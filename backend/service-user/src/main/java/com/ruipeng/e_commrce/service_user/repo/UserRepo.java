package com.ruipeng.e_commrce.service_user.repo;

import com.ruipeng.e_commrce.service_user.entity.User;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User, UUID> {
    @Query("SELECT u FROM User u WHERE u.email = ?1 ")
     User findByEmail(String email);
    @Query("SELECT u FROM User u WHERE u.username = ?1")
    User findByUsername(String username);
}
