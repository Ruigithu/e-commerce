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
    @Enumerated(EnumType.STRING) // 使用 EnumType.STRING 映射为数据库中的字符串值
    private OrderStatus status;  // 使用枚举类型
    private double totalAmount;
    private UUID shippingAddressId;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;


    public Order(UUID orderId, UUID userId, OrderStatus status, double totalAmount, UUID shippingAddressId, LocalDateTime createAt, LocalDateTime updateAt) {
        this.orderId = orderId;
        this.userId = userId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.shippingAddressId = shippingAddressId;
        this.createAt = createAt;
        this.updateAt = updateAt;
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

}
