import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../products/product.model';
import { CommonModule } from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment.prod';
import {Merchant} from './merchant.modal';

@Component({
  selector: 'app-merchant-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  template: `
    <!-- Non-merchant view -->
    <div *ngIf="!isMerchant" class="register-container">
      <div class="register-content">
        <div class="register-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h1 class="register-title">Welcome to Merchant Center</h1>
        <p class="register-description">You haven't registered as a merchant yet. Register now to start selling your products!</p>
        <button class="register-button" (click)="navigateToRegistration()">Register Your Shop</button></div>
    </div>

    <!-- Merchant dashboard view -->
    <div *ngIf="isMerchant" class="dashboard-container">
      <!-- Top header with stats -->
      <div class="dashboard-header">
        <div class="header-welcome">
          <h1>Welcome back, <span class="store-name">{{ storeName }}</span></h1>
          <p class="subtitle">Here's your store performance at a glance</p>
        </div>
        <div class="date-filter">
          <!-- Date picker placeholder -->
          <button class="date-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Last 7 days
          </button>
        </div>
      </div>

      <!-- Stats cards section -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon sales-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Today's Sales</p>
              <h2 class="stat-value">€{{ todaySales.toFixed(2) }}</h2>
              <p class="stat-change" [class.positive]="salesChange > 0" [class.negative]="salesChange < 0">
                <span *ngIf="salesChange > 0">↑</span>
                <span *ngIf="salesChange < 0">↓</span>
                <span *ngIf="salesChange === 0">=</span>
                {{ Math.abs(salesChange) }}% from yesterday
              </p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon orders-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">New Orders</p>
              <h2 class="stat-value">{{ pendingOrders }}</h2>
              <p class="stat-desc">Pending fulfillment</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon inventory-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/>
                <path d="M9 22V12h6v10M2 10l10-7 10 7"/>
              </svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Inventory Alerts</p>
              <h2 class="stat-value">{{ lowStockProducts.length }}</h2>
              <p class="stat-desc">Items running low</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main dashboard content -->
      <div class="dashboard-content">
        <div class="content-section orders-section">
          <div class="section-header">
            <h2>Recent Orders</h2>
            <a [routerLink]="['/merchant/orders']" class="view-all">View All</a>
          </div>
          <div class="section-content">
            <div *ngIf="isOrdersLoading" class="loading-placeholder">
              <div class="loading-spinner"></div>
              <p>Loading recent orders...</p>
            </div>
            <div *ngIf="!isOrdersLoading" class="orders-table">
              <!-- Order table content would go here -->
              <p class="placeholder-text">Order table will appear here</p>
            </div>
          </div>
        </div>

        <div class="content-section inventory-section">
          <div class="section-header">
            <h2>Inventory Alerts</h2>
            <a [routerLink]="['/merchant/inventory']" class="view-all">Manage Inventory</a>
          </div>
          <div class="section-content">
            <div *ngIf="isInventoryLoading" class="loading-placeholder">
              <div class="loading-spinner"></div>
              <p>Loading inventory data...</p>
            </div>
            <div *ngIf="!isInventoryLoading" class="inventory-alerts">
              <!-- Inventory alerts content would go here -->
              <p *ngIf="lowStockProducts.length === 0" class="empty-state">All products have sufficient stock levels.</p>
              <ul *ngIf="lowStockProducts.length > 0" class="alert-list">
                <li *ngFor="let product of lowStockProducts" class="alert-item">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="stock-level">{{ product.stock }} remaining</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales chart section -->
      <div class="content-section chart-section"  (click)="navigateToProductsManagement()">
        <div class="section-header">
          <h2>Products Management</h2>
          <div class="chart-controls">
            <button class="chart-period active">Daily</button>
            <button class="chart-period">Weekly</button>
            <button class="chart-period">Monthly</button>
          </div>
        </div>
        <div class="section-content">
          <div *ngIf="isChartLoading" class="loading-placeholder">
            <div class="loading-spinner"></div>
            <p>Loading products data...</p>
          </div>
          <div *ngIf="!isChartLoading" class="sales-chart">
            <!-- Sales chart would go here -->
            <p class="placeholder-text">All the products will appear here</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* General Styles */
    :host {
      display: block;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
    }
    .store-name {
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0,0,0,0.05);
      background: linear-gradient(90deg, #7a9e9f, #8ca9a6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      position: relative;
      display: inline-block;
      padding: 0 8px;
    }

    /* Non-merchant registration styles */
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background-color: #f9fafb;
      padding: 2rem;
    }

    .register-content {
      max-width: 500px;
      text-align: center;
      background: white;
      border-radius: 12px;
      padding: 3rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .register-icon {
      display: inline-flex;
      background-color: #f0f9ff;
      color: #0284c7;
      padding: 1rem;
      border-radius: 50%;
      margin-bottom: 1.5rem;
    }

    .register-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #0f172a;
    }

    .register-description {
      color: #64748b;
      margin-bottom: 2rem;
      line-height: 1.5;
    }

    .register-button {
      background-color: #0284c7;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .register-button:hover {
      background-color: #0369a1;
    }

    /* Dashboard styles */
    .dashboard-container {
      padding: 1.5rem;
      background-color: #f9fafb;
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header-welcome h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      color: #0f172a;
    }

    .subtitle {
      color: #64748b;
      margin-top: 0.25rem;
    }

    .date-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      cursor: pointer;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .stat-card-content {
      display: flex;
      padding: 1.5rem;
    }

    .stat-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      margin-right: 1rem;
    }

    .sales-icon {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .orders-icon {
      background-color: #f0f9ff;
      color: #0284c7;
    }

    .inventory-icon {
      background-color: #fef2f2;
      color: #dc2626;
    }

    .stat-info {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0 0 0.25rem 0;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
    }

    .stat-change {
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .positive {
      color: #16a34a;
    }

    .negative {
      color: #dc2626;
    }

    .stat-desc {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    /* Content Sections */
    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .content-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .section-header h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
      color: #0f172a;
    }

    .view-all {
      font-size: 0.875rem;
      color: #0284c7;
      text-decoration: none;
    }

    .section-content {
      padding: 1.5rem;
    }

    /* Chart section */
    .chart-section {
      grid-column: 1 / -1;
    }

    .chart-controls {
      display: flex;
      gap: 0.5rem;
    }

    .chart-period {
      background: none;
      border: none;
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      border-radius: 4px;
      cursor: pointer;
      color: #64748b;
    }

    .chart-period.active {
      background-color: #f0f9ff;
      color: #0284c7;
      font-weight: 500;
    }

    /* Loading States */
    .loading-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: #64748b;
    }

    .loading-spinner {
      border: 3px solid #f1f5f9;
      border-top: 3px solid #0284c7;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Placeholder/Empty states */
    .placeholder-text {
      text-align: center;
      color: #94a3b8;
      font-style: italic;
    }

    .empty-state {
      text-align: center;
      color: #64748b;
      padding: 2rem 0;
    }

    .alert-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .alert-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .alert-item:last-child {
      border-bottom: none;
    }

    .stock-level {
      font-weight: 500;
      color: #dc2626;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .date-filter {
        align-self: flex-end;
      }
    }
  `]
})
export class MerchantDashboardComponent implements OnInit {
  private apiBaseUrl = environment.apiUrl;

  isMerchant=false;
  storeName = '';
  todaySales = 0;
  salesChange = 0;
  pendingOrders = 0;

  lowStockProducts: Product[] = [];
  salesData: any[] = [];

  isOrdersLoading = true;
  isInventoryLoading = true;
  isChartLoading = true;

  userId = localStorage.getItem('userId');

  constructor(
    private router: Router,
    // Uncomment and add other services as needed:
    // private merchantService: MerchantService,
    // private orderService: OrderService,
    // private productService: ProductService
    private http:HttpClient
  ) {}

  ngOnInit() {
    this.checkMerchantStatus();
  }

  checkMerchantStatus() {
    // This would typically be an API call to get user information
    // For now, we'll simulate it with a mock implementation
      const is_Merchant = localStorage.getItem('isMerchant');
      if (is_Merchant=='true'){
        this.isMerchant=true;
      }
      if (this.isMerchant) {
        // Only load merchant data if the user is a merchant
        this.loadMerchantInfo();
        this.loadRecentOrders();
        this.loadInventoryAlerts();
        this.loadSalesData({ start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() });
      }

  }

  navigateToRegistration() {
    this.router.navigate(['/merchant/register']);
  }

  loadMerchantInfo() {
    this.http.get<Merchant>(`${this.apiBaseUrl}/users/getMerchantInformation/${this.userId}`).subscribe(
      {
        next: (data: Merchant) => {
          console.log(data);
          localStorage.setItem('merchantId',data.merchantId);
          this.storeName = data.storeName;
          //get todaySales
          this.todaySales=0;
          this.salesChange=0;
        }
      })
  }

  loadRecentOrders() {
    // Mock implementation
    setTimeout(() => {
      this.pendingOrders = 7;
      this.isOrdersLoading = false;
    }, 1000);
  }

  loadInventoryAlerts() {
    // Mock implementation
    setTimeout(() => {

      this.isInventoryLoading = false;
    }, 1200);
  }

  loadSalesData(range: { start: Date; end: Date }) {
    // Mock implementation
    setTimeout(() => {
      this.salesData = [
        { date: '2023-01-01', sales: 1200 },
        { date: '2023-01-02', sales: 1500 },
        { date: '2023-01-03', sales: 1300 }
      ];
      this.isChartLoading = false;
    }, 1500);
  }

  navigateToProductsManagement(){
    this.router.navigate(['/merchant/products'])
  }

  onDateRangeChanged(range: { start: Date, end: Date }) {
    // Reload data with the new date range
    this.loadSalesData(range);
  }

  protected readonly Math = Math;
}


