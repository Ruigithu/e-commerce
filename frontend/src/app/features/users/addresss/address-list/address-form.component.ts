import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address } from '../address.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  template: `
    <form [formGroup]="addressForm" (ngSubmit)="onSubmit()" class="address-form">
      <div class="form-fields">
        <!-- 收件人姓名 -->
        <div class="form-group">
          <label for="receiver_name">
            <i class="fa-solid fa-user"></i>
            收件人姓名
          </label>
          <div class="input-container">
            <input
              type="text"
              id="receiver_name"
              formControlName="receiver_name"
              placeholder="请输入收件人姓名"
              [class.error]="isFieldInvalid('receiver_name')"
            >
          </div>
          <div *ngIf="isFieldInvalid('receiver_name')" class="error-message">
            收件人姓名不能为空
          </div>
        </div>

        <!-- 手机号码 -->
        <div class="form-group">
          <label for="phone">
            <i class="fa-solid fa-phone"></i>
            手机号码
          </label>
          <div class="input-container">
            <input
              type="tel"
              id="phone"
              formControlName="phone"
              placeholder="请输入手机号码"
              [class.error]="isFieldInvalid('phone')"
            >
          </div>
          <div *ngIf="addressForm.get('phone')?.errors?.['required'] && addressForm.get('phone')?.touched" class="error-message">
            手机号码不能为空
          </div>
          <div *ngIf="addressForm.get('phone')?.errors?.['pattern'] && addressForm.get('phone')?.touched" class="error-message">
            请输入有效的手机号码
          </div>
        </div>

        <!-- 详细地址 -->
        <div class="form-group">
          <label for="address_line">
            <i class="fa-solid fa-location-dot"></i>
            详细地址
          </label>
          <div class="input-container">
            <input
              type="text"
              id="address_line"
              formControlName="address_line"
              placeholder="街道、楼层、门牌号等"
              [class.error]="isFieldInvalid('address_line')"
            >
          </div>
          <div *ngIf="isFieldInvalid('address_line')" class="error-message">
            详细地址不能为空
          </div>
        </div>

        <!-- 城市 -->
        <div class="form-group">
          <label for="city">
            <i class="fa-solid fa-city"></i>
            城市
          </label>
          <div class="input-container">
            <input
              type="text"
              id="city"
              formControlName="city"
              placeholder="请输入城市名称"
              [class.error]="isFieldInvalid('city')"
            >
          </div>
          <div *ngIf="isFieldInvalid('city')" class="error-message">
            城市不能为空
          </div>
        </div>

        <!-- 邮政编码 -->
        <div class="form-group">
          <label for="postal_code">
            <i class="fa-solid fa-envelope"></i>
            邮政编码
          </label>
          <div class="input-container">
            <input
              type="text"
              id="postal_code"
              formControlName="postal_code"
              placeholder="请输入邮政编码"
              [class.error]="isFieldInvalid('postal_code')"
            >
          </div>
          <div *ngIf="isFieldInvalid('postal_code')" class="error-message">
            邮政编码不能为空
          </div>
        </div>
      </div>

      <!-- 默认地址设置 -->
      <div class="default-address-option">
        <label class="checkbox-container">
          <input type="checkbox" formControlName="is_default">
          <span class="checkmark"></span>
          设为默认地址
        </label>
      </div>

      <!-- 按钮组 -->
      <div class="form-actions">
        <button type="button" class="cancel-btn" (click)="onCancel()">
          取消
        </button>
        <button type="submit" class="submit-btn" [disabled]="!addressForm.valid || isSubmitting">
          <span *ngIf="!isSubmitting">保存</span>
          <span *ngIf="isSubmitting" class="spinner-small"></span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    .address-form {
      padding: 1.5rem;
    }

    .form-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* 让详细地址占满整行 */
    .form-group:nth-child(3) {
      grid-column: 1 / 3;
    }

    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: #333;
      font-size: 0.95rem;
    }

    label i {
      color: #578E7E;
    }

    .input-container {
      position: relative;
    }

    input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #578E7E;
      box-shadow: 0 0 0 2px rgba(87, 142, 126, 0.2);
    }

    input.error {
      border-color: #ff5252;
      background-color: rgba(255, 82, 82, 0.05);
    }

    input.error:focus {
      box-shadow: 0 0 0 2px rgba(255, 82, 82, 0.2);
    }

    .error-message {
      color: #ff5252;
      font-size: 0.8rem;
    }

    /* 默认地址复选框样式 */
    .default-address-option {
      margin-bottom: 2rem;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      position: relative;
      padding-left: 28px;
      cursor: pointer;
      font-size: 0.95rem;
      user-select: none;
      color: #333;
    }

    .checkbox-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 18px;
      width: 18px;
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .checkbox-container:hover input ~ .checkmark {
      border-color: #578E7E;
    }

    .checkbox-container input:checked ~ .checkmark {
      background-color: #578E7E;
      border-color: #578E7E;
    }

    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }

    .checkbox-container input:checked ~ .checkmark:after {
      display: block;
    }

    .checkbox-container .checkmark:after {
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    /* 按钮样式 */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .cancel-btn, .submit-btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cancel-btn {
      background-color: transparent;
      border: 1px solid #ddd;
      color: #666;
    }

    .cancel-btn:hover {
      background-color: #f5f5f5;
    }

    .submit-btn {
      background-color: #578E7E;
      color: white;
      border: none;
      min-width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #477a6c;
    }

    .submit-btn:disabled {
      background-color: #97b3ac;
      cursor: not-allowed;
    }

    .spinner-small {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* 响应式样式 */
    @media (max-width: 768px) {
      .form-fields {
        grid-template-columns: 1fr;
      }

      .form-group:nth-child(3) {
        grid-column: 1;
      }
    }
  `]
})
export class AddressFormComponent implements OnInit {
  @Input() address: Address | null = null;
  @Output() formSubmit = new EventEmitter<Address>();
  @Output() formCancel = new EventEmitter<void>();

  addressForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      receiver_name: ['', Validators.required],
      address_line: ['', Validators.required],
      city: ['', Validators.required],
      postal_code: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
      is_default: [false]
    });
  }

  ngOnInit() {
    if (this.address) {
      // 将地址数据转换为表单字段格式
      this.addressForm.patchValue({
        receiver_name: this.address.receiverName,
        address_line: this.address.addressLine,
        city: this.address.city,
        postal_code: this.address.postalCode,
        phone: this.address.phone,
        is_default: this.address.isDefault
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  onSubmit() {
    if (this.addressForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.addressForm.value;
      const userId = localStorage.getItem("userId") || '';

      const addressObject: Address = {
        addressId: this.address?.addressId || '',
        userId: userId,
        addressLine: formValue.address_line,
        city: formValue.city,
        postalCode: formValue.postal_code,
        phone: formValue.phone,
        isDefault: formValue.is_default,
        createdAt: this.address?.createdAt || new Date().toISOString(),
        receiverName: formValue.receiver_name
      };

      this.formSubmit.emit(addressObject);

      // 提交后重置状态
      setTimeout(() => {
        this.isSubmitting = false;
      }, 1000);
    } else {
      // 标记所有字段为已触摸，显示错误信息
      this.addressForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
