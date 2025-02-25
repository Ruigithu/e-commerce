import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-payment-success',
  template: `<h1>Payment Successful!</h1><p>Thank you for your purchase.</p>`,
  standalone: true
})
export class PaymentSuccessComponent {
  orderId: string | null = null;

  constructor(private route: ActivatedRoute,
              private http:HttpClient) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId']; // 从URL获取orderId
      if (this.orderId) {
        this.updateOrderStatus(this.orderId);
      }
    });
  }

  updateOrderStatus(orderId: string) {
    this.http.post('http://localhost:8080/orders/update-payment-status', { orderId })
      .subscribe(
        response => console.log('Order status updated successfully', response),
        error => console.error('Failed to update order status', error)
      );
  }
}
