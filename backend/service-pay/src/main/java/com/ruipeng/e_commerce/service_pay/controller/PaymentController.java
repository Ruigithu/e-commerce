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
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody Map<String, String> request) {
        System.out.println("Received request: " + request); // 添加日志
        UUID orderId = UUID.fromString(request.get("orderId"));
        Stripe.apiKey = secretKey;

        try {
            // 1. 获取订单信息（从数据库获取）
            OrderDTO order = orderServiceClient.getOrder(orderId);  // 从 Feign 客户端获取订单

            // 2. 只需要订单的总金额，而不关心每个商品的价格
            // 创建支付会话参数，使用 totalAmount 作为总金额
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("http://localhost:4200/payment-success?orderId=" + order.getOrderId())
                    .setCancelUrl("http://localhost:4200/payment-cancelled?orderId=" + order.getOrderId())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)  // 假设这是整个订单的商品数量，可能为 1（代表一个订单总额）
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("eur")
                                            .setUnitAmount(Math.round(order.getTotalAmount() * 100))
                                            .setProductData(  // 添加产品数据
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName("Order #" + order.getOrderId())
                                                            .setDescription("Payment for order")
                                                            .build()
                                            )
                                            .build()
                            )
                            .build())
                    .putMetadata("orderId", order.getOrderId().toString())  // 将订单 ID 放到元数据中
                    .build();

            // 3. 创建支付会话
            Session session = Session.create(params);


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

                    // 3. 更新订单状态
                    if (orderId != null) {
                        orderServiceClient.updateOrderStatus(UUID.fromString(orderId), "PAID");
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