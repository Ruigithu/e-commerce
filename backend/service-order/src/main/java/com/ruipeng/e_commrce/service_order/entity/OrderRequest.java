package com.ruipeng.e_commrce.service_order.entity;

import java.util.UUID;

public class OrderRequest {
    private UUID userId;
    private UUID addressId;
    private UUID merchantId;
    private Product product;
    private int quantity;
    private double totalAmount;

    public OrderRequest(UUID userId, UUID addressId, UUID merchantId, Product product, int quantity, double totalAmount) {
        this.userId = userId;
        this.addressId = addressId;
        this.product = product;
        this.quantity = quantity;
        this.totalAmount = totalAmount;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getAddressId() {
        return addressId;
    }

    public void setAddressId(UUID addressId) {
        this.addressId = addressId;
    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
