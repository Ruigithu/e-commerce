import {Component, OnInit} from '@angular/core';
import {Order, OrderService, OrderStatus} from './my-orders.service';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {CartService} from '../carts/cart.service';
import {firstValueFrom, Observable, of, tap} from 'rxjs';
import {Header} from '../../../common/components/header/header.component';
import {ProductService} from '../../products/product.service';
import {Product} from '../../products/product.model';
import {FormsModule} from '@angular/forms';
import {Address} from '../../users/addresss/address.model';
import {AddressService} from '../../users/addresss/address.service';

@Component({
  selector: 'app-order-list',
  imports: [
    CommonModule,
    RouterModule,
    Header,
    FormsModule,
  ],
  template: `
    <div class="orders-management-container">
      <app-header></app-header>
      <br/>

      <div class="page-header">
        <div>
          <h1 class="page-title">My Orders</h1>
          <p class="subtitle">View and manage all your orders</p>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              class="search-input"
              placeholder="Search orders..."
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
            >
          </div>
        </div>

        <div class="filter-controls">
          <select class="filter-dropdown" [(ngModel)]="selectedStatus" (change)="applyFilters()">
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUND_REQUESTED">Refund Requested</option>
            <option value="REFUND">Refunded</option>
          </select>

          <select class="filter-dropdown" [(ngModel)]="sortOption" (change)="applyFilters()">
            <option value="date_desc">Date (Newest First)</option>
            <option value="date_asc">Date (Oldest First)</option>
            <option value="amount_desc">Amount (High-Low)</option>
            <option value="amount_asc">Amount (Low-High)</option>
          </select>
        </div>
      </div>

      <!-- Orders Section -->
      <div class="orders-section">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="error-message">
          <i class="fa-solid fa-circle-exclamation"></i>
          <div class="error-content">
            <p>{{ errorMessage }}</p>
            <button (click)="loadOrders()" class="retry-button">
              <i class="fa-solid fa-refresh"></i>
              Retry
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && !errorMessage && filteredOrders.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <h3>No orders found</h3>
          <p>Try adjusting your search or filters, or place a new order.</p>
          <button routerLink="/products" class="primary-button">Shop Now</button>
        </div>

        <!-- Orders Table -->
        <div *ngIf="!isLoading && filteredOrders.length > 0" class="table-container">
          <table class="orders-table">
            <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngFor="let order of paginatedOrders">
              <td class="order-id">{{ order.orderId.substring(0, 8) }}</td>
              <td>{{ formatDate(order.createAt) }}</td>
              <td>
                <span class="item-count">{{ getItemCount(order) }} item(s)</span>
              </td>
              <td class="order-total">€{{ order.totalAmount.toFixed(2) }}</td>
              <td>
              <span class="status-badge" [ngClass]="getStatusClass(order.status)">
                <i [class]="getStatusIcon(order.status)"></i>
                {{ getStatusText(order.status) }}
              </span>
              </td>
              <td class="actions-cell">
                <button class="action-button view-button" (click)="viewOrderDetails(order)" title="View Order Details">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button
                  *ngIf="order.status === 'PENDING'"
                  class="action-button process-button"
                  (click)="handlePay(order.orderId)"
                  title="Pay Now">
                  <i class="fa-solid fa-credit-card"></i>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div *ngIf="!isLoading && filteredOrders.length > 0" class="pagination-container">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to
          {{ Math.min(currentPage * pageSize, filteredOrders.length) }} of
          {{ filteredOrders.length }} orders
        </div>
        <div class="pagination-controls">
          <button
            class="pagination-button"
            [disabled]="currentPage === 1"
            (click)="changePage(currentPage - 1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="page-numbers">
            <button
              *ngFor="let page of getPageNumbers()"
              class="page-number"
              [class.active]="page === currentPage"
              (click)="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="pagination-button"
            [disabled]="currentPage === Math.ceil(filteredOrders.length / pageSize)"
            (click)="changePage(currentPage + 1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Order Details Modal -->
      <div *ngIf="showOrderDetailsModal && selectedOrder" class="modal-overlay" (click)="closeOrderDetailsModal($event)">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Order Details</h2>
            <button class="close-button" (click)="closeOrderDetailsModal($event)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="order-info-section">
              <div class="order-header-details">
                <div>
                  <span class="label">Order ID:</span>
                  <span class="value order-id">{{ selectedOrder.orderId }}</span>
                </div>
                <div>
                  <span class="label">Date:</span>
                  <span class="value">{{ formatDate(selectedOrder.createAt) }}</span>
                </div>
                <div>
                  <span class="label">Status:</span>
                  <span class="value">
                <span class="status-badge" [ngClass]="getStatusClass(selectedOrder.status)">
                  <i [class]="getStatusIcon(selectedOrder.status)"></i>
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </span>
                </div>
              </div>

              <div class="details-columns">
                <div class="shipping-details">
                  <h3>Shipping Address</h3>

                  <div *ngIf="getAddressInformation(selectedOrder.shippingAddressId) | async as address" class="address-details">
                    <div class="detail-row">
                      <span class="label">Recipient:</span>
                      <span class="value">{{address.receiverName}}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Address:</span>
                      <span class="value">{{ address.addressLine }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">City:</span>
                      <span class="value">{{ address.city }}, {{ address.postalCode }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Phone:</span>
                      <span class="value">{{ address.phone }}</span>
                    </div>
                  </div>
                </div>

                <div *ngIf="selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'COMPLETED'" class="tracking-info">
                  <h3>Tracking Information</h3>
                  <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value">{{ getStatusText(selectedOrder.status) }}</span>
                  </div>
                  <!-- Add tracking details if available -->
                </div>
              </div>
            </div>

            <div class="order-items-section">
              <h3>Order Items</h3>
              <table class="items-table">
                <thead>
                <tr>
                  <th class="item-image-col"></th>
                  <th>Item</th>
                  <th class="item-price-col">Price</th>
                  <th class="item-quantity-col">Quantity</th>
                  <th class="item-total-col">Total</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let item of selectedOrder.items">
                  <td class="item-image-col">
                    <div class="item-image-container">
                      <div class="image-placeholder" *ngIf="!getProductImage(item.productId)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                      <img *ngIf="getProductImage(item.productId)" [src]="getProductImage(item.productId)" alt="Product image">
                    </div>
                  </td>
                  <td class="item-details-cell">
                    <ng-container *ngIf="getProductInfo(item.productId) as product">
                      <div class="item-name" [routerLink]="['/product', product.productId]">  {{ product.name }}  </div>
                    </ng-container>

                  </td>
                  <td class="item-price-col">€{{ item.unitPrice.toFixed(2) }}</td>
                  <td class="item-quantity-col">{{ item.quantity }}</td>
                  <td class="item-total-col">€{{ (item.unitPrice * item.quantity).toFixed(2) }}</td>
                </tr>
                </tbody>
              </table>

              <div class="order-totals">
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>€{{ calculateSubtotal(selectedOrder).toFixed(2) }}</span>
                </div>
                <div class="total-row">
                  <span>Tax (20%)</span>
                  <span>€{{ calculateTax(selectedOrder).toFixed(2) }}</span>
                </div>
                <div class="total-row grand-total">
                  <span>Total</span>
                  <span>€{{ selectedOrder.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="secondary-button" (click)="closeOrderDetailsModal($event)">Close</button>
              <button *ngIf="selectedOrder.status === 'PENDING'" class="primary-button" (click)="handlePay(selectedOrder.orderId)">
                <i class="fa-solid fa-credit-card"></i>
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  providers: [ProductService],
  styles: [`
    /* Container Styles */
    .orders-management-container {
      padding: 1.5rem;
      background-color: #f9fafb;
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      color: #0f172a;
    }

    .subtitle {
      color: #64748b;
      margin-top: 0.25rem;
      margin-bottom: 0;
    }

    /* Filters Section */
    .filters-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
    }

    .search-container {
      flex: 1;
      min-width: 250px;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input-wrapper svg {
      position: absolute;
      left: 0.75rem;
      color: #94a3b8;
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #0f172a;
    }

    .filter-controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .filter-dropdown {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background-color: white;
      font-size: 0.875rem;
      color: #0f172a;
      min-width: 150px;
    }

    /* Orders Table */
    .orders-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #64748b;
    }

    .loading-spinner {
      border: 3px solid #f1f5f9;
      border-top: 3px solid #0284c7;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .table-container {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table th {
      background-color: #f8fafc;
      text-align: left;
      padding: 0.75rem 1rem;
      font-weight: 600;
      color: #475569;
      font-size: 0.875rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .orders-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
    }

    .order-id {
      font-family: monospace;
      font-weight: 500;
    }

    .item-count {
      display: inline-block;
      background-color: #f1f5f9;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #475569;
    }

    .order-total {
      font-weight: 500;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.status-PENDING {
      background-color: #fef3c7;
      color: #d97706;
    }

    .status-badge.status-PAID {
      background-color: #dbeafe;
      color: #3b82f6;
    }

    .status-badge.status-PROCESSING {
      background-color: #e0f2fe;
      color: #0ea5e9;
    }

    .status-badge.status-SHIPPED {
      background-color: #f3e8ff;
      color: #a855f7;
    }

    .status-badge.status-DELIVERED {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .status-badge.status-COMPLETED {
      background-color: #d1fae5;
      color: #059669;
    }

    .status-badge.status-CANCELLED {
      background-color: #f1f5f9;
      color: #64748b;
    }

    .status-badge.status-REFUND_REQUESTED {
      background-color: #fee2e2;
      color: #ef4444;
    }

    .status-badge.status-REFUND {
      background-color: #fecaca;
      color: #dc2626;
    }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }

    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .view-button {
      background-color: #f1f5f9;
      color: #64748b;
    }

    .view-button:hover {
      background-color: #e2e8f0;
      color: #475569;
    }

    .process-button {
      background-color: #dbeafe;
      color: #3b82f6;
    }

    .process-button:hover {
      background-color: #bfdbfe;
      color: #2563eb;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #64748b;
    }

    .empty-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #0f172a;
      font-weight: 600;
    }

    .empty-state p {
      margin-bottom: 1.5rem;
    }

    /* Error Message */
    .error-message {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background-color: rgba(255, 82, 82, 0.1);
      color: #ff5252;
      border-radius: 8px;
      margin: 1rem;
    }

    .error-message i {
      font-size: 1.5rem;
    }

    .error-content {
      flex: 1;
    }

    .error-content p {
      margin: 0 0 0.5rem 0;
    }

    .retry-button {
      background: none;
      border: 1px solid #ff5252;
      color: #ff5252;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .retry-button:hover {
      background-color: rgba(255, 82, 82, 0.1);
    }

    /* Pagination */
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      font-size: 0.875rem;
    }

    .pagination-info {
      color: #64748b;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pagination-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background-color: white;
      color: #64748b;
      cursor: pointer;
    }

    .pagination-button:hover:not(:disabled) {
      background-color: #f1f5f9;
    }

    .pagination-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }

    .page-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background-color: white;
      color: #64748b;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .page-number:hover {
      background-color: #f1f5f9;
    }

    .page-number.active {
      background-color: #0284c7;
      color: white;
      border-color: #0284c7;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: #0f172a;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      color: #64748b;
    }

    .close-button:hover {
      color: #0f172a;
    }

    .modal-body {
      padding: 1.5rem;
    }

    /* Order Details Modal Styles */
    .order-info-section {
      margin-bottom: 2rem;
    }

    .order-header-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .details-columns {
      display: grid;
      grid-template-columns: 1fr ;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .customer-details, .shipping-details, .tracking-info {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 1rem;
    }

    .customer-details h3, .shipping-details h3, .tracking-info h3, .order-items-section h3, .order-notes h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      color: #0f172a;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .detail-row .label {
      color: #64748b;
      font-size: 0.875rem;
    }

    .detail-row .value {
      font-weight: 500;
      color: #0f172a;
      font-size: 0.875rem;
      text-align: right;
    }

    .tracking-info {
      margin-bottom: 1.5rem;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }

    .items-table th {
      background-color: #f8fafc;
      text-align: left;
      padding: 0.75rem;
      font-weight: 600;
      color: #475569;
      font-size: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .items-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
    }

    .item-image-col {
      width: 72px;
    }

    .item-image-container {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      overflow: hidden;
      background-color: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #94a3b8;
    }

    .item-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details-cell {
      min-width: 200px;
    }

    .item-name {
      font-weight: 500;
      color: #0f172a;
    }
    .item-name:hover{
      color:#059669;
      cursor: pointer;
    }

    .item-price-col, .item-quantity-col, .item-total-col {
      width: 100px;
    }

    .order-totals {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 1rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .total-row.grand-total {
      font-weight: 600;
      font-size: 1.125rem;
      padding-top: 0.75rem;
      margin-top: 0.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .order-notes {
      margin-bottom: 1.5rem;
    }

    .order-notes p {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 1rem;
      margin: 0;
      color: #475569;
      font-size: 0.875rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    /* Button Styles */
    .primary-button {
      background-color: #0284c7;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .primary-button:hover {
      background-color: #0369a1;
    }

    .primary-button:disabled {
      background-color: #94a3b8;
      cursor: not-allowed;
    }

    .secondary-button {
      background-color: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .secondary-button:hover {
      background-color: #f1f5f9;
    }

    /* Responsive Styles */
    @media (max-width: 768px) {
      .details-columns {
        grid-template-columns: 1fr;
      }

      .order-header-details {
        flex-direction: column;
        gap: 0.75rem;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .detail-row .value {
        text-align: left;
      }

      .pagination-container {
        flex-direction: column;
        gap: 1rem;
      }

      .pagination-info {
        text-align: center;
      }

      .pagination-controls {
        justify-content: center;
      }

      .filter-controls {
        width: 100%;
      }

      .filter-dropdown {
        flex: 1;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];
  selectedOrder: Order | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Filters
  searchTerm = '';
  selectedStatus: string = 'ALL';
  sortOption = 'date_desc';

  // UI states
  isLoading: boolean = true;
  errorMessage: string = '';
  showOrderDetailsModal = false;

  // Product images map
  productImagesMap = new Map<string, string>();

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private productService: ProductService,
    private addressService:AddressService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getAllOrders().subscribe({
      next: (data: Order[]) => {
        this.orders = data; // Now data is already the processed array with orders and their items

        // Load product images for all products in all orders
        const productIds = new Set<string>();
        this.orders.forEach(order => {
          if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
              productIds.add(item.productId);
            });
          }
        });

        // Load images for all unique productIds
        const imageRequests = Array.from(productIds).map(productId =>
          this.productService.getProductMainImage(productId)
            .subscribe({
              next: (imageUrl: string) => {
                this.productImagesMap.set(productId, imageUrl);
              },
              error: (error) => {
                console.error(`Error loading image for product ${productId}:`, error);
              }
            })
        );

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to get order data. Please try again later.';
        this.isLoading = false;
        console.error('Error getting orders:', error);
      }
    });
  }

  // Get product image by productId
  getProductImage(productId: string): string {

    return this.productImagesMap.get(productId) || '';
  }

  // Get first product image for order (for displaying one image as preview)
  getFirstOrderProductImage(order: Order): string {
    if (!order.items || order.items.length === 0) return '';

    for (const item of order.items) {
      const image = this.getProductImage(item.productId);
      if (image) return image;
    }

    return '';
  }

  // Get item count for an order
  getItemCount(order: Order): number {
    return order.items?.length || 0;
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(order =>
        order.status === this.selectedStatus as OrderStatus
      );
    }

    // Apply sorting
    this.sortOrders(filtered);

    this.filteredOrders = filtered;
    this.updatePaginatedOrders();
  }

  sortOrders(orders: Order[]): void {
    switch (this.sortOption) {
      case 'date_desc':
        orders.sort((a, b) => new Date(b.createAt).getTime() - new Date(a.createAt).getTime());
        break;
      case 'date_asc':
        orders.sort((a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime());
        break;
      case 'amount_desc':
        orders.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case 'amount_asc':
        orders.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
    }
  }

  updatePaginatedOrders(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedOrders();
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredOrders.length / this.pageSize);
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, this.currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    startPage = Math.max(1, endPage - maxVisiblePages + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStatusClass(status: OrderStatus): string {
    return `status-${status}`;
  }

  getStatusIcon(status: OrderStatus): string {
    const iconMap: Record<string, string> = {
      'PENDING': 'fa-solid fa-clock',
      'PAID': 'fa-solid fa-check-circle',
      'REFUND': 'fa-solid fa-rotate-left',
      'SHIPPED': 'fa-solid fa-truck',
      'COMPLETED': 'fa-solid fa-check-double',
      'DELIVERED': 'fa-solid fa-box-open',
      'CANCELLED': 'fa-solid fa-ban',
      'REFUND_REQUESTED': 'fa-solid fa-hand-holding-dollar',
      'PROCESSING': 'fa-solid fa-gear fa-spin'
    };

    return iconMap[status] || 'fa-solid fa-question-circle';
  }

  getStatusText(status: OrderStatus): string {
    return this.orderService.getStatusText(status);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async handlePay(orderId: string) {
    try {
      this.isLoading = true;

      const paymentResponse = await firstValueFrom(
        this.cartService.createPaymentSession(orderId)
      );

      if (paymentResponse && paymentResponse.url) {
        window.location.href = paymentResponse.url;
      } else {
        console.error("Invalid payment response", paymentResponse);
        this.errorMessage = "Failed to create payment session. Please try again later.";
      }

      this.isLoading = false;
    } catch (error) {
      console.error("Payment session creation failed:", error);
      this.errorMessage = "Failed to create payment session. Please try again later.";
      this.isLoading = false;
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = { ...order };
    this.showOrderDetailsModal = true;
  }

  closeOrderDetailsModal(event?: Event): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal-overlay') || target.closest('.close-button') || target.closest('.secondary-button')) {
        this.showOrderDetailsModal = false;
        this.selectedOrder = null;
      }
    } else {
      this.showOrderDetailsModal = false;
      this.selectedOrder = null;
    }
  }

  calculateSubtotal(order: Order): number {
    if (!order.items || order.items.length === 0) return 0;

    return order.items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }

  calculateTax(order: Order): number {
    return this.calculateSubtotal(order) * 0.2; // 20% tax rate
  }

  productMap = new Map<string, Product>();
  loadingProducts = new Set<string>();

  getProductInfo(productId: string): Product | undefined {
    // Return from cache if available
    if (this.productMap.has(productId)) {
      return this.productMap.get(productId);
    }

    // Don't fetch if already loading
    if (!this.loadingProducts.has(productId)) {
      this.loadingProducts.add(productId);

      this.getProductInformation(productId).subscribe({
        next: (product) => {
          this.productMap.set(productId, product);
          this.loadingProducts.delete(productId);
        },
        error: (error) => {
          console.error(`Error loading product ${productId}:`, error);
          this.loadingProducts.delete(productId);
        }
      });
    }

    return undefined; // Return undefined while loading
  }

  getProductInformation(productId:string):Observable<Product> {
    return this.productService.getProduct(productId);
  }

  // 在服务中创建一个缓存 Map
  private addressCache = new Map<string, Address>();

// 获取地址信息的方法
  getAddressInformation(addressId: string): Observable<Address> {
    // 如果缓存中已经有这个地址，直接从缓存返回
    if (this.addressCache.has(addressId)) {
      // 将缓存的值包装成 Observable
      return of(this.addressCache.get(addressId) as Address);
    }

    // 如果缓存中没有，则从服务请求
    return this.addressService.getAddressById(addressId).pipe(
      tap(address => {
        this.addressCache.set(addressId, address);
      })
    );
  }

  // Helper method for pagination display
  protected readonly Math = Math;
}
