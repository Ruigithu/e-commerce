package com.ruipeng.e_commrce.service_user.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "merchants")
public class Merchant {
    @Id
    private UUID merchantId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;        // 关联到用户账号

    private String storeName;      // 店铺名称
    private String description;   // 店铺描述
    private String logoPath;;           // 店铺logo
    private String contactEmail;   // 联系邮箱
    private String contactPhone;   // 联系电话
    private String address;        // 店铺地址
    private LocalDateTime createdAt;      // 创建时间
    private MerchantStatus status; // 商家状态（活跃/暂停/关闭）

    public Merchant(UUID merchantId, UUID userId, String storeName, String description, String logoPath, String contactEmail, String contactPhone, String address, LocalDateTime createdAt, MerchantStatus status) {
        this.merchantId = merchantId;
        this.userId = userId;
        this.storeName = storeName;
        this.description = description;
        this.logoPath = logoPath;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.address = address;
        this.createdAt = createdAt;
        this.status = status;
    }


    public Merchant() {

    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoPath() {
        return logoPath;
    }

    public void setLogoPath(String logoPath) {
        this.logoPath = logoPath;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public MerchantStatus getStatus() {
        return status;
    }

    public void setStatus(MerchantStatus status) {
        this.status = status;
    }
}
