import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '../../products/product.model';

export class UserAuthenticationService {
  private apiUrlGetUserInfo = 'https://gateway-production-4c59.up.railway.app/users/getUserInfo'; // 后端 API 地址


  constructor(private http: HttpClient) {}


}
