# E-Commerce

## Angular

+ install Angular command line tool
  
  ```bash
  npm install -g @angular/cli
  ```

+ verify  whether installed successfully
  
  ```bash
  ng version
  ```

+ init angular
  
  ```bash
  ng new ecommerce-frontend
  ```

+ launch serve
  
  ```bash
  cd frontend
  ng serve
  ```

+ you can move all the new-generated files to the frontend, and use frontend as root catalog of the Angular project and the change the settings in the `angular.json`

## Angular

![](https://video.udacity-data.com/topher/2021/March/604d08a4_fsjs-c3-l1-what-ia-a-component/fsjs-c3-l1-what-ia-a-component.jpg)

+ create new Compoents
  
  ```bash
  ng generate component Photos
  ```

        > will create file in the app folder with four files

<img src="file:///C:/Users/A/AppData/Roaming/marktext/images/2025-01-18-22-31-02-image.png" title="" alt="" width="270">

+ small case
  
  ```typescript
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
    //standalone: 这是 Angular 14 及以后版本中引入的新属性，表示该组件是独立的，不依
    //CommonModule 是 Angular 提供的一个模块，它包含了一些常用的指令和管道，主要用于 Angular 模块的共享功能。常见的指令包括：
    //
    // ngIf: 条件渲染。根据条件来决定是否渲染某个元素。
    // ngFor: 循环渲染。用于遍历数组并为每个数组元素创建一个 DOM 元素。
    // ngClass: 动态添加/移除 CSS 类。
    // ngStyle: 动态应用样式。赖于其他模块的导入。
    standalone: true,
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
  
    loadProducts() {
      this.productService.getProducts().subscribe(
        products => this.products = products
      );
    }
  }
  service';
  ```

+ template

```typescript
@Component({
  selector: 'app-product-list',
  template: `
    <!-- HTML 模板内容 -->
  `,
  standalone: true,
  imports: [CommonModule],
  styles: [`
    /* CSS 样式 */
  `]
})

```

+ serviceenvironment.ts
  
  ```typescript
  //Injectable 是 Angular 提供的一个装饰器，用于标记一个类是可以被注入的服务。
  //通过使用 @Injectable()，Angular 会将这个类注册到依赖注入系统中，
  //以便在其他组件或服务中使用它。
  import { Injectable } from '@angular/core';
  //Observable 是 RxJS 库中的一个核心概念，用于表示异步数据流。
  //Angular 中的许多操作（如 HTTP 请求）都是通过 Observable 来处理的。
  //of 是 RxJS 中的一个创建操作符，
  //它用于将传入的数据（如数组、对象等）转换为一个 Observable 对象。
  //它是一个非常简单的方式来创建 Observable，
  //在这里它将 this.products 数组转换成一个 Observable 对象。
  import { Observable, of } from 'rxjs';
  import { Product } from './product.model';
  
  //@Injectable 装饰器表示 ProductService 是一个可注入的服务，
  //providedIn: 'root' 表示这个服务是根级别的，意味着它会在整个应用中共享，
  //并且 Angular 会在应用启动时自动创建一个 ProductService 实例。
  @Injectable({
    providedIn: 'root'
  })
  //这里定义了一个 private 类型的属性 products，它是一个 Product 类型的数组，
  //包含了三个商品的数据。这个数组是服务内部的数据源，模拟了从后端获取的商品列表。
  //该属性是私有的，因此只能在 ProductService 内部访问。
  export class ProductService {
    private products: Product[] = [
      { id: 1, name: '商品1', price: 99.99, description: '这是商品1的描述' },
      { id: 2, name: '商品2', price: 199.99, description: '这是商品2的描述' },
      { id: 3, name: '商品3', price: 299.99, description: '这是商品3的描述' }
    ];
  //通过使用 Observable，你将数据获取的时机推迟到真正需要它的时候。
  //当你调用 loadProducts() 方法时，
  //它通过 this.productService.getProducts() 获取数据，这个过程是异步的。
  //你可以在需要时获取数据，而不是在组件初始化时就立即加载。
    getProducts(): Observable<Product[]> {
  //return of(this.products); 
  //使用 RxJS 的 of 操作符将 this.products 数组包装成一个 Observable，并返回它。
  //调用 getProducts 的组件或服务可以通过订阅这个 Observable 来异步获取商品数据。
      return of(this.products);
    }
  }      
  ```

+ 配置路由
  
  ### **结合路由的配置**
  
  你的路由规则需要在 `appConfig` 中通过 `provideRouter()` 方法提供。
  
  #### 示例：
  
  1. **在 `app.routesenvironment.ts` 中定义路由规则**：只需要在这里配置
  
  ```typescript
  import { Routes } from '@angular/router'; 
  import { HomeComponent } from './home/home.component'; 
  import { AboutComponent } from './about/about.component'; 
  export const routes: Routes = [ 
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent }, 
  { path: 'about', component: AboutComponent } ];
  ```
  
  
  
  2. **在 `app.configenvironment.ts` 中配置路由**：
  
  ```typescript
  import { ApplicationConfig } from '@angular/core'; 
  import { provideRouter } from '@angular/router'; 
  import { routes } from './app.routes'; 
  
  export const appConfig: ApplicationConfig = { 
  providers: [ provideRouter(routes) // 提供路由规则 ] };
  ```
  
  `
  
  3. **更新 `mainenvironment.ts` 引导应用**：
  
  ```typescript
  import { bootstrapApplication } from '@angular/platform-browser'; 
  import { appConfig } from './app/app.config'; 
  import { AppComponent } from './app/app.component'; 
  bootstrapApplication(AppComponent, appConfig) 
  .catch(err => console.error(err));
  ```
  
  
  
  ---
  
  ### **如何验证路由是否生效**
  
  1. **确保路由组件正常导入和声明**：
     
     - 确保 `HomeComponent` 和 `AboutComponent` 是独立的组件，并且使用了 `@Component` 装饰器。
  
  2. **在 `AppComponent` 中添加 `<router-outlet>`**：
     
     html
     
     CopyEdit
     
     `<nav>   <a routerLink="/home">首页</a>   <a routerLink="/about">关于</a> </nav> <router-outlet></router-outlet>`
  
  3. **运行项目**：
     
     - 使用 `ng serve` 启动项目。
     - 访问 `/home` 和 `/about` 路径，验证是否加载了对应的组件。

+ Angular 与 Spring Boot 集成指南
  
  ## 1. 设置 Spring Boot 后端
  
  确保 Spring Boot 后端已配置好 REST API，可以返回 JSON 格式的数据。
  
  ### 后端代码示例
  
  #### Controller 示例
  
  ```java
  import org.springframework.web.bind.annotation.GetMapping;
  import org.springframework.web.bind.annotation.RequestMapping;
  import org.springframework.web.bind.annotation.RestController;
  import java.util.List;
  
  @RestController
  @RequestMapping("/api/products")
  public class ProductController {
      @GetMapping
      public List<Product> getProducts() {
          return List.of(
              new Product(1, "商品1", 99.99, "这是商品1的描述"),
              new Product(2, "商品2", 199.99, "这是商品2的描述"),
              new Product(3, "商品3", 299.99, "这是商品3的描述")
          );
      }
  }
  ```
  
  #### Product 类
  
  ```java
  public class Product {
      private int id;
      private String name;
      private double price;
      private String description;
  
      // 构造函数、Getter 和 Setter
      public Product(int id, String name, double price, String description) {
          this.id = id;
          this.name = name;
          this.price = price;
          this.description = description;
      }
      // Getters 和 Setters
  }
  ```
  
  ### 后端运行
  
  启动 Spring Boot 项目，确保 API 可以通过浏览器或工具（如 Postman）访问：
  
  ```bash
  GET http://localhost:8080/api/products
  ```
  
  ## 2. 配置 Angular 前端
  
  ### 安装依赖
  
  确保 Angular 项目安装了 `HttpClientModule`，用于发起 HTTP 请求：
  
  ```bash
  npm install @angular/common
  ```
  
  ## 3. 配置 Angular 服务
  
  ### 生成服务
  
  ```bash
  ng generate service product
  ```
  
  ### 服务代码
  
  `product.serviceenvironment.ts`:
  
  ```typescript
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { Product } from './product.model';
  
  @Injectable({
      providedIn: 'root',
  })
  export class ProductService {
      private apiUrl = 'http://localhost:8080/api/products'; // 后端 API 地址
  
      constructor(private http: HttpClient) {}
  
      getProducts(): Observable<Product[]> {
          return this.http.get<Product[]>(this.apiUrl);
      }
  }
  ```
  
  ## 4. 配置 Angular 组件
  
  ### 生成组件
  
  ```bash
  ng generate component product-list
  ```
  
  ### 组件代码
  
  `product-list.componentenvironment.ts`:
  
  ```typescript
  import { Component, OnInit } from '@angular/core';
  import { ProductService } from './product.service';
  import { Product } from './product.model';
  
  @Component({
      selector: 'app-product-list',
      template: `
          <div class="container">
              <h2>商品列表</h2>
              <button (click)="loadProducts()">加载商品</button>
              <div class="product-grid" *ngIf="products.length > 0">
                  <div *ngFor="let product of products" class="product-card">
                      <h3>{{ product.name }}</h3>
                      <p>价格: ¥{{ product.price }}</p>
                      <p>{{ product.description }}</p>
                  </div>
              </div>
          </div>
      `,
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
      `]
  })
  export class ProductListComponent implements OnInit {
      products: Product[] = [];
  
      constructor(private productService: ProductService) {}
  
      ngOnInit(): void {}
  
      loadProducts(): void {
          this.productService.getProducts().subscribe(
              (data) => (this.products = data),
              (error) => console.error('加载商品失败:', error)
          );
      }
  }
  ```
  
  ## 5. 配置路由
  
  ### 配置路由
  
  `app.routesenvironment.ts`:
  
  ```typescript
  import { Routes } from '@angular/router';
  import { ProductListComponent } from './product-list/product-list.component';
  
  export const routes: Routes = [
      { path: 'products', component: ProductListComponent },
      { path: '', redirectTo: '/products', pathMatch: 'full' },
  ];
  ```
  
  ## 6. 添加 HttpClientModule
  
  在 `app.configenvironment.ts` 中，确保引入了 `HttpClientModule`：
  
  ```typescript
  import { ApplicationConfig } from '@angular/core';
  import { provideRouter } from '@angular/router';
  import { routes } from './app.routes';
  import { provideHttpClient } from '@angular/common/http';
  
  export const appConfig: ApplicationConfig = {
      providers: [
          provideRouter(routes),
          provideHttpClient()
      ],
  };
  ```
  
  ## 7. 启动 Angular 项目
  
  运行 Angular 项目：
  
  ```bash
  ng serve
  ```
  
  浏览器访问：
  
  ```bash
  http://localhost:4200/products
  ```
  
  ## 总结
  
  1. **后端**：确保 Spring Boot 提供可用的 REST API
  2. **前端服务**：使用 `HttpClient` 调用后端 API
  3. **组件**：通过服务获取数据并显示在页面上
  4. **模块配置**：确保 Angular 项目中正确引入了 `HttpClientModule`
