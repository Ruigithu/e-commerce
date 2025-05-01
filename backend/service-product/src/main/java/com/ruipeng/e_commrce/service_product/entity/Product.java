package com.ruipeng.e_commrce.service_product.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="products")
public class Product {
    @Id
    private UUID productId;

    private UUID merchantId;
    private String name;
    private String description;
    private double price;
    private int stock;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private ProductCategoryEnum category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ProductStatusEnum status;

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createAt;

    public Product( UUID merchantId, String name, String description, double price, int stock, ProductCategoryEnum category,ProductStatusEnum status,LocalDateTime createAt) {
        this.merchantId=merchantId;
        this.productId = UUID.randomUUID(); // 添加这行
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.category=category;
        this.status=status;

        this.createAt = LocalDateTime.now();
    }
    public Product() {

    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
    }


    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }


    public UUID getProductId() {
        return productId;
    }

    public ProductCategoryEnum getCategory() {
        return category;
    }

    public void setCategory(ProductCategoryEnum category) {
        this.category = category;
    }

    public ProductStatusEnum getStatus() {
        return status;
    }

    public void setStatus(ProductStatusEnum status) {
        this.status = status;
    }
}