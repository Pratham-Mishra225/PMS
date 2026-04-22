package org.example.pms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleItemRequest {
    @NotNull
    private Long medicineId;
    @NotNull
    @Min(1)
    private Integer quantity;
}
