package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.dto.OrderNotificationDTO;
import com.ruipeng.e_commrce.service_order.entity.OrderNotification;
import com.ruipeng.e_commrce.service_order.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            UUID merchantId = UUID.fromString(notificationData.get("merchantId").toString());
            UUID orderId = UUID.fromString(notificationData.get("orderId").toString());
            String orderNumber = notificationData.get("orderNumber").toString();
            Double amount = Double.parseDouble(notificationData.get("amount").toString());
            String message = notificationData.getOrDefault("message", "New order notification").toString();
            String type = notificationData.getOrDefault("type", "ORDER_PLACED").toString();

            // 使用更新后的通知服务方法创建并发送通知
            OrderNotification notification = notificationService.createAndSendNotification(
                    type, merchantId, orderId, orderNumber, amount, message);

            return ResponseEntity.ok(OrderNotificationDTO.fromEntity(notification));
        } catch (Exception e) {
            logger.error("Failed to create notification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create notification: " + e.getMessage());
        }
    }

    @GetMapping("/merchant/{merchantId}")
    public ResponseEntity<List<OrderNotificationDTO>> getMerchantNotifications(@PathVariable UUID merchantId) {
        // 使用更新的方法名，如果需要
        return ResponseEntity.ok(notificationService.getNotificationsForMerchant(merchantId));
    }

    @GetMapping("/merchant/{merchantId}/unread")
    public ResponseEntity<List<OrderNotificationDTO>> getUnreadNotifications(@PathVariable UUID merchantId) {
        // 保持原有方法，需要确保NotificationService中有此方法
        return ResponseEntity.ok(notificationService.getUnreadNotifications(merchantId));
    }

    @GetMapping("/merchant/{merchantId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable UUID merchantId) {
        // 保持原有方法，需要确保NotificationService中有此方法
        return ResponseEntity.ok(notificationService.getUnreadCount(merchantId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID notificationId) {
        boolean updated = notificationService.markAsRead(notificationId);
        if (updated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/merchant/{merchantId}/read-all")
    public ResponseEntity<Integer> markAllAsRead(@PathVariable UUID merchantId) {
        int count = notificationService.markAllAsRead(merchantId);
        return ResponseEntity.ok(count);
    }

    // 添加一个测试方法用于发送测试通知
    @PostMapping("/test/{merchantId}")
    public ResponseEntity<?> sendTestNotification(@PathVariable UUID merchantId) {
        try {
            OrderNotification notification = notificationService.sendTestNotification(merchantId);
            return ResponseEntity.ok(OrderNotificationDTO.fromEntity(notification));
        } catch (Exception e) {
            logger.error("Failed to send test notification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send test notification: " + e.getMessage());
        }
    }

    // 添加一个方法获取WebSocket连接状态
    @GetMapping("/websocket/status")
    public ResponseEntity<Map<String, Object>> getWebSocketStatus() {
        try {
            // 创建一个包含连接统计信息的响应
            java.util.HashMap<String, Object> status = new java.util.HashMap<>();
            status.put("status", "active");
            status.put("connectionStats", notificationService.getConnectionStats());
            status.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            logger.error("Failed to get WebSocket status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Collections.singletonMap("error", "Failed to get WebSocket status"));
        }
    }
}