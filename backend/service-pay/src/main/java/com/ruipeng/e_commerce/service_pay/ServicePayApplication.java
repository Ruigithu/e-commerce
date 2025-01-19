package com.ruipeng.e_commerce.service_pay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServicePayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServicePayApplication.class, args);
	}

}
