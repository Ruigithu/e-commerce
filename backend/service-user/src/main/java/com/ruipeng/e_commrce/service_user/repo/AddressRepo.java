package com.ruipeng.e_commrce.service_user.repo;

import com.ruipeng.e_commrce.service_user.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AddressRepo extends JpaRepository<Address, UUID> {
    @Query("SELECT a FROM Address a WHERE a.userId = ?1")
    List<Address> getAddressesByUserId(UUID userId);

    @Query("SELECT a FROM Address a WHERE a.userId = :userId AND a.defaultAddress = true")
    Address getDefaultAddressByUserId(@Param("userId") UUID userId);

    @Query("SELECT a FROM Address a WHERE a.userId = :userId AND a.defaultAddress = false " +
            "ORDER BY a.createdAt ASC LIMIT 1")
    Address getTheSecondAddress(UUID userId);

    @Modifying
    @Query("UPDATE Address a SET a.defaultAddress = :defaultAddress WHERE a.addressId = :addressId")
    void updateNewDefault(UUID addressId, boolean defaultAddress);


}
