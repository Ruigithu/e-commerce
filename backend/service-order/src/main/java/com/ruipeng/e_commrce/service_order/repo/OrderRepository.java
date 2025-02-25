package com.ruipeng.e_commrce.service_order.repo;

import com.ruipeng.e_commrce.service_order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT o FROM Order o WHERE o.userId = :userId")
    List<Order> findByUserId( UUID userId);
}
