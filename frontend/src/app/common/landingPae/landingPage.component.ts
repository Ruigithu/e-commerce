import {Component} from '@angular/core';
import {Header} from '../components/header/header.component';
import {ProductListComponent} from '../../features/products/products-list/ product-list.component';

@Component({
  selector: `app-landing-page`,
  standalone: true,
  imports: [Header, ProductListComponent],
  template: `
    <div class="container">
      <app-header></app-header>
      <div class="main-content">
        <app-product-list></app-product-list>
      </div>
      <footer>
        made by rui peng
      </footer>
    </div>
  `,
  styles:[`
    .container{
      height: 100vh;
      width: 100vw;
      display: grid;
      grid-template-rows: 2fr 4fr 1fr;
      gap:0;
    }
    .main-content{
      border: 1px solid gray;
      text-align: center;
    }
    footer{
      text-align: center;
    }
  `]

})

export class LandingPage{

}
