package com.ruipeng.e_commrce.service_order.entity;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;


import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "order_notifications")
public class OrderNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String type;  // 通知类型，如"NEW_ORDER", "ORDER_SHIPPED"等

    @Column(nullable = false)
    private UUID merchantId;  // 通知的接收商家ID

    @Column(nullable = false)
    private UUID orderId;  // 相关订单ID

    @Column(nullable = false)
    private String orderNumber;  // 订单编号（用于显示）

    @Column(nullable = false)
    private Double amount;  // 订单金额

    @Column(nullable = false)
    private String message;  // 通知消息内容

    @Column(nullable = false)
    private boolean read;  // 是否已读

    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;  // 通知时间

    // 附加数据字段，存储为JSON
    @Column(columnDefinition = "TEXT")
    private String additionalData;  // 可以存储与通知相关的其他数据（JSON格式）

    // 构造函数，创建新的订单通知
    public OrderNotification(String type, UUID merchantId, UUID orderId, String orderNumber,
                             Double amount, String message) {
        this.type = type;
        this.merchantId = merchantId;
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.amount = amount;
        this.message = message;
        this.read = false;
        this.timestamp = LocalDateTime.now();
    }

    // 标记为已读
    public void markAsRead() {
        this.read = true;
    }

    // 用于创建新订单通知的静态工厂方法
    public static OrderNotification createNewOrderNotification(UUID merchantId, UUID orderId,
                                                               String orderNumber, Double amount) {
        return new OrderNotification(
                "NEW_ORDER",
                merchantId,
                orderId,
                orderNumber,
                amount,
                "New order received!"
        );
    }

    // 用于创建订单状态变更通知的静态工厂方法
    public static OrderNotification createStatusChangeNotification(UUID merchantId, UUID orderId,
                                                                   String orderNumber, Double amount,
                                                                   String newStatus) {
        return new OrderNotification(
                "STATUS_CHANGE",
                merchantId,
                orderId,
                orderNumber,
                amount,
                "Order #" + orderNumber + " status changed to " + newStatus
        );
    }

    public OrderNotification() {
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

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getAdditionalData() {
        return additionalData;
    }

    public void setAdditionalData(String additionalData) {
        this.additionalData = additionalData;
    }
}
