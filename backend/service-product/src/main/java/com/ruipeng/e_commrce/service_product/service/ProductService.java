package com.ruipeng.e_commrce.service_product.service;

import com.ruipeng.e_commrce.service_product.entity.Product;

import com.ruipeng.e_commrce.service_product.entity.ProductCategoryEnum;
import com.ruipeng.e_commrce.service_product.entity.ProductImage;
import com.ruipeng.e_commrce.service_product.repo.ProductImageRepo;
import com.ruipeng.e_commrce.service_product.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {


    private final ProductRepo productRepo;
    private ProductRepo repo;
    private ProductImageRepo productImageRepo;

    @Autowired
    public ProductService(ProductRepo repo, ProductRepo productRepo,ProductImageRepo productImageRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
        this.productImageRepo = productImageRepo;
    }

    public List<Product> findAll() {
        List<Product> all = repo.findAll();
        if (all.isEmpty()) {
            System.out.println("没有找到任何产品");
        } else {
            for (Product p : all) {
                System.out.println("名字是：" + p.getName());
            }
        }
        return all;
    }

    public Product findById(UUID id) {
        Optional<Product> product = repo.findById(id);
        return product.orElse(null);

    }

    public List<ProductCategoryEnum> findAllCategory() {
        ProductCategoryEnum [] all = ProductCategoryEnum.values();
        if (all.length==0) {
            throw new RuntimeException("Category not found");
        }
        return Arrays.asList(all);
    }



    public List<ProductImage> findAllImage(UUID productId) {
        List<ProductImage> all = repo.findAllImage(productId);
        if (all.isEmpty()) {
            System.out.println("Image not found");
        } else {
            for (ProductImage image : all) {
                System.out.println("路径是：" + image.getImageUrl());
            }
        }
        return all;
    }
    public Product updateStock(Product product) {
        return repo.save(product);
    }

    public List<Product> findByCategoryName(String displayName) {
            List<Product> all = repo.findAllByCategoryName(displayName);
            if (all.isEmpty()) {
                System.out.println("Product not found");
            } else {
                for (Product p : all) {
                    System.out.println("名字是：" + p.getName());
                }
            }
            return all;
        }

    public Product createNewProduct(Product product) {
        return productRepo.save(product);
    }

    public List<Product> getAllProductsByMerchantId(UUID merchantId) {
       return productRepo.findAllByMerchantId(merchantId);
    }

    public Product updateProduct(Product product) {
        return productRepo.save(product);
    }

    public ProductImage saveProductImage(ProductImage productImage) {
        // 假设有一个 productImageRepo 仓库用于处理ProductImage实体
        return productImageRepo.save(productImage);
    }
}
