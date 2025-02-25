package com.ruipeng.e_commrce.service_product.controller;

import com.ruipeng.e_commrce.service_product.entity.Product;
import com.ruipeng.e_commrce.service_product.entity.ProductCategory;
import com.ruipeng.e_commrce.service_product.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/")
@Slf4j
public class ProductController {


    private ProductService service;

    @Autowired
    public ProductController(ProductService service) {
        this.service = service;
    }

        @GetMapping
        public List<Product> getProducts() {
            log.info("Received request for products");
            return service.findAll();
        }

        @GetMapping("/product/{productId}")
        public Product getProduct(@PathVariable UUID productId) {
            return service.findById(productId);
        }

        @GetMapping("/product-categories")
        public List<ProductCategory> getProductCategory() {
            log.info("Received request for product categories");
            return service.findAllCategory();
        }

    @GetMapping("/category/{categoryId}")
    public List<Product> getProductsByCategoryId(@PathVariable UUID categoryId) {
        System.out.println(categoryId);
        return service.findByCategoryId(categoryId);
    }
}