# E-Commerce Project

This repository contains a full-stack e-commerce application built with Angular (frontend) and Spring Cloud Microservices (backend).

## Project Architecture

The project follows a microservices architecture pattern with the following components:

```
├── frontend     # Angular web application
└── backend      # Spring Cloud microservices
    ├── eureka   # Service discovery
    ├── gateway  # API Gateway
    ├── service-order    # Order management
    ├── service-pay      # Payment processing
    ├── service-product  # Product catalog
    └── service-user     # User management
```

## Frontend

The frontend is an Angular 19 application with the following features:

### Prerequisites

* Node.js
* Angular CLI 19.1.2

### Tech Stack

* Angular 19.1.0
* RxJS 7.8.0
* Stripe.js for payment processing
* FontAwesome for icons

### Setup and Running

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm start
```

This will start the Angular development server on https://e-commerce-rui667.netlify.app.

### Available Scripts

* `npm start` - Start development server
* `npm run build` - Build production-ready application
* `npm run watch` - Build with watch mode
* `npm test` - Run tests

## Backend

The backend is built using Spring Cloud microservices with the following components:

### Eureka Service Discovery (Port: 8761)

Handles service registration and discovery. Services register themselves with Eureka, and clients can discover services through it.

Configuration highlights:

* Self-preservation mode is disabled
* Server doesn't register with itself
* Server doesn't fetch registry

### API Gateway (Port: 8080)

Spring Cloud Gateway that routes requests to appropriate microservices based on predefined routes.

Routes:

* `/users/**` → service-user
* `/products/**` → service-product
* `/orders/**` → service-order
* `/pay/**` → service-pay
* `/login` → service-user
* `/signup` → service-user

Key features:

* CORS configuration for local development
* Load balancing
* Route filtering
* Extensive logging

### Microservices

#### Service-User

Handles user authentication, registration, and profile management.

#### Service-Product

Manages product catalog, categories, and inventory.

#### Service-Order

Manages order creation, tracking, and history.

Dependencies:

* Spring Boot Starter Data JPA
* Spring Boot Starter Security
* Spring Boot Starter Web
* Spring Cloud Netflix Eureka Client
* Spring Cloud OpenFeign
* MySQL/PostgreSQL for database

#### Service-Pay

Handles payment processing with Stripe integration.

## Getting Started

### Start Backend Services

1. Start Eureka Server first:

```bash
cd backend/eureka
./mvnw spring-boot:run
```

2. Start API Gateway:

```bash
cd backend/gateway
./mvnw spring-boot:run
```

3. Start other microservices:

```bash
cd backend/service-user
./mvnw spring-boot:run

cd backend/service-product
./mvnw spring-boot:run

cd backend/service-order
./mvnw spring-boot:run

cd backend/service-pay
./mvnw spring-boot:run
```

### Start Frontend

```bash
cd frontend
npm start
```

Access the application at https://e-commerce-rui667.netlify.app

## Monitoring and Management

Spring Boot Actuator is enabled, providing health checks and metrics:

* Gateway health: http://localhost:8080/actuator/health
* Gateway routes: http://localhost:8080/actuator/gateway/routes

## Development Notes

* Frontend communicates with API Gateway only
* Microservices communicate with each other via Eureka service discovery
* API Gateway handles CORS and security

## Dependencies

### Frontend

See package.json for complete list.

### Backend

* Spring Boot
* Spring Cloud
* Netflix Eureka
* Spring Cloud Gateway
* Spring Data JPA
* Spring Security
* PostgreSQL