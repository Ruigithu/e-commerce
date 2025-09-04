import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Merchant, MerchantStatus } from './merchant.modal';
import { Product, ProductStatus } from '../products/product.model';
import { OrderStatus } from '../orders/my-orders/my-orders.service';
import {environment} from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class MerchantService {
  private apiUrl = environment.apiUrl; // Gateway URL

  constructor(private http: HttpClient) {}

  // Merchant profile management
  getMerchantProfile(): Observable<Merchant> {
    const userId = localStorage.getItem('userId');
    // In a real app, this would be an HTTP request
    // return this.http.get<Merchant>(`${this.apiUrl}/merchant/profile/${userId}`);

    // For demo purposes, return mock data
    return of(this.getMockMerchantProfile());
  }

  updateMerchantProfile(merchant: Merchant): Observable<Merchant> {
    // In a real app, this would be an HTTP request
    // return this.http.put<Merchant>(`${this.apiUrl}/merchant/profile`, merchant);

    // For demo purposes, return the same merchant
    return of(merchant);
  }

  registerMerchant(merchant: Merchant): Observable<Merchant> {
    //HTTP request
    return this.http.post<Merchant>(`${this.apiUrl}/users/registerMerchant`,
      {
        merchantId: crypto.randomUUID(),
        userId: localStorage.getItem('userId'),
        storeName: merchant.storeName,
        description: merchant.description,
        logo: merchant.description,
        contactEmail: merchant.contactEmail,
        contactPhone: merchant.contactPhone,
        address: merchant.address,
        status: MerchantStatus.ACTIVE
      },
      {headers: new HttpHeaders({'Content-Type': 'application/json'}),
      withCredentials: true})
  }

  // Order management
  getMerchantOrders(): Observable<any[]> {
    const merchantId = localStorage.getItem('merchantId');
    // In a real app, this would be an HTTP request
    // return this.http.get<any[]>(`${this.apiUrl}/merchant/${merchantId}/orders`);

    // For demo purposes, return mock data
    return of([]);
  }

  updateOrderStatus(orderId: string, status: OrderStatus, trackingInfo?: any): Observable<any> {
    // In a real app, this would be an HTTP request
    // return this.http.put<any>(`${this.apiUrl}/merchant/orders/${orderId}/status`, {
    //   status,
    //   trackingNumber: trackingInfo?.trackingNumber,
    //   shippingCarrier: trackingInfo?.carrier,
    //   notes: trackingInfo?.notes
    // });

    // For demo purposes, return success
    return of({ success: true });
  }

  // Product management
  getMerchantProducts(): Observable<Product[]> {
    const merchantId = localStorage.getItem('merchantId');
    // In a real app, this would be an HTTP request
    // return this.http.get<Product[]>(`${this.apiUrl}/merchant/${merchantId}/products`);

    // For demo purposes, return mock data
    return of([]);
  }

  createProduct(product: Product): Observable<Product> {
    const merchantId = localStorage.getItem('merchantId');
    // In a real app, this would be an HTTP request with the merchantId included
    // return this.http.post<Product>(`${this.apiUrl}/merchant/${merchantId}/products`, product);

    // For demo purposes, return the product with an ID
    return of({
      ...product,
      productId: crypto.randomUUID(),
      merchantId: merchantId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: []
    });
  }

  updateProduct(product: Product): Observable<Product> {
    // In a real app, this would be an HTTP request
    // return this.http.put<Product>(`${this.apiUrl}/merchant/products/${product.productId}`, product);

    // For demo purposes, return the same product
    return of({
      ...product,
      updatedAt: new Date().toISOString()
    });
  }

  updateProductStatus(productId: string, status: ProductStatus): Observable<any> {
    // In a real app, this would be an HTTP request
    // return this.http.put<any>(`${this.apiUrl}/merchant/products/${productId}/status`, { status });

    // For demo purposes, return success
    return of({ success: true });
  }

  deleteProduct(productId: string): Observable<any> {
    // In a real app, this would be an HTTP request
    // return this.http.delete<any>(`${this.apiUrl}/merchant/products/${productId}`);

    // For demo purposes, return success
    return of({ success: true });
  }

  // Sales & Analytics
  getMerchantDashboardStats(): Observable<any> {
    const merchantId = localStorage.getItem('merchantId');
    // In a real app, this would be an HTTP request
    // return this.http.get<any>(`${this.apiUrl}/merchant/${merchantId}/stats`);

    // For demo purposes, return mock data
    return of(this.getMockDashboardStats());
  }

  // Helper methods for mock data
  private getMockMerchantProfile(): Merchant {
    return {
      merchantId: '12345',
      userId: localStorage.getItem('userId') || '',
      storeName: 'Example Store',
      description: 'This is an example store selling high-quality products.',
      logo: 'https://via.placeholder.com/150',
      contactEmail: 'store@example.com',
      contactPhone: '123-456-7890',
      address: '123 Store Street, City, Country',
      createdAt: new Date().toISOString(),
      status: MerchantStatus.ACTIVE,
      rating: 4.5
    };
  }

  private getMockDashboardStats(): any {
    return {
      todaySales: 1250.75,
      salesChange: 5.2,
      pendingOrders: 7,
      lowStockProducts: [
        { id: '1', name: 'Product 1', stock: 3 },
        { id: '2', name: 'Product 2', stock: 5 }
      ],
      recentOrders: [
        {
          orderId: 'order-1',
          customerName: 'Customer 1',
          date: new Date().toISOString(),
          total: 125.50,
          status: OrderStatus.PAID
        },
        {
          orderId: 'order-2',
          customerName: 'Customer 2',
          date: new Date().toISOString(),
          total: 89.99,
          status: OrderStatus.SHIPPED
        }
      ],
      salesData: [
        { date: '2023-01-01', sales: 1200 },
        { date: '2023-01-02', sales: 1500 },
        { date: '2023-01-03', sales: 1300 }
      ]
    };
  }
}
