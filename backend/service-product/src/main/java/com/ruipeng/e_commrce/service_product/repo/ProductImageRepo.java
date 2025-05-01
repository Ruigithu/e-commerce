package com.ruipeng.e_commrce.service_product.repo;

import com.ruipeng.e_commrce.service_product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductImageRepo extends JpaRepository<ProductImage, UUID> {

    void deleteByProductId(UUID productId);
}
