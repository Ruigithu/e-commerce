import { Component, OnInit } from '@angular/core';
import { AddressService } from '../address.service';
import { Address } from '../address.model';
import {AddressFormComponent} from './address-form.component';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [AddressFormComponent, CommonModule],
  template: `
    <div class="address-container">
      <div class="address-card">
        <div class="address-card__header">
          <button *ngIf="returnUrl" (click)="goBack()" class="btn btn-icon">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h2 class="address-card__title">
            {{ selectionMode ? '选择收货地址' : '地址管理' }}
          </h2>
          <button class="btn btn-primary btn-icon" (click)="openAddressForm()">
            <i class="fas fa-plus"></i>新建地址
          </button>
        </div>

        <div class="p-4">
          <div *ngFor="let address of addresses"
               class="address-item"
               [class.selectable]="selectionMode"
               (click)="selectionMode ? selectAddress(address) : null">
            <div class="address-item__content">
              <div class="address-item__info">
                <div class="address-item__line">
                  <span class="address-item__text">{{address.addressLine}}</span>
                  <span *ngIf="address.isDefault" class="address-item__default-badge">
                    默认
                  </span>
                </div>
                <div class="address-item__details">
                  {{address.city}} {{address.postalCode}}
                </div>
                <div class="address-item__details">
                  {{address.phone}}
                </div>
              </div>
              <div class="address-item__actions" *ngIf="!selectionMode">
                <button class="btn btn-outline btn-icon" (click)="editAddress(address)">
                  <i class="fas fa-edit"></i>Edit
                </button>
                <button class="btn btn-outline btn-icon" (click)="deleteAddress(address.addressId)">
                  <i class="fas fa-trash"></i>Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <app-address-form
        *ngIf="isFormVisible"
        [address]="selectedAddress"
        (formSubmit)="handleFormSubmit($event)"
        (formCancel)="closeAddressForm()">
      </app-address-form>
    </div>
  `,
  styleUrl: './address-list.style.css'
})
export class AddressListComponent implements OnInit {
  addresses: Address[] = [];
  isFormVisible = false;
  selectedAddress: Address | null = null;
  selectionMode = false;
  returnUrl: string | null = null;

  constructor(
    private addressService: AddressService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAddresses();
    this.route.queryParams.subscribe(params => {
      this.selectionMode = params['mode'] === 'selection';
      this.returnUrl = params['returnUrl'];
    });
  }

  loadAddresses() {
    this.addressService.getAddresses().subscribe(addresses => {
      this.addresses = addresses;
    });
  }

  selectAddress(address: Address) {
    if (!this.selectionMode) return;

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
      this.addressService.deleteAddress(addressId).subscribe(() => {
        this.loadAddresses();
      });
    }
  }

  handleFormSubmit(address: Address) {
console.log(`调用创建前`+address.addressLine);
    const operation = this.selectedAddress
      ? this.addressService.updateAddress(address)
      : this.addressService.createAddress(address);

    operation.subscribe(result => {
      if (this.selectedAddress) {
        this.addresses = this.addresses.map(addr =>
          addr.addressId === result.addressId ? result : addr
        );
      } else {
        this.addresses.push(result);
      }
      this.closeAddressForm();
    });
  }
}
