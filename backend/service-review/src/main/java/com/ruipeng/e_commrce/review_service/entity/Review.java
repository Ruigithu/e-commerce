package com.ruipeng.e_commrce.review_service.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "reviews")
@Getter
@Setter
public class Review {
    @Id
    private String id;
    private UUID productId;
    private UUID userId;
    private String username;
    private int rating; // 1-5 stars
    private String title;
    private String content;
    private LocalDateTime createdAt;

    public Review() {}

    public Review(UUID productId, UUID userId, String username, int rating, String title, String content) {
        this.productId = productId;
        this.userId = userId;
        this.username = username;
        this.rating = rating;
        this.title = title;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }
}