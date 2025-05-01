import { Injectable } from '@angular/core';

interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private container: HTMLDivElement | null = null;

  constructor() {
    // 创建消息容器
    this.createContainer();
  }

  private createContainer() {
    // 如果容器已存在，不再创建
    if (document.getElementById('toast-container')) return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;

    document.body.appendChild(this.container);
  }

  showSuccess(message: string, duration: number = 3000): void {
    this.showToast({
      message,
      type: 'success',
      duration
    });
  }

  showError(message: string, duration: number = 4000): void {
    this.showToast({
      message,
      type: 'error',
      duration
    });
  }

  showWarning(message: string, duration: number = 3500): void {
    this.showToast({
      message,
      type: 'warning',
      duration
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.showToast({
      message,
      type: 'info',
      duration
    });
  }

  private showToast(options: ToastOptions): void {
    if (!this.container) this.createContainer();

    // 创建 toast 元素
    const toast = document.createElement('div');

    // 设置 toast 样式基于类型
    const backgroundColor = this.getBackgroundColor(options.type);
    const icon = this.getIcon(options.type);

    toast.style.cssText = `
      padding: 12px 16px;
      background-color: ${backgroundColor};
      color: white;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      min-width: 300px;
      max-width: 450px;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      pointer-events: auto;
    `;

    // 添加内容
    toast.innerHTML = `
      <div style="margin-right: 12px;">${icon}</div>
      <div>${options.message}</div>
    `;

    // 添加关闭按钮
    const closeButton = document.createElement('div');
    closeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor: pointer; margin-left: auto;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeButton.style.cssText = `
      margin-left: auto;
      cursor: pointer;
    `;
    closeButton.onclick = () => this.closeToast(toast);

    toast.appendChild(closeButton);

    // 添加到容器
    this.container?.appendChild(toast);

    // 触发渐入动画
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    // 设置消失计时器
    const duration = options.duration || 3000;
    setTimeout(() => {
      this.closeToast(toast);
    }, duration);
  }

  private closeToast(toast: HTMLDivElement): void {
    // 添加淡出动画
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';

    // 动画结束后移除元素
    setTimeout(() => {
      if (toast.parentNode === this.container) {
        this.container?.removeChild(toast);
      }
    }, 300);
  }

  private getBackgroundColor(type: string): string {
    switch (type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#4caf50';
    }
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'success':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>`;
      case 'error':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>`;
      case 'warning':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>`;
      case 'info':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>`;
      default:
        return '';
    }
  }
}
