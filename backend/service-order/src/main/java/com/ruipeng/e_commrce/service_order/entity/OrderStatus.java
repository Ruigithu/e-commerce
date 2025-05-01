package com.ruipeng.e_commrce.service_order.entity;

public enum OrderStatus {
    PENDING("PENDING"),
    PAID("PAID"),
    REFUND("REFUND"),
    PROCESSING("PROCESSING"),
    SHIPPED ("SHIPPED"),
    DELIVERED ("DELIVERED"),
    COMPLETED ("COMPLETED"),
    CANCELLED ("CANCELLED"),
    REFUND_REQUESTED ("REFUND_REQUESTED");

    private final String status;

    OrderStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}

