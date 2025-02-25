package com.ruipeng.e_commrce.service_product.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name="products")
public class Product {
    @Id
    private UUID productId;
    private String name;
    private String description;
    private double price;
    private int stock;
    @Column(name = "category_id")
    private UUID categoryId;
    @Column(name = "created_at")
    private LocalDateTime createAt;

    public Product(String name, String description, double price, int stock, UUID categoryId,LocalDateTime createAt) {
        this.productId = UUID.randomUUID(); // 添加这行
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.categoryId=categoryId;
        this.createAt = LocalDateTime.now();
    }
    public Product() {

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

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }
}