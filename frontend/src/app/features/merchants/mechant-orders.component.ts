import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Order, OrderService, OrderStatus} from '../orders/my-orders/my-orders.service';
import { MerchantService } from './merchant.service';
import {Header} from "../../common/components/header/header.component";
import {ProductService} from '../products/product.service';
import {MessageService} from '../../common/message.service';
import {Address} from '../users/addresss/address.model';
import {Observable, of, tap} from 'rxjs';
import {AddressService} from '../users/addresss/address.service';
import {Product} from '../products/product.model';

interface OrderItem {
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}


@Component({
  selector: 'app-merchant-orders',
  standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        Header
    ],
  templateUrl: './merchant-orders.component.html',
  styleUrls: ['./merchant-orders.component.css']
})
export class MerchantOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];
  selectedOrder: Order | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Filters
  searchTerm = '';
  statusFilter = '';
  sortOption = 'date_desc';

  // UI states
  isLoading = true;
  showOrderDetailsModal = false;
  showShipModal = false;
  orderIdToShip = '';

  productImagesMap = new Map<string, string>();

  // Shipping form data
  shippingInfo = {
    trackingNumber: '',
    carrier: '',
    otherCarrier: '',
    notes: '',
    notifyCustomer: true
  };

  constructor(private merchantService: MerchantService,private orderService:OrderService, private productService:ProductService,
              private messageService:MessageService,
              private addressService:AddressService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;

    this.orderService.getAllOrdersByMerchantId().subscribe({
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
        this.messageService.showError( 'Failed to get order data. Please try again later.');
        this.isLoading = false;
        console.error('Error getting orders:', error);
      }
    });
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
  getProductImage(productId: string): string {

    return this.productImagesMap.get(productId) || '';
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
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getStatusClass(status: OrderStatus): string {
    return `status-${status}`;
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'Pending';
      case OrderStatus.PAID: return 'Awaiting Processing';
      case OrderStatus.PROCESSING: return 'Processing';
      case OrderStatus.SHIPPED: return 'Shipped';
      case OrderStatus.DELIVERED: return 'Delivered';
      case OrderStatus.COMPLETED: return 'Completed';
      case OrderStatus.CANCELLED: return 'Cancelled';
      case OrderStatus.REFUND_REQUESTED: return 'Refund Requested';
      case OrderStatus.REFUND: return 'Refunded';
      default: return 'Unknown';
    }
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = { ...order };

    if (order.items) {
      order.items.forEach(item => {
        this.getProductInfo(item.productId);
      });
    }

    if (order.shippingAddressId) {
      this.getAddressInformation(order.shippingAddressId).subscribe();
    }

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

  showShipOrderModal(orderId: string): void {
    this.orderIdToShip = orderId;
    this.shippingInfo = {
      trackingNumber: '',
      carrier: '',
      otherCarrier: '',
      notes: '',
      notifyCustomer: true
    };
    this.showShipModal = true;
  }

  closeShipModal(event?: Event): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal-overlay') || target.closest('.close-button') || target.closest('.secondary-button')) {
        this.showShipModal = false;
        this.orderIdToShip = '';
      }
    } else {
      this.showShipModal = false;
      this.orderIdToShip = '';
    }
  }

  getCarrierName(): string {
    return this.shippingInfo.carrier === 'Other' ? this.shippingInfo.otherCarrier : this.shippingInfo.carrier;
  }

  processOrder(orderId: string): void {
    // In a real app, this would call a service method to update the order status
    const orderIndex = this.orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = OrderStatus.PROCESSING;
      this.applyFilters();
      // Show success message or notification
      alert(`Order ${orderId} has been marked as processing`);
    }
  }

  shipOrder(): void {
    if (!this.orderIdToShip) return;

    // Validate form
    if (!this.shippingInfo.trackingNumber || !this.getCarrierName()) {
      alert('Please provide tracking number and carrier');
      return;
    }

    // In a real app, this would call a service method to update the order
    const orderIndex = this.orders.findIndex(o => o.orderId === this.orderIdToShip);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = OrderStatus.SHIPPED;

      // Apply filters to update the UI
      this.applyFilters();

      // If selected order is the one being shipped, update it too
      if (this.selectedOrder && this.selectedOrder.orderId === this.orderIdToShip) {
        this.selectedOrder = { ...this.orders[orderIndex] };
      }

      // Close the modal
      this.closeShipModal();

      // Show success message
      alert(`Order ${this.orderIdToShip} has been marked as shipped`);

      // Reset the shipping form
      this.orderIdToShip = '';
    }
  }

  markAsDelivered(orderId: string): void {
    // In a real app, this would call a service method to update the order status
    const orderIndex = this.orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = OrderStatus.DELIVERED;
      this.applyFilters();
      // Show success message or notification
      alert(`Order ${orderId} has been marked as delivered`);
    }
  }

  getItemCount(order: Order): number {
    return order.items?.length || 0;
  }

  calculateSubtotal(order: Order | null): number {
    if(order!=null) {
      if (!order.items || order.items.length === 0) return 0;

      return order.items.reduce((total, item) => {
        return total + (item.unitPrice * item.quantity);
      }, 0);
    }
    return -1;
  }

  calculateTax(): number {
    return this.calculateSubtotal(this.selectedOrder) * 0.2; // 20% tax rate
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

  protected readonly Math = Math;
}
