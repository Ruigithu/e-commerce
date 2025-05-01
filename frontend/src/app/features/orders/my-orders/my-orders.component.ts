import { Component, OnInit } from '@angular/core';
import { OrderService, Order, OrderStatus } from './my-orders.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../carts/cart.service';
import { firstValueFrom } from 'rxjs';
import { Header } from '../../../common/components/header/header.component';

@Component({
  selector: 'app-order-list',
  imports: [
    CommonModule,
    RouterModule,
    Header
  ],
  template: `
    <div class="orders-page">
      <app-header></app-header>

      <div class="orders-container">
        <div class="page-header">
          <h1>我的订单</h1>
          <p class="subtitle">查看和管理您的所有订单</p>
        </div>

        <!-- 状态筛选器 -->
        <div class="status-filter">
          <span class="filter-label">筛选: </span>
          <div class="filter-buttons">
            <button
              [class.active]="selectedStatus === 'ALL'"
              (click)="filterByStatus('ALL')">
              <i class="fa-solid fa-list"></i>
              全部
            </button>
            <button
              [class.active]="selectedStatus === 'PENDING'"
              (click)="filterByStatus('PENDING')">
              <i class="fa-solid fa-clock"></i>
              待付款
            </button>
            <button
              [class.active]="selectedStatus === 'PAID'"
              (click)="filterByStatus('PAID')">
              <i class="fa-solid fa-check-circle"></i>
              已支付
            </button>
            <button
              [class.active]="selectedStatus === 'REFUND'"
              (click)="filterByStatus('REFUND')">
              <i class="fa-solid fa-rotate-left"></i>
              已退款
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div *ngIf="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>正在加载订单...</p>
        </div>

        <!-- 错误信息 -->
        <div *ngIf="errorMessage" class="error-message">
          <i class="fa-solid fa-circle-exclamation"></i>
          <div class="error-content">
            <p>{{ errorMessage }}</p>
            <button (click)="loadOrders()" class="retry-button">
              <i class="fa-solid fa-refresh"></i>
              重试
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div *ngIf="!isLoading && !errorMessage && filteredOrders.length === 0" class="empty-state">
          <i class="fa-solid fa-shopping-bag"></i>
          <h3>暂无订单</h3>
          <p>您还没有任何订单记录</p>
          <button routerLink="/products" class="start-shopping-btn">
            去购物
          </button>
        </div>

        <!-- 订单列表 -->
        <div *ngIf="filteredOrders.length > 0" class="order-list">
          <div *ngFor="let order of filteredOrders" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <span class="order-date">{{ formatDate(order.createAt) }}</span>
                <span class="order-id">订单号: {{ order.orderId.substring(0, 8) }}</span>
              </div>
              <span class="order-status" [ngClass]="getStatusClass(order.status)">
                <i [class]="getStatusIcon(order.status)"></i>
                {{ getStatusText(order.status) }}
              </span>
            </div>

            <div class="order-details">
              <div class="order-items">
                <!-- 这里可以添加订单商品展示 -->
                <div class="order-item-placeholder">
                  <i class="fa-solid fa-box"></i>
                  <span>订单商品</span>
                </div>
              </div>

              <div class="order-summary">
                <div class="amount-info">
                  <span class="amount-label">订单金额:</span>
                  <span class="amount-value">€{{ order.totalAmount.toFixed(2) }}</span>
                </div>

                <div class="order-actions">
                  <!--                  <button class="action-btn view-btn">-->
                  <!--                    <i class="fa-solid fa-eye"></i>-->
                  <!--                    查看详情-->
                  <!--                  </button>-->
                  <button
                    *ngIf="order.status === 'PENDING'"
                    class="action-btn pay-btn"
                    (click)="handlePay(order.orderId)">
                    <i class="fa-solid fa-credit-card"></i>
                    去支付
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  styles: [`
    .orders-page {
      min-height: 100vh;
      background-color: #f9f9f9;
    }

    .orders-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      color: #333;
      margin: 0;
      font-weight: 600;
    }

    .subtitle {
      color: #666;
      margin: 0.5rem 0 0 0;
    }

    /* 状态筛选器样式 */
    .status-filter {
      display: flex;
      align-items: center;
      margin-bottom: 2rem;
      background-color: white;
      border-radius: 8px;
      padding: 1rem 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .filter-label {
      font-weight: 500;
      color: #666;
      margin-right: 1rem;
    }

    .filter-buttons {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .filter-buttons button {
      border: 1px solid #e0e0e0;
      background-color: white;
      color: #666;
      padding: 0.6rem 1.2rem;
      border-radius: 20px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-buttons button:hover {
      border-color: #578E7E;
      color: #578E7E;
    }

    .filter-buttons button.active {
      background-color: #578E7E;
      color: white;
      border-color: #578E7E;
    }

    /* 加载状态样式 */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(87, 142, 126, 0.3);
      border-radius: 50%;
      border-top-color: #578E7E;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* 错误信息样式 */
    .error-message {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background-color: rgba(255, 82, 82, 0.1);
      color: #ff5252;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .error-message i {
      font-size: 1.5rem;
    }

    .error-content {
      flex: 1;
    }

    .error-content p {
      margin: 0 0 0.5rem 0;
    }

    .retry-button {
      background: none;
      border: 1px solid #ff5252;
      color: #ff5252;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .retry-button:hover {
      background-color: rgba(255, 82, 82, 0.1);
    }

    /* 空状态样式 */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .empty-state i {
      font-size: 3rem;
      color: #ddd;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #666;
      margin: 0 0 1.5rem 0;
    }

    .start-shopping-btn {
      background-color: #578E7E;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .start-shopping-btn:hover {
      background-color: #477a6c;
    }

    /* 订单列表样式 */
    .order-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background-color: #f9f9f9;
      border-bottom: 1px solid #eee;
    }

    .order-info {
      display: flex;
      flex-direction: column;
    }

    .order-date {
      font-size: 0.9rem;
      color: #666;
    }

    .order-id {
      font-size: 0.85rem;
      color: #888;
      margin-top: 0.25rem;
    }

    .order-status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .status-pending {
      background-color: #fff7e6;
      color: #fa8c16;
    }

    .status-paid {
      background-color: #f6ffed;
      color: #52c41a;
    }

    .status-refund {
      background-color: #f5f5f5;
      color: #888888;
    }

    .status-shipped {
      background-color: #e6f7ff;
      color: #1890ff;
    }

    .status-delivered {
      background-color: #f9f0ff;
      color: #722ed1;
    }

    .status-completed {
      background-color: #f6ffed;
      color: #52c41a;
    }

    .status-cancelled {
      background-color: #fff1f0;
      color: #f5222d;
    }

    .order-details {
      padding: 1.5rem;
    }

    .order-items {
      margin-bottom: 1.5rem;
    }

    .order-item-placeholder {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background-color: #f9f9f9;
      border-radius: 8px;
      color: #888;
    }

    .order-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .amount-info {
      display: flex;
      flex-direction: column;
    }

    .amount-label {
      font-size: 0.9rem;
      color: #666;
    }

    .amount-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #578E7E;
    }

    .order-actions {
      display: flex;
      gap: 0.75rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn {
      border: 1px solid #ddd;
      background-color: white;
      color: #666;
    }

    .view-btn:hover {
      border-color: #578E7E;
      color: #578E7E;
    }

    .pay-btn {
      background-color: #578E7E;
      color: white;
      border: none;
    }

    .pay-btn:hover {
      background-color: #477a6c;
    }

    /* 响应式样式 */
    @media (max-width: 768px) {
      .orders-container {
        padding: 1rem;
      }

      .order-summary {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .order-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = 'ALL';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

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
    // 使用类型安全的方式处理枚举
    const statusMap: {
      [OrderStatus.CANCELLED]: string;
      [OrderStatus.REFUND]: string;
      [OrderStatus.COMPLETED]: string;
      [OrderStatus.DELIVERED]: string;
      [OrderStatus.PAID]: string;
      [OrderStatus.PENDING]: string;
      [OrderStatus.SHIPPED]: string;
      [OrderStatus.REFUND_REQUESTED]: string;
      [OrderStatus.PROCESSING]: string;

    } = {
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.PAID]: 'status-paid',
      [OrderStatus.REFUND]: 'status-refund',
      [OrderStatus.SHIPPED]: 'status-shipped',
      [OrderStatus.COMPLETED]: 'status-completed',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
      [OrderStatus.REFUND_REQUESTED]: 'status-refund_request',
      [OrderStatus.PROCESSING]: 'status-processing',
    };

    return statusMap[status] || '';
  }

  getStatusIcon(status: OrderStatus): string {
    // 使用类型安全的方式处理枚举
    const iconMap: {
      [OrderStatus.CANCELLED]: string;
      [OrderStatus.REFUND]: string;
      [OrderStatus.COMPLETED]: string;
      [OrderStatus.DELIVERED]: string;
      [OrderStatus.PAID]: string;
      [OrderStatus.PENDING]: string;
      [OrderStatus.SHIPPED]: string;
      [OrderStatus.REFUND_REQUESTED]: string;
      [OrderStatus.PROCESSING]: string;
    } = {
      [OrderStatus.PENDING]: 'fa-solid fa-clock',
      [OrderStatus.PAID]: 'fa-solid fa-check-circle',
      [OrderStatus.REFUND]: 'fa-solid fa-rotate-left',
      [OrderStatus.SHIPPED]: 'fa-solid fa-truck',
      [OrderStatus.COMPLETED]: 'fa-solid fa-check-double',
      [OrderStatus.DELIVERED]: 'fa-solid fa-box-open',
      [OrderStatus.CANCELLED]: 'fa-solid fa-ban',
      [OrderStatus.REFUND_REQUESTED]: 'fa-solid fa-hand-holding-dollar',
      [OrderStatus.PROCESSING]: 'fa-solid fa-gear fa-spin'
    };

    return iconMap[status] || 'fa-solid fa-question-circle';
  }

  getStatusText(status: OrderStatus): string {
    return this.orderService.getStatusText(status);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('zh-CN');
  }

  async handlePay(orderId: string) {
    try {
      this.isLoading = true;

      const paymentResponse = await firstValueFrom(
        this.cartService.createPaymentSession(orderId)
      );

      if (paymentResponse && paymentResponse.url) {
        window.location.href = paymentResponse.url;
      } else {
        console.error("Invalid payment response", paymentResponse);
        this.errorMessage = "创建支付会话失败，请稍后再试";
      }

      this.isLoading = false;
    } catch (error) {
      console.error("Payment session creation failed:", error);
      this.errorMessage = "创建支付会话失败，请稍后再试";
      this.isLoading = false;
    }
  }
}
