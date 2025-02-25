import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '../../products/product.model';

export class UserAuthenticationService {
  private apiUrlGetUserInfo = 'http://localhost:8080/users/getUserInfo'; // 后端 API 地址


  constructor(private http: HttpClient) {}


}
