
import { Component, OnInit } from '@angular/core';
//product.model: 引入了 Product 模型，表示商品的数据结构。
import { Product } from '../product.model';
//@angular/common: 引入了 CommonModule.
// 这是 Angular 中常用的公共模块，提供了一些常用指令（如 ngIf、ngFor）和管道。
import {CommonModule, NgForOf, NgIf} from '@angular/common';
//product.service: 引入了 ProductService，这是一个服务，用于获取商品数据。
import { ProductService } from '../product.service';
import {ActivatedRoute, RouterLink, RouterModule} from '@angular/router';
import {Header} from '../../../common/components/header/header.component';
import {UserMenuComponent} from '../../../common/components/header/user-menu.component';
import {environment} from '../../../environment';
import {catchError, forkJoin, map, of} from 'rxjs';



@Component({
  selector: 'app-product-list',
  template: `
    <div class="container">
      <app-header></app-header>
      <div class="category-header">
        <h2>{{ displayName }}</h2>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>

      <div *ngIf="!loading" class="product-grid">
        <div *ngFor="let product of products" class="product-card" [routerLink]="['/product', product.productId]">
          <div class="product-image">
            <img
              [src]="productService.isExternalUrl(product.imageUrl) ? product.imageUrl : (product.imageUrl ? (imageBaseUrl + product.imageUrl) : 'https://via.placeholder.com/200x200')"
              [alt]="product.name"
              (error)="onImageError($event)"
            >
            <div class="product-actions">
              <button class="action-button">
                <i class="fa-solid fa-cart-plus"></i>
              </button>
              <button class="action-button">
                <i class="fa-solid fa-heart"></i>
              </button>
            </div>
            <div class="product-badge" *ngIf="product.stock < 50">Limited Stock</div>
          </div>

          <div class="product-content">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-rating">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-regular fa-star"></i>
              <span>(24)</span>
            </div>
            <p class="product-description">{{ truncateDescription(product.description) }}</p>
            <div class="product-price">
              <span class="current-price">€{{ product.price.toFixed(2) }}</span>
              <span class="original-price" *ngIf="hasDiscount(product)">€{{ (product.price * 1.2).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && products.length === 0" class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <p>No products found in this category</p>
        <button class="refresh-button" (click)="loadProducts(displayName)">Refresh</button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterModule,
    UserMenuComponent,
    Header
  ],
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .category-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    h2 {
      font-size: 1.8rem;
      font-weight: 600;
      color: #333;
      margin: 0;
      text-transform: capitalize;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
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

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
      transition: all 0.3s;
      cursor: pointer;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }

    .product-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-actions {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.3s;
    }

    .product-card:hover .product-actions {
      opacity: 1;
      transform: translateX(0);
    }

    .action-button {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background-color: white;
      color: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }

    .action-button:hover {
      background-color: #578E7E;
      color: white;
    }

    .product-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background-color: #ff5252;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 500;
    }

    .product-content {
      padding: 1rem;
    }

    .product-name {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
    }

    .product-rating i {
      color: #ffc107;
    }

    .product-rating span {
      color: #666;
      margin-left: 0.25rem;
    }

    .product-description {
      font-size: 0.85rem;
      color: #666;
      margin: 0 0 0.75rem 0;
      line-height: 1.4;
      height: 2.4rem;
      overflow: hidden;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .current-price {
      font-size: 1.1rem;
      font-weight: 600;
      color: #578E7E;
    }

    .original-price {
      font-size: 0.9rem;
      color: #999;
      text-decoration: line-through;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
      color: #666;
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #ddd;
    }

    .refresh-button {
      background-color: #578E7E;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .refresh-button:hover {
      background-color: #477a6c;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
    }
  `]
})
export class SpecificCategoryComponent implements OnInit {
  products: Product[] = [];
  displayName: string = "";
  loading: boolean = true;
  imageBaseUrl: string = environment.apiUrl; // 使用网关地址

  constructor(
    private route: ActivatedRoute,
    public productService: ProductService // 修改为 public 以便在模板中访问
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.displayName = params['displayName'];
      if (this.displayName) {
        this.loadProducts(this.displayName);
      }
    });
  }

  loadProducts(displayName: string): void {
    this.loading = true;
    console.log(`进来请求，categoryId是:`, displayName);

    this.productService.getSpecificCategoryProducts(displayName).subscribe({
      next: (data) => {
        this.products = data || [];
        console.log('获取到的商品数据:', data);

        // 加载产品图片
        this.loadProductImages();
      },
      error: (error) => {
        console.error('加载商品失败:', error);
        this.products = [];
        this.loading = false;
      }
    });
  }

  loadProductImages(): void {
    // 创建所有产品图片请求的数组
    const imageRequests = this.products.map(product =>
      this.productService.getProductMainImage(product.productId).pipe(
        map(imageUrl => ({ productId: product.productId, imageUrl })),
        catchError(() => of({ productId: product.productId, imageUrl: '' }))
      )
    );

    // 若没有产品，直接返回
    if (imageRequests.length === 0) {
      this.loading = false;
      return;
    }

    // 并行处理所有图片请求
    forkJoin(imageRequests).subscribe({
      next: (results) => {
        // 为每个产品添加图片URL
        results.forEach(result => {
          const product = this.products.find(p => p.productId === result.productId);
          if (product) {
            product.imageUrl = result.imageUrl;
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product images:', error);
        this.loading = false;
      }
    });
  }

  // 处理图片加载错误，使用默认图片
  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/200x200';
  }

  // 截断描述文本
  truncateDescription(description: string): string {
    if (!description) return '';
    return description.length > 60 ? description.substring(0, 60) + '...' : description;
  }

  // 判断产品是否有折扣
  hasDiscount(product: Product): boolean {
    return product.price > 50; // 同样只是演示用
  }
}
