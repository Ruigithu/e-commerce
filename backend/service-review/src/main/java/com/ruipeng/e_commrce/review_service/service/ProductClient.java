package com.ruipeng.e_commrce.review_service.service;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@FeignClient(name = "service-product")
@RestController
public interface ProductClient {
    @GetMapping("/product/{productId}")
    Object getProduct(@PathVariable UUID productId);
}
