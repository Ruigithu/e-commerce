package com.ruipeng.e_commerce.service_pay.service;

import com.ruipeng.e_commerce.service_pay.entity.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;


@FeignClient(
        name = "service-order"
)
public interface OrderServiceClient {
    @GetMapping("/getOrder/{orderId}")  // 移除了 /orders 前缀
    OrderDTO getOrder(@PathVariable UUID orderId);


    @PutMapping("/{orderId}/status")  // 同样移除 /orders 前缀
    void updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status,
            @RequestParam(required = false) String stripeSessionId
    );
}

