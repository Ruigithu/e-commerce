import {Component, OnInit} from '@angular/core';
import { SigninComponentButton} from '../button/login/signin-button.component';
import {ProductService} from '../../../features/products/product.service';
import {ProductCategory} from '../../../features/products/product-category.model';
import {NgForOf, NgIf} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {UserMenuComponent} from './user-menu.component';

@Component({
  selector: 'app-header',
  template: `
    <div class="header">
      <div class="the-first-row">
        <img [src]="'assets/icons/shopper.png'" alt="logo" class="icon">
        <div class="search-bar">
          <input type="text" placeholder="search what you want to buy">
        </div>
        <div class="right-buttons">
          <ng-container *ngIf="isLoggedIn; else notLoggedIn">
            <button class="cart-button" (click)="navigateToCart()">
              <i class="fa-solid fa-cart-shopping" ></i>
            </button>
            <user-menu></user-menu>
          </ng-container>
          <ng-template #notLoggedIn>
            <signin-button></signin-button>
          </ng-template>
        </div>
      </div>
      <div class="the-second-row">
        <h4 class="category-item" [routerLink]="['/home']">Home</h4>
        <div *ngFor="let category of productCategories"
             (click)="navigateToSpecificCategory(category.categoryId)"
             class="category-item">
          <h4>{{category.name}}</h4>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header {
      display: grid;
      grid-template-rows: auto auto;
      border: none;
      width: auto;
    }

    .the-first-row {
      display: flex;
      flex-direction: row;
      padding: 30px;
      justify-content: space-between;
      align-items: center;
      background-color: #F5ECD5;
    }

    .icon {
      height: 65px;
      width: 65px;
    }

    input {
      width: 600px;
      height: 25px;
    }

    .the-second-row {
      display: flex;
      flex-direction: row;
      gap: 20px;
      padding: 10px 30px;
      margin-bottom: 0;
    }

    .right-buttons {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .cart-button {
      width: 50px;
      height: 50px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
    }

    .fa-cart-shopping {
      width: 35px;
      height: 35px;
      color: #3b4591;
    }
    .category-item {
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

  `],
  imports: [
    SigninComponentButton,
    NgForOf,
    NgIf,
    UserMenuComponent,
    RouterModule,
  ],
  standalone: true
})
export class Header implements OnInit {
  productCategories: ProductCategory[] = [];
  isLoggedIn = false;


  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProductCategory();
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const userId = localStorage.getItem('userId');
    this.isLoggedIn = !!userId;
  }

  loadProductCategory(): void {
    this.productService.getProductCategory().subscribe(
      (data) => {
        console.log('获取到的商品种类数据:', data);
        this.productCategories = data;
      },
      (error) => console.error('加载商品种类失败:', error)
    );
  }

  navigateToSpecificCategory(categoryId:string){
    this.router.navigate([`/product-list/${categoryId}`])
}

  navigateToCart() {
    this.router.navigate(['/go-to-cart']);
  }
}
