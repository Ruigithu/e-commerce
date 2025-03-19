package com.ruipeng.e_commrce.service_product.entity;

import java.util.UUID;

// 在共享模块或两边都定义
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
