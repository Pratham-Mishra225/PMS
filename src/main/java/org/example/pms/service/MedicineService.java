package org.example.pms.service;
import jakarta.persistence.EntityNotFoundException;
import org.example.pms.dto.MedicineRequest;
import org.example.pms.entity.Medicine;
import org.example.pms.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
@Service
@Transactional
public class MedicineService {
    private final MedicineRepository medicineRepository;
    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }
    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found with id: " + id));
    }
    public Medicine addMedicine(MedicineRequest request) {
        Medicine medicine = new Medicine();
        medicine.setName(request.getName());
        medicine.setBrand(request.getBrand());
        medicine.setBatchNo(request.getBatchNo());
        medicine.setQuantity(request.getQuantity());
        medicine.setPrice(request.getPrice());
        medicine.setExpiryDate(request.getExpiryDate());
        return medicineRepository.save(medicine);
    }
    public Medicine updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = getMedicineById(id);
        medicine.setName(request.getName());
        medicine.setBrand(request.getBrand());
        medicine.setBatchNo(request.getBatchNo());
        medicine.setQuantity(request.getQuantity());
        medicine.setPrice(request.getPrice());
        medicine.setExpiryDate(request.getExpiryDate());
        return medicineRepository.save(medicine);
    }
    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new EntityNotFoundException("Medicine not found with id: " + id);
        }
        medicineRepository.deleteById(id);
    }
    public List<Medicine> searchByName(String name) {
        return medicineRepository.findByNameContainingIgnoreCase(name);
    }
    public List<Medicine> getLowStockMedicines() {
        return medicineRepository.findLowStock(10);
    }
    public List<Medicine> getExpiringSoonMedicines() {
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return medicineRepository.findExpiredOrExpiringSoon(thirtyDaysFromNow);
    }
    public void updateStock(Long id, int quantityChange) {
        Medicine medicine = getMedicineById(id);
        int newQuantity = medicine.getQuantity() + quantityChange;
        if (newQuantity < 0) {
            throw new IllegalStateException("Insufficient stock for medicine: " + medicine.getName());
        }
        medicine.setQuantity(newQuantity);
        medicineRepository.save(medicine);
    }
}
