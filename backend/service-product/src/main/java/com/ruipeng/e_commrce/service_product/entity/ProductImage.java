package com.ruipeng.e_commrce.service_product.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue
    @Column(name = "image_id", nullable = false, updatable = false)
    private UUID imageId;


    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ProductImage(UUID imageId, UUID productId, String imageUrl, LocalDateTime createdAt) {
        this.imageId = imageId;
        this.productId = productId;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
    }

    public ProductImage() {

    }

    public UUID getImageId() {
        return imageId;
    }

    public void setImageId(UUID imageId) {
        this.imageId = imageId;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

