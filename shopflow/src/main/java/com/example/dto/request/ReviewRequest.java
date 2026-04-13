package com.shopflow.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

/** DTO pour poster un avis sur un produit */
@Data
public class ReviewRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Min(1) @Max(5)
    private Integer note;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String commentaire;
}