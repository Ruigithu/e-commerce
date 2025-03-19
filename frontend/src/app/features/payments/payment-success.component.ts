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
              private http: HttpClient) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
      if (this.orderId) {
        // Call your API to update the order status
        this.http.put(`http://localhost:8080/orders/updateStatus/${this.orderId}?status=PAID`, {},
          { responseType: 'text' })
          .subscribe({
            next: (response) => console.log('Order status updated:', response),
            error: (err) => console.error('Failed to update order status', err)
          });
      }
    });
  }
}
