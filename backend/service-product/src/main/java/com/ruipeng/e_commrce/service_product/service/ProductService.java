package com.ruipeng.e_commrce.service_product.service;

import com.ruipeng.e_commrce.service_product.entity.Product;
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

//    @PostConstruct
//    public void init() {
//        // 检查数据是否为空，如果为空，则插入一些默认数据
//        if (repo.findAll().isEmpty()) {
//            Product product1 = new Product("商品1", "描述1", 100.0, 10, LocalDateTime.now());
//            Product product2 = new Product("商品2", "描述2", 200.0, 5, LocalDateTime.now());
//            repo.save(product1);
//            repo.save(product2);
//            System.out.println("已插入默认产品数据");
//        }
//    }

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
}
