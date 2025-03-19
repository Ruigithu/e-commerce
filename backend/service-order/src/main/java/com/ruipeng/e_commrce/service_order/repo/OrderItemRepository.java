package com.ruipeng.e_commrce.service_order.repo;

import com.ruipeng.e_commrce.service_order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    @Query("SELECT i FROM OrderItem i WHERE i.orderId = ?1")
    List<OrderItem> findByOrderId(UUID orderId);
}
