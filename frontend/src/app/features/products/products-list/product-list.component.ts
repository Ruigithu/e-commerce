import { Component, OnInit } from '@angular/core';
import { Product } from '../product.model';
import { CommonModule } from '@angular/common';
import { ProductService } from '../product.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  template: `
    <div class="container">
      <div class="product-header">
        <h2>Featured Products</h2>
        <div class="product-filters">
          <button class="filter-button active">All</button>
          <button class="filter-button">New Arrivals</button>
          <button class="filter-button">Best Sellers</button>
          <button class="filter-button">On Sale</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading products...</p>
      </div>

      <div *ngIf="!loading" class="product-grid">
        <div *ngFor="let product of products" class="product-card" [routerLink]="['/product', product.productId]">
          <div class="product-image">
            <img src="https://via.placeholder.com/200x200" alt="{{ product.name }}">
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
        <p>No products found</p>
        <button class="refresh-button" (click)="loadProducts()">Refresh</button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .product-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-button {
      background: none;
      border: 1px solid #e0e0e0;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-button:hover {
      background-color: #f5f5f5;
    }

    .filter-button.active {
      background-color: #578E7E;
      color: white;
      border-color: #578E7E;
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

      .product-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .product-filters {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 0.5rem;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe(
      (data) => {
        console.log('Products loaded:', data);
        this.products = data;
        this.loading = false;
      },
      (error) => {
        console.error('Failed to load products:', error);
        this.loading = false;
      }
    );
  }

  truncateDescription(description: string): string {
    return description.length > 60 ? description.substring(0, 60) + '...' : description;
  }

  hasDiscount(product: Product): boolean {
    // This is a placeholder. In a real application, you might have a discount field
    return product.price > 50; // Just for demonstration
  }
}
