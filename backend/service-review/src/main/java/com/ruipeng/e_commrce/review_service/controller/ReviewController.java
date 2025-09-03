package com.ruipeng.e_commrce.review_service.controller;

import com.ruipeng.e_commrce.review_service.entity.Review;
import com.ruipeng.e_commrce.review_service.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

    @GetMapping("/canReview/{userId}/{productId}")
    public ResponseEntity<Map<String, Boolean>> canUserReview(
            @PathVariable UUID userId,
            @PathVariable UUID productId) {
        boolean canReview = reviewService.canUserReview(userId, productId);
        return ResponseEntity.ok(Map.of("canReview", canReview));
    }

    @PostMapping("/add")
    public ResponseEntity<Review> addReview(@RequestBody Review review) {
        Review savedReview = reviewService.addReview(review);
        return ResponseEntity.ok(savedReview);
    }

    @GetMapping("/getProduct/{productId}")
    public ResponseEntity<List<Review>> getReviewsByProductId(@PathVariable UUID productId) {
        System.out.println("productId: " + productId);
        List<Review> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(reviews);
    }
}