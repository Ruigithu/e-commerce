package com.ruipeng.e_commrce.service_order.controller;

import com.ruipeng.e_commrce.service_order.entity.Merchant;
import com.ruipeng.e_commrce.service_order.entity.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@FeignClient(name = "service-user")
@RestController
public interface UserClient {
    @GetMapping("/findUserById")
     Optional<User> findUserById(@RequestParam("userId") UUID userId) ;

    @GetMapping("/findMerchantById")
     Optional<Merchant> findMerchantById(@RequestParam("merchantId") UUID merchantId) ;
}
