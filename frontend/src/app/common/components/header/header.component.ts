import {Component} from '@angular/core';
import { SigninComponentButton} from '../button/login/signin-button.component';

@Component({
  selector: `app-header`,
  template: `
    <div class="header">
      <div class="the-first-row">
        <i>icon</i>
        <div class="search-bar">
          <input type="text">
        </div>
        <signin-button></signin-button>
      </div>
      <div class="the-second-row">
        <p>All Products</p>
        <p>For young Adult</p>
        <p>Books</p>
      </div>
    </div>
  `,
  imports: [
    SigninComponentButton
  ],
  standalone: true,
  styles: [`

    .header {
      display: grid;
      grid-template-rows: 1fr 1fr;
      padding: 10px;
      border: 1px solid gray;
    }

    .the-first-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }

    .the-second-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }`
  ]

})

export class Header{


}
