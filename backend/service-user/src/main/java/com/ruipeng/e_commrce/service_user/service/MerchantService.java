package com.ruipeng.e_commrce.service_user.service;

import com.ruipeng.e_commrce.service_user.entity.Merchant;
import com.ruipeng.e_commrce.service_user.repo.MerchantRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MerchantService {
    @Autowired
    private MerchantRepo merchantRepo;

    public Merchant getMerchantInformation(UUID userId) {
       return merchantRepo.findByUserId(userId);
    }

    public Merchant registerMerchant(Merchant merchant) {
        return merchantRepo.save(merchant);
    }
}
