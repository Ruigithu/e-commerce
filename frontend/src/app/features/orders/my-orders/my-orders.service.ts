import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 确保枚举值是字符串类型，使其可以作为索引
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUND = 'REFUND'
}

export interface OrderItem {
  itemId: string;
  productId: string;
  orderId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  orderId: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddressId: string;
  createAt: string;
  updateAt: string;
  items?: OrderItem[]; // 可选字段，用于存储订单项
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/orders'; // 根据实际API路径调整

  constructor(private http: HttpClient) { }

  // 获取用户所有订单
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/getAllOrders/${localStorage.getItem('userId')}`);
  }

  // 获取单个订单详情（包括订单项）
  getOrderDetails(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  // 获取特定状态的订单
  getOrdersByStatus(status: OrderStatus): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  // 订单状态文本映射 - 使用类型安全的方式
  getStatusText(status: OrderStatus): string {
    const statusTextMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Unpaid',
      [OrderStatus.PAID]: 'Paid',
      [OrderStatus.PROCESSING]: 'Processing',
      [OrderStatus.SHIPPED]: 'Shipped',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.COMPLETED]: 'Completed',
      [OrderStatus.CANCELLED]: 'Cancelled',
      [OrderStatus.REFUND_REQUESTED]: 'Refund Requested',
      [OrderStatus.REFUND]: 'Refunded'
    };

    return statusTextMap[status] || 'Unknown';
  }
}
