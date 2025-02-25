package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.entity.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@FeignClient(name = "service-product")
@RestController
public interface ProductClient {
    @GetMapping("/product/{id}")
    Product getProduct(@PathVariable("id") UUID productId);
}