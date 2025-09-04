import {Component, OnInit} from '@angular/core';
import {Product} from '../product.model';
import {ProductService} from '../product.service';
import {NgIf, NgOptimizedImage, NgClass, NgFor} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Header} from '../../../common/components/header/header.component';
import {CartService} from '../../orders/carts/cart.service';
import {ProductImage} from '../product-image.model';
import {environment} from '../../../../environments/environment.prod';

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

      <!-- Loading state -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading product information...</p>
      </div>

      <!-- Product details -->
      <div *ngIf="!loading && product" class="product-container">
        <!-- Breadcrumb navigation -->
        <div class="breadcrumb">
          <a [routerLink]="['/home']">Home</a>
          <i class="fa-solid fa-chevron-right"></i>
          <a [routerLink]="['/products']">Products</a>
          <i class="fa-solid fa-chevron-right"></i>
          <span>{{product.name}}</span>
        </div>

        <div class="product-details">
          <!-- Product images area -->
          <div class="product-images">
            <div class="main-image">
              <img
                [src]="productService.isExternalUrl(getMainImageUrl()) ? getMainImageUrl() : (imageBaseUrl + getMainImageUrl())"
                [alt]="product.name"
                (click)="openImageModal()"
                (error)="handleImageError($event)"
              >
              <div class="image-overlay">
                <i class="fa-solid fa-magnifying-glass"></i>
                <span>Click to zoom</span>
              </div>
            </div>

            <div class="thumbnails" *ngIf="productImages && productImages.length > 1">
              <div
                *ngFor="let image of productImages; let i = index"
                class="thumbnail"
                [class.active]="selectedImageIndex === i"
                (click)="selectedImageIndex = i">
                <img
                  [src]="productService.isExternalUrl(getImageUrl(image)) ? getImageUrl(image) : (imageBaseUrl + getImageUrl(image))"
                  [alt]="'Thumbnail ' + (i + 1)"
                  (error)="handleImageError($event)"
                >
              </div>
            </div>
          </div>

          <!-- Product information area -->
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
                <span class="rating-count">4.5 (245 reviews)</span>
              </div>

              <div class="product-sku">
                <span>Product ID: {{product.productId.substring(0, 8)}}</span>
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
                <span>Limited time offer, only 2 days left</span>
              </div>
            </div>

            <div class="product-description">
              <h3>Product Details</h3>
              <p>{{product.description}}</p>
            </div>

            <div class="product-stock" [ngClass]="{'low-stock': product.stock < 100}">
              <i class="fa-solid" [ngClass]="product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'"></i>
              <span>
                {{product.stock > 0 ? 'In Stock' : 'Out of Stock'}}
                {{product.stock < 100 && product.stock > 0 ? '(Only ' + product.stock + ' left)' : ''}}
              </span>
            </div>

            <div class="shipping-info">
              <div class="info-item">
                <i class="fa-solid fa-truck"></i>
                <div>
                  <h4>Free Shipping</h4>
                  <p>On orders over €50</p>
                </div>
              </div>

              <div class="info-item">
                <i class="fa-solid fa-rotate-left"></i>
                <div>
                  <h4>7-Day Returns</h4>
                  <p>No-questions-asked return policy</p>
                </div>
              </div>

              <div class="info-item">
                <i class="fa-solid fa-shield-alt"></i>
                <div>
                  <h4>Authentic Products</h4>
                  <p>All items are officially authorized</p>
                </div>
              </div>
            </div>

            <div class="quantity-selector">
              <button (click)="decreaseQuantity()" [disabled]="quantity <= 1" aria-label="Decrease quantity">
                <i class="fa-solid fa-minus"></i>
              </button>
              <input type="number" [value]="quantity" min="1" max="99" readonly aria-label="Product quantity">
              <button (click)="increaseQuantity()" [disabled]="quantity >= product.stock" aria-label="Increase quantity">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>

            <div class="product-actions">
              <button class="buy-now-btn" (click)="handleBuyNow()">
                <i class="fa-solid fa-bolt"></i>
                Buy Now
              </button>

              <button
                class="add-to-cart-btn"
                [ngClass]="{'in-cart': isInCart}"
                (click)="handleCartAction()">
                <i class="fa-solid" [ngClass]="isInCart ? 'fa-shopping-cart' : 'fa-cart-plus'"></i>
                {{isInCart ? 'Go to Cart' : 'Add to Cart'}}
              </button>
            </div>
          </div>
        </div>

        <!-- Product tabs -->
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
            <!-- Reviews tab -->
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
                  <span class="total-reviews">245 reviews</span>
                </div>

                <div class="rating-distribution">
                  <div class="rating-bar">
                    <span>5 stars</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 70%"></div>
                    </div>
                    <span>70%</span>
                  </div>

                  <div class="rating-bar">
                    <span>4 stars</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 20%"></div>
                    </div>
                    <span>20%</span>
                  </div>

                  <div class="rating-bar">
                    <span>3 stars</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 5%"></div>
                    </div>
                    <span>5%</span>
                  </div>

                  <div class="rating-bar">
                    <span>2 stars</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 3%"></div>
                    </div>
                    <span>3%</span>
                  </div>

                  <div class="rating-bar">
                    <span>1 star</span>
                    <div class="bar-container">
                      <div class="bar" style="width: 2%"></div>
                    </div>
                    <span>2%</span>
                  </div>
                </div>
              </div>

              <!-- Reviews list -->
              <div class="review-list">
                <div class="review-item">
                  <div class="reviewer-info">
                    <div class="avatar">J</div>
                    <div>
                      <div class="reviewer-name">John Smith</div>
                      <div class="review-date">2 weeks ago</div>
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
                    <h4>Excellent shopping experience</h4>
                    <p>The product quality is excellent, even better than I expected. Fast shipping, excellent logistics, and perfect packaging. Overall very satisfied!</p>
                  </div>
                </div>

                <div class="review-item">
                  <div class="reviewer-info">
                    <div class="avatar">M</div>
                    <div>
                      <div class="reviewer-name">Maria Johnson</div>
                      <div class="review-date">1 month ago</div>
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
                    <h4>Good but with minor issues</h4>
                    <p>The product overall is good, but there are some minor flaws. I hope the seller can be more strict on quality control. Customer service response was timely, and shipping was fast.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Specifications tab -->
            <div *ngIf="activeTab === 'specs'" class="specs-tab">
              <table class="specs-table">
                <tbody>
                <tr>
                  <th>Product ID</th>
                  <td>{{product.productId}}</td>
                </tr>
                <tr>
                  <th>Product Name</th>
                  <td>{{product.name}}</td>
                </tr>
                <tr>
                  <th>Price</th>
                  <td>€{{product.price.toFixed(2)}}</td>
                </tr>
                <tr>
                  <th>Stock</th>
                  <td>{{product.stock}} units</td>
                </tr>
                <tr>
                  <th>Category</th>
                  <td>Electronics</td>
                </tr>
                <tr>
                  <th>Weight</th>
                  <td>0.5 kg</td>
                </tr>
                <tr>
                  <th>Dimensions</th>
                  <td>20 × 15 × 5 cm</td>
                </tr>
                </tbody>
              </table>
            </div>

            <!-- FAQs tab -->
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

      <!-- Image zoom modal -->
      <div *ngIf="isImageModalOpen" class="image-modal" (click)="closeImageModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-modal" (click)="closeImageModal()">
            <i class="fa-solid fa-times"></i>
          </button>
          <img
            [src]="productService.isExternalUrl(getMainImageUrl()) ? getMainImageUrl() : (imageBaseUrl + getMainImageUrl())"
            [alt]="product?.name"
            (error)="handleImageError($event)"
          >
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
  imageBaseUrl: string = environment.apiUrl; // Use gateway address

  tabs = [
    { id: 'reviews', label: 'Reviews' },
    { id: 'specs', label: 'Specifications' },
    { id: 'faqs', label: 'FAQs' }
  ];

  faqs = [
    {
      question: 'How long is the warranty period for this product?',
      answer: 'This product comes with a standard 12-month manufacturer warranty covering defects in materials and workmanship.',
      open: false
    },
    {
      question: 'Do you support international shipping?',
      answer: 'Yes, we support shipping to most countries worldwide. Shipping fees and delivery times may vary by region.',
      open: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and Apple Pay. All transactions are securely encrypted.',
      open: false
    },
    {
      question: 'Can I return the product if I\'m not satisfied?',
      answer: 'Yes, we offer a 30-day return policy. Items must be in their original condition and packaging.',
      open: false
    }
  ];

  constructor(
    public productService: ProductService, // Changed to public for template access
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
      console.error('Product ID not found');
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
    if (this.productService.isExternalUrl(image.imageUrl)) {
      return image.imageUrl;
    }
    return `/images/products/${image.imageUrl}`;
  }

  // Handle image loading errors
  handleImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x400';
  }

  loadProductInfo(productId: string): void {
    // Create parallel requests
    const productRequest = this.productService.getProduct(productId);
    const imagesRequest = this.productService.getProductImages(productId);

    // Get product data
    productRequest.subscribe({
      next: (data) => {
        console.log('Product data loaded successfully:', data);
        this.product = data;
        this.checkCartStatus();
      },
      error: (error) => {
        console.error('Failed to load product:', error);
        this.loading = false;
      }
    });

    // Get product images
    imagesRequest.subscribe({
      next: (data) => {
        console.log('Product images loaded successfully:', data);
        this.productImages = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load product images:', error);
        this.loading = false;
      }
    });
  }

  checkCartStatus(): void {
    // This is a placeholder logic for checking if the product is in the cart
    // You need to implement the actual cart check logic
    this.isInCart = false;
  }

  openImageModal(): void {
    this.isImageModalOpen = true;
    // Prevent page scrolling when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeImageModal(): void {
    this.isImageModalOpen = false;
    // Restore page scrolling
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
              // Can add success notification here
            },
            error: (error) => console.error('Failed to add to cart:', error)
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
