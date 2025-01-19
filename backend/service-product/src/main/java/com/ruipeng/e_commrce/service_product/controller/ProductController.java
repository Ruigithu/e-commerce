package com.ruipeng.e_commrce.service_product.controller;

import com.ruipeng.e_commrce.service_product.entity.Product;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.List;

@RestController
@RequestMapping("/products")
@Slf4j
public class ProductController {
    @GetMapping
    public List<Product> getProducts() {
        log.info("Received request for products");
        log.info("Request headers: {}", RequestContextHolder.currentRequestAttributes());
        return List.of(
                new Product(1, "商品1", 99.99, "这是商品1的描述"),
                new Product(2, "商品2", 199.99, "这是商品2的描述"),
                new Product(3, "商品3", 299.99, "这是商品3的描述")
        );
    }
}