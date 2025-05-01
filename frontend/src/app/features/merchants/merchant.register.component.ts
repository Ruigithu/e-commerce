import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MerchantService } from './merchant.service';
import { Merchant, MerchantStatus } from './merchant.modal';
import { Header } from '../../common/components/header/header.component';
import {catchError, of} from 'rxjs';
import {ProductCategory} from '../products/product-category.model';

@Component({
  selector: 'app-merchant-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    Header
  ],
  template: `
    <div class="register-page">
      <app-header></app-header>

      <div class="register-container">
        <div class="register-header">
          <h1>Apply to Become a Merchant</h1>
          <p class="subtitle">Join our platform and showcase your products to global buyers</p>
        </div>

        <!-- Success or Error Messages -->
        <div *ngIf="successMessage" class="success-message">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ successMessage }}</span>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-section">
            <h2>Store Information</h2>

            <div class="form-group">
              <label for="store-name">Store Name <span class="required">*</span></label>
              <input
                type="text"
                id="store-name"
                formControlName="storeName"
                class="form-control"
                [class.is-invalid]="hasError('storeName', 'required') || hasError('storeName', 'minlength') || hasError('storeName', 'maxlength')"
              >
              <div class="error-feedback" *ngIf="hasError('storeName', 'required')">
                Store name is required
              </div>
              <div class="error-feedback" *ngIf="hasError('storeName', 'minlength')">
                Store name must be at least 3 characters
              </div>
              <div class="error-feedback" *ngIf="hasError('storeName', 'maxlength')">
                Store name cannot exceed 50 characters
              </div>
            </div>

            <div class="form-group">
              <label for="business-category">Business Category <span class="required">*</span></label>
              <select
                id="business-category"
                formControlName="businessCategory"
                class="form-control"
                [class.is-invalid]="hasError('businessCategory', 'required')"
              >
                <option value="">-- Select Business Category --</option>
                <option *ngFor="let category of productCategories" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
              <div class="error-feedback" *ngIf="hasError('businessCategory', 'required')">
                Please select a business category
              </div>
            </div>

            <div class="form-group">
              <label for="store-description">Store Description <span class="required">*</span></label>
              <textarea
                id="store-description"
                formControlName="description"
                class="form-control"
                rows="4"
                [class.is-invalid]="hasError('description', 'required') || hasError('description', 'minlength') || hasError('description', 'maxlength')"
              ></textarea>
              <div class="error-feedback" *ngIf="hasError('description', 'required')">
                Store description is required
              </div>
              <div class="error-feedback" *ngIf="hasError('description', 'minlength')">
                Store description must be at least 20 characters
              </div>
              <div class="error-feedback" *ngIf="hasError('description', 'maxlength')">
                Store description cannot exceed 500 characters
              </div>
              <div class="form-text">Describe your store, products, and your business</div>
            </div>

            <div class="form-group">
              <label for="store-logo">Store Logo (Optional)</label>
              <input
                type="text"
                id="store-logo"
                formControlName="logo"
                class="form-control"
                placeholder="Enter Logo image URL"
              >
              <div class="form-text">Provide a link to your store logo (image upload will be supported in future versions)</div>
            </div>
          </div>

          <div class="form-section">
            <h2>Contact Information</h2>

            <div class="form-group">
              <label for="contact-email">Contact Email <span class="required">*</span></label>
              <input
                type="email"
                id="contact-email"
                formControlName="contactEmail"
                class="form-control"
                [class.is-invalid]="hasError('contactEmail', 'required') || hasError('contactEmail', 'email')"
              >
              <div class="error-feedback" *ngIf="hasError('contactEmail', 'required')">
                Contact email is required
              </div>
              <div class="error-feedback" *ngIf="hasError('contactEmail', 'email')">
                Please enter a valid email address
              </div>
            </div>

            <div class="form-group">
              <label for="contact-phone">Contact Phone <span class="required">*</span></label>
              <input
                type="tel"
                id="contact-phone"
                formControlName="contactPhone"
                class="form-control"
                [class.is-invalid]="hasError('contactPhone', 'required') || hasError('contactPhone', 'pattern')"
              >
              <div class="error-feedback" *ngIf="hasError('contactPhone', 'required')">
                Contact phone is required
              </div>
              <div class="error-feedback" *ngIf="hasError('contactPhone', 'pattern')">
                Please enter a valid phone number (8-15 digits)
              </div>
            </div>

            <div class="form-group">
              <label for="address">Store Address <span class="required">*</span></label>
              <input
                type="text"
                id="address"
                formControlName="address"
                class="form-control"
                [class.is-invalid]="hasError('address', 'required') || hasError('address', 'minlength')"
              >
              <div class="error-feedback" *ngIf="hasError('address', 'required')">
                Store address is required
              </div>
              <div class="error-feedback" *ngIf="hasError('address', 'minlength')">
                Address is too short, please enter complete address
              </div>
            </div>
          </div>

          <div class="form-group terms-group">
            <div class="checkbox-container">
              <input type="checkbox" id="terms" formControlName="termsAccepted">
              <label for="terms">I have read and agree to the <a href="#">Merchant Terms of Service</a> and <a href="#">Privacy Policy</a></label>
            </div>
            <div class="error-feedback" *ngIf="hasError('termsAccepted', 'required')">
              You must agree to the terms to continue
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="secondary-button" routerLink="/home">Cancel</button>
            <button
              type="submit"
              class="primary-button"
              [disabled]="isSubmitting || registerForm.invalid"
            >
              <i *ngIf="isSubmitting" class="fa-solid fa-spinner fa-spin"></i>
              <span *ngIf="!isSubmitting">Submit Application</span> <span *ngIf="isSubmitting">Processing...</span> </button> </div> </form>  <div class="benefits-section">   <h2>Benefits of Becoming a Merchant</h2>   <div class="benefits-grid"> <div class="benefit-card"> <div class="benefit-icon"> <i class="fa-solid fa-globe"></i>   </div>   <h3>Global Reach</h3>   <p>Connect with potential customers from around the world and expand your business.</p> </div>  <div class="benefit-card"> <div class="benefit-icon"> <i class="fa-solid fa-chart-line"></i>   </div>   <h3>Sales Analytics</h3>   <p>Track sales trends and customer behavior with our analytics tools.</p> </div>  <div class="benefit-card"> <div class="benefit-icon"> <i class="fa-solid fa-credit-card"></i>   </div>   <h3>Secure Payments</h3>   <p>Multiple payment methods with secure transaction guarantees.</p> </div>  <div class="benefit-card"> <div class="benefit-icon"> <i class="fa-solid fa-truck"></i>   </div>   <h3>Logistics Support</h3>   <p>Integrated logistics solutions for easy order delivery management.</p> </div> </div> </div> </div> </div>

  `,
  styles:[`
  .register-page {
  min-height: 100vh;
background-color: #f9fafb;
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.register-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.register-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1.1rem;
}

/* Success and Error Messages */
.success-message,
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.success-message {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.success-message i,
.error-message i {
  font-size: 1.25rem;
}

/* Form Sections */
.form-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

/* Form Groups */
.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

.required {
  color: #dc2626;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #0f172a;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px;
  padding-right: 2.5rem;
}

.error-feedback {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.375rem;
}

.form-text {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.375rem;
}

/* Checkbox Styles */
.terms-group {
  margin-top: 1.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
}

.checkbox-container label {
  margin-bottom: 0;
  font-size: 0.875rem;
  color: #475569;
}

.checkbox-container a {
  color: #3b82f6;
  text-decoration: none;
}

.checkbox-container a:hover {
  text-decoration: underline;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  margin-bottom: 2.5rem;
}

.primary-button,
.secondary-button {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.primary-button {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.primary-button:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}

.primary-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.secondary-button {
  background-color: white;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.secondary-button:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

/* Benefits Section */
.benefits-section {
  margin-top: 3rem;
  text-align: center;
}

.benefits-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 1.5rem;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.benefit-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.benefit-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ebf5ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.25rem;
}

.benefit-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.benefit-card p {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
.register-container {
    padding: 1rem;
  }

.form-actions {
    flex-direction: column-reverse;
  }

.form-actions button {
    width: 100%;
  }

.benefits-grid {
    grid-template-columns: 1fr;
  }
}
`]
})


export class MerchantRegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // 商家类别选项
  productCategories = [
    { id: 'ELECTRONICS', name: 'Electronics' },
    { id: 'CLOTHING', name: 'Clothing' },
    { id: 'HOME_APPLIANCES', name: 'Home Appliances' },
    { id: 'BOOKS', name: 'Books' },
    { id: 'FOOD', name: 'Food' },
    { id: 'BEAUTY', name: 'Beauty' },
    { id: 'SPORTS', name: 'Sports & Outdoors' },
    { id: 'TOYS', name: 'Toys' },
    { id: 'FURNITURE', name: 'Furniture' }
  ];

  constructor(
    private fb: FormBuilder,
    private merchantService: MerchantService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      storeName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      businessCategory: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      logo: [''],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    // 检查用户是否已登录
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    // 检查用户是否已是商家，但包装在try-catch中确保即使出错也能显示页面
    this.checkIfAlreadyMerchant();

    // 可以预填充一些字段
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.registerForm.patchValue({ contactEmail: email });
    }
  }

  // 抽取检查商家状态的逻辑到单独的方法
  checkIfAlreadyMerchant(): void {
    // 使用catchError操作符处理可能的错误
    this.merchantService.getMerchantProfile()
      .pipe(
        catchError(error => {
          console.log('User is not a merchant yet, showing registration form');
          return of(null);
        })
      )
      .subscribe(merchant => {
        if (!merchant) {
          // 用户已经是商家，重定向到商家仪表盘
          console.log('User is already a merchant, redirecting to dashboard');
          this.router.navigate(['/merchant/dashboard']);
        }
      });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // 标记所有字段为 touched，显示验证错误
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.registerForm.value;
    const userId = localStorage.getItem('userId') || '';

    // 创建商家对象
    const merchant: Partial<Merchant> = {
      userId: userId,
      storeName: formValue.storeName,
      description: formValue.description,
      logo: formValue.logo || 'assets/images/default-store-logo.png', // 默认logo
      contactEmail: formValue.contactEmail,
      contactPhone: formValue.contactPhone,
      address: formValue.address,
      // 这些字段将由服务端设置
      status: MerchantStatus.ACTIVE, // 默认为活跃状态，实际可能需要审核
      rating: 0, // 初始评分
    };

    this.merchantService.registerMerchant(merchant as Merchant).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Register Successfully! Now you can set your store and add products.';

        // 存储商家ID
        localStorage.setItem('merchantId', response.merchantId);
        localStorage.setItem('isMerchant', 'true');

        // 3秒后重定向到商家仪表盘
        setTimeout(() => {
          this.router.navigate(['/merchant/dashboard']);
        }, 3000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed registering. Try later.';
        console.error('Merchant registration error:', error);
      }
    });
  }

  // 辅助方法，用于简化模板中的表单验证
  hasError(controlName: string, errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
}
