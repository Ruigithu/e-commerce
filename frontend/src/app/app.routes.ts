import { Routes } from '@angular/router';
import {ProductListComponent} from './features/products/products-list/product-list.component';
import {LandingPage} from './common/landingPae/landingPage.component';
import {LoginPageComponent} from './features/users/loginPage/login-page.component';
import {SignupPageComponent} from './features/users/signupPage/signupPage.component';
import {ProductInfoComponent} from './features/products/products-info/product-info.component';
import {OrderInfoComponent} from './features/orders/order.component';
import {PaymentCancelledComponent} from './features/payments/payment-failure.component';
import {PaymentSuccessComponent} from './features/payments/payment-success.component';
import {ShoppingCartComponent} from './features/orders/carts/cart.component';
import {SpecificCategoryComponent} from './features/products/products-list/specific-category.component';
import {AddressListComponent} from './features/users/addresss/address-list/address-list.component';
import {AddressFormComponent} from './features/users/addresss/address-list/address-form.component';
import {MyOrdersComponent} from './features/orders/my-orders/my-orders.component';

export const routes: Routes = [
  {path: '', component: LandingPage, pathMatch: 'full'},  // 添加 pathMatch: 'full'
  {path:'products', component: ProductListComponent },
  {path:'login',component:LoginPageComponent},
  {path:'signup',component:SignupPageComponent},
  {path:'home',component:LandingPage},
  {path:'product/:productId',component:ProductInfoComponent},
  {path:'createOrder',component:OrderInfoComponent},
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-cancelled', component: PaymentCancelledComponent },
  { path: 'go-to-cart', component: ShoppingCartComponent },
  {path: 'product-list/:categoryId', component: SpecificCategoryComponent},
  {path: 'address', component: AddressListComponent},
  {path: 'modify-address', component: AddressFormComponent},
  {path: 'my-orders', component: MyOrdersComponent},

];
