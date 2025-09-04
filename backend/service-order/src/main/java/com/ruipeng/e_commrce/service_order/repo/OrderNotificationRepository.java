package com.ruipeng.e_commrce.service_order.repo;

import com.ruipeng.e_commrce.service_order.entity.OrderNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderNotificationRepository extends JpaRepository<OrderNotification, UUID> {

    // 获取商家的所有通知，按时间降序排序
    List<OrderNotification> findByMerchantIdOrderByTimestampDesc(UUID merchantId);


    // 将商家的所有通知标记为已读
    @Modifying
    @Query("UPDATE OrderNotification n SET n.read = true WHERE n.merchantId = :merchantId AND n.read = false")
    int markAllAsReadByMerchantId(UUID merchantId);

    // 将特定通知标记为已读
    @Modifying
    @Query("UPDATE OrderNotification n SET n.read = true WHERE n.id = :notificationId")
    int markAsRead(UUID notificationId);


    /**
     * 查找商家的所有未读通知，按时间倒序排列
     */
    List<OrderNotification> findByMerchantIdAndReadFalseOrderByTimestampDesc(UUID merchantId);

    /**
     * 统计商家的未读通知数量
     */
    Long countByMerchantIdAndReadFalse(UUID merchantId);

}
