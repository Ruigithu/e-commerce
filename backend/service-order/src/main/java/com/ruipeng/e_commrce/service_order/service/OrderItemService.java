package com.ruipeng.e_commrce.service_order.service;

import com.ruipeng.e_commrce.service_order.entity.OrderItem;
import com.ruipeng.e_commrce.service_order.repo.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemService {
    @Autowired
    private OrderItemRepository orderItemRepository;

    public OrderItemService(OrderItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    public void addOrderItems(List<OrderItem> itemList) {
         orderItemRepository.saveAll(itemList);
    }

    public void addOrderItem(OrderItem orderItem) {
        orderItemRepository.save(orderItem);
    }
}
