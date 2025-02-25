
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

//
@Component({
  selector: 'app-product-list',
  template: `
    <div class="container">
      <app-header></app-header>
      <h2>Products List</h2>
      <div class="product-grid">
        <!-- 修改这里，添加 products 的空值检查 -->
        <div *ngIf="products && products.length === 0">
          No products found in this category
        </div>
        <!-- 同样添加 products 的空值检查 -->
        <div *ngFor="let product of products || []"
             class="product-card"
             [routerLink]="['/product', product.productId]">
          <h3>{{ product.name }}</h3>
          <p>Price: €{{ product.price }}</p>
          <p>{{ product.description }}</p>
        </div>
      </div>
    </div>
  `,
  //standalone: 这是 Angular 14 及以后版本中引入的新属性，表示该组件是独立的，不依赖于其他模块的导入。
  standalone: true,

  imports: [
    NgForOf,
    NgIf,
    UserMenuComponent,
    RouterModule,
    CommonModule,
    Header
  ],

  styles: [`
    .container {
      padding: 10px;
      margin-top: 0;
      text-align: center;
    }
    h2{
      margin-top: 0;
    }

    .product-grid {
      display: flex;
      flex-wrap: wrap; /* 允许换行 */
      justify-content: space-between; /* 均匀分布 */
      gap: 20px; /* 控制间距 */
      padding: 20px;
    }

    .product-card {
      flex: 1 1 calc(33.333% - 20px); /* 让每个卡片占 1/3 宽度，并考虑间距 */
      max-width: 200px; /* 限制最大宽度 */
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 10px;
      text-align: center;
      background: #fff;
      box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s; /* 动画效果 */
    }
    .product-card:hover {
      transform: scale(1.05); /* 鼠标悬停时放大卡片 */
    }

    button {
      padding: 10px 20px;
      background-color: #3D3D3D;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #3D3D3D;
    }
  `]
})
export class SpecificCategoryComponent implements OnInit {
  // 初始化为空数组而不是 undefined
  products: Product[] = [];
  categoryId: string = "";

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['categoryId'];
      if (this.categoryId) {
        this.loadProducts(this.categoryId);
      }
    });
  }

  loadProducts(categoryId: string): void {
    console.log(`进来请求，categoryId是:`, categoryId);
    this.productService.getSpecificCategoryProducts(categoryId).subscribe({
      next: (data) => {
        this.products = data || []; // 确保即使 data 为 null 也会赋值为空数组
        console.log('获取到的商品数据:', data);
      },
      error: (error) => {
        console.error('加载商品失败:', error);
        this.products = []; // 发生错误时设置为空数组
      }
    });
  }
}
