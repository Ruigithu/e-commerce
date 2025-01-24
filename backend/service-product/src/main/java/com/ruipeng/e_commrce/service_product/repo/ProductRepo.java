package com.ruipeng.e_commrce.service_product.repo;

import com.ruipeng.e_commrce.service_product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface ProductRepo extends JpaRepository<Product, UUID> {

}
