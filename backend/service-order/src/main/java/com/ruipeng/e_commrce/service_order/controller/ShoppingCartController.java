package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.entity.CartItem;
import com.ruipeng.e_commrce.service_order.entity.ShoppingCart;
import com.ruipeng.e_commrce.service_order.service.CartItemService;
import com.ruipeng.e_commrce.service_order.service.ShoppingCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class ShoppingCartController {
    @Autowired
    private ShoppingCartService shoppingCartService;
    @Autowired
    private CartItemService cartItemService;

    public ShoppingCartController(ShoppingCartService shoppingCartService, CartItemService cartItemService) {
        this.shoppingCartService = shoppingCartService;
        this.cartItemService = cartItemService;
    }

    @PostMapping("/add-newCart")
    public ResponseEntity<ShoppingCart> addToCart(@RequestBody Map<String, String> map) {
        ShoppingCart cart = shoppingCartService.addNewCart(UUID.fromString(map.get("userId")));
        if (cart == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(cart);
    }

    @GetMapping("/getItems/{userId}")
    public List<CartItem> getItems(@PathVariable UUID userId) {
        UUID cartId = shoppingCartService.getCartId(userId);
        if (cartId != null) {
            List<CartItem> itemList = cartItemService.getItemsByCartId(cartId);
            if (itemList == null) {
                return null;
            } else {
                return itemList;
            }
        }
        return null;
    }

    @DeleteMapping("/removeItem/{itemId}")
    public void removeFromCart(@PathVariable UUID itemId) {
        cartItemService.removeFromCart(itemId);
    }

    @PutMapping("/updateQuantity/{itemId}")
    public void updateQuantity(@PathVariable UUID itemId, @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");  // 获取传递的数量

        cartItemService.updateQuantity(itemId, quantity);

    }

}
