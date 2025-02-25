import { Component, OnInit } from '@angular/core';
import { OrderService, Order, OrderStatus } from './my-orders.service';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-order-list',
  imports: [
    CommonModule,
    RouterModule,
  ],
  template: `<div class="orders-container">
    <h2>我的订单</h2>

    <!-- 状态筛选器 -->
    <div class="status-filter">
      <span>筛选: </span>
      <button
        [class.active]="selectedStatus === 'ALL'"
        (click)="filterByStatus('ALL')">
        全部
      </button>
      <button
        [class.active]="selectedStatus === 'PENDING'"
        (click)="filterByStatus('PENDING')">
        待付款
      </button>
      <button
        [class.active]="selectedStatus === 'PAID'"
        (click)="filterByStatus('PAID')">
        已付款
      </button>
      <button
        [class.active]="selectedStatus === 'REFUND'"
        (click)="filterByStatus('REFUND')">
        已退款
      </button>
    </div>

    <!-- 加载状态 -->
    <div *ngIf="isLoading" class="loading">
      <p>正在加载订单数据...</p>
    </div>

    <!-- 错误信息 -->
    <div *ngIf="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button (click)="loadOrders()">重试</button>
    </div>

    <!-- 订单列表 -->
    <div *ngIf="!isLoading && !errorMessage && filteredOrders.length === 0" class="empty-state">
      <p>暂无订单数据</p>
    </div>

    <div *ngIf="filteredOrders.length > 0" class="order-list">
      <div *ngFor="let order of filteredOrders" class="order-card">
        <div class="order-header">
          <span class="order-id">订单号: {{ order.orderId  }}</span>
          <span
            class="order-status"
            [ngClass]="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <div class="order-details">
          <div class="info-row">
            <span class="label">创建时间:</span>
            <span>{{ formatDate(order.createAt) }}</span>
          </div>
          <div class="info-row">
            <span class="label">总金额:</span>
            <span class="amount">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="order-actions">
          <button [routerLink]="['/orders', order.orderId]">查看详情</button>
          <button *ngIf="order.status === 'PENDING'" class="primary-btn">去支付</button>
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

  constructor(private orderService: OrderService) { }

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
}
