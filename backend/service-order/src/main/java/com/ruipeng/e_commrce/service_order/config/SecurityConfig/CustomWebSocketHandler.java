package com.ruipeng.e_commrce.service_order.config.SecurityConfig;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CustomWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomWebSocketHandler.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 按商家 ID 存储会话
    private final Map<String, Map<String, WebSocketSession>> merchantSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String merchantId = getMerchantId(session);

        if (merchantId != null) {
            // 存储会话
            merchantSessions.computeIfAbsent(merchantId, k -> new ConcurrentHashMap<>())
                    .put(session.getId(), session);

            logger.info("WebSocket 连接已建立 - 商家: {}, 会话: {}", merchantId, session.getId());

            // 记录连接信息
            logger.info("会话详情 - 远程地址: {}, 本地地址: {}, 协议版本: {}",
                    session.getRemoteAddress(),
                    session.getLocalAddress(),
                    session.getHandshakeHeaders().getFirst("Sec-WebSocket-Version"));

            // 发送欢迎消息
            try {
                Map<String, Object> welcome = new HashMap<>();
                welcome.put("type", "CONNECTION_ESTABLISHED");
                welcome.put("message", "WebSocket 连接已建立");
                welcome.put("timestamp", System.currentTimeMillis());
                welcome.put("sessionId", session.getId());

                String welcomeJson = objectMapper.writeValueAsString(welcome);
                logger.debug("准备发送欢迎消息: {}", welcomeJson);

                session.sendMessage(new TextMessage(welcomeJson));
                logger.info("已发送欢迎消息 - 商家: {}, 会话: {}", merchantId, session.getId());
            } catch (IOException e) {
                logger.error("发送欢迎消息失败", e);
            }
        } else {
            logger.warn("连接尝试缺少商家 ID，关闭连接");
            try {
                session.close(CloseStatus.POLICY_VIOLATION.withReason("缺少商家 ID"));
            } catch (IOException e) {
                logger.error("关闭无效会话失败", e);
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String merchantId = getMerchantId(session);

        try {
            // 打印原始消息
            String payload = message.getPayload();
            logger.info("收到原始消息 - 商家: {}, 会话: {}, 消息: {}",
                    merchantId, session.getId(), payload);

            // 检查消息是否为空
            if (payload == null || payload.trim().isEmpty()) {
                logger.error("收到空消息或只有空白的消息");
                sendErrorResponse(session, "消息内容为空");
                return;
            }

            // 尝试通过 Jackson 将消息解析为 JSON
            try {
                // 首先尝试解析为 JsonNode，这是最宽松的方式
                JsonNode jsonNode = objectMapper.readTree(payload);
                logger.debug("成功解析消息为 JSON: {}", jsonNode);

                // 检查消息类型字段是否存在
                if (!jsonNode.has("type")) {
                    logger.warn("消息缺少 'type' 字段: {}", payload);
                    sendErrorResponse(session, "消息缺少 type 字段");
                    return;
                }

                // 提取消息类型
                String type = jsonNode.get("type").asText();
                logger.debug("消息类型: {}", type);

                // 处理不同类型的消息
                if ("PING".equals(type)) {
                    handlePingMessage(session, jsonNode);
                } else if ("PONG".equals(type)) {
                    // 记录收到的 PONG 响应
                    logger.debug("收到 PONG 响应 - 会话: {}", session.getId());
                } else if ("HELLO".equals(type)) {
                    // 处理客户端发送的 HELLO 消息
                    handleHelloMessage(session, jsonNode);
                } else {
                    logger.info("收到未知类型消息: {}", type);
                    // 简单地发送回显响应
                    Map<String, Object> response = new HashMap<>();
                    response.put("type", "ECHO");
                    response.put("originalType", type);
                    response.put("timestamp", System.currentTimeMillis());
                    response.put("message", "收到未知类型的消息");

                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
                    logger.debug("已发送回显响应");
                }
            } catch (JsonProcessingException e) {
                logger.error("解析消息为 JSON 失败: {}", e.getMessage());
                logger.error("有问题的消息内容: '{}'", payload);
                sendErrorResponse(session, "无效的 JSON 格式: " + e.getMessage());
            }
        } catch (Exception e) {
            logger.error("处理消息时出现未预期的错误", e);
            try {
                sendErrorResponse(session, "处理消息时出现服务器错误");
            } catch (IOException ex) {
                logger.error("发送错误响应失败", ex);
            }
        }
    }

    /**
     * 发送错误响应给客户端
     */
    private void sendErrorResponse(WebSocketSession session, String errorMessage) throws IOException {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "ERROR");
        response.put("message", errorMessage);
        response.put("timestamp", System.currentTimeMillis());

        String responseJson = objectMapper.writeValueAsString(response);
        logger.debug("发送错误响应: {}", responseJson);

        session.sendMessage(new TextMessage(responseJson));
    }

    /**
     * 处理 PING 消息
     */
    private void handlePingMessage(WebSocketSession session, JsonNode payload) throws IOException {
        String id = payload.has("id") ? payload.get("id").asText() : null;
        logger.debug("收到 PING 消息, ID: {}", id);

        // 响应 ping 消息
        Map<String, Object> pongResponse = new HashMap<>();
        pongResponse.put("type", "PONG");
        pongResponse.put("timestamp", System.currentTimeMillis());
        if (id != null) {
            pongResponse.put("id", id);
        }

        String responseJson = objectMapper.writeValueAsString(pongResponse);
        logger.debug("发送 PONG 响应: {}", responseJson);

        session.sendMessage(new TextMessage(responseJson));
        logger.info("已发送 PONG 响应 - 会话: {}", session.getId());
    }
    /**
     * 检查字符串是否为有效的 JSON
     */
    private boolean isValidJson(String json) {
        try {
            objectMapper.readTree(json);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 发送无效消息响应
     */
    private void sendInvalidMessageResponse(WebSocketSession session) throws IOException {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "ERROR");
        response.put("message", "收到无效的 JSON 消息格式");
        response.put("timestamp", System.currentTimeMillis());

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    /**
     * 处理客户端发送的 HELLO 消息
     */
    private void handleHelloMessage(WebSocketSession session, JsonNode payload) throws IOException {
        String merchantId = getMerchantId(session);
        logger.info("收到客户端 HELLO 消息 - 商家: {}, 会话: {}", merchantId, session.getId());

        // 发送确认响应
        Map<String, Object> response = new HashMap<>();
        response.put("type", "WELCOME_MESSAGE");
        response.put("message", "您好！服务器已确认连接。");
        response.put("timestamp", System.currentTimeMillis());

        String responseJson = objectMapper.writeValueAsString(response);
        logger.debug("发送 WELCOME_MESSAGE 响应: {}", responseJson);

        session.sendMessage(new TextMessage(responseJson));
    }

    private void handlePingMessage(WebSocketSession session, Map<String, Object> payload) throws IOException {
        // 响应 ping 消息
        Map<String, Object> pongResponse = new HashMap<>();
        pongResponse.put("type", "PONG");
        pongResponse.put("timestamp", System.currentTimeMillis());
        if (payload.containsKey("id")) {
            pongResponse.put("id", payload.get("id"));
        }

        String responseJson = objectMapper.writeValueAsString(pongResponse);
        logger.debug("发送 PONG 响应: {}", responseJson);

        session.sendMessage(new TextMessage(responseJson));
        logger.debug("发送 PONG 响应 - 会话: {}", session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String merchantId = getMerchantId(session);

        logger.info("WebSocket 连接已关闭 - 商家: {}, 会话: {}, 状态代码: {}, 原因: {}",
                merchantId, session.getId(), status.getCode(), status.getReason());

        // 从跟踪映射中移除会话
        if (merchantId != null) {
            Map<String, WebSocketSession> sessions = merchantSessions.get(merchantId);
            if (sessions != null) {
                sessions.remove(session.getId());
                if (sessions.isEmpty()) {
                    merchantSessions.remove(merchantId);
                }
                logger.info("会话已从映射中移除 - 商家: {}, 会话: {}", merchantId, session.getId());
            }
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        String merchantId = getMerchantId(session);
        logger.error("WebSocket 传输错误 - 商家: {}, 会话: {}, 错误: {}",
                merchantId, session.getId(), exception.getMessage(), exception);

        // 记录更多详细信息以便调试
        try {
            logger.error("会话状态: 是否打开 = {}, 远程地址 = {}",
                    session.isOpen(), session.getRemoteAddress());
        } catch (Exception e) {
            logger.error("获取会话信息时出错", e);
        }
    }

    /**
     * 向特定商家发送通知
     */
    public boolean sendNotificationToMerchant(String merchantId, Object notification) {
        if (merchantId == null || merchantId.isEmpty()) {
            logger.error("无法发送通知: 商家 ID 为空");
            return false;
        }

        Map<String, Object> messageWrapper = new HashMap<>();
        messageWrapper.put("type", "ORDER_NOTIFICATION");
        messageWrapper.put("notification", notification);
        messageWrapper.put("timestamp", System.currentTimeMillis());

        Map<String, WebSocketSession> sessions = merchantSessions.get(merchantId);
        if (sessions == null || sessions.isEmpty()) {
            logger.warn("商家没有活动的 WebSocket 会话: {}", merchantId);
            return false;
        }

        boolean sentToAny = false;
        String notificationJson;

        try {
            notificationJson = objectMapper.writeValueAsString(messageWrapper);
            logger.debug("准备发送通知: {}", notificationJson);
        } catch (Exception e) {
            logger.error("序列化通知失败", e);
            return false;
        }

        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(notificationJson));
                    sentToAny = true;
                    logger.debug("通知已发送 - 商家: {}, 会话: {}", merchantId, session.getId());
                } catch (IOException e) {
                    logger.error("向会话发送通知失败: {}", session.getId(), e);
                }
            } else {
                logger.warn("尝试向已关闭的会话发送消息 - 商家: {}, 会话: {}", merchantId, session.getId());
            }
        }

        if (sentToAny) {
            logger.info("通知已发送给商家: {}", merchantId);
        } else {
            logger.warn("无法向任何会话发送通知 - 商家: {}", merchantId);
        }

        return sentToAny;
    }

    /**
     * 获取商家的活动会话数
     */
    public int getActiveSessionCount(String merchantId) {
        Map<String, WebSocketSession> sessions = merchantSessions.get(merchantId);
        if (sessions == null) {
            return 0;
        }
        return (int) sessions.values().stream().filter(WebSocketSession::isOpen).count();
    }

    /**
     * 获取总活动会话数
     */
    public int getTotalActiveSessionCount() {
        return merchantSessions.values().stream()
                .mapToInt(sessions -> (int) sessions.values().stream()
                        .filter(WebSocketSession::isOpen)
                        .count())
                .sum();
    }

    /**
     * 从会话属性中提取商家 ID
     */
    private String getMerchantId(WebSocketSession session) {
        Object merchantId = session.getAttributes().get("merchantId");
        return merchantId != null ? merchantId.toString() : null;
    }
}