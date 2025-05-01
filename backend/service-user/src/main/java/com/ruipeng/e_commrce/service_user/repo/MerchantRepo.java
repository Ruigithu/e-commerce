package com.ruipeng.e_commrce.service_user.repo;

import com.ruipeng.e_commrce.service_user.entity.Merchant;
import com.ruipeng.e_commrce.service_user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MerchantRepo extends JpaRepository<Merchant, UUID> {
    @Query("SELECT m FROM Merchant m WHERE m.userId = ?1 ")
    Merchant findByUserId(UUID userId);
}
