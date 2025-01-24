import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';


@Component({
  selector: 'app-payment',
  template: `
      <button (click)="redirectToCheckout()">Pay</button>
  `,
  styles: ` button {
    cursor: pointer;
    background-color: darkseagreen;
    width: 100px;
    height: 50px;
    border-radius: 10px;
    border: none;
    transition-delay: 0.2ms;
  }

  button:hover {
    background-color: seagreen;
  }`,
  standalone: true
})
export class PaymentComponent {
  private stripePromise = loadStripe('pk_test_51QkbM8GdsqdKUqpLbNg0xdvLmkCKvtCM1Lk34iR1iHPolLIdIb2CON4aDoPD6Uz7dB99Uv5cOYbgzoB22fsh8Z1M00OzQdhq0K'); // 替换为你的 Publishable Key

  constructor(private http: HttpClient) {}

  async redirectToCheckout() {
    this.http
      .post<{ id: string }>('http://localhost:8080/pay/create-checkout-session', {
        items: [{ id: 'product_id_123', quantity: 1 }],
      })
      .subscribe({
        next: async (response) => {
          const stripe = await loadStripe('pk_test_51QkbM8GdsqdKUqpLbNg0xdvLmkCKvtCM1Lk34iR1iHPolLIdIb2CON4aDoPD6Uz7dB99Uv5cOYbgzoB22fsh8Z1M00OzQdhq0K'); // 替换为你的 Publishable Key
          if (stripe) {
            stripe.redirectToCheckout({ sessionId: response.id });
          } else {
            console.error('Stripe failed to load');
          }
        },
        error: (error) => {
          console.error('Error creating checkout session:', error);
        },
      });
  }
}
