package com.ruipeng.e_commrce.service_order.service;

import com.ruipeng.e_commrce.service_order.controller.ProductClient;
import com.ruipeng.e_commrce.service_order.entity.*;
import com.ruipeng.e_commrce.service_order.repo.CartItemRepository;
import com.ruipeng.e_commrce.service_order.repo.CartRepository;
import com.ruipeng.e_commrce.service_order.repo.OrderItemRepository;
import com.ruipeng.e_commrce.service_order.repo.OrderRepository;
import jakarta.transaction.Transactional;
import org.hibernate.service.spi.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductClient productClient; // Feign客户端获取商品信息



    @Transactional
    public Order createOrderFromShoppingCart(UUID userId, UUID addressId) {
        // 1. 获取用户购物车
        ShoppingCart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Shopping cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getCartId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Shopping cart is empty");
        }

        // 2. 创建新订单
        Order order = new Order();
        order.setOrderId(UUID.randomUUID());
        order.setUserId(userId);
        order.setShippingAddressId(addressId);
        order.setStatus(OrderStatus.PENDING);
        order.setCreateAt(LocalDateTime.now());

        // 3. 计算总金额并转换购物车项到订单项
        double totalAmount = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem item : cartItems) {
            // 获取产品信息（通过Feign）
            Product product = productClient.getProduct(item.getProductId());

            OrderItem orderItem = new OrderItem();
            orderItem.setItemId(UUID.randomUUID());
            orderItem.setOrderId(order.getOrderId());
            orderItem.setProductId(item.getProductId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            totalAmount += (product.getPrice() * item.getQuantity());
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);

        // 4. 保存订单和订单项
        orderRepository.save(order);
        orderItemRepository.saveAll(orderItems);

        return order;
    }

    public Order createNewOrder(Order order) {
        return orderRepository.save(order);
    }

    public Order getOrderByOrderId(UUID orderId) {
        return orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public boolean updateOrderPaymentStatus(UUID orderId) {
        Optional<Order> orderOptional = orderRepository.findById(orderId);

        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            order.setStatus(OrderStatus.PAID);  // 更新状态为已支付
            orderRepository.save(order);
            return true;
        } else {
            return false;
        }
    }

    public List<Order> getAllOrdersByUserId(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("用户ID不能为空");
        }

        try {
            // 从数据库查询用户的所有订单
            List<Order> userOrders = orderRepository.findByUserId(userId);

            // 如果找不到订单，返回空列表或抛出异常
            if (userOrders.isEmpty()) {
                // 选项1: 返回空列表
                return Collections.emptyList();

                // 选项2: 抛出自定义异常
                // throw new OrderNotFoundException("未找到用户 " + userId + " 的订单");
            }

            // 返回找到的订单列表
            return userOrders;
        } catch (DataAccessException e) {

            throw new ServiceException("获取订单数据时发生错误", e);
        }
    }
}
