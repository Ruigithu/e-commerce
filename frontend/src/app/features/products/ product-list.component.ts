//@angular/core: 引入了 Angular 核心模块中的 Component 和 OnInit。
// Component 是用于定义组件的装饰器，而 OnInit 是一个生命周期钩子，用于在组件初始化时执行逻辑。
import { Component, OnInit } from '@angular/core';
//product.model: 引入了 Product 模型，表示商品的数据结构。
import { Product } from './product.model';
//@angular/common: 引入了 CommonModule.
// 这是 Angular 中常用的公共模块，提供了一些常用指令（如 ngIf、ngFor）和管道。
import { CommonModule } from '@angular/common';
//product.service: 引入了 ProductService，这是一个服务，用于获取商品数据。
import { ProductService } from './product.service';

//
@Component({
  selector: 'app-product-list',
  template: `
    <div class="container">
      <h2>商品列表</h2>
      <button (click)="loadProducts()">加载商品</button>

      <div class="product-grid">
        <!--*ngFor="let product of products":
        使用 ngFor 指令循环遍历 products 数组，生成每个商品的卡片。-->
        <div *ngFor="let product of products" class="product-card">
          <h3>{{ product.name }}</h3>
          <p>价格: ¥{{ product.price }}</p>
          <p>{{ product.description }}</p>
        </div>
      </div>
    </div>
  `,
  //standalone: 这是 Angular 14 及以后版本中引入的新属性，表示该组件是独立的，不依赖于其他模块的导入。
  standalone: true,
  //CommonModule 是 Angular 提供的一个模块，它包含了一些常用的指令和管道，主要用于 Angular 模块的共享功能。常见的指令包括：
  //
  // ngIf: 条件渲染。根据条件来决定是否渲染某个元素。
  // ngFor: 循环渲染。用于遍历数组并为每个数组元素创建一个 DOM 元素。
  // ngClass: 动态添加/移除 CSS 类。
  // ngStyle: 动态应用样式。
  imports: [CommonModule],
  //你需要依赖其他模块的导入，当你的组件需要使用来自其他模块的功能时。比如，如果你想使用表单功能，你需要导入 FormsModule 或 ReactiveFormsModule；如果你需要 HTTP 请求功能，你需要导入 HttpClientModule。
  //
  // 例如：
  //
  // FormsModule: 用于模板驱动表单。
  // ReactiveFormsModule: 用于响应式表单。
  // HttpClientModule: 用于发起 HTTP 请求。
  // 你可以在 Angular 模块的 imports 数组中导入这些模块：
  //
  // typescript
  // Copy
  // Edit
  // import { FormsModule } from '@angular/forms';
  // import { HttpClientModule } from '@angular/common/http';
  //
  // @NgModule({
  //   imports: [FormsModule, HttpClientModule],
  //   // 其他配置...
  // })
  // export class AppModule {}
  styles: [`
    .container {
      padding: 20px;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .product-card {
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 8px;
    }

    button {
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #45a049;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {}
//这里的 subscribe 方法表示异步获取数据，products 是返回的数据，
// this.products = products 是更新组件中的 products 数组。
//   loadProducts() {
//     this.productService.getProducts().subscribe(
//       products => this.products = products
//     );
//   }
  loadProducts(): void {
    this.productService.getProducts().subscribe(
      (data) => (this.products = data),
      (error) => console.error('加载商品失败:', error)
    );
  }
}
