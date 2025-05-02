package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.entity.*;
import com.ruipeng.e_commrce.service_order.service.OrderItemService;
import com.ruipeng.e_commrce.service_order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
public class OrderController {
    @Autowired
    private OrderService orderService;

    private OrderItemService orderItemService;
    @Qualifier("com.ruipeng.e_commrce.service_order.controller.ProductClient")
    @Autowired
    private ProductClient productClient;

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

        Order order = new Order();
        order.setOrderId(UUID.randomUUID());
        order.setUserId(request.getUserId());
        order.setShippingAddressId(request.getAddressId());
        order.setCreateAt(LocalDateTime.now());
        order.setUpdateAt(LocalDateTime.now());
        order.setTotalAmount(request.getTotalAmount());
        order.setStatus(OrderStatus.PENDING);
        order.setMerchantId(request.getMerchantId());

        Order newOrder = orderService.createNewOrder(order);
        OrderItem orderItem=new OrderItem();
            orderItem.setItemId(UUID.randomUUID());
            orderItem.setOrderId(newOrder.getOrderId());
            orderItem.setProductId(request.getProduct().getProductId());
            orderItem.setQuantity(request.getQuantity());
            orderItem.setUnitPrice(request.getProduct().getPrice());

        orderItemService.addOrderItem(orderItem);
        return ResponseEntity.ok(newOrder);

    }

    @PutMapping("/updateStatus/{orderId}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status
    ){
        boolean updated=false;
        System.out.println("update status");

        try {
            if (status.equals("PAID")) {
                updated = orderService.updateOrderPaymentStatus(orderId);
                System.out.println(updated);
            }


            if (updated) {
                List<OrderItem> orderItems = orderItemService.getOrderItems(orderId);
                List<Product> updatedProductList = new ArrayList<>();
                for (OrderItem orderItem : orderItems) {

                    Product product = productClient.getProduct(orderItem.getProductId());

                    int  newStock=product.getStock()-orderItem.getQuantity();

                    product.setStock(newStock);
                    ProductStockUpdateDTO stockUpdate = new ProductStockUpdateDTO();
                    stockUpdate.setProductId(orderItem.getProductId());
                    stockUpdate.setStock(newStock);

                    Product stockUpdatedProduct = productClient.updateProductStock(stockUpdate, orderItem.getProductId());  System.out.println(7);
                    updatedProductList.add(stockUpdatedProduct);

                }
                if (!updatedProductList.isEmpty()) {
                    return ResponseEntity.ok("Order payment status updated successfully");
                }

            } else {
                return ResponseEntity.internalServerError().body("Failed to update order status");
            }
        }catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to update order status");
        }

        return ResponseEntity.internalServerError().body("Failed to update order status");
    }

    @GetMapping("/getOrder/{orderId}")
    public Order getOrder(@PathVariable UUID orderId) {
        return orderService.getOrderByOrderId(orderId);
    }

    @GetMapping("/getAllOrders/{userId}")
    public Map<String, Object> getAllOrders(@PathVariable UUID userId) {
        return orderService.getAllOrdersByUserId(userId);
    }

    @GetMapping("/getAllOrdersByMerchantId/{merchantId}")
    public Map<String, Object> getAllOrdersByMerchantId(@PathVariable UUID merchantId) {
        return orderService.getAllOrdersByMerchantId(merchantId);
    }

}



