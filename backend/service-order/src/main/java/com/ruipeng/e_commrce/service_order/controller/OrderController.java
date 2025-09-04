package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.dto.OrderRequest;
import com.ruipeng.e_commrce.service_order.dto.OrderRequestFromCart;
import com.ruipeng.e_commrce.service_order.dto.ProductStockUpdateDTO;
import com.ruipeng.e_commrce.service_order.entity.*;
import com.ruipeng.e_commrce.service_order.repo.OrderRepository;
import com.ruipeng.e_commrce.service_order.service.EmailService;
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

    @Autowired
    private OrderItemService orderItemService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserClient userClient;

    @Qualifier("com.ruipeng.e_commrce.service_order.controller.ProductClient")
    @Autowired
    private ProductClient productClient;

    public OrderController(OrderService orderService, OrderItemService orderItemService) {
        this.orderService = orderService;
        this.orderItemService = orderItemService;
    }

    @PostMapping("/createOrderFromCart")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestFromCart request) {
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
        List<Order> orderList =new ArrayList<>();
        try {
            Map<UUID, List<UUID>> merchantIds_products = new HashMap<>();
            Set<UUID> merchantIds = new HashSet<>();
            for (Product product : request.getProducts()) {
                if (merchantIds_products.containsKey(product.getMerchantId())) {
                    merchantIds_products.get(product.getMerchantId()).add(product.getProductId());
                } else {
                    merchantIds.add(product.getMerchantId());
                    List<UUID> productsId = new ArrayList<>();
                    productsId.add(product.getProductId());
                    merchantIds_products.put(product.getMerchantId(), productsId);
                }
            }

            for (UUID merchantId : merchantIds) {
                Order order = new Order();
                order.setOrderId(UUID.randomUUID());
                order.setUserId(userId);
                order.setMerchantId(merchantId);
                order.setShippingAddressId(addressId);
                order.setCreateAt(LocalDateTime.now());
                order.setUpdateAt(LocalDateTime.now());
                order.setTotalAmount(request.getTotalAmount());
                order.setStatus(OrderStatus.PENDING);

                Order newOrder = orderService.createNewOrder(order);

                List<OrderItem> itemList = new ArrayList<>();

                for (CartItem cartItem : request.getCartItems()) {
                    if (merchantIds_products.get(merchantId).contains(cartItem.getProductId())) {
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
                }
                orderList.add(newOrder);
            }
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok(orderList);

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
        order.setMerchantId(request.getProduct().getMerchantId());

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
    ) {
        System.out.println("Updating order status to: " + status + " for order: " + orderId);

        try {
            boolean updated = false;

            // 处理支付状态更新
            if (status.equals("PAID")) {
                updated = orderService.updateOrderPaymentStatus(orderId);
                System.out.println("Order payment status update result: " + updated);

                if (!updated) {
                    return ResponseEntity.badRequest().body(
                            Map.of("error", "Failed to update order status",
                                    "message", "Order not found or cannot change to this status")
                    );
                }

                // 更新库存
                try {
                    List<OrderItem> orderItems = orderItemService.getOrderItems(orderId);
                    if (orderItems == null || orderItems.isEmpty()) {
                        return ResponseEntity.badRequest().body(
                                Map.of("error", "No items found for this order")
                        );
                    }

                    List<Product> updatedProductList = new ArrayList<>();
                    for (OrderItem orderItem : orderItems) {
                        Product product = productClient.getProduct(orderItem.getProductId());
                        if (product == null) {
                            continue;
                        }

                        int newStock = product.getStock() - orderItem.getQuantity();
                        if (newStock < 0) {
                            return ResponseEntity.badRequest().body(
                                    Map.of("error", "Insufficient stock for product: " + product.getName())
                            );
                        }

                        product.setStock(newStock);
                        ProductStockUpdateDTO stockUpdate = new ProductStockUpdateDTO();
                        stockUpdate.setProductId(orderItem.getProductId());
                        stockUpdate.setStock(newStock);

                        Product stockUpdatedProduct = productClient.updateProductStock(stockUpdate, orderItem.getProductId());
                        if (stockUpdatedProduct != null) {
                            updatedProductList.add(stockUpdatedProduct);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error updating product stock: " + e.getMessage());
                    // 即使库存更新失败，我们仍然继续发送邮件
                }

                // 获取订单详情并发送邮件
                try {
                    Order order = orderService.getOrderByOrderId(orderId);
                    if (order != null) {
                        Optional<Merchant> merchantOptional = userClient.findMerchantById(order.getMerchantId());
                        if (merchantOptional.isPresent()) {
                            Merchant merchant = merchantOptional.get();
                            if (merchant.getContactEmail() != null && !merchant.getContactEmail().isEmpty()) {
                                emailService.sendOrderStatusUpdateToMerchant(
                                        order,
                                        merchant.getContactEmail(),
                                        merchant.getStoreName()
                                );
                                System.out.println("Order notification email sent to merchant: " + merchant.getStoreName());
                            } else {
                                System.err.println("Merchant email not available for: " + merchant.getStoreName());
                            }
                        } else {
                            System.err.println("Merchant not found for order: " + orderId);
                        }

                        // 也可以考虑发送确认邮件给客户
                        try {
                            Optional<User> userOptional = userClient.findUserById(order.getUserId());
                            if (userOptional.isPresent() && userOptional.get().getEmail() != null) {
                                User user = userOptional.get();
                                emailService.sendOrderStatusUpdateToCustomer(
                                        order,
                                        user.getEmail(),
                                        user.getUsername()
                                );
                                System.out.println("Order confirmation email sent to customer: " + user.getUsername());
                            }
                        } catch (Exception e) {
                            System.err.println("Error sending customer email: " + e.getMessage());
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error sending merchant notification: " + e.getMessage());
                    // 邮件发送失败不应影响主流程
                }

                return ResponseEntity.ok(Map.of(
                        "message", "Order payment status updated successfully",
                        "orderId", orderId,
                        "status", "PAID"
                ));
            } else {
                // 处理其他状态更新...
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Unsupported status change",
                        "message", "Only PAID status is supported by this endpoint"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to update order status",
                    "message", e.getMessage()
            ));
        }
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

    @PutMapping("/updateMerchantOrderStatus/{orderId}")
    public ResponseEntity<?> updateMerchantOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status,
            @RequestBody(required = false) Map<String, Object> trackingInfo
    ) {
        try {
            // 获取订单
            Optional<Order> orderOptional = orderRepository.findById(orderId);

            if (orderOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Order order = orderOptional.get();
            OrderStatus newStatus;

            try {
                newStatus = OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid order status", "message", status));
            }

            // 保存原始状态，用于后续逻辑判断
            OrderStatus oldStatus = order.getStatus();

            // 更新订单状态和相关信息
            order.setStatus(newStatus);

            // 处理运输信息
            if (newStatus == OrderStatus.SHIPPED && trackingInfo != null) {
                if (trackingInfo.containsKey("trackingNumber")) {
                    order.setTrackingNumber((String) trackingInfo.get("trackingNumber"));
                }

                if (trackingInfo.containsKey("carrier")) {
                    order.setShippingCarrier((String) trackingInfo.get("carrier"));
                }

                if (trackingInfo.containsKey("notes")) {
                    order.setShippingNotes((String) trackingInfo.get("notes"));
                }
            }

            order.setUpdateAt(LocalDateTime.now());

            // 保存到数据库
            orderRepository.save(order);

            // 只有状态真正发生变化时才发送通知
            if (!oldStatus.equals(newStatus)) {
                try {
                    // 发送邮件给客户
                    Optional<User> userOptional = userClient.findUserById(order.getUserId());
                    if (userOptional.isPresent()) {
                        User user = userOptional.get();
                        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
                            emailService.sendOrderStatusUpdateToCustomer(
                                    order,
                                    user.getEmail(),
                                    user.getUsername()
                            );
                        }
                    }

                    // 发送邮件给商家
                    Optional<Merchant> merchantOptional = userClient.findMerchantById(order.getMerchantId());
                    if (merchantOptional.isPresent()) {
                        Merchant merchant = merchantOptional.get();
                        if (merchant.getContactEmail() != null && !merchant.getContactEmail().isEmpty()) {
                            emailService.sendOrderStatusUpdateToMerchant(
                                    order,
                                    merchant.getContactEmail(),
                                    merchant.getStoreName()
                            );
                        }
                    }
                } catch (Exception e) {
                    // 记录邮件发送错误，但不影响主流程
                    System.err.println("Error sending notification emails: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            return ResponseEntity.ok()
                    .body(Map.of(
                            "message", "Order status updated successfully",
                            "orderId", orderId,
                            "status", newStatus,
                            "statusChanged", !oldStatus.equals(newStatus)
                    ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to update order status", "message", e.getMessage()));
        }
    }

    @GetMapping("/getRecentOrders/{merchantId}")
    public ResponseEntity<Map<String, Object>> getRecentOrders(@PathVariable UUID merchantId) {
        try {
            // Get all orders for this merchant sorted by creation date (most recent first)
            List<Order> merchantOrders = orderRepository.findByMerchantIdOrderByCreateAtDesc(merchantId);
            merchantOrders.removeIf(order -> order.getStatus() == OrderStatus.PENDING);
            // Process orders to include their items - similar to getAllOrdersByMerchantId
            Map<String, Object> response = new HashMap<>();
            List<Map<String, Object>> processedOrders = new ArrayList<>();

            for (Order order : merchantOrders) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("status", order.getStatus());
                orderMap.put("totalAmount", order.getTotalAmount());
                orderMap.put("createAt", order.getCreateAt());

                // Get order items
                List<OrderItem> orderItems = orderItemService.getOrderItems(order.getOrderId());
                List<Map<String, Object>> items = new ArrayList<>();

                for (OrderItem item : orderItems) {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("itemId", item.getItemId());
                    itemMap.put("productId", item.getProductId());

                    // Get product name
                    try {
                        Product product = productClient.getProduct(item.getProductId());
                        if (product != null) {
                            itemMap.put("productName", product.getName());
                        } else {
                            itemMap.put("productName", "Product not found");
                        }
                    } catch (Exception e) {
                        itemMap.put("productName", "Product info unavailable");
                    }

                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("unitPrice", item.getUnitPrice());

                    items.add(itemMap);
                }

                orderMap.put("items", items);
                processedOrders.add(orderMap);
            }

            response.put("orders", processedOrders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get recent orders"));
        }
    }

    @GetMapping("/getSalesDifference/{merchantId}")
    public ResponseEntity<Map<String, Object>> getSalesDifference(@PathVariable UUID merchantId) {
        try {
            // Get current date/time in the system's timezone
            LocalDateTime now = LocalDateTime.now();

            // Calculate start of today and yesterday
            LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
            LocalDateTime startOfYesterday = startOfToday.minusDays(1);
            LocalDateTime endOfYesterday = startOfToday.minusSeconds(1);

            // Get orders from today
            List<Order> todayOrders = orderRepository.findByMerchantIdAndCreateAtBetweenAndStatusNot(
                    merchantId,
                    startOfToday,
                    now,
                    OrderStatus.CANCELLED
            );
            todayOrders.removeIf(order -> order.getStatus() == OrderStatus.PENDING);

            // Get orders from yesterday
            List<Order> yesterdayOrders = orderRepository.findByMerchantIdAndCreateAtBetweenAndStatusNot(
                    merchantId,
                    startOfYesterday,
                    endOfYesterday,
                    OrderStatus.CANCELLED
            );
            yesterdayOrders.removeIf(order -> order.getStatus() == OrderStatus.PENDING);

            // Calculate total sales for today
            double todaySales = todayOrders.stream()
                    .mapToDouble(Order::getTotalAmount)
                    .sum();

            // Calculate total sales for yesterday
            double yesterdaySales = yesterdayOrders.stream()
                    .mapToDouble(Order::getTotalAmount)
                    .sum();

            // Calculate percentage change
            double percentChange = 0;
            if (yesterdaySales > 0) {
                percentChange = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
            } else if (todaySales > 0) {
                percentChange = 100; // If yesterday was 0 but today has sales, show 100% increase
            }

            Map<String, Object> response = new HashMap<>();
            response.put("todaySales", todaySales);
            response.put("yesterdaySales", yesterdaySales);
            response.put("percentChange", Math.round(percentChange));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to calculate sales difference"));
        }
    }

    @GetMapping("/verifyPurchase/{userId}/{productId}")
    public ResponseEntity<Map<String, Boolean>> verifyPurchase(
            @PathVariable UUID userId,
            @PathVariable UUID productId) {
        List<Order> userOrders = orderRepository.findByUserIdAndStatusNot(userId, OrderStatus.PENDING);
        if (userOrders.isEmpty()) {
            return ResponseEntity.ok(Map.of("canReview", false));
        }

        for (Order order : userOrders) {
            List<OrderItem> orderItems = orderItemService.getOrderItems(order.getOrderId());
            for (OrderItem item : orderItems) {
                if (item.getProductId().equals(productId)) {
                    return ResponseEntity.ok(Map.of("canReview", true));
                }
            }
        }
        return ResponseEntity.ok(Map.of("canReview", false));
    }
}



