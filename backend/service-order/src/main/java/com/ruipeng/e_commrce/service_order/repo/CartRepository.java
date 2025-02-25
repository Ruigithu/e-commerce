package com.ruipeng.e_commrce.service_order.repo;

import com.ruipeng.e_commrce.service_order.entity.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<ShoppingCart, UUID> {
    @Query("SELECT s FROM ShoppingCart s WHERE s.userId = ?1")
    Optional<ShoppingCart> findByUserId(UUID userId);

    @Query("SELECT s.cartId FROM ShoppingCart s WHERE s.userId = ?1")
    UUID getCartIdByUserId(UUID userId);
}
