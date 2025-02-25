import { Component, OnInit } from '@angular/core';
import {CommonModule, DecimalPipe, NgFor} from '@angular/common';
import {PaymentComponent} from '../../payments/payment.component';
import {Router, RouterLink} from '@angular/router';
import {CartService} from './cart.service';
import {firstValueFrom, forkJoin} from 'rxjs';
import {Product} from '../../products/product.model';
import {ProductService} from '../../products/product.service';
import {CartItem} from './CartItem.model';
import {CommandModule} from '@angular/cli/src/command-builder/command-module';


@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [NgFor, DecimalPipe, PaymentComponent, RouterLink,CommonModule], // 添加 RouterLink
  template: `
    <div class="shopping-cart">
      <div class="cart-header">
        <h2>
          <i class="fas fa-shopping-cart"></i>
          Shopping Cart
        </h2>
      </div>
      <div class="cart-content">
        <div class="cart-items">
          <!-- 显示加载状态 -->
          <div *ngIf="loading" class="loading">
            Loading cart items...
          </div>

          <!-- 修复嵌套的 ngFor 结构 -->
          <div *ngFor="let item of cartItems" class="cart-item">
            <ng-container *ngIf="getProduct(item.productId) as product">
              <div class="item-details">
                <h3 (click)="navigateToProduct(item.productId)" style="cursor: pointer;">
                  {{product.name}}
                </h3>
                <p class="price">{{product.price | number:'1.2-2'}}</p>
              </div>
              <div class="quantity-controls">
                <button
                  (click)="updateQuantity(item.itemId, -1)"
                  class="quantity-btn"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">{{item.quantity}}</span>
                <button
                  (click)="updateQuantity(item.itemId, 1)"
                  class="quantity-btn"
                >
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="item-total">
                {{(product.price * item.quantity) | number:'1.2-2'}}
              </div>
              <button
                (click)="removeItem(item.itemId)"
                class="remove-btn"
              >
                <i class="fas fa-trash"></i>
              </button>
            </ng-container>
          </div>

          <div class="cart-summary" *ngIf="cartItems.length > 0">
            <span class="total-label">Total:</span>
            <span class="total-amount">{{calculateTotal() | number:'1.2-2'}}</span>
          </div>

          <div *ngIf="cartItems.length === 0 && !loading" class="empty-cart">
            <p>Your shopping cart is empty</p>
            <button routerLink="/" class="continue-shopping">Continue Shopping</button>
          </div>

          <button
            *ngIf="cartItems.length > 0"
            class="checkout"
            (click)="proceedToCheckout()"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './cart.style.css'
})
export class ShoppingCartComponent implements OnInit {
  products = new Map<string, Product>(); // 使用 Map 存储产品
  cartItems: CartItem[] = [];
  loading = true;
  errorMessage: string|null=null;

  constructor(
    private cartService: CartService,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.loading = true;
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        // 使用 forkJoin 并行加载所有产品
        const productRequests = items.map(item =>
          this.productService.getProduct(item.productId)
        );

        if (productRequests.length > 0) {
          forkJoin(productRequests).subscribe({
            next: (products) => {
              products.forEach(product => {
                this.products.set(product.productId, product);
              });
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading products:', error);
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
        this.loading = false;
      }
    });
  }

  getProduct(productId: string): Product | undefined {
    return this.products.get(productId);
  }

  updateQuantity(itemId: string, delta: number): void {
    const item = this.cartItems.find(i => i.itemId === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      this.cartService.updateQuantity(itemId, newQuantity).subscribe({
        next: () => {
          this.loadCartItems();
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
        }
      });
    }
  }

  removeItem(itemId: string): void {
    if (confirm('Are you sure you want to remove this item?')) {
      this.cartService.removeFromCart(itemId).subscribe({
        next: () => {
          this.loadCartItems();
        },
        error: (error) => {
          console.error('Error removing item:', error);
        }
      });
    }
  }

  calculateTotal(): number {
    return this.cartItems.reduce((total, item) => {
      const product = this.products.get(item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }

  async proceedToCheckout() {
    if (!this.cartItems.length) {
      return;
    }
    const addressId = localStorage.getItem('defaultAddress');
    if (!addressId) {
      // 显示错误消息
      this.errorMessage = "请先添加收货地址";
      alert(this.errorMessage);
      // 或者重定向到地址管理页面
      this.router.navigate(['/address']);
      return;
    }

    try {
      const orderResponse = await firstValueFrom(
        this.cartService.createOrder(this.cartItems, Array.from(this.products.values()), this.calculateTotal())
      );
      console.log(1);
      console.log(orderResponse)
      if (orderResponse && orderResponse.orderId) {
        console.log(2);
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

