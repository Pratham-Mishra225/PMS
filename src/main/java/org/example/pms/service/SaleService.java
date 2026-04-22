package org.example.pms.service;
import jakarta.persistence.EntityNotFoundException;
import org.example.pms.dto.SaleItemRequest;
import org.example.pms.dto.SaleItemResponse;
import org.example.pms.dto.SaleRequest;
import org.example.pms.dto.SaleResponse;
import org.example.pms.entity.Medicine;
import org.example.pms.entity.Sale;
import org.example.pms.entity.SaleItem;
import org.example.pms.repository.MedicineRepository;
import org.example.pms.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Service
@Transactional
public class SaleService {
    private final SaleRepository saleRepository;
    private final MedicineRepository medicineRepository;
    public SaleService(SaleRepository saleRepository, MedicineRepository medicineRepository) {
        this.saleRepository = saleRepository;
        this.medicineRepository = medicineRepository;
    }
    public SaleResponse processSale(SaleRequest request, String cashierName) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalStateException("Sale must contain at least one item");
        }
        Sale sale = new Sale();
        sale.setDateTime(LocalDateTime.now());
        sale.setCashierName(cashierName);
        List<SaleItem> saleItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (SaleItemRequest itemRequest : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemRequest.getMedicineId())
                    .orElseThrow(() -> new EntityNotFoundException("Medicine not found: " + itemRequest.getMedicineId()));
            if (medicine.getQuantity() < itemRequest.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for: " + medicine.getName() +
                        ". Available: " + medicine.getQuantity());
            }
            if (!medicine.getExpiryDate().isAfter(LocalDate.now())) {
                throw new IllegalStateException("Cannot sell expired or expiring today medicine: " + medicine.getName());
            }
            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setMedicine(medicine);
            saleItem.setQuantity(itemRequest.getQuantity());
            saleItem.setUnitPrice(medicine.getPrice());
            BigDecimal subtotal = medicine.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            saleItem.setSubtotal(subtotal);
            saleItems.add(saleItem);
            totalAmount = totalAmount.add(subtotal);
            medicine.setQuantity(medicine.getQuantity() - itemRequest.getQuantity());
            medicineRepository.save(medicine);
        }
        sale.setItems(saleItems);
        sale.setTotalAmount(totalAmount);
        Sale savedSale = saleRepository.save(sale);
        return mapToResponse(savedSale);
    }
    public List<SaleResponse> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }
    private SaleResponse mapToResponse(Sale sale) {
        List<SaleItemResponse> itemResponses = sale.getItems().stream()
                .map(item -> new SaleItemResponse(
                        item.getMedicine().getId(),
                        item.getMedicine().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();
        return new SaleResponse(
                sale.getId(),
                sale.getDateTime(),
                sale.getTotalAmount(),
                sale.getCashierName(),
                itemResponses
        );
    }
}
