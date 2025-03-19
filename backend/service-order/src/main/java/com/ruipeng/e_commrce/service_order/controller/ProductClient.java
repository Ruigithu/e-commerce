package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.entity.Product;
import com.ruipeng.e_commrce.service_order.entity.ProductStockUpdateDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@FeignClient(name = "service-product")
@RestController
public interface ProductClient {
    @GetMapping("/product/{id}")
    Product getProduct(@PathVariable("id") UUID productId);

    @PostMapping("/updateProductStock/{id}")
    Product updateProductStock(@RequestBody ProductStockUpdateDTO stockUpdate, @PathVariable("id") UUID id);
}