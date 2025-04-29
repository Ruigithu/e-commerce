import { Component, OnInit } from '@angular/core';
import { AddressService } from '../address.service';
import { Address } from '../address.model';
import { AddressFormComponent } from './address-form.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Header } from '../../../../common/components/header/header.component';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [
    AddressFormComponent,
    CommonModule,
    RouterLink,
    Header
  ],
  template: `
    <div class="address-page">
      <app-header></app-header>

      <div class="address-container">
        <div class="address-card">
          <div class="page-header">
            <div class="header-left">
              <button *ngIf="returnUrl" (click)="goBack()" class="back-button">
                <i class="fa-solid fa-arrow-left"></i>
                返回
              </button>
              <h1>{{ selectionMode ? '选择收货地址' : '地址管理' }}</h1>
            </div>

            <button class="add-address-btn" (click)="openAddressForm()">
              <i class="fa-solid fa-plus"></i>
              新建地址
            </button>
          </div>

          <!-- 加载状态 -->
          <div *ngIf="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>正在加载地址信息...</p>
          </div>

          <!-- 错误状态 -->
          <div *ngIf="errorMessage" class="error-message">
            <i class="fa-solid fa-circle-exclamation"></i>
            <div>
              <p>{{ errorMessage }}</p>
              <button (click)="loadAddresses()" class="retry-btn">重试</button>
            </div>
          </div>

          <!-- 空状态 -->
          <div *ngIf="!isLoading && !errorMessage && addresses.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <h3>暂无地址</h3>
            <p>您还没有添加任何收货地址</p>
            <button (click)="openAddressForm()" class="add-btn">
              <i class="fa-solid fa-plus"></i>
              添加新地址
            </button>
          </div>

          <!-- 地址列表 -->
          <div *ngIf="addresses.length > 0" class="address-list">
            <div *ngFor="let address of addresses"
                 class="address-item"
                 [class.selectable]="selectionMode"
                 [class.selected]="isAddressSelected(address)"
                 (click)="selectionMode ? selectAddress(address) : null">

              <div class="address-content">
                <div class="address-header">
                  <div class="recipient-info">
                    <span class="recipient-name">{{ address.receiverName }}</span>
                    <span class="recipient-phone">{{ formatPhone(address.phone) }}</span>
                  </div>

                  <div *ngIf="address.isDefault" class="default-badge">
                    <i class="fa-solid fa-check"></i>
                    默认地址
                  </div>
                </div>

                <div class="address-details">
                  <i class="fa-solid fa-location-dot"></i>
                  <div>
                    <p class="address-line">{{ address.addressLine }}</p>
                    <p class="address-city">{{ address.city }} {{ address.postalCode }}</p>
                  </div>
                </div>
              </div>

              <div class="address-actions" *ngIf="!selectionMode">
                <button class="action-btn edit-btn" (click)="editAddress(address); $event.stopPropagation()">
                  <i class="fa-solid fa-pen-to-square"></i>
                  编辑
                </button>

                <button
                  class="action-btn delete-btn"
                  (click)="deleteAddress(address.addressId); $event.stopPropagation()"
                  [disabled]="address.isDefault">
                  <i class="fa-solid fa-trash-alt"></i>
                  删除
                </button>

                <button
                  *ngIf="!address.isDefault"
                  class="action-btn default-btn"
                  (click)="setAsDefault(address); $event.stopPropagation()">
                  <i class="fa-solid fa-star"></i>
                  设为默认
                </button>
              </div>

              <div *ngIf="selectionMode" class="select-indicator">
                <i class="fa-solid" [ngClass]="isAddressSelected(address) ? 'fa-check-circle' : 'fa-circle'"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 地址表单模态框 -->
      <div *ngIf="isFormVisible" class="address-form-modal">
        <div class="address-form-modal__content">
          <div class="modal-header">
            <h2>{{ selectedAddress ? '编辑地址' : '添加新地址' }}</h2>
            <button class="close-btn" (click)="closeAddressForm()">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <app-address-form
            [address]="selectedAddress"
            (formSubmit)="handleFormSubmit($event)"
            (formCancel)="closeAddressForm()">
          </app-address-form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .address-page {
      min-height: 100vh;
      background-color: #f9f9f9;
    }

    .address-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .address-card {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    h1 {
      font-size: 1.8rem;
      color: #333;
      margin: 0;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: #666;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .back-button:hover {
      background-color: #f0f0f0;
    }

    .add-address-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #578E7E;
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-address-btn:hover {
      background-color: #477a6c;
    }

    /* 加载状态样式 */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
      color: #666;
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

    /* 错误信息样式 */
    .error-message {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      background-color: rgba(255, 82, 82, 0.1);
      color: #ff5252;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .error-message i {
      font-size: 1.5rem;
    }

    .error-message p {
      margin: 0 0 0.75rem 0;
    }

    .retry-btn {
      background: none;
      border: 1px solid #ff5252;
      color: #ff5252;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .retry-btn:hover {
      background-color: rgba(255, 82, 82, 0.1);
    }

    /* 空状态样式 */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
      color: #666;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .empty-icon i {
      font-size: 2.5rem;
      color: #ccc;
    }

    .empty-state h3 {
      font-size: 1.2rem;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #578E7E;
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-btn:hover {
      background-color: #477a6c;
    }

    /* 地址列表样式 */
    .address-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .address-item {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      position: relative;
      transition: all 0.2s;
    }

    .address-item.selectable {
      cursor: pointer;
    }

    .address-item.selectable:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: #ddd;
    }

    .address-item.selected {
      border-color: #578E7E;
      background-color: rgba(87, 142, 126, 0.05);
    }

    .address-content {
      flex: 1;
    }

    .address-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .recipient-info {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .recipient-name {
      font-weight: 600;
      color: #333;
    }

    .recipient-phone {
      color: #666;
    }

    .default-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #e6f7ff;
      color: #1890ff;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .address-details {
      display: flex;
      gap: 0.75rem;
      color: #666;
    }

    .address-details i {
      color: #999;
      font-size: 1.2rem;
      margin-top: 0.25rem;
    }

    .address-line, .address-city {
      margin: 0.25rem 0;
    }

    .address-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: #666;
      font-size: 0.9rem;
      white-space: nowrap;
      cursor: pointer;
      padding: 0.4rem 0.75rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .action-btn:hover:not(:disabled) {
      background-color: #f5f5f5;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .edit-btn:hover {
      color: #578E7E;
    }

    .delete-btn:hover:not(:disabled) {
      color: #ff5252;
    }

    .default-btn:hover {
      color: #faad14;
    }

    .select-indicator {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      color: #578E7E;
      font-size: 1.2rem;
    }

    /* 地址表单模态框样式 */
    .address-form-modal {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .address-form-modal__content {
      background-color: white;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      font-size: 1.3rem;
      color: #333;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: #666;
      font-size: 1.2rem;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background-color: #f5f5f5;
      color: #333;
    }

    /* 响应式样式 */
    @media (max-width: 768px) {
      .address-container {
        padding: 1rem;
      }

      .address-card {
        padding: 1.5rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .add-address-btn {
        width: 100%;
        justify-content: center;
      }

      .address-item {
        flex-direction: column;
        gap: 1rem;
      }

      .address-actions {
        flex-direction: row;
        flex-wrap: wrap;
        padding-top: 1rem;
        border-top: 1px solid #eee;
      }

      .address-form-modal__content {
        max-width: 90%;
        margin: 1rem;
      }
    }
  `]
})
export class AddressListComponent implements OnInit {
  addresses: Address[] = [];
  isFormVisible = false;
  selectedAddress: Address | null = null;
  selectionMode = false;
  returnUrl: string | null = null;
  isLoading = true;
  errorMessage = '';
  selectedAddressId: string | null = null;

  constructor(
    private addressService: AddressService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;

    // 检查URL参数
    this.route.queryParams.subscribe(params => {
      this.selectionMode = params['mode'] === 'selection';
      this.returnUrl = params['returnUrl'];

      // 加载地址
      this.loadAddresses();
    });

    // 如果有默认地址，设置为选中状态
    const storedAddress = localStorage.getItem('defaultAddress');
    if (storedAddress && this.selectionMode) {
      try {
        const defaultAddress = JSON.parse(storedAddress);
        this.selectedAddressId = defaultAddress.addressId;
      } catch (error) {
        console.error('Error parsing stored address:', error);
      }
    }
  }

  loadAddresses() {
    this.isLoading = true;
    this.errorMessage = '';

    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('加载地址失败:', error);
        this.errorMessage = '获取地址数据失败，请稍后重试';
        this.isLoading = false;
      }
    });
  }

  isAddressSelected(address: Address): boolean {
    if (!this.selectionMode) return false;
    return this.selectedAddressId === address.addressId;
  }

  selectAddress(address: Address) {
    if (!this.selectionMode) return;

    this.selectedAddressId = address.addressId;
    this.addressService.selectAddress(address);

    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  goBack() {
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  openAddressForm() {
    this.selectedAddress = null;
    this.isFormVisible = true;
  }

  editAddress(address: Address) {
    this.selectedAddress = address;
    this.isFormVisible = true;
  }

  closeAddressForm() {
    this.isFormVisible = false;
    this.selectedAddress = null;
  }

  deleteAddress(addressId: string) {
    if (confirm('确定要删除这个地址吗？')) {
      this.addressService.deleteAddress(addressId).subscribe({
        next: () => {
          this.loadAddresses();
        },
        error: (error) => {
          console.error('删除地址失败:', error);
          this.errorMessage = '删除地址失败，请稍后重试';
        }
      });
    }
  }

  setAsDefault(address: Address) {
    // 克隆地址对象并设置为默认
    const updatedAddress = { ...address, isDefault: true };

    this.addressService.updateAddress(updatedAddress).subscribe({
      next: (result) => {
        // 更新地址列表中的默认状态
        this.addresses = this.addresses.map(addr => ({
          ...addr,
          isDefault: addr.addressId === result.addressId
        }));

        // 更新本地存储的默认地址
        localStorage.setItem('defaultAddress', JSON.stringify(result));
      },
      error: (error) => {
        console.error('设置默认地址失败:', error);
        this.errorMessage = '设置默认地址失败，请稍后重试';
      }
    });
  }

  handleFormSubmit(address: Address) {
    this.isLoading = true;

    const operation = this.selectedAddress
      ? this.addressService.updateAddress(address)
      : this.addressService.createAddress(address);

    operation.subscribe({
      next: (result) => {
        if (this.selectedAddress) {
          // 更新现有地址
          this.addresses = this.addresses.map(addr =>
            addr.addressId === result.addressId ? result : addr
          );
        } else {
          // 添加新地址
          this.addresses.push(result);
        }

        // 如果设置为默认地址，更新其他地址的默认状态
        if (result.isDefault) {
          this.addresses = this.addresses.map(addr => ({
            ...addr,
            isDefault: addr.addressId === result.addressId
          }));

          // 更新本地存储的默认地址
          localStorage.setItem('defaultAddress', JSON.stringify(result));
        }

        this.closeAddressForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('保存地址失败:', error);
        this.errorMessage = '保存地址失败，请稍后重试';
        this.isLoading = false;
      }
    });
  }

  formatPhone(phone: string): string {
    // 简单的电话号码格式化，如：186****1234
    if (!phone || phone.length !== 11) return phone;
    return `${phone.substring(0, 3)}****${phone.substring(7)}`;
  }
}
