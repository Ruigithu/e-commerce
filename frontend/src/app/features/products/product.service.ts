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
import {catchError, map, Observable, of, switchMap, throwError} from 'rxjs';
import {Product, ProductStatus} from './product.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ProductCategory} from './product-category.model';
import {ProductImage} from './product-image.model';
import {environment} from '../../../environments/environment.prod';

//@Injectable 装饰器表示 ProductService 是一个可注入的服务，
//providedIn: 'root' 表示这个服务是根级别的，意味着它会在整个应用中共享，
//并且 Angular 会在应用启动时自动创建一个 ProductService 实例。
@Injectable({
  providedIn: 'root'
})
//这里定义了一个 private 类型的属性 products，它是一个 Product 类型的数组，
//包含了三个商品的数据。这个数组是服务内部的数据源，模拟了从后端获取的商品列表。
//该属性是私有的，因此只能在 ProductService 内部访问。
// export class ProductService {
//   private products: Product[] = [
//     { id: 1, name: '商品1', price: 99.99, description: '这是商品1的描述' },
//     { id: 2, name: '商品2', price: 199.99, description: '这是商品2的描述' },
//     { id: 3, name: '商品3', price: 299.99, description: '这是商品3的描述' }
//   ];
//通过使用 Observable，你将数据获取的时机推迟到真正需要它的时候。
//当你调用 loadProducts() 方法时，
//它通过 this.productService.getProducts() 获取数据，这个过程是异步的。
//你可以在需要时获取数据，而不是在组件初始化时就立即加载。
//   getProducts(): Observable<Product[]> {
// //return of(this.products);
// //使用 RxJS 的 of 操作符将 this.products 数组包装成一个 Observable，并返回它。
// //调用 getProducts 的组件或服务可以通过订阅这个 Observable 来异步获取商品数据。
//     return of(this.products);
//   }
// }

export class ProductService {
  private apiUrlGetAllProductsBase = `${environment.apiUrl}/products`; // 后端 API 地址


  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {

      return this.http.get<Product[]>(this.apiUrlGetAllProductsBase);  // 移除重复的配置
    }

    getProduct(productId: string):Observable<Product>{
      const apiGetProductInfo = `${this.apiUrlGetAllProductsBase}/product/${productId}`;
      return this.http.get<Product>(apiGetProductInfo);
    }

    getProductCategory(): Observable<ProductCategory[]> {

      return this.http.get<ProductCategory[]>(`${this.apiUrlGetAllProductsBase}/product-categories`);  // 移除重复的配置
    }

  getProductImages(productId: string): Observable<ProductImage[]> {

    return this.http.get<ProductImage[]>(`${this.apiUrlGetAllProductsBase}/product-images/${productId}`);  // 移除重复的配置
  }


  getSpecificCategoryProducts(displayName: string): Observable<Product[]> {
    const url = `${this.apiUrlGetAllProductsBase}/category/${displayName}`;
    console.log('请求URL:', url);
    return this.http.get<Product[]>(url).pipe(
      catchError(err => {
        console.error('HTTP 请求错误:', err);
        return throwError(() => err);
      })
    );
  }

  updateProduct(productData: Product): Observable<Product> {
    const url = `${this.apiUrlGetAllProductsBase}/updateProduct`;

    return this.http.post<any>(url,
      productData,  // 直接传递 productData，不再嵌套
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
      }).pipe(
      map(response => response.body as Product)
    );
  }

  createProduct(productData: Product): Observable<Product> {
    const url = `${this.apiUrlGetAllProductsBase}/createNewProduct`;
    return this.http.post<any>(url,
      productData,  // 直接传递 productData，不要嵌套
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
        observe: 'response'
      }).pipe(
      map(response => response.body as Product)
    );
  }
  getAllProductsByMerchantId(merchantId: string|null):Observable<Product[]> {
    const url  =`${this.apiUrlGetAllProductsBase}/getAllProductsByMerchantId/${merchantId}`;
    return this.http.get<Product[]>(url);
  }
  // 添加产品图片
  addProductImage(productImage: {productId: string, imageUrl: string}): Observable<any> {
    const url = `${this.apiUrlGetAllProductsBase}/add-product-image`;
    return this.http.post<any>(url, productImage, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: true
    });
  }

// 获取产品的主图片URL（用于显示在列表中）
  getProductMainImage(productId: string): Observable<string> {
    const url = `${this.apiUrlGetAllProductsBase}/product-main-image/${productId}`;
    return this.http.get<{imageUrl: string}>(url).pipe(
      map(response => response.imageUrl),
      catchError(() => of('')) // 如果没有图片，返回空字符串
    );
  }

  // 在ProductService中添加
  isExternalUrl(url: string): boolean|string {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  }


  deleteProduct(productId: string): Observable<any> {
    const url = `${this.apiUrlGetAllProductsBase}/deleteProduct/${productId}`;
    return this.http.delete(url, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials: true
    });
  }

}
