import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {Product, ProductStatus} from '../products/product.model';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule
  ],
  template: `
    <div class="product-management-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Product Management</h1>
          <p class="subtitle">Manage your store's products</p>
        </div>
        <button class="primary-button" (click)="showAddProductForm()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Product
        </button>
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
              placeholder="Search products..."
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
            >
          </div>
        </div>

        <div class="filter-controls">
          <select class="filter-dropdown" [(ngModel)]="categoryFilter" (change)="applyFilters()">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>

          <select class="filter-dropdown" [(ngModel)]="statusFilter" (change)="applyFilters()">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select class="filter-dropdown" [(ngModel)]="sortOption" (change)="applyFilters()">
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="price_asc">Price (Low-High)</option>
            <option value="price_desc">Price (High-Low)</option>
            <option value="stock_asc">Stock (Low-High)</option>
            <option value="stock_desc">Stock (High-Low)</option>
          </select>
        </div>
      </div>

      <!-- Products Table -->
      <div class="products-section">
        <div *ngIf="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading products...</p>
        </div>

        <div *ngIf="!isLoading" class="table-container">
          <table *ngIf="paginatedProducts.length > 0" class="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of paginatedProducts">
                <td class="product-image">
                  <div class="image-placeholder" *ngIf="!product.imageUrl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <img *ngIf="product.imageUrl" [src]="product.imageUrl" [alt]="product.name">
                </td>
                <td class="product-name">{{ product.name }}</td>
                <td>{{ product.categoryId }}</td>
                <td class="product-price">€{{ product.price.toFixed(2) }}</td>
                <td class="product-stock" [class.low-stock]="product.stock < 10">{{ product.stock }}</td>
                <td>
                  <span class="status-badge" [class.active]="product.status" [class.inactive]="!product.status">
                    {{ product.status ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button class="action-button edit-button" (click)="editProduct(product)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      class="action-button"
                      [class.deactivate-button]="product.status"
                      [class.activate-button]="!product.status"
                      (click)="toggleProductStatus(product)"
                    >
                      <svg *ngIf="product.status" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                        <line x1="12" y1="2" x2="12" y2="12"></line>
                      </svg>
                      <svg *ngIf="!product.status" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                      </svg>
                    </button>
                    <button class="action-button delete-button" (click)="confirmDelete(product)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredProducts.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters, or add a new product.</p>
            <button class="primary-button" (click)="showAddProductForm()">Add New Product</button>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div *ngIf="!isLoading && filteredProducts.length > 0" class="pagination-container">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to
          {{ Math.min(currentPage * pageSize, filteredProducts.length) }} of
          {{ filteredProducts.length }} products
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
            [disabled]="currentPage === Math.ceil(filteredProducts.length / pageSize)"
            (click)="changePage(currentPage + 1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Add/Edit Product Form Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal($event)">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h2>
            <button class="close-button" (click)="closeModal($event)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
              <div class="form-group">
                <label for="name">Product Name *</label>
                <input type="text" id="name" formControlName="name" class="form-control">
                <div *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched" class="error-message">
                  Product name is required
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="price">Price (€) *</label>
                  <input type="number" id="price" formControlName="price" class="form-control" step="0.01" min="0">
                  <div *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched" class="error-message">
                    Valid price is required
                  </div>
                </div>

                <div class="form-group">
                  <label for="stock">Stock Quantity *</label>
                  <input type="number" id="stock" formControlName="stock" class="form-control" min="0">
                  <div *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched" class="error-message">
                    Valid stock quantity is required
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="category">Category *</label>
                <select id="category" formControlName="category" class="form-control">
                  <option value="">Select Category</option>
                  <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
                </select>
                <div *ngIf="productForm.get('category')?.invalid && productForm.get('category')?.touched" class="error-message">
                  Category is required
                </div>
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" formControlName="description" class="form-control" rows="4"></textarea>
              </div>

              <div class="form-group">
                <label for="imageUrl">Image URL</label>
                <input type="text" id="imageUrl" formControlName="imageUrl" class="form-control">
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-container">
                  <input type="checkbox" formControlName="active">
                  <span class="checkbox-label">Active (Available for purchase)</span>
                </label>
              </div>

              <div class="form-actions">
                <button type="button" class="secondary-button" (click)="closeModal($event)">Cancel</button>
                <button type="submit" class="primary-button" [disabled]="productForm.invalid">
                  {{ isEditMode ? 'Update Product' : 'Add Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="showDeleteModal" class="modal-overlay" (click)="closeDeleteModal($event)">
        <div class="modal-container delete-modal">
          <div class="modal-header">
            <h2>Confirm Deletion</h2>
            <button class="close-button" (click)="closeDeleteModal($event)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="delete-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <p>Are you sure you want to delete <strong>{{ productToDelete?.name }}</strong>?</p>
              <p class="warning-text">This action cannot be undone.</p>
            </div>

            <div class="form-actions">
              <button type="button" class="secondary-button" (click)="closeDeleteModal($event)">Cancel</button>
              <button type="button" class="danger-button" (click)="deleteProduct()">Delete Product</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Container Styles */
    .product-management-container {
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
      transition: background-color 0.2s;
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
      transition: background-color 0.2s;
    }

    .secondary-button:hover {
      background-color: #f1f5f9;
    }

    .danger-button {
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .danger-button:hover {
      background-color: #dc2626;
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

    .search-input:focus {
      outline: none;
      border-color: #0284c7;
      box-shadow: 0 0 0 1px #0284c7;
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

    .filter-dropdown:focus {
      outline: none;
      border-color: #0284c7;
      box-shadow: 0 0 0 1px #0284c7;
    }

    /* Products Table */
    .products-section {
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

    .products-table {
      width: 100%;
      border-collapse: collapse;
    }

    .products-table th {
      background-color: #f8fafc;
      text-align: left;
      padding: 0.75rem 1rem;
      font-weight: 600;
      color: #475569;
      font-size: 0.875rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .products-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
    }

    .products-table tr:last-child td {
      border-bottom: none;
    }

    .product-image {
      width: 60px;
    }

    .image-placeholder {
      width: 48px;
      height: 48px;
      background-color: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      color: #94a3b8;
    }

    .product-image img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 6px;
    }

    .product-name {
      font-weight: 500;
      color: #0f172a;
    }

    .product-price {
      font-weight: 500;
    }

    .product-stock.low-stock {
      color: #ef4444;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-badge.active {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .status-badge.inactive {
      background-color: #f1f5f9;
      color: #64748b;
    }

    .actions-cell {
      width: 120px;
    }

    .action-buttons {
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
      background-color: #f1f5f9;
      color: #64748b;
      transition: background-color 0.2s;
    }

    .action-button:hover {
      background-color: #e2e8f0;
    }

    .edit-button:hover {
      background-color: #e0f2fe;
      color: #0284c7;
    }

    .activate-button:hover {
      background-color: #dcfce7;
      color: #16a34a;
    }

    .deactivate-button:hover {
      background-color: #fef9c3;
      color: #ca8a04;
    }

    .delete-button:hover {
      background-color: #fee2e2;
      color: #ef4444;
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
      transition: background-color 0.2s;
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
      transition: background-color 0.2s;
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
    }

    .modal-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .delete-modal {
      max-width: 450px;
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

    /* Form Styles */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
    }

    .form-control {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
      color: #0f172a;
    }

    .form-control:focus {
      outline: none;
      border-color: #0284c7;
      box-shadow: 0 0 0 1px #0284c7;
    }

    textarea.form-control {
      resize: vertical;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .checkbox-label {
      margin-left: 0.5rem;
      font-size: 0.875rem;
      color: #475569;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    /* Delete Confirmation Modal */
    .delete-warning {
      text-align: center;
      padding: 1rem 0;
    }

    .delete-warning svg {
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .warning-text {
      color: #ef4444;
      font-size: 0.875rem;
    }

    /* Responsive Styles */
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .filter-controls {
        flex-direction: column;
        align-items: stretch;
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
    }
  `]
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Filters
  searchTerm = '';
  categoryFilter = '';
  statusFilter = '';
  sortOption = 'name_asc';

  // Form
  productForm: FormGroup;
  isEditMode = false;
  selectedProductId: string | undefined;

  // UI states
  isLoading = true;
  showModal = false;
  showDeleteModal = false;
  productToDelete: Product | null = null;

  // Available categories (should come from a service in real app)
  categories = ['Electronics', 'Clothing', 'Home & Garden', 'Beauty', 'Books', 'Sports', 'Toys', 'Food & Beverages'];

  constructor(private fb: FormBuilder) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      description: [''],
      imageUrl: [''],
      active: [true]
    });
  }

  loadProducts(): void {
    // In a real application, you would call a service to fetch products from the API
    // For demo purposes, we'll use mock data
    setTimeout(() => {
      this.products = this.generateMockProducts();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  generateMockProducts(): Product[] {
    // Generate mock products
    const mockProducts: Product[] = [];

    for (let i = 1; i <= 52; i++) {
      const category = this.categories[Math.floor(Math.random() * this.categories.length)];
      const stock = Math.floor(Math.random() * 100);

      mockProducts.push({
        productId: `dd`,
        name: `Product ${i}`,
        description: `This is a description for Product ${i}. It contains details about the product features and specifications.`,
        price: parseFloat((10 + Math.random() * 90).toFixed(2)),
        stock: stock,
        categoryId: category,
        imageUrl: i % 3 === 0 ? `https://placeholder.com/300` : '',
        createdAt: '',
        images: [],
        merchantId: '',
        updatedAt: '', // Some products have images, some don't
        status: ProductStatus.ACTIVE // 80% active products
      });
    }

    return mockProducts;
  }

  applyFilters(): void {
    // Filter products based on search term, category, and status
    let filtered = [...this.products];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.categoryId.toLowerCase().includes(term)
      );
    }

    if (this.categoryFilter) {
      filtered = filtered.filter(product => product.categoryId=== this.categoryFilter);
    }

    if (this.statusFilter) {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(product => product.status === ProductStatus.ACTIVE);
    }

    // Apply sorting
    this.sortProducts(filtered);

    this.filteredProducts = filtered;
    this.updatePaginatedProducts();
  }

  sortProducts(products: Product[]): void {
    switch (this.sortOption) {
      case 'name_asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'stock_asc':
        products.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock_desc':
        products.sort((a, b) => b.stock - a.stock);
        break;
    }
  }

  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    const pages: number[] = [];

    // Show up to 5 page numbers
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

  showAddProductForm(): void {
    this.isEditMode = false;
    this.selectedProductId = '';
    this.productForm.reset({
      active: true,
      price: 0,
      stock: 0
    });
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.selectedProductId = product.productId;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.categoryId,
      description: product.description,
      imageUrl: product.imageUrl,
      active: product.status
    });
    this.showModal = true;
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;

    const productData = this.productForm.value;

    if (this.isEditMode && this.selectedProductId) {
      // Update existing product
      const index = this.products.findIndex(p => p.productId === this.selectedProductId);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          ...productData
        };
      }
    } else {
      // Add new product
      const newProduct: Product = {
        id: this.getNextProductId(),
        ...productData,
        createdAt: new Date()
      };
      this.products.unshift(newProduct);
    }

    this.applyFilters();
    this.closeModal();

    // In a real application, you would call a service to save the product to the API
    // productService.saveProduct(productData).subscribe(...)
  }

  getNextProductId(): number {
    return Math.max(0, 1) + 1;
  }

  toggleProductStatus(product: Product): void {
    const index = this.products.findIndex(p => p.productId === product.productId );
    if (index !== -1) {
      this.products[index].status = ProductStatus.ACTIVE;
      this.applyFilters();
    }

    // In a real application, you would call a service to update the product status
    // productService.updateProductStatus(product.id, !product.active).subscribe(...)
  }

  confirmDelete(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  deleteProduct(): void {
    if (!this.productToDelete) return;

    const index = this.products.findIndex(p => p.productId  === this.productToDelete!.productId );
    if (index !== -1) {
      this.products.splice(index, 1);
      this.applyFilters();
    }

    this.closeDeleteModal();

    // In a real application, you would call a service to delete the product
    // productService.deleteProduct(this.productToDelete.id).subscribe(...)
  }

  closeModal(event?: Event): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal-overlay') || target.closest('.close-button') || target.closest('.secondary-button')) {
        this.showModal = false;
      }
    } else {
      this.showModal = false;
    }
  }

  closeDeleteModal(event?: Event): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal-overlay') || target.closest('.close-button') || target.closest('.secondary-button')) {
        this.showDeleteModal = false;
        this.productToDelete = null;
      }
    } else {
      this.showDeleteModal = false;
      this.productToDelete = null;
    }
  }

  protected readonly Math = Math;
}
