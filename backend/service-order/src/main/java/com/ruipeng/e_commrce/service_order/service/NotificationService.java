package com.ruipeng.e_commrce.service_order.service;

import com.ruipeng.e_commrce.service_order.config.SecurityConfig.CustomWebSocketHandler;
import com.ruipeng.e_commrce.service_order.dto.OrderNotificationDTO;
import com.ruipeng.e_commrce.service_order.entity.OrderNotification;

import com.ruipeng.e_commrce.service_order.repo.OrderNotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private OrderNotificationRepository notificationRepository;

    @Autowired
    private CustomWebSocketHandler webSocketHandler;

    /**
     * 创建并发送通知
     */
    @Transactional
    public OrderNotification createAndSendNotification(String type, UUID merchantId, UUID orderId,
                                                       String orderNumber, Double amount, String message) {
        logger.info("创建通知: type={}, merchantId={}, orderId={}", type, merchantId, orderId);

        // 创建通知实体
        OrderNotification notification = new OrderNotification(
                type, merchantId, orderId, orderNumber, amount, message);

        // 保存到数据库
        notification = notificationRepository.save(notification);
        logger.info("通知已保存到数据库: id={}", notification.getId());

        // 转换为 DTO
        OrderNotificationDTO dto = OrderNotificationDTO.fromEntity(notification);

        // 创建包含通知的消息对象
        Map<String, Object> websocketMessage = new HashMap<>();
        websocketMessage.put("type", "ORDER_NOTIFICATION");
        websocketMessage.put("notification", dto);
        websocketMessage.put("timestamp", System.currentTimeMillis());

        // 通过 WebSocket 发送
        boolean sent = webSocketHandler.sendNotificationToMerchant(merchantId.toString(), websocketMessage);

        if (sent) {
            logger.info("通知已通过 WebSocket 成功发送");
        } else {
            logger.warn("无法通过 WebSocket 发送通知，客户端将通过轮询接收");
        }

        return notification;
    }

    /**
     * 获取商家的所有通知
     */
    public List<OrderNotificationDTO> getNotificationsForMerchant(UUID merchantId) {
        List<OrderNotification> notifications = notificationRepository.findByMerchantIdOrderByTimestampDesc(merchantId);
        return notifications.stream()
                .map(OrderNotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 将通知标记为已读
     */
    @Transactional
    public boolean markAsRead(UUID notificationId) {
        try {
            OrderNotification notification = notificationRepository.findById(notificationId)
                    .orElse(null);

            if (notification == null) {
                logger.warn("找不到通知: id={}", notificationId);
                return false;
            }

            notification.setRead(true);
            notificationRepository.save(notification);

            logger.info("通知已标记为已读: id={}", notificationId);
            return true;
        } catch (Exception e) {
            logger.error("标记通知为已读时出错: id={}", notificationId, e);
            return false;
        }
    }

    /**
     * 将所有通知标记为已读
     */
    @Transactional
    public int markAllAsRead(UUID merchantId) {
        try {
            int count = notificationRepository.markAllAsReadByMerchantId(merchantId);
            logger.info("已将商家 {} 的 {} 条通知标记为已读", merchantId, count);
            return count;
        } catch (Exception e) {
            logger.error("将所有通知标记为已读时出错: merchantId={}", merchantId, e);
            return 0;
        }
    }

    /**
     * 发送测试通知
     */
    @Transactional
    public OrderNotification sendTestNotification(UUID merchantId) {
        String type = "TEST_NOTIFICATION";
        UUID orderId = UUID.randomUUID();
        String orderNumber = "TEST-" + System.currentTimeMillis();
        Double amount = 99.99;
        String message = "这是一条测试通知 - " + LocalDateTime.now();

        return createAndSendNotification(type, merchantId, orderId, orderNumber, amount, message);
    }

    /**
     * 获取 WebSocket 连接统计信息
     */
    public String getConnectionStats() {
        int totalSessions = webSocketHandler.getTotalActiveSessionCount();
        return String.format("总活跃 WebSocket 会话: %d", totalSessions);
    }

    /**
     * 获取未读通知
     */
    public List<OrderNotificationDTO> getUnreadNotifications(UUID merchantId) {
        List<OrderNotification> notifications = notificationRepository.findByMerchantIdAndReadFalseOrderByTimestampDesc(merchantId);
        return notifications.stream()
                .map(OrderNotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 获取未读通知数量
     */
    public Long getUnreadCount(UUID merchantId) {
        return notificationRepository.countByMerchantIdAndReadFalse(merchantId);
    }
}