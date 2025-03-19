package com.ruipeng.e_commrce.service_order.repo;

import com.ruipeng.e_commrce.service_order.entity.CartItem;
import com.ruipeng.e_commrce.service_order.entity.ShoppingCart;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    @Query("SELECT c FROM CartItem c WHERE c.cartId = ?1")
    List<CartItem> findByCartId(UUID cartId);

    @Modifying
    @Transactional
    @Query("UPDATE CartItem c SET c.quantity = :quantity WHERE c.itemId = :itemId")
    void updateQuantity(UUID itemId, Integer quantity);


}
