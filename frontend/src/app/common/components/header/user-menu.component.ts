import {NgIf} from '@angular/common';
import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'user-menu',
  template: `
    <div class="user-menu">
      <button (click)="toggleMenu()" class="user-button">
        {{ userName }}
      </button>
      <div *ngIf="isMenuOpen" class="dropdown-menu">
        <button (click)="navigateToOrders()">my orders</button>
        <button (click)="navigateToAddress()">modify address</button>
        <button (click)="logout()">logout</button>
      </div>
    </div>
  `,
  styles: [`
    .user-menu {
      position: relative;
    }
    .user-button{
      width:80px;
      height:30px;
    }
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .dropdown-menu button {
      display: block;
      width: 100%;
      padding: 8px 16px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
    }
    .dropdown-menu button:hover {
      background: #f5f5f5;
    }
  `],
  standalone: true,
  imports: [NgIf]
})
export class UserMenuComponent {
  isMenuOpen = false;
  userName: string | null = localStorage.getItem('userName');

constructor(private router: Router ){

}
  toggleMenu() {
    console.log(localStorage.getItem('userName'));
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToOrders() {
    // 实现导航到订单页面的逻辑
    this.router.navigate(['/my-orders']);
  }

  navigateToAddress() {
    // 实现导航到地址页面的逻辑
    this.router.navigate(['/address']);
  }

  logout() {
    localStorage.removeItem('userId');
    // 添加登出后的重定向逻辑
  }

  protected readonly localStorage = localStorage;
}
