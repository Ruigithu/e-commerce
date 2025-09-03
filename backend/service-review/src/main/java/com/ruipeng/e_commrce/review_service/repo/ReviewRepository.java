package com.ruipeng.e_commrce.review_service.repo;

import com.ruipeng.e_commrce.review_service.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(UUID productId);
    boolean existsByProductIdAndUserId(UUID productId, UUID userId);
}