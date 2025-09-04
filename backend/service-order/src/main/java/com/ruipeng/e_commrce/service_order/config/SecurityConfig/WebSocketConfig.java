package com.ruipeng.e_commrce.service_order.config.SecurityConfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

import java.util.Map;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

    @Autowired
    private CustomWebSocketHandler customWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        logger.info("注册 WebSocket 处理器");

        // Use the same allowed origins as defined in CorsConfig
        registry.addHandler(customWebSocketHandler, "/orders/ws")
                .setAllowedOrigins(CorsConfig.ALLOWED_ORIGINS)
                .addInterceptors(new MerchantHandshakeInterceptor());
        registry.addHandler(customWebSocketHandler, "/ws")
                .setAllowedOrigins(CorsConfig.ALLOWED_ORIGINS)
                .addInterceptors(new MerchantHandshakeInterceptor());
        logger.info("WebSocket 处理器已注册: /orders/ws, /ws");

    }

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(65536); // 增加到64KB
        container.setMaxBinaryMessageBufferSize(65536);
        container.setMaxSessionIdleTimeout(60 * 60 * 1000L); // 1小时
        container.setAsyncSendTimeout(30 * 1000L); // 30秒异步发送超时

        logger.info("WebSocket 容器已配置");
        return container;
    }

    /**
     * 商家 ID 握手拦截器
     */

    public static class MerchantHandshakeInterceptor implements HandshakeInterceptor {

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) {
            logger.info("WebSocket 握手开始: {}", request.getURI());

            // 打印所有请求头以便调试
            logger.debug("握手请求头:");
            request.getHeaders().forEach((key, value) ->
                    logger.debug("{}: {}", key, value));

            // 从查询参数中提取商家 ID
            String query = request.getURI().getQuery();
            String merchantId = null;

            if (query != null) {
                String[] params = query.split("&");
                for (String param : params) {
                    String[] keyValue = param.split("=");
                    if (keyValue.length == 2 && "merchantId".equals(keyValue[0])) {
                        merchantId = keyValue[1];
                        break;
                    }
                }
            }

            if (merchantId == null || merchantId.isEmpty()) {
                logger.warn("握手中没有提供商家 ID，连接将被拒绝");
                return false;
            }

            logger.info("握手中的商家 ID: {}", merchantId);

            // 将商家 ID 存储在会话属性中
            attributes.put("merchantId", merchantId);
            attributes.put("connectionTime", System.currentTimeMillis());

            return true;
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
            if (exception != null) {
                logger.error("WebSocket 握手失败: {}", exception.getMessage(), exception);
            } else {
                logger.info("WebSocket 握手成功完成: {}", request.getURI());
            }
        }
    }
}