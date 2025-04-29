import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PaymentComponent } from '../../payments/payment.component';
import { Router, RouterLink } from '@angular/router';
import { CartService } from './cart.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Product } from '../../products/product.model';
import { ProductService } from '../../products/product.service';
import { CartItem } from './CartItem.model';
import { Header } from '../../../common/components/header/header.component';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    PaymentComponent,
    RouterLink,
    Header
  ],
  template: `
    <div class="cart-page-container">
      <app-header></app-header>

      <div class="cart-container">
        <div class="cart-header">
          <h1>Shopping Cart</h1>
          <span class="item-count">{{ cartItems.length }} items</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your cart...</p>
        </div>

        <!-- Empty Cart State -->
        <div *ngIf="!loading && cartItems.length === 0" class="empty-cart">
          <div class="empty-cart-icon">
            <i class="fa-solid fa-cart-shopping"></i>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <button routerLink="/home" class="continue-shopping-btn">
            <i class="fa-solid fa-arrow-left"></i>
            Continue Shopping
          </button>
        </div>

        <!-- Cart with Items -->
        <div *ngIf="!loading && cartItems.length > 0" class="cart-with-items">
          <div class="cart-content">
            <div class="cart-items">
              <!-- Cart Items -->
              <div *ngFor="let item of cartItems" class="cart-item">
                <ng-container *ngIf="getProduct(item.productId) as product">
                  <!-- Product Image -->
                  <div class="item-image">
                    <img src="https://via.placeholder.com/80x80" [alt]="product.name">
                  </div>

                  <!-- Product Details -->
                  <div class="item-details">
                    <h3 (click)="navigateToProduct(item.productId)">{{ product.name }}</h3>
                    <p class="item-price">€{{ product.price | number:'1.2-2' }} each</p>

                    <!-- Stock Info -->
                    <div class="item-stock" *ngIf="product.stock < 20">
                      <i class="fa-solid fa-exclamation-circle"></i>
                      <span>Only {{ product.stock }} left in stock</span>
                    </div>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="quantity-controls">
                    <button (click)="updateQuantity(item.itemId, -1)" [disabled]="item.quantity <= 1">
                      <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button (click)="updateQuantity(item.itemId, 1)" [disabled]="item.quantity >= product.stock">
                      <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>

                  <!-- Item Total -->
                  <div class="item-total">
                    €{{ (product.price * item.quantity) | number:'1.2-2' }}
                  </div>

                  <!-- Remove Button -->
                  <button class="remove-btn" (click)="removeItem(item.itemId)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </ng-container>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <h3>Order Summary</h3>

              <div class="summary-row">
                <span>Subtotal</span>
                <span>€{{ calculateSubtotal() | number:'1.2-2' }}</span>
              </div>

              <div class="summary-row">
                <span>Shipping</span>
                <span>€{{ calculateShipping() | number:'1.2-2' }}</span>
              </div>

              <div class="summary-row">
                <span>Tax</span>
                <span>€{{ calculateTax() | number:'1.2-2' }}</span>
              </div>

              <div class="summary-row discount" *ngIf="hasDiscount()">
                <span>Discount</span>
                <span>-€{{ calculateDiscount() | number:'1.2-2' }}</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row total">
                <span>Total</span>
                <span>€{{ calculateTotal() | number:'1.2-2' }}</span>
              </div>

              <button class="checkout-btn" (click)="proceedToCheckout()">
                <i class="fa-solid fa-lock"></i>
                Proceed to Checkout
              </button>

              <button routerLink="/home" class="continue-shopping">
                <i class="fa-solid fa-arrow-left"></i>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page-container {
      min-height: 100vh;
      background-color: #f9f9f9;
    }

    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .cart-header {
      margin-bottom: 2rem;
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }

    .cart-header h1 {
      font-size: 2rem;
      margin: 0;
      color: #333;
      font-weight: 600;
    }

    .item-count {
      color: #666;
      font-size: 1rem;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
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

    /* Empty Cart State */
    .empty-cart {
      text-align: center;
      padding: 4rem 0;
      max-width: 500px;
      margin: 0 auto;
    }

    .empty-cart-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: #ccc;
    }

    .empty-cart h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .empty-cart p {
      color: #666;
      margin-bottom: 2rem;
    }

    .continue-shopping-btn {
      padding: 0.75rem 1.5rem;
      background-color: #578E7E;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .continue-shopping-btn:hover {
      background-color: #477a6c;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    /* Cart with Items */
    .cart-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
    }

    .cart-items {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
    }

    /* Cart Item */
    .cart-item {
      display: grid;
      grid-template-columns: auto 1fr auto auto auto;
      gap: 1rem;
      align-items: center;
      padding: 1.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .cart-item:last-child {
      border-bottom: none;
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      min-width: 0; /* Fixes flexbox overflow */
    }

    .item-details h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      transition: color 0.2s;
    }

    .item-details h3:hover {
      color: #578E7E;
    }

    .item-price {
      margin: 0 0 0.25rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .item-stock {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      color: #ff9800;
      font-size: 0.8rem;
    }

    /* Quantity Controls */
    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 1rem;
    }

    .quantity-controls button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #ddd;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #333;
    }

    .quantity-controls button:hover:not(:disabled) {
      background-color: #f5f5f5;
      border-color: #ccc;
    }

    .quantity-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      min-width: 30px;
      text-align: center;
      font-weight: 500;
    }

    .item-total {
      font-weight: 600;
      color: #333;
      white-space: nowrap;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      transition: color 0.2s;
      margin-left: 1rem;
    }

    .remove-btn:hover {
      color: #ff5252;
    }

    /* Order Summary */
    .order-summary {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
      position: sticky;
      top: 1rem;
    }

    .order-summary h3 {
      font-size: 1.2rem;
      margin: 0 0 1.5rem 0;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.75rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      color: #666;
    }

    .summary-row.discount {
      color: #4caf50;
    }

    .summary-divider {
      height: 1px;
      background-color: #eee;
      margin: 1rem 0;
    }

    .summary-row.total {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .checkout-btn {
      width: 100%;
      padding: 0.75rem 0;
      margin: 1.5rem 0 1rem;
      background-color: #578E7E;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .checkout-btn:hover {
      background-color: #477a6c;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(87, 142, 126, 0.2);
    }

    .continue-shopping {
      width: 100%;
      padding: 0.75rem 0;
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      color: #666;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .continue-shopping:hover {
      background-color: #f5f5f5;
    }

    /* Responsive Styles */
    @media (max-width: 992px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .cart-container {
        padding: 1rem;
      }

      .cart-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        padding: 1rem 0;
      }

      .item-details {
        order: 1;
      }

      .item-image {
        order: 0;
        width: 100%;
        height: auto;
        aspect-ratio: 16/9;
      }

      .quantity-controls {
        order: 2;
        justify-content: flex-start;
        margin: 0.5rem 0;
      }

      .item-total {
        order: 3;
      }

      .remove-btn {
        order: 4;
        margin: 0;
        align-self: flex-start;
      }
    }
  `]
})
export class ShoppingCartComponent implements OnInit {
  products = new Map<string, Product>();
  cartItems: CartItem[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;

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

        // Load product details for each cart item
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
      const product = this.products.get(item.productId);
      const newQuantity = Math.max(1, Math.min(item.quantity + delta, product?.stock || 99));

      if (newQuantity !== item.quantity) {
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

  calculateSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      const product = this.products.get(item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  calculateShipping(): number {
    const subtotal = this.calculateSubtotal();
    // Free shipping for orders over €50
    return subtotal > 50 ? 0 : 4.99;
  }

  calculateTax(): number {
    // Assuming 20% tax rate
    return this.calculateSubtotal() * 0.2;
  }

  hasDiscount(): boolean {
    // Example logic - orders over €100 get a discount
    return this.calculateSubtotal() > 100;
  }

  calculateDiscount(): number {
    if (!this.hasDiscount()) return 0;
    // 10% discount for orders over €100
    return this.calculateSubtotal() * 0.1;
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const shipping = this.calculateShipping();
    const tax = this.calculateTax();
    const discount = this.calculateDiscount();

    return subtotal + shipping + tax - discount;
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
      this.errorMessage = "Please add a shipping address first";
      alert(this.errorMessage);
      this.router.navigate(['/address']);
      return;
    }

    try {
      // Show a loading indicator
      this.loading = true;

      // 1. Create order
      const orderResponse = await firstValueFrom(
        this.cartService.createOrder(this.cartItems, Array.from(this.products.values()), this.calculateTotal())
      );

      if (orderResponse && orderResponse.orderId) {
        // 2. Create payment session
        const paymentResponse = await firstValueFrom(
          this.cartService.createPaymentSession(orderResponse.orderId)
        );

        // 3. Redirect to payment page
        if (paymentResponse && paymentResponse.url) {
          window.location.href = paymentResponse.url;
        } else {
          console.error("Invalid payment response", paymentResponse);
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Checkout process failed:', error);
      this.loading = false;
      // Show error message
      this.errorMessage = "An error occurred during checkout. Please try again.";
      alert(this.errorMessage);
    }
  }
}
