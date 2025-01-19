package com.ruipeng.e_commrce.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
public class GatewayConfiguration {

    @Bean
    public WebFilter corsFilter() {
        return (ServerWebExchange ctx, WebFilterChain chain) -> {
            ServerHttpRequest request = ctx.getRequest();
            String origin = request.getHeaders().getOrigin();

            if (origin != null) {
                HttpHeaders headers = ctx.getResponse().getHeaders();
                headers.add("Access-Control-Allow-Origin", "http://localhost:4200");
                headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                headers.add("Access-Control-Allow-Headers", "*");
                headers.add("Access-Control-Allow-Headers","Content-Type");
                headers.add("Access-Control-Allow-Credentials", "true");
                headers.add("Access-Control-Max-Age", "3600");

                if (request.getMethod() == HttpMethod.OPTIONS) {
                    ctx.getResponse().setStatusCode(HttpStatus.OK);
                    return Mono.empty();
                }
            }
            return chain.filter(ctx);
        };
    }
}