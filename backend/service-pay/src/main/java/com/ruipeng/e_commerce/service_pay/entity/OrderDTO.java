package com.ruipeng.e_commerce.service_pay.entity;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrderDTO {
    private UUID orderId;
    private UUID userId;
    private String status;
    private double totalAmount;
    private UUID shippingAddressId;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    public OrderDTO(UUID orderId, UUID userId, String status, double totalAmount, UUID shippingAddressId, LocalDateTime createAt, LocalDateTime updateAt) {
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.shippingAddressId = shippingAddressId;
        this.createAt = createAt;
        this.updateAt = updateAt;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public UUID getShippingAddressId() {
        return shippingAddressId;
    }

    public void setShippingAddressId(UUID shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }

    public LocalDateTime getUpdateAt() {
        return updateAt;
    }

    public void setUpdateAt(LocalDateTime updateAt) {
        this.updateAt = updateAt;
    }
}
