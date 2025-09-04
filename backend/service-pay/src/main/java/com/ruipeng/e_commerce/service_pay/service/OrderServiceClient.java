package com.ruipeng.e_commerce.service_pay.service;

import com.ruipeng.e_commerce.service_pay.entity.OrderDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;


@FeignClient(
        name = "service-order"
)
public interface OrderServiceClient {
    @GetMapping("/getOrder/{orderId}")  // 移除了 /orders 前缀
    OrderDTO getOrder(@PathVariable UUID orderId);


    @PutMapping("/updateStatus/{orderId}")
    ResponseEntity<String> updateOrderStatus(
            @PathVariable("orderId") UUID orderId,
            @RequestParam("status") String status
    );
    @PostMapping("/notifications/create")
    ResponseEntity<?> createOrderNotification(@RequestBody Map<String, Object> notificationData);}

