package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.entity.CartItem;
import com.ruipeng.e_commrce.service_order.service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
public class CartItemController {
    @Autowired
    private  CartItemService cartItemService;
    public CartItemController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }
    @PostMapping("/cart/add")
    public ResponseEntity<CartItem> addCartItem(@RequestBody Map<String,String> map) {
        UUID userId = UUID.fromString(map.get("userId"));
        UUID productId = UUID.fromString(map.get("productId"));
        int quantity = Integer.parseInt(map.get("quantity"));
        CartItem cartItem = cartItemService.addToCart(userId, productId, quantity);
        if (cartItem != null) {
            return ResponseEntity.ok(cartItem);
        }
        return ResponseEntity.badRequest().build();
    }

}
