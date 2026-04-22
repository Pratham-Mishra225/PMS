package org.example.pms.controller;
import jakarta.validation.Valid;
import org.example.pms.dto.SaleRequest;
import org.example.pms.dto.SaleResponse;
import org.example.pms.service.SaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/sales")
public class SaleController {
    private final SaleService saleService;
    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }
    @PostMapping
    public ResponseEntity<SaleResponse> processSale(@Valid @RequestBody SaleRequest request, Authentication authentication) {
        String cashierName = authentication.getName();
        return ResponseEntity.ok(saleService.processSale(request, cashierName));
    }
    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }
}
