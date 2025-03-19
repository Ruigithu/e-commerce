package com.ruipeng.e_commrce.service_product.service;

import com.ruipeng.e_commrce.service_product.entity.Product;
import com.ruipeng.e_commrce.service_product.entity.ProductCategory;
import com.ruipeng.e_commrce.service_product.entity.ProductImage;
import com.ruipeng.e_commrce.service_product.repo.ProductRepo;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {


    private ProductRepo repo;

    @Autowired
    public ProductService(ProductRepo repo) {
        this.repo = repo;
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

    public List<ProductCategory> findAllCategory() {
        List<ProductCategory> all = repo.findAllCategory();
        if (all.isEmpty()) {
            System.out.println("没有找到任何产品种类");
        } else {
            for (ProductCategory p : all) {
                System.out.println("名字是：" + p.getName());
            }
        }
        return all;
    }

    public List<Product> findByCategoryId(UUID categoryId) {
        List<Product> all = repo.findAllByCategoryId(categoryId);
        if (all.isEmpty()) {
            System.out.println("没有找到任何产品");
        } else {
            for (Product p : all) {
                System.out.println("名字是：" + p.getName());
            }
        }
        return all;
    }

    public List<ProductImage> findAllImage(UUID productId) {
        List<ProductImage> all = repo.findAllImage(productId);
        if (all.isEmpty()) {
            System.out.println("没有找到任何产品种类");
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
}
