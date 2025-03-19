package com.ruipeng.e_commrce.service_user.controller;


import com.ruipeng.e_commrce.service_user.config.security.AppLogoutHandler;
import com.ruipeng.e_commrce.service_user.entity.Address;
import com.ruipeng.e_commrce.service_user.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.amqp.RabbitConnectionDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
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
        try {
            if(address.isDefaultAddress()){
                Address address1 = service.getDefaultAddressByUserId(address.getUserId());
                address1.setDefaultAddress(false);
                service.updateDefaultAddress(address1);
            }
        }catch (Exception e){
            e.printStackTrace();
        }

       return service.save(address);

    }
    @DeleteMapping("/deleteAddress/{addressId}")
    public void deleteAddress(@PathVariable UUID addressId) {
        System.out.println(addressId);
        Optional<Address> address = service.getAddress(addressId);
        try {
            if (address.isPresent()&& address.get().isDefaultAddress()) {
                Address newDefault=  service.getTheSecondAddress(address.get().getUserId());
                newDefault.setDefaultAddress(true);
                service.updateDefaultAddress(newDefault);
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        service.deleteAddress(addressId);

    }
    @PutMapping("/updateAddress/{addressId}")
    public Address updateAddress(@PathVariable UUID addressId,
                                       @RequestBody Address address) {

        return  service.updateAddress(addressId,address);
    }
}
