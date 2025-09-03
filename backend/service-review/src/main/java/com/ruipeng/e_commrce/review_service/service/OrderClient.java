package com.ruipeng.e_commrce.review_service.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@FeignClient(name = "service-order")
@RestController
public interface OrderClient {
    @GetMapping("/verifyPurchase/{userId}/{productId}")
    Map<String, Boolean> verifyPurchase(@PathVariable UUID userId, @PathVariable UUID productId);
}
