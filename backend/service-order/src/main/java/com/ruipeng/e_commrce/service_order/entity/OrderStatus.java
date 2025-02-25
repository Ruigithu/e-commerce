package com.ruipeng.e_commrce.service_order.entity;

public enum OrderStatus {
    PENDING("PENDING"),
    PAID("PAID"),
    REFUND("REFUND");

    private final String status;

    OrderStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}

