package com.ruipeng.e_commrce.service_user.entity;

public  enum  MerchantStatus {
    ACTIVE("ACTIVE"),
    SUSPENDED("SUSPENDED"),
    CLOSED("CLOSED");

    private final String status;

    MerchantStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
