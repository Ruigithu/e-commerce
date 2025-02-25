package com.ruipeng.e_commrce.service_user.service;

import com.ruipeng.e_commrce.service_user.entity.Address;
import com.ruipeng.e_commrce.service_user.repo.AddressRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AddressService {

    private final AddressRepo addressRepo;

    public AddressService(AddressRepo addressRepo) {
        this.addressRepo = addressRepo;
    }

    public List<Address> getAddresses(UUID userId) {
        List<Address> addresses = addressRepo.getAddressesByUserId(userId);
        if (addresses == null) {
            return new ArrayList<>();
        }
        return addresses;
    }

    public Address getDefaultAddressByUserId(UUID userId) {
        System.out.println("getDefaultAddressByUserId");
        System.out.println(userId);
        return addressRepo.getDefaultAddressByUserId(userId);
    }

    public Address save(Address address) {
        return addressRepo.save(address);
    }
}
