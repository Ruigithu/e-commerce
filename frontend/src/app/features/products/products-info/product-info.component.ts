import {Component, OnInit} from '@angular/core';
import {Product} from '../product.model';
import {ProductService} from '../product.service';
import {NgIf} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';

@Component({
  selector: `product-info`,
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  template: `
    <div class="container">
      <div *ngIf="product">
        <img alt="" src="#"/>

        <h2>{{ product.name }}</h2>
        <p>价格: ¥{{ product.price }}</p>
        <p>{{ product.description }}</p>
        <p>库存: {{ product.stock }}</p>
        <!-- 显示其他商品详细信息 -->
        <button routerLink="/createOrder">Buy</button>
      </div>
      <div *ngIf="!product">
        <p>Product Info Loading...</p>
      </div>
    </div>
  `,
  styles:`
.container{
  text-align: center;
}
img{
  width:100px;
  height:100px;
}
  `
})

export class ProductInfoComponent implements OnInit{
  product!: Product; // 可选属性，避免初始化问题

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute // 注入 ActivatedRoute
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.loadProductInfo(productId);
    } else {
      console.error('productId 未定义');
    }

  }

  loadProductInfo(productId:string): void {
    this.productService.getProduct(productId).subscribe(
      (data) => {
        console.log('获取到的商品数据:', data);
        this.product = data;
      },
      (error) => console.error('加载商品失败:', error)
    );
  }
}
