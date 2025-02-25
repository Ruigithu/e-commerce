package com.ruipeng.e_commrce.service_user.controller;


import com.ruipeng.e_commrce.service_user.config.security.AppLogoutHandler;
import com.ruipeng.e_commrce.service_user.entity.Address;
import com.ruipeng.e_commrce.service_user.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.amqp.RabbitConnectionDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/")
public class AddressController {

    private AddressService service;

    @Autowired
    public AddressController(AddressService service, AppLogoutHandler appLogoutHandler) {
        this.service = service;
    }

    @GetMapping("/addresses/{userId}")
    public List<Address> getAddress(@PathVariable UUID userId) {

        return service.getAddresses(userId);
    }
    @PostMapping("/addAddress")
    public Address addAddress(@RequestBody Address address) {
        System.out.println(address.getAddressId());
       return service.save(address);

    }
}
