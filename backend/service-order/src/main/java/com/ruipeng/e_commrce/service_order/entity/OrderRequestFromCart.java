package com.ruipeng.e_commrce.service_order.entity;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.UUID;

public class OrderRequestFromCart {
    private UUID userId;
    private UUID addressId;
    private List<UUID> merchantId;
    private List<CartItem> cartItems; // 接收复杂对象
    private List<Product> products; // 接收复杂对象
    private double totalAmount;

    public OrderRequestFromCart(UUID userId, UUID addressId,List<UUID> merchantId, List<CartItem> cartItems, List<Product> products, double totalAmount) {
        this.userId = userId;
        this.addressId = addressId;
        this.merchantId = merchantId;
        this.cartItems = cartItems;
        this.products = products;
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

    public List<UUID> getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(List<UUID> merchantId) {
        this.merchantId = merchantId;
    }

    public List<CartItem> getCartItems() {
        return cartItems;
    }

    public void setCartItems(List<CartItem> cartItems) {
        this.cartItems = cartItems;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
