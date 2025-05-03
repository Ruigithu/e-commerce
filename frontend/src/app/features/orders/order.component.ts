import { Component, OnInit } from '@angular/core';
import { PaymentComponent } from '../payments/payment.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../products/product.model';
import { CommonModule } from '@angular/common';
import { ProductService } from '../products/product.service';
import { Address } from '../users/addresss/address.model';
import { AddressService } from '../users/addresss/address.service';
import { Header } from '../../common/components/header/header.component';
import {Observable, of, tap} from 'rxjs';

@Component({
  selector: 'specific-order',
  standalone: true,
  imports: [
    PaymentComponent,
    CommonModule,
    Header
  ],
  template: `
    <div class="order-page">
      <app-header></app-header>

      <div class="order-container">
        <!-- Loading State -->
        <div *ngIf="!product && isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading order information...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="!product && !isLoading && errorMessage" class="error-message">
          <i class="fa-solid fa-circle-exclamation"></i>
          <div>
            <h3>Loading Failed</h3>
            <p>{{ errorMessage }}</p>
            <button (click)="retry()" class="retry-btn">Retry</button>
          </div>
        </div>

        <!-- Order Details -->
        <div *ngIf="product" class="order-content">
          <div class="order-header">
            <div>
              <h1>Order Details</h1>
            </div>
            <div class="order-status">
              <i class="fa-solid fa-circle-notch fa-spin"></i>
              Processing
            </div>
          </div>

          <div class="order-details">
            <!-- Product Information Card -->
            <div class="order-card item-details">
              <h2>
                <i class="fa-solid fa-box"></i>
                Product Information
              </h2>

              <div class="product-card">
                <div class="product-image">
                  <img *ngIf="getProductImage(productId) | async as imageUrl"
                       [src]="imageUrl"
                       alt="Product image">
                </div>

                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-price">€{{ product.price.toFixed(2) }}</p>

                  <div class="quantity-info">
                    <span class="quantity-label">Quantity:</span>
                    <div class="quantity-selector">
                      <button (click)="decreaseQuantity()" [disabled]="quantity <= 1" class="quantity-btn">
                        <i class="fa-solid fa-minus"></i>
                      </button>
                      <span class="quantity-display">{{ quantity }}</span>
                      <button (click)="increaseQuantity()" class="quantity-btn">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="order-summary">
                <div class="summary-row">
                  <span>Product Amount:</span>
                  <span>€{{ product.price.toFixed(2) }}</span>
                </div>
                <div class="summary-row">
                  <span>Quantity:</span>
                  <span>{{ quantity }}</span>
                </div>
                <div class="summary-row shipping">
                  <span>Shipping Fee:</span>
                  <span>{{ shippingFee > 0 ? '€' + shippingFee.toFixed(2) : 'Free Shipping' }}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total">
                  <span>Total:</span>
                  <span>€{{ getTotalPrice().toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Shipping Address Card -->
            <div class="order-card shipping-info">
              <h2>
                <i class="fa-solid fa-location-dot"></i>
                Shipping Information
              </h2>

              <div *ngIf="defaultAddress" class="address-details">
                <div class="address-content">
                  <h3 class="recipient-name">{{ defaultAddress.receiverName }}</h3>
                  <p class="recipient-phone">{{ formatPhoneNumber(defaultAddress.phone) }}</p>
                  <p class="recipient-address">{{ defaultAddress.addressLine }}</p>
                  <p class="recipient-city">{{ defaultAddress.city }} {{ defaultAddress.postalCode }}</p>
                </div>

                <button class="address-edit-btn" (click)="navigateToAddressSelection()">
                  <i class="fa-solid fa-pen-to-square"></i>
                  Edit
                </button>
              </div>

              <div *ngIf="!defaultAddress" class="no-address">
                <p>You haven't added a shipping address yet</p>
                <button class="add-address-btn" (click)="navigateToAddressSelection()">
                  <i class="fa-solid fa-plus"></i>
                  Add Address
                </button>
              </div>
            </div>

            <!-- Payment Method Card -->
            <div class="order-card payment-section">
              <h2>
                <i class="fa-solid fa-credit-card"></i>
                Payment Method
              </h2>

              <div class="payment-method">
                <div class="payment-option selected">
                  <input type="radio" id="stripe" name="payment" checked>
                  <label for="stripe">
                    <i class="fa-brands fa-stripe"></i>
                    Stripe Payment
                  </label>
                </div>

                <app-payment [product]="product" [quantity]="quantity" class="payment-button"></app-payment>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .order-page {
      min-height: 100vh;
      background-color: #f9f9f9;
    }

    .order-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
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
      align-items: flex-start;
      gap: 1rem;
      padding: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .error-message i {
      font-size: 2rem;
      color: #ff5252;
    }

    .error-message h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .error-message p {
      margin: 0 0 1rem 0;
      color: #666;
    }

    .retry-btn {
      background-color: #578E7E;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .retry-btn:hover {
      background-color: #477a6c;
    }

    /* 订单内容样式 */
    .order-content {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 1.8rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .order-id {
      color: #666;
      margin: 0;
      font-size: 0.9rem;
    }

    .order-status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* 订单卡片样式 */
    .order-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .order-card h2 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.2rem;
      color: #333;
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }

    /* 商品卡片样式 */
    .product-card {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .product-image {
      width: 100px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-info {
      flex: 1;
    }

    .product-name {
      font-size: 1.1rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .product-price {
      font-size: 1.1rem;
      font-weight: 600;
      color: #578E7E;
      margin: 0 0 1rem 0;
    }

    .quantity-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .quantity-label {
      color: #666;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quantity-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }

    .quantity-btn:hover:not(:disabled) {
      background-color: #eee;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-display {
      min-width: 24px;
      text-align: center;
      font-weight: 500;
    }

    /* 订单总结样式 */
    .order-summary {
      background-color: #f9f9f9;
      padding: 1.25rem;
      border-radius: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      color: #666;
      font-size: 0.95rem;
    }

    .summary-row.shipping {
      margin-bottom: 0;
    }

    .summary-divider {
      height: 1px;
      background-color: #ddd;
      margin: 0.75rem 0;
    }

    .summary-row.total {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    /* 收货地址样式 */
    .address-details {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background-color: #f9f9f9;
      padding: 1.25rem;
      border-radius: 8px;
    }

    .address-content {
      flex: 1;
    }

    .recipient-name {
      font-size: 1.1rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .recipient-phone, .recipient-address, .recipient-city {
      margin: 0.25rem 0;
      color: #666;
    }

    .address-edit-btn {
      background: none;
      border: none;
      color: #578E7E;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .address-edit-btn:hover {
      background-color: rgba(87, 142, 126, 0.1);
    }

    .no-address {
      text-align: center;
      padding: 2rem 0;
      color: #666;
    }

    .add-address-btn {
      background-color: #578E7E;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-address-btn:hover {
      background-color: #477a6c;
    }

    /* 支付方式样式 */
    .payment-method {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .payment-option.selected {
      border-color: #578E7E;
      background-color: rgba(87, 142, 126, 0.05);
    }

    .payment-option label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-weight: 500;
      color: #333;
    }

    .payment-option i {
      font-size: 1.5rem;
      color: #6772e5;
    }

    .payment-button {
      margin-top: 1rem;
      width: 100%;
    }

    .payment-button button {
      width: 100%;
      background-color: #578E7E;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.9rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .payment-button button:hover {
      background-color: #477a6c;
    }

    .payment-button button:active {
      transform: translateY(1px);
    }

    /* 响应式样式 */
    @media (max-width: 768px) {
      .order-container {
        padding: 1rem;
      }

      .order-header {
        flex-direction: column;
      }

      .order-status {
        margin-top: 1rem;
      }

      .product-card {
        flex-direction: column;
      }

      .product-image {
        width: 100%;
        height: auto;
        aspect-ratio: 16/9;
      }
    }
  `]
})
export class OrderInfoComponent implements OnInit {
  productId: string = "";
  quantity: number = 1;
  product: Product | null = null;
  defaultAddress: Address | null = null;
  isLoading: boolean = true;
  errorMessage: string = "";
  shippingFee: number = 0;
  image='';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private addressService: AddressService
  ) {}

  ngOnInit() {
    this.loadData();

    this.addressService.selectedAddress$.subscribe(address => {
      if (address) {
        this.defaultAddress = address;
        localStorage.setItem('defaultAddress', JSON.stringify(address));
      }
    });
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = "";

    this.route.queryParams.subscribe(params => {
      this.productId = params['productId'];
      this.quantity = parseInt(params['quantity']) || 1;

      const addressData = localStorage.getItem("defaultAddress");
      if (addressData) {
        try {
          this.defaultAddress = JSON.parse(addressData);
        } catch (error) {
          console.error('Error parsing address data:', error);
          this.defaultAddress = null;
        }
      }

      if (this.productId) {
        this.loadProductInfo(this.productId);
      } else {
        this.isLoading = false;
        this.errorMessage = "Product no found";
      }
    });
  }

  retry() {
    this.loadData();
  }

  navigateToAddressSelection() {
    this.router.navigate(['/address'], {
      queryParams: {
        returnUrl: this.router.url,
        mode: 'selection'
      }
    });
  }
  productImagesMap = new Map<string, string>();

  loadProductInfo(productId: string): void {
    this.productService.getProduct(productId).subscribe({
      next: (data) => {
        this.product = data;

        // 根据订单金额计算运费
        this.calculateShipping();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load product:', error);
        this.errorMessage = "加载商品信息失败";
        this.isLoading = false;
      }
    });
  }

  getProductImage(productId: string): Observable<string> {
    // 如果缓存中已有图片，直接返回
    if (this.productImagesMap.has(productId)) {
      return of(this.productImagesMap.get(productId) || '');
    }

    // 否则调用服务获取图片
    return this.productService.getProductMainImage(productId).pipe(
      tap(imageUrl => {
        // 存入缓存
        this.productImagesMap.set(productId, imageUrl);
      })
    );
  }
  calculateShipping() {
    // 简单的运费计算逻辑：订单金额超过50欧元免运费，否则5欧元运费
    if (this.product) {
      const subtotal = this.product.price * this.quantity;
      this.shippingFee = subtotal >= 50 ? 0 : 5;
    }
  }

  getTotalPrice(): number {
    if (!this.product) return 0;
    return (this.product.price * this.quantity) + this.shippingFee;
  }


  formatPhoneNumber(phone: string): string {
    // 简单的电话号码格式化
    if (!phone || phone.length !== 11) return phone;
    return `${phone.substring(0, 3)} ${phone.substring(3, 7)} ${phone.substring(7)}`;
  }

  increaseQuantity(): void {
    this.quantity++;
    this.calculateShipping();
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.calculateShipping();
    }
  }
}
