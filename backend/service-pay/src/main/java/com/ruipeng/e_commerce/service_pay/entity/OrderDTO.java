package com.ruipeng.e_commerce.service_pay.entity;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrderDTO {
    private UUID orderId;
    private UUID userId;
    private UUID merchantId;
    private String status;
    private double totalAmount;
    private UUID shippingAddressId;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    public OrderDTO(UUID orderId, UUID userId, UUID merchantId, String status, double totalAmount, UUID shippingAddressId, LocalDateTime createAt, LocalDateTime updateAt) {
        this.orderId = orderId;
        this.userId = userId;
        this.merchantId = merchantId;
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

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
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
