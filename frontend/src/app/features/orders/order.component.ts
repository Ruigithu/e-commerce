import {Component, OnInit} from '@angular/core';
import {PaymentComponent} from '../payments/payment.component';
import {ActivatedRoute, Router} from '@angular/router';
import './order.style.css'
import {Product} from '../products/product.model';
import {CommonModule} from '@angular/common';
import {ProductService} from '../products/product.service';
import {Address} from '../users/addresss/address.model';
import {AddressService} from '../users/addresss/address.service';


@Component({
  selector: 'specific-order',
  standalone: true,
  imports: [PaymentComponent, CommonModule], // 添加CommonModule用于ngIf等指令
  template: `
    <div class="order-container" *ngIf="product">
      <div class="order-header">
        <h2>Order Details</h2>
        <span class="order-status">Processing</span>
      </div>

      <div class="order-content">
        <div class="order-card item-details">
          <h3>Item Details</h3>
          <div class="detail-row">
            <span class="label">Item Name:</span>
            <span class="value">{{ product.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Price:</span>
            <span class="value">{{ product.price }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Quantity:</span>
            <span class="value">{{ quantity }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">Total Price:</span>
            <span class="value">{{ product.price * quantity }}</span>
          </div>
        </div>

        <div class="order-card shipping-info">
          <h3>Shipping Information</h3>
          <div class="address">
            <div class="receiver-info">
              <div class="detail-row full-name">
                <span class="value">{{ defaultAddress?.receiverName }}</span>
              </div>
              <div class="detail-row phone-number">
                <span class="value">{{ defaultAddress?.phone }}</span>
              </div>
              <div class="detail-row detailed-address">
                <span class="value">{{ defaultAddress?.addressLine }} </span>
              </div>
              <div class="detail-row city">
                <span class="value">{{ defaultAddress?.city }}</span>
              </div>
            </div>
            <i class="fa-solid fa-angle-right" (click)="navigateToAddressSelection()"   [style.color]="'#dedede'"></i>
          </div>

        </div>

        <div class="payment-section">
          <app-payment [product]="product" [quantity]="quantity" ></app-payment>
        </div>
      </div>
    </div>

  `,
  styleUrl: './order.style.css'
})
export class OrderInfoComponent implements OnInit {
  productId: string="";
  quantity: number = 1;
  product:Product | null = null;
  defaultAddress:Address|null=null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService, // 需要添加这个服务
    private addressService: AddressService  // 使用合并后的服务
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.productId = params['productId'];
      this.quantity = parseInt(params['quantity']) || 1;

      const addressData = localStorage.getItem("defaultAddress");


      if (addressData) {  // 先检查是否有数据
        try {
          this.defaultAddress = JSON.parse(addressData);
        } catch (error) {
          console.error('Error parsing address data:', error);
          this.defaultAddress = null;
        }
      } else {
        this.defaultAddress = null;
      }

      if (this.productId) {
        this.loadProductInfo(this.productId);
      }
    });

    this.addressService.selectedAddress$.subscribe(address => {
      if (address) {
        this.defaultAddress = address;
        localStorage.setItem('defaultAddress', JSON.stringify(address));
      }
    });
  }

  navigateToAddressSelection() {
    this.router.navigate(['/address'], {
      queryParams: {
        returnUrl: this.router.url,
        mode: 'selection'
      }
    });

  }

  loadProductInfo(productId: string): void {
    this.productService.getProduct(productId).subscribe(
      (data) => {
        this.product = data;
      },
      (error) => console.error('Failed to load product:', error)
    );
  }
}
