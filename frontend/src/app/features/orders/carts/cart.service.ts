import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CartItem} from './CartItem.model';
import {Product} from '../../products/product.model';
import {Address} from '../../users/addresss/address.model';
import {Order} from '../my-orders/my-orders.service';




@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080'; // 网关地址
  address: Address | null = null;
  constructor(private http: HttpClient) {
    this.loadStoredAddress();
  }

  // 购物车相关操作
  getCartItems(): Observable<CartItem[]> {
    const userId = localStorage.getItem('userId');
    return this.http.get<CartItem[]>(`${this.apiUrl}/orders/getItems/${userId}`);
  }

  removeFromCart(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/removeItem/${itemId}`);
  }

  updateQuantity(itemId: string, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/orders/updateQuantity/${itemId}`, { quantity });
  }
  private loadStoredAddress(): void {
    const storedAddress = localStorage.getItem('defaultAddress');
    if (storedAddress) {
      try {
        this.address = JSON.parse(storedAddress);
      } catch (error) {
        console.error('Failed to parse stored address:', error);
        this.address = null;
      }
    }
  }
  // 订单相关操作
  createOrder(cartItems: CartItem[], products: Product[], totalAmount: number): Observable<Order> {
    const userId = localStorage.getItem('userId') || null;
    if (!this.address) {
      throw new Error('Address is required to create an order');
    }

    const orderData = {
      userId,
      addressId: this.address.addressId,
      cartItems,
      products,
      totalAmount
    };

    return this.http.post<Order>(`${this.apiUrl}/orders/createOrderFromCart`, orderData);
  }

  // 支付相关操作
  createPaymentSession(orderId: string): Observable<{
    url:  string,
    id: string }> {
    const paymentData = {
      orderId,
    };

    return this.http.post<{
      url:  string,
      id: string }>(`${this.apiUrl}/pay/create-checkout-session`, paymentData);
  }


// Add item to cart
  addToCart(productId: string, quantity: number): Observable<CartItem> {
    const userId = localStorage.getItem('userId');
    return this.http.post<CartItem>(`${this.apiUrl}/orders/cart/add`, {
      userId,
      productId,
      quantity
    });
  }
}
