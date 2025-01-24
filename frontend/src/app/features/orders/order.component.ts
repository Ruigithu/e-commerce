import {Component} from '@angular/core';
import {PaymentComponent} from '../payments/payment.component';

@Component({
  selector: `specific-order`,
  standalone: true,
  template: `
    <div class="container">
      <h2>specific order</h2>
      <div class="item-card">
        <div>item name:</div>
        <br>
        <div>price:</div>
        <br>
        <div>quantity:</div>
        <br>
        <div>total price:</div>
        <br>
      </div>
      <div class="order-info">
        <div>order id:</div>
        <br>
        <div>receiver:</div>
        <br>
        <div>address:</div>
        <br>
      </div>
      <app-payment></app-payment>
    </div>
  `,
  imports: [
    PaymentComponent
  ],
  styles: `
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: 100vh;
      width: 100%;
    }

    .item-card {
      width: 300px;
      border: 1px solid darkseagreen;
      margin-bottom: 50px;
      padding: 10px;
    }

    .order-info {
      width: 300px;
      border: 1px solid darkseagreen;
      margin-bottom: 20px;
      padding: 10px;
    }

    button {
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
    }
  `
})

export class OrderInfoComponent{}
