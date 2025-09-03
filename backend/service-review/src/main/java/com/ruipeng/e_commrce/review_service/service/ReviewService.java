package com.ruipeng.e_commrce.review_service.service;

import com.ruipeng.e_commrce.review_service.repo.ReviewRepository;
import com.ruipeng.e_commrce.review_service.entity.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private OrderClient orderClient;

    @Autowired
    private ProductClient productClient;

    public boolean canUserReview(UUID userId, UUID productId) {
        // Validate product exists
        Object product = productClient.getProduct(productId);
        if (product == null) {
            return false;
        }

        // Check purchase history
        Map<String, Boolean> response = orderClient.verifyPurchase(userId, productId);
        return response.getOrDefault("canReview", false);
    }

    public Review addReview(Review review) {
        // Validate rating (1-5)
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        // Validate product exists
        Object product = productClient.getProduct(review.getProductId());
        if (product == null) {
            throw new IllegalArgumentException("Product not found");
        }
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByProductId(UUID productId) {
        return reviewRepository.findByProductId(productId);
    }
}
