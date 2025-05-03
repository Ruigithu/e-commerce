package com.ruipeng.e_commrce.service_order.dto;

import java.util.UUID;

public class ProductStockUpdateDTO {
    private UUID productId;
    private int stock;

    public ProductStockUpdateDTO(UUID productId, int stock) {
        this.productId = productId;
        this.stock = stock;
    }

    public ProductStockUpdateDTO() {

    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }
}

