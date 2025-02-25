import {Component, Input} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';
import {firstValueFrom, Observable} from 'rxjs';
import {CartService} from '../orders/carts/cart.service';
import {Router} from '@angular/router';
import {ProductService} from '../products/product.service';
import {CartItem} from '../orders/carts/CartItem.model';
import {Product} from '../products/product.model';
import { Address } from '../users/addresss/address.model';
import {Order} from '../orders/my-orders/my-orders.service';


@Component({
  selector: 'app-payment',
  template: `
      <button (click)="redirectToCheckout()">Pay</button>
  `,
  styles: ` button {
    cursor: pointer;
    background-color: darkseagreen;
    width: 100px;
    height: 50px;
    border-radius: 10px;
    border: none;
    transition-delay: 0.2ms;
  }

  button:hover {
    background-color: seagreen;
  }`,
  standalone: true
})
export class PaymentComponent {
  @Input() product!: Product;
  @Input() quantity!: number;
  address: Address | null = null;
  orderResponse: Order | null = null;  // 修正类型声明

  constructor(
    private cartService: CartService,
    private http: HttpClient
  ) {
    this.loadStoredAddress();
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

  // 修正返回类型
  createOrder(product: Product, quantity: number): Observable<Order> {
    const userId = localStorage.getItem('userId');
    const totalAmount = product.price * quantity;

    if (!this.address) {
      throw new Error('Address is required to create an order');
    }

    const orderData = {
      userId,
      addressId: this.address.addressId,
      product,
      quantity,
      totalAmount
    };

    // 直接返回 Order 类型
    return this.http.post<Order>(`http://localhost:8080/orders/createOrder`, orderData);
  }

  async redirectToCheckout() {
    try {
      // 1. 创建订单
      const orderResponse = await firstValueFrom(this.createOrder(this.product, this.quantity));
      this.orderResponse = orderResponse;  // 保存到组件属性
      console.log(`orderId是 ${orderResponse.orderId}`);

      if (orderResponse && orderResponse.orderId) {
        // 2. 创建支付会话
        const paymentResponse = await firstValueFrom(
          this.cartService.createPaymentSession(orderResponse.orderId)
        );

        // 3. 重定向到 Stripe 支付页面
        if (paymentResponse && paymentResponse.url) {
          window.location.href = paymentResponse.url;
        } else {
          console.error("Invalid payment response", paymentResponse);
        }
      }
    } catch (error) {
      console.error('Checkout process failed:', error);
      // 添加错误提示
    }
  }
}
