package com.ruipeng.e_commrce.service_order.config.SecurityConfig;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${spring.mail.host:}")
    private String host;

    @Value("${spring.mail.port:0}")
    private int port;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Value("${spring.mail.properties.mail.smtp.auth:false}")
    private String auth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}")
    private String starttls;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        // 检查是否有邮件服务器配置，如果没有，返回一个不实际发送邮件的空实现
        if (host == null || host.isEmpty()) {
            System.out.println("警告: 未配置邮件服务器。将使用空实现，不会实际发送邮件。");
            return new NoOpMailSender();
        }

        mailSender.setHost(host);
        mailSender.setPort(port);

        if (username != null && !username.isEmpty()) {
            mailSender.setUsername(username);
            mailSender.setPassword(password);
        }

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", auth);
        props.put("mail.smtp.starttls.enable", starttls);
        props.put("mail.debug", "true");

        return mailSender;
    }

    /**
     * 空实现的JavaMailSender，在没有配置邮件服务器的情况下使用
     * 这样可以让应用程序正常启动，但不会实际发送邮件
     */
    private static class NoOpMailSender extends JavaMailSenderImpl {
        @Override
        public void send(org.springframework.mail.SimpleMailMessage simpleMessage) {
            System.out.println("模拟发送简单邮件: " + (simpleMessage != null ? "To: " + String.join(", ", simpleMessage.getTo()) : ""));
        }

        @Override
        public void send(org.springframework.mail.SimpleMailMessage... simpleMessages) {
            System.out.println("模拟发送多个简单邮件");
        }

        @Override
        public void send(jakarta.mail.internet.MimeMessage mimeMessage) {
            System.out.println("模拟发送MIME邮件");
        }

        @Override
        public void send(jakarta.mail.internet.MimeMessage... mimeMessages) {
            System.out.println("模拟发送多个MIME邮件");
        }

        @Override
        public void send(org.springframework.mail.javamail.MimeMessagePreparator mimeMessagePreparator) {
            System.out.println("模拟发送准备好的MIME邮件");
        }

        @Override
        public void send(org.springframework.mail.javamail.MimeMessagePreparator... mimeMessagePreparators) {
            System.out.println("模拟发送多个准备好的MIME邮件");
        }
    }
}
