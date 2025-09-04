package com.ruipeng.e_commrce.service_user.controller;

import com.ruipeng.e_commrce.service_user.entity.Merchant;
import com.ruipeng.e_commrce.service_user.repo.MerchantRepo;
import com.ruipeng.e_commrce.service_user.service.MerchantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
public class MerchantController {

    @Autowired
    private MerchantService merchantService;
    @Autowired
    private MerchantRepo merchantRepo;

    @GetMapping("/getMerchantInformation/{userId}")
    public ResponseEntity<Merchant> getMerchantInformation(@PathVariable("userId") UUID userId) {
        Merchant merchantInformation = merchantService.getMerchantInformation(userId);
        if (merchantInformation != null) {
            return ResponseEntity.ok(merchantInformation);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/registerMerchant")
    public ResponseEntity<Merchant> registerMerchant(@RequestBody Merchant merchant) {
        Merchant registeredMerchant = merchantService.registerMerchant(merchant);
        if (registeredMerchant != null) {
            return ResponseEntity.ok(registeredMerchant);
        }
        return ResponseEntity.internalServerError().build();
    }

    @GetMapping("/findMerchantById")
    public Optional<Merchant> findMerchantById(@RequestParam("merchantId") UUID merchantId){
        return  merchantRepo.findById(merchantId);
    }

}
