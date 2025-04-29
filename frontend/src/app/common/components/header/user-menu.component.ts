import {NgClass, NgIf} from '@angular/common';
import {Component, HostListener} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'user-menu',
  template: `
    <div class="user-menu">
      <button (click)="toggleMenu()" class="user-button">
        <div class="avatar">{{ getUserInitials() }}</div>
        <span class="username">{{ userName }}</span>
        <i class="fa-solid" [ngClass]="isMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </button>

      <div *ngIf="isMenuOpen" class="dropdown-menu">
        <div class="menu-header">
          <div class="avatar large">{{ getUserInitials() }}</div>
          <div class="user-info">
            <span class="full-name">{{ userName }}</span>
            <span class="email">user &#64;example.com</span>
          </div>
        </div>

        <div class="menu-divider"></div>

        <button (click)="navigateToOrders()" class="menu-item">
          <i class="fa-solid fa-box"></i>
          <span>My Orders</span>
        </button>

        <button (click)="navigateToAddress()" class="menu-item">
          <i class="fa-solid fa-location-dot"></i>
          <span>Manage Addresses</span>
        </button>

        <button (click)="navigateToMerchantDashboard()" class="menu-item">
          <i class="fa-solid fa-location-dot"></i>
          <span>Merchant Dashboard</span>
        </button>

        <div class="menu-divider"></div>

        <button (click)="logout()" class="menu-item logout">
          <i class="fa-solid fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .user-menu {
      position: relative;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 24px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .user-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #578E7E;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 0.8rem;
    }

    .avatar.large {
      width: 48px;
      height: 48px;
      font-size: 1rem;
    }

    .username {
      font-weight: 500;
      color: #333;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: white;
      border-radius: 8px;
      min-width: 220px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 100;
      overflow: hidden;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .full-name {
      font-weight: 500;
      color: #333;
    }

    .email {
      font-size: 0.8rem;
      color: #666;
    }

    .menu-divider {
      height: 1px;
      background-color: #eee;
      margin: 0.25rem 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.2s;
      color: #333;
    }

    .menu-item:hover {
      background-color: #f5f5f5;
    }

    .menu-item.logout {
      color: #e53935;
    }

    .menu-item.logout:hover {
      background-color: rgba(229, 57, 53, 0.1);
    }
  `],
  standalone: true,
  imports: [NgIf, NgClass]
})
export class UserMenuComponent {
  isMenuOpen = false;
  userName: string | null = localStorage.getItem('userName') || 'User';

  constructor(private router: Router) {}

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    if (!(event.target as HTMLElement).closest('.user-menu')) {
      this.isMenuOpen = false;
    }
  }

  getUserInitials(): string {
    if (!this.userName) return 'U';
    return this.userName.charAt(0).toUpperCase();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToOrders() {
    this.router.navigate(['/my-orders']);
    this.isMenuOpen = false;
  }

  navigateToAddress() {
    this.router.navigate(['/address']);
    this.isMenuOpen = false;
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    this.router.navigate(['/home']);
    this.isMenuOpen = false;
  }

  navigateToMerchantDashboard() {
    this.router.navigate(['/merchant/dashboard'])
    this.isMenuOpen=false;
  }
}
