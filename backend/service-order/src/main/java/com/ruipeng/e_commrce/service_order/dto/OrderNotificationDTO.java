package com.ruipeng.e_commrce.service_order.dto;

import com.ruipeng.e_commrce.service_order.entity.OrderNotification;

import java.util.UUID;

public class OrderNotificationDTO {
    private UUID id;
    private String type;
    private UUID orderId;
    private String orderNumber;
    private Double amount;
    private String message;
    private boolean read;
    private long timestamp;  // 使用Unix时间戳，便于前端处理

    public OrderNotificationDTO() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    // 从实体转换为DTO的静态方法
    public static OrderNotificationDTO fromEntity(OrderNotification notification) {
        OrderNotificationDTO dto = new OrderNotificationDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setOrderId(notification.getOrderId());
        dto.setOrderNumber(notification.getOrderNumber());
        dto.setAmount(notification.getAmount());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());

        // 将LocalDateTime转换为Unix时间戳
        dto.setTimestamp(notification.getTimestamp()
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli());

        return dto;
    }
}
