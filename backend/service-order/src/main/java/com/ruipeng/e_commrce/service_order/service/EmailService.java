package com.ruipeng.e_commrce.service_order.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;


import com.ruipeng.e_commrce.service_order.entity.Order;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired(required = false)
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username:no-reply@example.com}")
    private String fromEmail;

    @Value("${app.email.sender-name:E-Commerce Store}")
    private String senderName;

    /**
     * 发送简单文本邮件
     */
    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            emailSender.send(message);
            System.out.println("Email sent to " + to + " with subject: " + subject);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            // 记录错误但不抛出异常，不影响主业务流程
        }
    }


    /**
     * 发送订单状态更新通知给顾客
     */
    public void sendOrderStatusUpdateToCustomer(Order order, String customerEmail, String customerName) {
        try {
            // 创建纯文本邮件
            String message = createPlainTextOrderStatusEmail(order, customerName);

            // 根据状态设置邮件主题
            String subject = "";
            switch (order.getStatus()) {
                case PROCESSING:
                    subject = "Your Order #" + order.getOrderId().toString().substring(0, 8) + " is Being Processed";
                    break;
                case SHIPPED:
                    subject = "Your Order #" + order.getOrderId().toString().substring(0, 8) + " Has Been Shipped";
                    break;
                case DELIVERED:
                    subject = "Your Order #" + order.getOrderId().toString().substring(0, 8) + " Has Been Delivered";
                    break;
                default:
                    subject = "Update on Your Order #" + order.getOrderId().toString().substring(0, 8);
            }

            // 直接发送简单文本邮件
            sendSimpleMessage(customerEmail, subject, message);

        } catch (Exception e) {
            System.err.println("Error sending customer email notification: " + e.getMessage());
        }
    }

    /**
     * 发送订单状态更新通知给商家
     */
    public void sendOrderStatusUpdateToMerchant(Order order, String merchantEmail, String merchantName) {
        try {
            // 创建纯文本邮件
            String message = createPlainTextMerchantOrderStatusEmail(order, merchantName);

            // 设置邮件主题
            String subject = "Order #" + order.getOrderId().toString().substring(0, 8) + " Status Updated: " + order.getStatus().name();

            // 直接发送简单文本邮件
            sendSimpleMessage(merchantEmail, subject, message);

        } catch (Exception e) {
            System.err.println("Error sending merchant email notification: " + e.getMessage());
        }
    }

    private String createPlainTextOrderStatusEmail(Order order, String customerName) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(customerName).append(",\n\n");
        sb.append("There's an update to your recent order #").append(order.getOrderId().toString().substring(0, 8)).append(".\n\n");
        sb.append("Order Status: ").append(order.getStatus().name()).append("\n\n");

        // 根据不同状态添加不同内容
        switch (order.getStatus()) {
            case PROCESSING:
                sb.append("Great news! We're now processing your order. We'll prepare and pack your items with care.\n\n");
                break;
            case SHIPPED:
                sb.append("Your order has been shipped and is on its way to you!\n\n");

                // 添加跟踪信息（如果有）
                if (order.getTrackingNumber() != null) {
                    sb.append("Tracking Information:\n");
                    sb.append("Tracking Number: ").append(order.getTrackingNumber()).append("\n");
                    sb.append("Carrier: ").append(order.getShippingCarrier()).append("\n\n");

                    String trackingUrl = generateTrackingUrl(order.getShippingCarrier(), order.getTrackingNumber());
                    if (trackingUrl != null) {
                        sb.append("Track your package at: ").append(trackingUrl).append("\n\n");
                    }
                }
                break;
            case DELIVERED:
                sb.append("Your order has been delivered. We hope you enjoy your purchase!\n\n");
                sb.append("If you have any questions or need assistance, please don't hesitate to contact our customer service.\n\n");
                break;
            default:
                sb.append("Thank you for your order. Your current order status is: ").append(order.getStatus().name()).append(".\n\n");
        }

        sb.append("Thank you for shopping with us!\n\n");
        sb.append("Best Regards,\n");
        sb.append(senderName).append("\n\n");
        sb.append("This is an automated message, please do not reply directly to this email.");

        return sb.toString();
    }

    /**
     * 创建简单文本格式的商家订单状态更新邮件
     */
    private String createPlainTextMerchantOrderStatusEmail(Order order, String merchantName) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(merchantName).append(",\n\n");
        sb.append("An order in your store has been updated to the following status:\n\n");
        sb.append("Order #").append(order.getOrderId().toString().substring(0, 8)).append("\n");
        sb.append("Status: ").append(order.getStatus().name()).append("\n\n");

        // 根据不同状态添加不同内容
        switch (order.getStatus()) {
            case PROCESSING:
                sb.append("The order has been marked as processing. Please prepare the items for shipment.\n\n");
                break;
            case SHIPPED:
                sb.append("The order has been marked as shipped with the following tracking information:\n\n");

                // 添加跟踪信息
                if (order.getTrackingNumber() != null) {
                    sb.append("Tracking Number: ").append(order.getTrackingNumber()).append("\n");
                    sb.append("Carrier: ").append(order.getShippingCarrier()).append("\n");

                    if (order.getShippingNotes() != null && !order.getShippingNotes().isEmpty()) {
                        sb.append("Shipping Notes: ").append(order.getShippingNotes()).append("\n");
                    }
                    sb.append("\n");
                }
                break;
            case DELIVERED:
                sb.append("The order has been marked as delivered to the customer.\n\n");
                break;
            default:
                sb.append("The order status has been updated. Please check your merchant dashboard for more details.\n\n");
        }

        sb.append("You can view the full order details in your merchant dashboard.\n\n");
        sb.append("Thank you for your business!\n\n");
        sb.append("Best Regards,\n");
        sb.append("E-Commerce Platform Team");

        return sb.toString();
    }

    /**
     * 根据承运商和跟踪号生成跟踪URL
     */
    private String generateTrackingUrl(String carrier, String trackingNumber) {
        if (carrier == null || trackingNumber == null) {
            return null;
        }

        // 根据不同的承运商返回不同的跟踪URL
        switch (carrier.toUpperCase()) {
            case "DHL":
                return "https://www.dhl.com/en/express/tracking.html?AWB=" + trackingNumber;
            case "FEDEX":
                return "https://www.fedex.com/fedextrack/?trknbr=" + trackingNumber;
            case "UPS":
                return "https://www.ups.com/track?tracknum=" + trackingNumber;
            case "USPS":
                return "https://tools.usps.com/go/TrackConfirmAction?tLabels=" + trackingNumber;
            case "ROYAL MAIL":
                return "https://www.royalmail.com/track-your-item#/tracking-results/" + trackingNumber;
            default:
                return null;
        }
    }
}