package com.ruipeng.e_commrce.service_order.service;

import com.ruipeng.e_commrce.service_order.entity.ShoppingCart;
import com.ruipeng.e_commrce.service_order.repo.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ShoppingCartService {
    @Autowired
    private CartRepository cartRepository;
    public ShoppingCartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public ShoppingCart addNewCart(UUID userId){
        ShoppingCart cart = new ShoppingCart();
        cart.setCartId(UUID.randomUUID());
        cart.setUserId(userId);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());

        return cartRepository.save(cart);
    }

    public UUID getCartId(UUID userId) {
        return cartRepository.getCartIdByUserId(userId);
    }

}
