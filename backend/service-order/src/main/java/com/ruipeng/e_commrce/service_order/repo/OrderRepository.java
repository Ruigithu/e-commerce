package com.ruipeng.e_commrce.service_order.repo;

import com.ruipeng.e_commrce.service_order.entity.Order;
import com.ruipeng.e_commrce.service_order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT o FROM Order o WHERE o.userId = :userId")
    List<Order> findByUserId( UUID userId);

    @Query("SELECT o FROM Order o WHERE o.merchantId = :merchantId")
    List<Order> findByMerchantId(UUID merchantId);

    /**
     * Find all orders for a merchant sorted by creation date (most recent first)
     */
    List<Order> findByMerchantIdOrderByCreateAtDesc(UUID merchantId);

    /**
     * Find orders for a merchant created between specified dates, excluding cancelled orders
     */
    List<Order> findByMerchantIdAndCreateAtBetweenAndStatusNot(
            UUID merchantId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            OrderStatus excludeStatus
    );

    List<Order> findByUserIdAndStatusNot(UUID userId, OrderStatus excludeStatus);
}
