import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {CartItem} from './CartItem.model';
import {Product} from '../../products/product.model';
import {Address} from '../../users/addresss/address.model';
import {Order} from '../my-orders/my-orders.service';




@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://gateway-production-4c59.up.railway.app'; // 网关地址
  address: Address | null = null;

  constructor(private http: HttpClient) {
    this.loadStoredAddress();
  }

  getCartItems(): Observable<CartItem[]> {
    const userId = localStorage.getItem('userId');
    return this.http.get<CartItem[]>(`${this.apiUrl}/orders/getItems/${userId}`);
  }

  removeFromCart(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/removeItem/${itemId}`)
      .pipe(
        tap(() => {
          // Update cart count in localStorage after removing item
          this.updateCartCountInLocalStorage(-1);
        })
      );
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

  createOrder(cartItems: CartItem[], products: Product[], totalAmount: number): Observable<Order[]> {
    const userId = localStorage.getItem('userId') || null;
    if (!this.address) {
      throw new Error('Address is required to create an order');
    }
    let merchantList = [];
    products.forEach((product)=>{
        merchantList.push(product.merchantId);
    });

    const orderData = {
      userId,
      addressId: this.address.addressId,
      cartItems,
      products,
      totalAmount
    };

    return this.http.post<Order[]>(`${this.apiUrl}/orders/createOrderFromCart`, orderData)
      .pipe(
        tap(() => {
          // Clear cart count after creating order
          localStorage.setItem('cartItemsCount', '0');
        })
      );
  }

  createPaymentSession(orderId: string): Observable<{
    url: string,
    id: string
  }> {
    const paymentData = {
      orderId,
    };


    return this.http.post<{
      url: string,
      id: string
    }>(`${this.apiUrl}/pay/create-checkout-session`, paymentData);
  }
  createPaymentSessionForMultipleOrders(paymentRequest: {orderIds: string[], totalAmount: number}): Observable<{url: string, id: string}> {
    return this.http.post<{url: string, id: string}>(`${this.apiUrl}/pay/create-checkout-session`, paymentRequest);
  }

  // Add item to cart
  addToCart(productId: string, quantity: number): Observable<CartItem> {
    const userId = localStorage.getItem('userId');
    return this.http.post<CartItem>(`${this.apiUrl}/orders/cart/add`, {
      userId,
      productId,
      quantity
    }).pipe(
      tap(() => {
        // Update cart count in localStorage after adding item
        this.updateCartCountInLocalStorage(1);
      })
    );
  }

  // Helper method to update cart count in localStorage
  private updateCartCountInLocalStorage(change: number): void {
    const currentCount = localStorage.getItem('cartItemsCount');
    let newCount = 0;

    if (currentCount) {
      newCount = Math.max(0, parseInt(currentCount, 10) + change);
    } else {
      // If no count exists yet, load it from the server
      this.getCartItems().subscribe(items => {
        localStorage.setItem('cartItemsCount', items.length.toString());
      });
      return;
    }

    localStorage.setItem('cartItemsCount', newCount.toString());

    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cartItemsCount',
      newValue: newCount.toString()
    }));
  }

  // Reset cart count (used after logout)
  resetCartCount(): void {
    localStorage.removeItem('cartItemsCount');
  }

  // Refresh cart count from server
  refreshCartCount(): void {
    this.getCartItems().subscribe(items => {
      const count = items.length;
      localStorage.setItem('cartItemsCount', count.toString());

      // Notify other components about the change
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'cartItemsCount',
        newValue: count.toString()
      }));
    });
  }

}
