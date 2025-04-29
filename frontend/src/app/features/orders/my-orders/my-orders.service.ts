import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum OrderStatus {
  PENDING = 'PENDING',    // 待付款
  PAID = 'PAID',          // 已支付
  SHIPPED = 'SHIPPED',    // 已发货(新增)
  DELIVERED = 'DELIVERED', // 已送达(新增)
  COMPLETED = 'COMPLETED', // 已完成(新增)
  CANCELLED = 'CANCELLED', // 已取消(新增)
  REFUND = 'REFUND'       // 已退款
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

  // 订单状态文本映射
  getStatusText(status: OrderStatus): string {
    const statusMap = {
      [OrderStatus.PENDING]: 'Unpaid',
      [OrderStatus.PAID]: 'Paid',
      [OrderStatus.REFUND]: 'Refunded',
      [OrderStatus.SHIPPED]: 'Shipped',
      [OrderStatus.COMPLETED]: 'Completed',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]:'Cancelled'
    };
    return statusMap[status] || 'unknown';
  }
}
