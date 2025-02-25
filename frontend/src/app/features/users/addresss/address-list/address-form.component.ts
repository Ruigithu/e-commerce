import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Address } from '../address.model';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  template: `
    <form [formGroup]="addressForm" (ngSubmit)="onSubmit()" class="address-form-modal__form">
      <div class="form-group">
        <label class="form-group__label">Recipient Name</label>
        <input
          type="text"
          formControlName="receiver_name"
          class="form-group__input"
          placeholder="Enter recipient name"
        >
        <div *ngIf="addressForm.get('receiver_name')?.errors?.['required'] &&
               addressForm.get('receiver_name')?.touched"
             class="form-group__error">
          Please enter recipient name
        </div>
      </div>

      <div class="form-group">
        <label class="form-group__label">Street Address</label>
        <input
          type="text"
          formControlName="address_line"
          class="form-group__input"
          placeholder="Enter street address"
        >
        <div *ngIf="addressForm.get('address_line')?.errors?.['required'] &&
               addressForm.get('address_line')?.touched"
             class="form-group__error">
          Please enter street address
        </div>
      </div>

      <div class="form-group">
        <label class="form-group__label">City</label>
        <input
          type="text"
          formControlName="city"
          class="form-group__input"
          placeholder="Enter city"
        >
        <div *ngIf="addressForm.get('city')?.errors?.['required'] &&
               addressForm.get('city')?.touched"
             class="form-group__error">
          Please enter city
        </div>
      </div>

      <div class="form-group">
        <label class="form-group__label">Postal Code</label>
        <input
          type="text"
          formControlName="postal_code"
          class="form-group__input"
          placeholder="Enter postal code"
        >
        <div *ngIf="addressForm.get('postal_code')?.errors?.['required'] &&
               addressForm.get('postal_code')?.touched"
             class="form-group__error">
          Please enter postal code
        </div>
      </div>

      <div class="form-group">
        <label class="form-group__label">Phone Number</label>
        <input
          type="tel"
          formControlName="phone"
          class="form-group__input"
          placeholder="Enter phone number"
        >
        <div *ngIf="addressForm.get('phone')?.errors?.['required'] &&
               addressForm.get('phone')?.touched"
             class="form-group__error">
          Please enter phone number
        </div>
        <div *ngIf="addressForm.get('phone')?.errors?.['pattern'] &&
               addressForm.get('phone')?.touched"
             class="form-group__error">
          Please enter a valid phone number
        </div>
      </div>

      <div class="checkbox-group">
        <input
          type="checkbox"
          formControlName="is_default"
          class="checkbox-group__input"
        >
        <label class="checkbox-group__label">Set as default address</label>
      </div>

      <div class="button-group">
        <button
          type="button"
          class="btn btn-outline"
          (click)="onCancel()"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="!addressForm.valid"
        >
          Save
        </button>
      </div>
    </form>
  `,

  styleUrl:`./address-form.style.css`
})
export class AddressFormComponent implements OnInit {
  @Input() address: Address | null = null;
  @Output() formSubmit = new EventEmitter<Address>();
  @Output() formCancel = new EventEmitter<void>();

  addressForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      receiver_name:['', Validators.required],
      address_line: ['', Validators.required],
      city: ['', Validators.required],
      postal_code: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^1[3-9]\d{9}$/)]],
      is_default: [false]
    });
  }

  ngOnInit() {
    if (this.address) {
      this.addressForm.patchValue(this.address);
    }
  }

  onSubmit() {
    if (this.addressForm.valid) {
      const formValue = this.addressForm.value;
      const userId=localStorage.getItem("userId");

      const addressObject: Address = {
        addressId: this.address?.addressId || '',
        userId:userId||'',
        addressLine: formValue.address_line,
        city: formValue.city,
        postalCode: formValue.postal_code,
        phone: formValue.phone,
        isDefault: formValue.is_default,
        createdAt: this.address?.createdAt || new Date().toISOString(),
        receiverName: formValue.receiver_name || ''
      };

      console.log('提交的数据:', addressObject);
      this.formSubmit.emit(addressObject);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
