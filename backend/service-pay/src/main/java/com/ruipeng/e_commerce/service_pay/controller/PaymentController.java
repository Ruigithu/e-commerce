package com.ruipeng.e_commerce.service_pay.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruipeng.e_commerce.service_pay.entity.OrderDTO;
import com.ruipeng.e_commerce.service_pay.service.OrderServiceClient;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
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

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

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
            logger.error(e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        System.out.println("开始处理支付结果");
        logger.info("Received Stripe webhook");
        Stripe.apiKey = secretKey;

        try {
            // 1. 验证 Webhook 签名
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            logger.info("Webhook signature verified. Event type: {}", event.getType());

            // 2. 处理支付成功事件
            if ("checkout.session.completed".equals(event.getType())) {
                logger.info("Processing checkout.session.completed event");

                try {
                    // 使用 Jackson 解析 JSON
                    ObjectMapper objectMapper = new ObjectMapper();

                    // 从 payload 解析 JSON
                    JsonNode rootNode = objectMapper.readTree(payload);

                    // 获取 data.object 节点（这是 session 对象）
                    JsonNode dataNode = rootNode.path("data").path("object");

                    if (dataNode == null) {
                        logger.error("Session object not found in JSON data");
                        return ResponseEntity.ok("Event received but session object not found");
                    }

                    // 获取会话ID用于日志记录
                    String sessionId = dataNode.has("id") ? dataNode.get("id").asText() : "unknown";
                    logger.info("Processing session ID: {}", sessionId);

                    // 处理使用 Jackson JsonNode
                    processPaymentSuccessWithJsonNode(dataNode);

                } catch (Exception e) {
                    logger.error("Error processing checkout.session.completed event", e);
                    return ResponseEntity.ok("Event received but processing failed: " + e.getMessage());
                }
            }

            return ResponseEntity.ok("Webhook processed successfully");

        } catch (SignatureVerificationException e) {
            logger.error("Webhook signature verification failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Signature verification failed");
        } catch (Exception e) {
            logger.error("Error processing webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Webhook processing failed");
        }
    }

    /**
     * 使用 Jackson JsonNode 处理支付成功事件
     */


    private void processPaymentSuccessWithJsonNode(JsonNode sessionNode) {
        logger.info("Processing payment success with JsonNode");

        try {
            // 1. 尝试获取元数据
            if (!sessionNode.has("metadata") || sessionNode.get("metadata").isNull()) {
                logger.warn("No metadata found in session object");
                return;
            }

            JsonNode metadata = sessionNode.get("metadata");
            logger.info("Session metadata found: {}", metadata);

            // 2. 处理单订单场景
            if (metadata.has("orderId") && !metadata.get("orderId").isNull()) {
                String orderId = metadata.get("orderId").asText();
                logger.info("Processing single order payment: {}", orderId);

                try {
                    // 更新订单状态
                    boolean updated = orderServiceClient.updateOrderStatus(
                            UUID.fromString(orderId.trim()), "PAID").getStatusCode() == HttpStatusCode.valueOf(200);

                    logger.info("Order update result for {}: {}", orderId, updated);

                    if (updated) {
                        // 获取订单详情以获取商家ID和金额
                        OrderDTO order = orderServiceClient.getOrder(UUID.fromString(orderId.trim()));

                        // 如果订单存在商家ID，发送通知
                        if (order != null && order.getMerchantId() != null) {
                            sendOrderNotification(order);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Failed to update single order {}: {}", orderId, e.getMessage(), e);
                }
            }
            // 3. 处理多订单场景
            else if (metadata.has("orderIds") && !metadata.get("orderIds").isNull()) {
                String orderIdsStr = metadata.get("orderIds").asText();
                logger.info("Processing multiple orders payment: {}", orderIdsStr);

                String[] orderIds = orderIdsStr.split(",");
                for (String id : orderIds) {
                    try {
                        // 更新订单状态
                        boolean updated = orderServiceClient.updateOrderStatus(
                                UUID.fromString(id.trim()), "PAID").getStatusCode() == HttpStatusCode.valueOf(200);

                        logger.info("Order update result for {}: {}", id, updated);

                        if (updated) {
                            // 获取订单详情
                            OrderDTO order = orderServiceClient.getOrder(UUID.fromString(id.trim()));

                            // 发送通知
                            if (order != null && order.getMerchantId() != null) {
                                sendOrderNotification(order);
                            }
                        }
                    } catch (Exception e) {
                        logger.error("Failed to update order {}: {}", id, e.getMessage(), e);
                    }
                }
            } else {
                logger.warn("No recognized order information found in session metadata");
            }
        } catch (Exception e) {
            logger.error("Error in processPaymentSuccessWithJsonNode: {}", e.getMessage(), e);
        }
    }

    /**
     * 发送订单通知
     */
    private void sendOrderNotification(OrderDTO order) {
        try {
            // 准备通知数据
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("merchantId", order.getMerchantId().toString());
            notificationData.put("orderId", order.getOrderId().toString());
            notificationData.put("orderNumber", order.getOrderId().toString().substring(0, 8)); // 使用订单ID前8位作为订单编号
            notificationData.put("amount", order.getTotalAmount());

            // 添加消息和类型以兼容新的通知服务
            notificationData.put("message", "New order payment received: " + order.getOrderId().toString().substring(0, 8));
            notificationData.put("type", "PAYMENT_RECEIVED");

            // 调用通知服务
            ResponseEntity<?> response = orderServiceClient.createOrderNotification(notificationData);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Notification sent successfully for order: {}", order.getOrderId());
            } else {
                logger.warn("Failed to send notification for order: {}, status: {}",
                        order.getOrderId(), response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Error sending notification for order {}: {}",
                    order.getOrderId(), e.getMessage(), e);
            // 通知发送失败不应影响主流程
        }
    }
}