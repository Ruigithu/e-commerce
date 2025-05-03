package com.ruipeng.e_commerce.service_pay.controller;

import com.ruipeng.e_commerce.service_pay.entity.OrderDTO;
import com.ruipeng.e_commerce.service_pay.service.OrderServiceClient;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
public class PaymentController {

    @Autowired
    private OrderServiceClient orderServiceClient;
    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody Map<String, Object> request) {
        System.out.println("Received request: " + request); // 添加日志

        Stripe.apiKey = secretKey;

        try {
            SessionCreateParams.Builder paramsBuilder;

            if (request.containsKey("orderId")) {
                // 单订单处理逻辑
                UUID orderId = UUID.fromString((String) request.get("orderId"));

                // 获取订单信息（从数据库获取）
                OrderDTO order = orderServiceClient.getOrder(orderId);

                // 创建单订单支付会话参数
                paramsBuilder = SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl("http://localhost:4200/payment-success?orderId=" + order.getOrderId())
                        .setCancelUrl("http://localhost:4200/payment-cancelled?orderId=" + order.getOrderId())
                        .addLineItem(SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(Math.round(order.getTotalAmount() * 100))
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Order #" + order.getOrderId())
                                                                .setDescription("Payment for order")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build());

                // 将订单 ID 放到元数据中
                paramsBuilder.putMetadata("orderId", order.getOrderId().toString());

            } else if (request.containsKey("orderIds")) {
                // 多订单处理逻辑
                List<String> orderIds = (List<String>) request.get("orderIds");
                Object totalAmountObj = request.get("totalAmount");
                double totalAmount;

                // 处理 totalAmount 可能是 Double 或 Integer 的情况
                if (totalAmountObj instanceof Number) {
                    totalAmount = ((Number) totalAmountObj).doubleValue();
                } else {
                    totalAmount = Double.parseDouble(totalAmountObj.toString());
                }

                // 创建多订单支付会话参数
                paramsBuilder = SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl("http://localhost:4200/payment-success")
                        .setCancelUrl("http://localhost:4200/payment-cancelled")
                        .addLineItem(SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(Math.round(totalAmount * 100))
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Order Payment")
                                                                .setDescription("Payment for " + orderIds.size() + " order(s)")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build());

                // 将多个订单 ID 放到元数据中
                paramsBuilder.putMetadata("orderIds", String.join(",", orderIds));
                paramsBuilder.putMetadata("totalAmount", String.valueOf(totalAmount));

            } else {
                // 如果既没有 orderId 也没有 orderIds，返回错误请求
                return ResponseEntity.badRequest().build();
            }

            // 构建参数并创建支付会话
            SessionCreateParams params = paramsBuilder.build();
            Session session = Session.create(params);

            // 准备响应数据
            Map<String, String> responseData = new HashMap<>();
            responseData.put("id", session.getId());
            responseData.put("url", session.getUrl());
            return ResponseEntity.ok(responseData);

        } catch (StripeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                      @RequestHeader("Stripe-Signature") String sigHeader) {
        // 记录收到的webhook请求
        Stripe.apiKey = secretKey;

        try {
            // 1. 验证 Webhook 签名
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            // 2. 处理支付成功事件
            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);

                if (session != null) {
                    String orderId = session.getMetadata().get("orderId");
                    String orderIdsStr = session.getMetadata().get("orderIds");

                    if (orderId != null) {
                        // 处理单订单
                        orderServiceClient.updateOrderStatus(UUID.fromString(orderId), "PAID");
                    } else if (orderIdsStr != null) {
                        // 处理多订单
                        String[] orderIds = orderIdsStr.split(",");
                        for (String id : orderIds) {
                            orderServiceClient.updateOrderStatus(UUID.fromString(id.trim()), "PAID");
                        }
                    }
                }
            }

            return ResponseEntity.ok("Webhook received");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }
    }
}