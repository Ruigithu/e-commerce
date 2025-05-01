package com.ruipeng.e_commrce.service_product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruipeng.e_commrce.service_product.entity.*;
import com.ruipeng.e_commrce.service_product.repo.ProductImageRepo;
import com.ruipeng.e_commrce.service_product.repo.ProductRepo;
import com.ruipeng.e_commrce.service_product.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/")
@Slf4j
public class ProductController {


    private final ProductService productService;
    private final ProductRepo productRepo;
    private final ProductImageRepo productImageRepo;
    private ProductService service;

    @Autowired
    public ProductController(ProductService service, ProductService productService, ProductRepo productRepo, ProductImageRepo productImageRepo) {
        this.service = service;
        this.productService = productService;
        this.productRepo = productRepo;
        this.productImageRepo = productImageRepo;
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
        public List<ProductCategoryEnum> getProductCategory() {
            log.info("Received request for product categories");
            return service.findAllCategory();
        }
        @GetMapping("/product-images/{productId}")
        public List<ProductImage> getProductImages(@PathVariable UUID productId) {
            log.info("Received request for product images");
            return service.findAllImage(productId);
        }

        @GetMapping("/category/{displayName}")
        public List<Product> getProductsByCategoryName(@PathVariable String displayName) {
            System.out.println(displayName);
            return service.findByCategoryName(displayName);
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

    @PostMapping("/createNewProduct")
    public ResponseEntity<Product> createNewProduct(@RequestBody Map<String, Object> requestBody) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            // 检查是否有嵌套的 productData 字段
            Object productDataObj = requestBody.get("productData");
            Product product;

            if (productDataObj != null) {
                // 如果有嵌套，则从嵌套对象解析
                product = mapper.convertValue(productDataObj, Product.class);
            } else {
                // 如果没有嵌套，则直接从根对象解析
                product = mapper.convertValue(requestBody, Product.class);
            }

            // 设置必要的默认值
            if (product.getProductId() == null) {
                product.setProductId(UUID.randomUUID());
            }
            if (product.getCreateAt() == null) {
                product.setCreateAt(LocalDateTime.now());
            }

            // 处理枚举类型转换
            if (product.getStatus() == null) {
                product.setStatus(ProductStatusEnum.ACTIVE); // 设置默认状态
            }

            log.info("Processing product: {}", product);
            Product newProduct = productService.createNewProduct(product);

            if (newProduct != null) {
                return ResponseEntity.ok(newProduct);
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error creating product", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/updateProduct")
    public ResponseEntity<Product> updateProduct(@RequestBody Map<String, Object> requestBody) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            // 检查是否有嵌套的 productData 字段
            Object productDataObj = requestBody.get("productData");
            Product product;

            if (productDataObj != null) {
                // 如果有嵌套，则从嵌套对象解析
                product = mapper.convertValue(productDataObj, Product.class);
            } else {
                // 如果没有嵌套，则直接从根对象解析
                product = mapper.convertValue(requestBody, Product.class);
            }

            // 验证必要字段
            if (product.getProductId() == null) {
                return ResponseEntity.badRequest().build();
            }

            // 尝试获取原始产品数据
            Product existingProduct = productService.findById(product.getProductId());
            if (existingProduct == null) {
                return ResponseEntity.notFound().build();
            }

            // 保留不变的字段或设置默认值
            if (product.getCreateAt() == null) {
                product.setCreateAt(existingProduct.getCreateAt());
            }

            log.info("Updating product: {}", product);
            Product updatedProduct = productService.updateProduct(product);

            if (updatedProduct != null) {
                return ResponseEntity.ok(updatedProduct);
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error updating product", e);
            return ResponseEntity.internalServerError().build();
        }
    }



   @GetMapping("/getAllProductsByMerchantId/{merchantId}")
    public List<Product> getAllProductsByMerchantId(@PathVariable UUID merchantId) {
      List<Product> productList =  productService.getAllProductsByMerchantId(merchantId);
      if (productList!=null && !productList.isEmpty()) {
          return productList;
      }
      return null;
   }

    @PostMapping("/add-product-image")
    public ResponseEntity<ProductImage> addProductImage(@RequestBody Map<String, String> request) {
        try {
            String productIdStr = request.get("productId");
            String imageUrl = request.get("imageUrl");

            if (productIdStr == null || imageUrl == null) {
                return ResponseEntity.badRequest().build();
            }

            UUID productId;
            try {
                productId = UUID.fromString(productIdStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }

            // 检查产品是否存在
            Product product = productService.findById(productId);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }

            // 创建新的产品图片
            ProductImage productImage = new ProductImage();
            productImage.setImageId(UUID.randomUUID());
            productImage.setProductId(productId);
            productImage.setImageUrl(imageUrl);
            productImage.setCreatedAt(LocalDateTime.now());

            ProductImage savedImage = productService.saveProductImage(productImage);
            return ResponseEntity.ok(savedImage);
        } catch (Exception e) {
            log.error("Error adding product image", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/product-main-image/{productId}")
    public ResponseEntity<Map<String, String>> getProductMainImage(@PathVariable UUID productId) {
        try {
            List<ProductImage> images = productService.findAllImage(productId);
            if (images == null || images.isEmpty()) {
                return ResponseEntity.ok(Collections.singletonMap("imageUrl", ""));
            }

            // 返回第一张图片的URL
            return ResponseEntity.ok(Collections.singletonMap("imageUrl", images.get(0).getImageUrl()));
        } catch (Exception e) {
            log.error("Error getting product main image", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/deleteProduct/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable UUID productId) {
            productRepo.deleteById(productId);
            productImageRepo.deleteByProductId(productId);
            return ResponseEntity.ok().build();
    }
}