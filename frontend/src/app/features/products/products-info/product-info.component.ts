import {Component, OnInit} from '@angular/core';
import {Product} from '../product.model';
import {ProductService} from '../product.service';
import {NgIf, NgOptimizedImage, NgClass, NgFor} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
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
    Header,
    NgFor
  ],
  template: `
    <div class="product-page">
      <app-header></app-header>

      <!-- 加载状态 -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>正在加载商品信息...</p>
      </div>

      <!-- 产品详情 -->
      <div *ngIf="!loading && product" class="product-container">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
          <a [routerLink]="['/home']">首页</a>
          <i class="fa-solid fa-chevron-right"></i>
          <a [routerLink]="['/products']">商品</a>
          <i class="fa-solid fa-chevron-right"></i>
          <span>{{product.name}}</span>
        </div>

        <div class="product-details">
          <!-- 商品图片区域 -->
          <div class="product-images">
            <div class="main-image">
              <img [src]="getMainImageUrl()" [alt]="product.name" (click)="openImageModal()">
              <div class="image-overlay">
                <i class="fa-solid fa-magnifying-glass"></i>
                <span>点击放大查看</span>
              </div>
            </div>

            <div class="thumbnails" *ngIf="productImages && productImages.length > 1">
              <div
                *ngFor="let image of productImages; let i = index"
                class="thumbnail"
                [class.active]="selectedImageIndex === i"
                (click)="selectedImageIndex = i">
                <img [src]="getImageUrl(image)" [alt]="'缩略图 ' + (i + 1)">
              </div>
            </div>
          </div>

          <!-- 商品信息区域 -->
          <div class="product-info">
            <h1 class="product-title">{{product.name}}</h1>

            <div class="product-meta">
              <div class="product-rating">
                <div class="stars">
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star"></i>
                  <i class="fa-solid fa-star-half-alt"></i>
                </div>
                <span class="rating-count">4.5 (245 评价)</span>
              </div>

              <div class="product-sku">
                <span>商品编号: {{product.productId.substring(0, 8)}}</span>
              </div>
            </div>

            <div class="product-price">
              <div class="price-main">
                <span class="currency">€</span>
                <span class="current-price">{{product.price.toFixed(2)}}</span>
                <span class="original-price">€{{(product.price * 1.2).toFixed(2)}}</span>
                <span class="discount-badge">-20%</span>
              </div>

              <div class="price-promo">
                <i class="fa-solid fa-tag"></i>
                <span>限时优惠，仅剩2天</span>
              </div>
            </div>

            <div class="product-description">
              <h3>商品详情</h3>
              <p>{{product.description}}</p>
            </div>

            <div class="product-stock" [ngClass]="{'low-stock': product.stock < 100}">
              <i class="fa-solid" [ngClass]="product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'"></i>
              <span>
                {{product.stock > 0 ? '有库存' : '无库存'}}
                {{product.stock < 100 && product.stock > 0 ? '(仅剩 ' + product.stock + ' 件)' : ''}}
              </span>
            </div>

            <div class="shipping-info">
              <div class="info-item">
                <i class="fa-solid fa-truck"></i>
                <div>
                  <h4>免费配送</h4>
                  <p>订单满€50即可享受免费配送</p>
                </div>
              </div>

              <div class="info-item">
                <i class="fa-solid fa-rotate-left"></i>
                <div>
                  <h4>七天退换</h4>
                  <p>7天内可无理由退换货</p>
                </div>
              </div>

              <div class="info-item">
                <i class="fa-solid fa-shield-alt"></i>
                <div>
                  <h4>正品保证</h4>
                  <p>所有商品均为官方授权正品</p>
                </div>
              </div>
            </div>

            <div class="quantity-selector">
              <button (click)="decreaseQuantity()" [disabled]="quantity <= 1" aria-label="减少数量">
                <i class="fa-solid fa-minus"></i>
              </button>
              <input type="number" [value]="quantity" min="1" max="99" readonly aria-label="商品数量">
              <button (click)="increaseQuantity()" [disabled]="quantity >= product.stock" aria-label="增加数量">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>

            <div class="product-actions">
              <button class="buy-now-btn" (click)="handleBuyNow()">
                <i class="fa-solid fa-bolt"></i>
                立即购买
              </button>

              <button
                class="add-to-cart-btn"
                [ngClass]="{'in-cart': isInCart}"
                (click)="handleCartAction()">
                <i class="fa-solid" [ngClass]="isInCart ? 'fa-shopping-cart' : 'fa-cart-plus'"></i>
                {{isInCart ? '去购物车' : '加入购物车'}}
              </button>
            </div>
          </div>
        </div>

        <!-- 产品选项卡 -->
        <div class="product-tabs">
          <div class="tabs-header">
            <button
              *ngFor="let tab of tabs"
              [class.active]="activeTab === tab.id"
              (click)="activeTab = tab.id">
              {{tab.label}}
            </button>
          </div>

          <div class="tab-content">
            <!-- 评价选项卡 -->
            <div *ngIf="activeTab === 'reviews'" class="reviews-tab">
              <div class="reviews-summary">
                <div class="overall-rating">
                  <span class="rating-number">4.5</span>
                  <div class="rating-stars">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star-half-alt"></i>
                  </div>
                  <span class="total-reviews">245 条评价</span>
                </div>

                <div class="rating-distribution">
                  <div class="rating-bar">
                    <span>5星</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 70%"></div>
                    </div>
                    <span>70%</span>
                  </div>

                  <div class="rating-bar">
                    <span>4星</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 20%"></div>
                    </div>
                    <span>20%</span>
                  </div>

                  <div class="rating-bar">
                    <span>3星</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 5%"></div>
                    </div>
                    <span>5%</span>
                  </div>

                  <div class="rating-bar">
                    <span>2星</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 3%"></div>
                    </div>
                    <span>3%</span>
                  </div>

                  <div class="rating-bar">
                    <span>1星</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 2%"></div>
                    </div>
                    <span>2%</span>
                  </div>
                </div>
              </div>

              <!-- 评价列表 -->
              <div class="review-list">
                <div class="review-item">
                  <div class="reviewer-info">
                    <div class="avatar">李</div>
                    <div>
                      <div class="reviewer-name">李先生</div>
                      <div class="review-date">2周前</div>
                    </div>
                  </div>

                  <div class="review-rating">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                  </div>

                  <div class="review-content">
                    <h4>非常满意的购物体验</h4>
                    <p>商品质量非常好，比我想象中的还要好。发货速度快，物流给力，包装也很完整。总体非常满意！</p>
                  </div>
                </div>

                <div class="review-item">
                  <div class="reviewer-info">
                    <div class="avatar">张</div>
                    <div>
                      <div class="reviewer-name">张女士</div>
                      <div class="review-date">1个月前</div>
                    </div>
                  </div>

                  <div class="review-rating">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-regular fa-star"></i>
                  </div>

                  <div class="review-content">
                    <h4>还不错但有小问题</h4>
                    <p>商品整体表现还不错，但是有些小瑕疵。希望卖家能在质量控制上再严格一些。客服回复很及时，物流也很快。</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 规格选项卡 -->
            <div *ngIf="activeTab === 'specs'" class="specs-tab">
              <table class="specs-table">
                <tbody>
                <tr>
                  <th>商品ID</th>
                  <td>{{product.productId}}</td>
                </tr>
                <tr>
                  <th>商品名称</th>
                  <td>{{product.name}}</td>
                </tr>
                <tr>
                  <th>价格</th>
                  <td>€{{product.price.toFixed(2)}}</td>
                </tr>
                <tr>
                  <th>库存</th>
                  <td>{{product.stock}} 件</td>
                </tr>
                <tr>
                  <th>分类</th>
                  <td>电子产品</td>
                </tr>
                <tr>
                  <th>重量</th>
                  <td>0.5 kg</td>
                </tr>
                <tr>
                  <th>尺寸</th>
                  <td>20 × 15 × 5 cm</td>
                </tr>
                </tbody>
              </table>
            </div>

            <!-- 常见问题选项卡 -->
            <div *ngIf="activeTab === 'faqs'" class="faqs-tab">
              <div class="faq-item" *ngFor="let faq of faqs; let i = index">
                <div class="faq-question" (click)="toggleFaq(i)">
                  <h4>{{faq.question}}</h4>
                  <i class="fa-solid" [ngClass]="faq.open ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </div>
                <div class="faq-answer" [ngClass]="{'open': faq.open}">
                  <p>{{faq.answer}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片放大模态框 -->
      <div *ngIf="isImageModalOpen" class="image-modal" (click)="closeImageModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-modal" (click)="closeImageModal()">
            <i class="fa-solid fa-times"></i>
          </button>
          <img [src]="getMainImageUrl()" [alt]="product?.name">
        </div>
      </div>
    </div>
  `,
  styleUrl: './product-info.style.css'
})

export class ProductInfoComponent implements OnInit {
  product!: Product;
  isInCart: boolean = false;
  quantity: number = 1;
  productImages: ProductImage[] = [];
  loading: boolean = true;
  selectedImageIndex: number = 0;
  isImageModalOpen: boolean = false;
  activeTab: string = 'reviews';

  tabs = [
    { id: 'reviews', label: '用户评价' },
    { id: 'specs', label: '商品规格' },
    { id: 'faqs', label: '常见问题' }
  ];

  faqs = [
    {
      question: '这个商品的保修期是多长时间？',
      answer: '该商品提供标准12个月厂商保修，覆盖材料和工艺上的缺陷。',
      open: false
    },
    {
      question: '你们支持国际配送吗？',
      answer: '是的，我们支持全球大部分国家的配送。配送费用和交付时间可能因地区而异。',
      open: false
    },
    {
      question: '支持哪些支付方式？',
      answer: '我们接受所有主要信用卡、PayPal和Apple Pay。所有交易都是安全加密的。',
      open: false
    },
    {
      question: '如果不满意可以退货吗？',
      answer: '是的，我们提供30天退货政策。商品必须保持原始状态和包装。',
      open: false
    }
  ];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.loadProductInfo(productId);
    } else {
      console.error('没有找到商品ID');
      this.loading = false;
    }
  }

  getMainImageUrl(): string {
    if (this.productImages && this.productImages.length > 0) {
      return this.getImageUrl(this.productImages[this.selectedImageIndex]);
    }
    return 'https://via.placeholder.com/400x400';
  }

  getImageUrl(image: ProductImage): string {
    return `${environment.apiUrl}/products/${image.imageUrl}`;
  }

  loadProductInfo(productId: string): void {
    // 创建并行请求
    const productRequest = this.productService.getProduct(productId);
    const imagesRequest = this.productService.getProductImages(productId);

    // 获取商品数据
    productRequest.subscribe({
      next: (data) => {
        console.log('商品数据加载成功:', data);
        this.product = data;
        this.checkCartStatus();
      },
      error: (error) => {
        console.error('加载商品失败:', error);
        this.loading = false;
      }
    });

    // 获取商品图片
    imagesRequest.subscribe({
      next: (data) => {
        console.log('商品图片加载成功:', data);
        this.productImages = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('加载商品图片失败:', error);
        this.loading = false;
      }
    });
  }

  checkCartStatus(): void {
    // 这是检查商品是否在购物车中的占位逻辑
    // 您需要实现实际的购物车检查逻辑
    this.isInCart = false;
  }

  openImageModal(): void {
    this.isImageModalOpen = true;
    // 防止模态框打开时页面滚动
    document.body.style.overflow = 'hidden';
  }

  closeImageModal(): void {
    this.isImageModalOpen = false;
    // 恢复页面滚动
    document.body.style.overflow = 'auto';
  }

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }

  handleCartAction(): void {
    if (localStorage.getItem('userId') !== null) {
      if (!this.isInCart) {
        this.cartService.addToCart(this.product.productId, this.quantity)
          .subscribe({
            next: (response) => {
              this.isInCart = true;
              // 可以添加成功提示
            },
            error: (error) => console.error('添加到购物车失败:', error)
          });
      } else {
        this.router.navigate(['/go-to-cart']);
      }
    } else {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      this.router.navigate(['/login']);
    }
  }

  handleBuyNow(): void {
    if (localStorage.getItem('userId') !== null) {
      this.router.navigate(['/createOrder'], {
        queryParams: {
          productId: this.product.productId,
          quantity: this.quantity
        }
      });
    } else {
      localStorage.setItem('redirectAfterLogin', window.location.href);
      this.router.navigate(['/login']);
    }
  }

  increaseQuantity(): void {
    if (this.quantity < 99 && this.quantity < this.product?.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
