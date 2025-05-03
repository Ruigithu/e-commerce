import {Component, OnDestroy, OnInit} from '@angular/core';
import { SigninComponentButton} from '../button/login/signin-button.component';
import {ProductService} from '../../../features/products/product.service';
import {ProductCategory} from '../../../features/products/product-category.model';
import {NgForOf, NgIf} from '@angular/common';
import {Router, RouterLink, RouterModule} from '@angular/router';
import {UserMenuComponent} from './user-menu.component';
import {CartService} from '../../../features/orders/carts/cart.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  template: `
    <div class="header">
      <div class="header-main">
        <div class="logo-container">
          <img [routerLink]="['/home']" [src]="'assets/icons/shopper.png'" alt="BuyBuy" class="logo">
          <h1 class="brand-name" [routerLink]="['/home']">BuyBuy</h1>
        </div>

        <div class="search-bar">
          <i class="fa-solid fa-search search-icon"></i>
          <input type="text" placeholder="Search for products...">
          <button class="search-button">Search</button>
        </div>

        <div class="right-buttons">
          <ng-container *ngIf="isLoggedIn; else notLoggedIn">
            <button class="cart-button" (click)="navigateToCart()">
              <i class="fa-solid fa-cart-shopping"></i>
              <span class="cart-count">{{ cartItemsCount}}</span>
            </button>
            <user-menu></user-menu>
          </ng-container>
          <ng-template #notLoggedIn>
            <signin-button></signin-button>
          </ng-template>
        </div>
      </div>

      <nav class="categories-nav">
        <div class="category-item" [routerLink]="['/home']">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </div>
        <div *ngFor="let category of productCategories"
             (click)="navigateToSpecificCategory(category)"
             class="category-item">
          <span>{{category}}</span>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      background-color: #ffffff;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
    }

    .logo-container {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .logo {
      height: 40px;
      width: 40px;
      margin-right: 0.5rem;
    }

    .brand-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #578E7E;
      margin: 0;
    }

    .search-bar {
      display: flex;
      align-items: center;
      width: 40%;
      position: relative;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .search-bar:focus-within {
      box-shadow: 0 0 0 2px rgba(87, 142, 126, 0.3);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: #999;
    }

    input {
      width: 100%;
      height: 44px;
      padding: 0 1rem 0 2.5rem;
      border: none;
      outline: none;
      font-size: 0.9rem;
    }

    .search-button {
      background-color: #578E7E;
      color: white;
      border: none;
      padding: 0 1.5rem;
      height: 44px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .search-button:hover {
      background-color: #477a6c;
    }

    .right-buttons {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .cart-button {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      color: #333;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background-color 0.2s;
    }

    .cart-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .cart-count {
      position: absolute;
      top: 0;
      right: 0;
      background-color: #ff5252;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .categories-nav {
      display: flex;
      gap: 1.5rem;
      background-color: #f9f9f9;
      padding: 0.75rem 2rem;
      overflow-x: auto;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .category-item:hover {
      background-color: rgba(87, 142, 126, 0.1);
      color: #578E7E;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .header-main {
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
      }

      .search-bar {
        width: 100%;
        order: 3;
      }

      .categories-nav {
        padding: 0.5rem 1rem;
      }
    }
  `],
  imports: [
    SigninComponentButton,
    NgForOf,
    NgIf,
    UserMenuComponent,
    RouterModule,
    RouterLink
  ],
  standalone: true
})
export class Header implements OnInit, OnDestroy {
  productCategories: ProductCategory[] = [];
  isLoggedIn = false;
  cartItemsCount = 0;
  private cartSubscription: Subscription | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProductCategory();
    this.checkLoginStatus();

    if (this.isLoggedIn) {
      this.loadCartItemsCount();

      // Set up listener for storage events to detect changes from other tabs/components
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }

    // Remove event listener
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
  }

  checkLoginStatus() {
    const userId = localStorage.getItem('userId');
    this.isLoggedIn = !!userId;
  }

  loadCartItemsCount(): void {
    // First try to get from localStorage
    const storedCount = localStorage.getItem('cartItemsCount');
    if (storedCount) {
      this.cartItemsCount = parseInt(storedCount, 10);
    }

    // Then refresh from server
    this.refreshCartItemsCount();
  }

  refreshCartItemsCount(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }

    this.cartSubscription = this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItemsCount = items.length;
        // Save to localStorage for persistence
        localStorage.setItem('cartItemsCount', this.cartItemsCount.toString());
      },
      error: (error) => {
        console.error('Failed to load cart items:', error);
      }
    });
  }

  handleStorageChange(event: StorageEvent): void {
    // Only react to cart count changes
    if (event.key === 'cartItemsCount' && event.newValue) {
      this.cartItemsCount = parseInt(event.newValue, 10);
    }
  }

  loadProductCategory(): void {
    this.productService.getProductCategory().subscribe(
      (data) => {
        console.log('Categories loaded:', data);
        this.productCategories = data;
      },
      (error) => console.error('Failed to load categories:', error)
    );
  }

  navigateToSpecificCategory(displayName: string) {
    this.router.navigate([`/product-list/${displayName}`]);
  }

  navigateToCart() {
    this.router.navigate(['/go-to-cart']);
  }
}
