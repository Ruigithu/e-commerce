package com.ruipeng.e_commrce.service_order.service;

import com.ruipeng.e_commrce.service_order.entity.CartItem;
import com.ruipeng.e_commrce.service_order.entity.ShoppingCart;
import com.ruipeng.e_commrce.service_order.repo.CartItemRepository;
import com.ruipeng.e_commrce.service_order.repo.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartItemService {
    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;;

    public CartItemService(CartItemRepository cartItemRepository, CartRepository cartRepository) {
        this.cartItemRepository = cartItemRepository;
        this.cartRepository = cartRepository;
    }


    public CartItem addToCart(UUID userId, UUID productId, Integer quantity, UUID cartId) {
        System.out.println("add to cart "+userId);
        Optional<ShoppingCart> cart = cartRepository.findByUserId(userId);

        CartItem cartItem = new CartItem();
        cartItem.setItemId(UUID.randomUUID());
//        if (cart.isPresent()) {
//            ShoppingCart shoppingCart = cart.get();
//            cartItem.setCartId(shoppingCart.getCartId());
//        }
        cartItem.setCartId(cartId);
        cartItem.setProductId(productId);
        cartItem.setQuantity(quantity);
        cartItem.setCreatedAt(LocalDateTime.now());
        cartItem.setUpdatedAt(LocalDateTime.now());

        return cartItemRepository.save(cartItem);
    }

    public List<CartItem> getItemsByCartId(UUID cartId) {
        List<CartItem> itemList = cartItemRepository.findByCartId(cartId);
        if (itemList.isEmpty()) {
            return null;
        }
        return itemList;
    }

    public void removeFromCart(UUID itemId) {
      cartItemRepository.deleteById(itemId);
    }

    public void updateQuantity(UUID itemId, Integer quantity) {
        cartItemRepository.updateQuantity(itemId,quantity);
    }

}
