package com.ruipeng.e_commrce.service_order.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    private UUID orderId;
    private UUID userId;
    private UUID merchantId;
    @Enumerated(EnumType.STRING) // 使用 EnumType.STRING 映射为数据库中的字符串值
    private OrderStatus status;  // 使用枚举类型
    private double totalAmount;
    private UUID shippingAddressId;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    private String trackingNumber;
    private String shippingCarrier;
    private String shippingNotes;


    public Order(UUID orderId, UUID userId, UUID merchantId,   OrderStatus status, double totalAmount, UUID shippingAddressId, LocalDateTime createAt, LocalDateTime updateAt
    , String trackingNumber, String shippingCarrier, String shippingNotes) {
        this.orderId = orderId;
        this.userId = userId;
        this.merchantId = merchantId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.shippingAddressId = shippingAddressId;
        this.createAt = createAt;
        this.updateAt = updateAt;
        this.trackingNumber = trackingNumber;
        this.shippingCarrier = shippingCarrier;
        this.shippingNotes = shippingNotes;
    }

    public Order() {}

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

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
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

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getShippingCarrier() {
        return shippingCarrier;
    }

    public void setShippingCarrier(String shippingCarrier) {
        this.shippingCarrier = shippingCarrier;
    }

    public String getShippingNotes() {
        return shippingNotes;
    }

    public void setShippingNotes(String shippingNotes) {
        this.shippingNotes = shippingNotes;
    }
}
