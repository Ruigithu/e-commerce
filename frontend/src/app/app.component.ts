import { Component } from '@angular/core';
import {ProductListComponent} from './features/products/ product-list.component';
import {RouterOutlet} from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [ProductListComponent, RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ecommerce-frontend';
}


