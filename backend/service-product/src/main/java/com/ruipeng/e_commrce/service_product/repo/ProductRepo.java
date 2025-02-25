package com.ruipeng.e_commrce.service_product.repo;

import com.ruipeng.e_commrce.service_product.entity.Product;
import com.ruipeng.e_commrce.service_product.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;


@Repository
public interface ProductRepo extends JpaRepository<Product, UUID> {
    @Query(value = "SELECT * FROM product_category" , nativeQuery = true)
    List<ProductCategory> findAllCategory();

    @Query(value = "SELECT * FROM products WHERE category_id = ?1", nativeQuery = true)
    List<Product> findAllByCategoryId(UUID categoryId);

}
