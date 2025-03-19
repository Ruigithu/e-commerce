package com.ruipeng.e_commrce.service_product.controller;

import com.ruipeng.e_commrce.service_product.entity.Product;
import com.ruipeng.e_commrce.service_product.entity.ProductCategory;
import com.ruipeng.e_commrce.service_product.entity.ProductImage;
import com.ruipeng.e_commrce.service_product.entity.ProductStockUpdateDTO;
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
        @GetMapping("/product-images/{productId}")
        public List<ProductImage> getProductImages(@PathVariable UUID productId) {
            log.info("Received request for product images");
            return service.findAllImage(productId);
        }

        @GetMapping("/category/{categoryId}")
        public List<Product> getProductsByCategoryId(@PathVariable UUID categoryId) {
            System.out.println(categoryId);
            return service.findByCategoryId(categoryId);
        }

    @PostMapping("/updateProductStock/{id}")
    public Product updateProductStock(@RequestBody ProductStockUpdateDTO stockUpdate, @PathVariable("id") UUID id) {
        Product p = service.findById(id);
        if(p != null && p.getStock() != stockUpdate.getStock()) {
            p.setStock(stockUpdate.getStock());
            return service.updateStock(p);
        }
        return null;
    }
}