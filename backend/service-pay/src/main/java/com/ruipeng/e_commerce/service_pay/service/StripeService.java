package com.ruipeng.e_commerce.service_pay.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.publishable-key}")
    private String publishableKey;

    public void configureStripe() {
        com.stripe.Stripe.apiKey = secretKey;
        System.out.println("Stripe configured with Publishable Key: " + publishableKey);
    }
}

