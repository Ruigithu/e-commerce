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
    .container {
      min-height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
    }
    app-header{
      margin-bottom: 0;
    }

    .main-content {
      flex: 1;
      margin-top: 0;
      padding: 0;
    }
    app-product-list{
      margin-top: 0;
    }

    footer {
      text-align: center;
      padding: 20px 0;
    }
  `]

})

export class LandingPage{

}
