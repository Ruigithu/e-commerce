import {Component, OnInit} from '@angular/core';
import {Product} from '../product.model';
import {ProductService} from '../product.service';
import {NgIf, NgOptimizedImage, NgClass} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import './product-info.style.css'
import {Header} from '../../../common/components/header/header.component';
import {CartService} from '../../orders/carts/cart.service';
import {ProductImage} from '../product-image.model';
import {environment} from '../../../environment';

@Component({
  selector: `product-info`,
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    NgOptimizedImage,
    NgClass,
    Header
  ],
  template: `
    <div class="container">
      <app-header></app-header>
      <div *ngIf="product" class="container-content">
        <div class="breadcrumb">
          <span>Home</span> > <span>Products</span> > <span class="current">{{product.name}}</span>
        </div>

        <div class="top-half">
          <div class="item-pictures">
            <div class="main-image-container">
              <img [src]="getImageUrl(productImages[0])" alt="laptop" class="product-image"/>
              <div class="image-overlay">
                <span class="zoom-hint">🔍 点击放大</span>
              </div>
            </div>
            <div class="thumbnail-container" *ngIf="productImages && productImages.length > 0">
              <div class="thumbnail active">
                <img [src]="getImageUrl(productImages[0])" alt="thumbnail 1"/>
              </div>
              <div class="thumbnail" *ngIf="productImages.length > 1">
                <img [src]="getImageUrl(productImages[1])" alt="thumbnail 2"/>
              </div>
              <div class="thumbnail" *ngIf="productImages.length > 2">
                <img [src]="getImageUrl(productImages[2])" alt="thumbnail 3"/>
              </div>
            </div>
          </div>

          <div class="item-info">
            <div class="product-header">
              <h1>{{ product.name }}</h1>
              <div class="rating">
                <span class="stars">★★★★☆</span>
                <span class="review-count">(245 reviews)</span>
              </div>
            </div>

            <div class="price-container">
              <span class="currency">euros</span>
              <span class="price">{{ product.price }}</span>
              <span class="original-price">euros {{product.price * 1.2}}</span>
              <span class="discount-tag">-20%</span>
            </div>

            <div class="description">
              <h3>description</h3>
              <p>{{ product.description }}</p>
            </div>

            <div class="stock-info" [ngClass]="{'low-stock': product.stock < 100}">
              <span class="stock-icon">{{product.stock > 0 ? '✓' : '✗'}}</span>
              <span>stock: {{ product.stock }} {{product.stock < 100 ? '(low stock)' : ''}}</span>
            </div>

            <div class="shipping-info">
              <div class="info-item">
                <span class="icon">🚚</span>
                <span>free delivery</span>
              </div>
              <div class="info-item">
                <span class="icon">↩️</span>
                <span>return and refund within 7 days</span>
              </div>
              <div class="info-item">
                <span class="icon">💯</span>
                <span>Genuine product guarantee</span>
              </div>
            </div>

            <div class="quantity-selector">
              <button class="quantity-btn" (click)="decreaseQuantity()">-</button>
              <input type="number" [value]="quantity" min="1" max="99" readonly>
              <button class="quantity-btn" (click)="increaseQuantity()">+</button>
            </div>

            <div class="button-container">
              <button class="buy-button" routerLink="/createOrder" (click)="handleBuyNow()">
                <span class="icon">💳</span>
                Buy now
              </button>
              <button
                class="cart-button"
                [ngClass]="{'in-cart': isInCart}"
                (click)="handleCartAction()"
              >
                <span class="icon">{{isInCart ? '🛒' : '+'}}</span>
                {{ isInCart ? '去购物车' : '加入购物车' }}
              </button>
            </div>
          </div>
        </div>

        <div class="item-review">
          <h2>Review Summary</h2>
          <div class="review-summary">
            <div class="rating-overview">
              <div class="average-rating">
                <span class="big-rating">4.8</span>
                <div class="rating-stars">★★★★★</div>
                <span class="total-reviews">245 条评价</span>
              </div>
              <div class="rating-bars">
                <div class="rating-bar">
                  <span>5星</span>
                  <div class="bar-container">
                    <div class="bar" style="width: 80%"></div>
                  </div>
                  <span>80%</span>
                </div>
                <!-- More rating bars... -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!product" class="loading">
        <div class="loading-spinner"></div>
        <p>loading product information...</p>
      </div>
    </div>
  `,
  styleUrl: './product-info.style.css'
})

export class ProductInfoComponent implements OnInit {
  product!: Product;
  isInCart: boolean = false;
  quantity: number = 1;
  productImages!:ProductImage[];
  cartId: string | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,  // 添加Router服务
    private cartService:CartService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.loadProductInfo(productId);
    } else {
      console.error('productId 未定义');
    }

  }
  getImageUrl(image: ProductImage): string {
    console.log(`${environment.apiUrl}/products/${image.imageUrl}`);
    return `${environment.apiUrl}/products/${image.imageUrl}`;
  }

  loadProductInfo(productId: string): void {
    this.productService.getProduct(productId).subscribe(
      (data) => {
        console.log('获取到的商品数据:', data);
        this.product = data;
      },
      (error) => console.error('加载商品失败:', error)
    );
    this.productService.getProductImages(productId).subscribe(
      (data)=>{
        console.log(data);
        this.productImages=data;
      },
      (error) => console.error('加载商品图片失败:', error)
    );
  }

  handleCartAction(): void {
    if (localStorage.getItem('userId') !== null) {
      console.log(localStorage.getItem('userId'));
      if (!this.isInCart) {
        this.cartService.addToCart(this.product.productId, this.quantity)
          .subscribe(
            (response) => {
              this.isInCart = true;
              // Optional: Show success message
            },
            (error) => console.error('Failed to add to cart:', error)
          );
      } else {
        this.router.navigate(['/go-to-cart']);
      }
    }else{
      localStorage.setItem('redirectAfterLogin',window.location.pathname);
      this.router.navigate(['/login']);
    }
  }

  handleBuyNow(){
    if (localStorage.getItem('userId') !== null) {
      console.log(localStorage.getItem('userId'));
      this.router.navigate(['/createOrder'], {
        queryParams: {
          productId: this.product.productId,  // 假设你的Product模型有id属性
          quantity: this.quantity
        }
      });
    }else{
      localStorage.setItem('redirectAfterLogin',window.location.href);
      this.router.navigate(['/login']);
    }
  }


  increaseQuantity(): void {
    if (this.quantity < 99) {
      this.quantity++;
      console.log(`quantity=${this.quantity}`)
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }




}


