import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderStatus } from '../orders/my-orders/my-orders.service';
import { MerchantService } from './merchant.service';

interface OrderItem {
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

interface MerchantOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: {
    receiverName: string;
    addressLine: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  trackingNumber?: string;
  shippingCarrier?: string;
  notes?: string;
}

@Component({
  selector: 'app-merchant-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './merchant-orders.component.html',
  styleUrls: ['./merchant-orders.component.css']
})
export class MerchantOrdersComponent implements OnInit {
  orders: MerchantOrder[] = [];
  filteredOrders: MerchantOrder[] = [];
  paginatedOrders: MerchantOrder[] = [];
  selectedOrder: MerchantOrder | null = null;

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

  // Shipping form data
  shippingInfo = {
    trackingNumber: '',
    carrier: '',
    otherCarrier: '',
    notes: '',
    notifyCustomer: true
  };

  constructor(private merchantService: MerchantService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;

    // In a real app, this would call the merchant service
    setTimeout(() => {
      this.orders = this.generateMockOrders();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
  }

  generateMockOrders(): MerchantOrder[] {
    const mockOrders: MerchantOrder[] = [];
    const statuses = [
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED
    ];

    for (let i = 1; i <= 25; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

      const items: OrderItem[] = [];
      const itemCount = Math.floor(Math.random() * 3) + 1;

      let totalAmount = 0;
      for (let j = 1; j <= itemCount; j++) {
        const price = parseFloat((10 + Math.random() * 90).toFixed(2));
        const quantity = Math.floor(Math.random() * 3) + 1;
        totalAmount += price * quantity;

        items.push({
          itemId: `item-${i}-${j}`,
          productId: `product-${j}`,
          productName: `Product ${j}`,
          quantity: quantity,
          unitPrice: price
        });
      }

      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      mockOrders.push({
        orderId: `order-${i}`,
        customerName: `Customer ${i}`,
        customerEmail: `customer${i}@example.com`,
        orderDate: orderDate.toISOString(),
        status: randomStatus,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        items: items,
        shippingAddress: {
          receiverName: `Customer ${i}`,
          addressLine: `${i} Main Street`,
          city: 'Example City',
          postalCode: '12345',
          phone: '123-456-7890'
        },
        trackingNumber: randomStatus === OrderStatus.SHIPPED ||
        randomStatus === OrderStatus.DELIVERED ||
        randomStatus === OrderStatus.COMPLETED
          ? `TRK${100000 + i}` : undefined,
        shippingCarrier: randomStatus === OrderStatus.SHIPPED ||
        randomStatus === OrderStatus.DELIVERED ||
        randomStatus === OrderStatus.COMPLETED
          ? 'DHL' : undefined
      });
    }

    return mockOrders;
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term)
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

  sortOrders(orders: MerchantOrder[]): void {
    switch (this.sortOption) {
      case 'date_desc':
        orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        break;
      case 'date_asc':
        orders.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
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

  viewOrderDetails(order: MerchantOrder): void {
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
      this.orders[orderIndex].trackingNumber = this.shippingInfo.trackingNumber;
      this.orders[orderIndex].shippingCarrier = this.getCarrierName();
      this.orders[orderIndex].notes = this.shippingInfo.notes || '';

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

  calculateSubtotal(): number {
    if (!this.selectedOrder) return 0;

    return this.selectedOrder.items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity);
    }, 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.2; // 20% tax rate
  }

  protected readonly Math = Math;
}
