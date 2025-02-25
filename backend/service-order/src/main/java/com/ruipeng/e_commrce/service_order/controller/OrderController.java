package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.entity.*;
import com.ruipeng.e_commrce.service_order.service.OrderItemService;
import com.ruipeng.e_commrce.service_order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
public class OrderController {
    @Autowired
    private OrderService orderService;

    private OrderItemService orderItemService;

    public OrderController(OrderService orderService, OrderItemService orderItemService) {
        this.orderService = orderService;
        this.orderItemService = orderItemService;
    }

    @PostMapping("/createOrderFromCart")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequestFromCart request) {
        // 添加空值检查
        UUID userId = null;
        UUID addressId = null;

        try {
            if (request.getUserId() != null && !"null".equals(request.getUserId())) {
                userId = UUID.fromString(request.getUserId().toString());
            }
            if (request.getAddressId() != null && !"null".equals(request.getAddressId())) {
                addressId = UUID.fromString(request.getAddressId().toString());
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        Order order = new Order();
        order.setOrderId(UUID.randomUUID());
        order.setUserId(userId);
        order.setShippingAddressId(addressId);
        order.setCreateAt(LocalDateTime.now());
        order.setUpdateAt(LocalDateTime.now());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(OrderStatus.PENDING);

        Order newOrder = orderService.createNewOrder(order);

        List<OrderItem> itemList=new ArrayList<>();

        for(CartItem cartItem : request.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setItemId(UUID.randomUUID());
            orderItem.setOrderId(newOrder.getOrderId());
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setQuantity(cartItem.getQuantity());
            for (Product product : request.getProducts()) {
                if (product.getProductId().equals(cartItem.getProductId())) {
                    orderItem.setUnitPrice(product.getPrice());
                }
            }
            itemList.add(orderItem);
        }
        orderItemService.addOrderItems(itemList);
        return ResponseEntity.ok(newOrder);

    }

    @PostMapping("/createOrder")
    public ResponseEntity<Order> createOrderForOneItem(
            @RequestBody OrderRequest request) {
        System.out.println("1");

        Order order = new Order();
        order.setOrderId(UUID.randomUUID());
        order.setUserId(request.getUserId());
        order.setShippingAddressId(request.getAddressId());
        order.setCreateAt(LocalDateTime.now());
        order.setUpdateAt(LocalDateTime.now());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(OrderStatus.PENDING);

        Order newOrder = orderService.createNewOrder(order);
        System.out.println("2");
        OrderItem orderItem=new OrderItem();
            orderItem.setItemId(UUID.randomUUID());
            orderItem.setOrderId(newOrder.getOrderId());
            orderItem.setProductId(request.getProduct().getProductId());
            orderItem.setQuantity(request.getQuantity());
            orderItem.setUnitPrice(request.getProduct().getPrice());

        System.out.println("3");
        orderItemService.addOrderItem(orderItem);
        System.out.println("4");
        System.out.println(newOrder.getOrderId());
        return ResponseEntity.ok(newOrder);

    }

    @PostMapping("/update-payment-status")
    public ResponseEntity<?> updatePaymentStatus(@RequestParam UUID orderId) {
        boolean updated = orderService.updateOrderPaymentStatus(orderId);

        if (updated) {
            return ResponseEntity.ok("Order payment status updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to update order status");
        }
    }

    @GetMapping("/getOrder/{orderId}")
    public Order getOrder(@PathVariable UUID orderId) {
        return orderService.getOrderByOrderId(orderId);
    }
    @GetMapping("/getAllOrders/{userId}")
    public List<Order> getAllOrders(@PathVariable UUID userId) {
        return orderService.getAllOrdersByUserId(userId);
    }
}



