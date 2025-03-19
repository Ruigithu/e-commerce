import { Component, OnInit } from '@angular/core';
import { OrderService, Order, OrderStatus } from './my-orders.service';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {CartService} from '../carts/cart.service';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-order-list',
  imports: [
    CommonModule,
    RouterModule,
  ],
  template:
    `<div class="orders-container">
    <h2>My Orders</h2>

    <!-- 状态筛选器 -->
    <div class="status-filter">
      <span>Filer: </span>
      <button
        [class.active]="selectedStatus === 'ALL'"
        (click)="filterByStatus('ALL')">
        All
      </button>
      <button
        [class.active]="selectedStatus === 'PENDING'"
        (click)="filterByStatus('PENDING')">
        Unpaid
      </button>
      <button
        [class.active]="selectedStatus === 'PAID'"
        (click)="filterByStatus('PAID')">
        Paid
      </button>
      <button
        [class.active]="selectedStatus === 'REFUND'"
        (click)="filterByStatus('REFUND')">
        Refunded
      </button>
    </div>

    <!-- 加载状态 -->
    <div *ngIf="isLoading" class="loading">
      <p>loading...</p>
    </div>

    <!-- 错误信息 -->
    <div *ngIf="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button (click)="loadOrders()">Try again</button>
    </div>

    <!-- 订单列表 -->
    <div *ngIf="!isLoading && !errorMessage && filteredOrders.length === 0" class="empty-state">
      <p>no data</p>
    </div>

    <div *ngIf="filteredOrders.length > 0" class="order-list">
      <div *ngFor="let order of filteredOrders" class="order-card">
        <div class="order-header">
          <span class="order-id">order id: {{ order.orderId  }}</span>
          <span
            class="order-status"
            [ngClass]="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <div class="order-details">
          <div class="info-row">
            <span class="label">created time:</span>
            <span>{{ formatDate(order.createAt) }}</span>
          </div>
          <div class="info-row">
            <span class="label">total:</span>
            <span class="amount">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-actions">
<!--          <button [routerLink]="['/orders', order.orderId]">view</button>-->
          <button *ngIf="order.status === 'PENDING'" class="primary-btn" (click)="handlePay(order.orderId)">go to pay</button>
        </div>
      </div>
    </div>
  </div>`,
  standalone: true,
  styleUrls: ['./my-orders.style.css']
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = 'ALL';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private orderService: OrderService,
              private cartService : CartService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data;
        this.filteredOrders = [...this.orders];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = '获取订单数据失败，请稍后重试';
        this.isLoading = false;
        console.error('获取订单出错:', error);
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;

    if (status === 'ALL') {
      this.filteredOrders = [...this.orders];
      return;
    }

    this.filteredOrders = this.orders.filter(order =>
      order.status === status as OrderStatus
    );
  }

  getStatusClass(status: OrderStatus): string {
    const statusClasses = {
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.PAID]: 'status-paid',
      [OrderStatus.REFUND]: 'status-refund'
    };
    return statusClasses[status] || '';
  }
  getStatusText(status: OrderStatus): string {
    return this.orderService.getStatusText(status);
  }


  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('zh-CN');
  }

  async handlePay(orderId: string) {


    const paymentResponse = await firstValueFrom(
      this.cartService.createPaymentSession(orderId)
    );

    // 3. 重定向到 Stripe 支付页面
    if (paymentResponse && paymentResponse.url) {
      window.location.href = paymentResponse.url;
    } else {
      console.error("Invalid payment response", paymentResponse);
    }
  }
}
