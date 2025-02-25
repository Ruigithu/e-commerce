import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import { Address } from './address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http:localhost:8080/users/addresses'; // 替换为实际的API地址
  private selectedAddressSource = new Subject<Address>();
  selectedAddress$ = this.selectedAddressSource.asObservable();

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`http://localhost:8080/users/addresses/${localStorage.getItem('userId')}`);
  }

  createAddress(address: Omit<Address, 'address_id'>): Observable<Address> {
    console.log(`address是`+address.addressLine);
    return this.http.post<Address>(`http://localhost:8080/users/addAddress`, address);
  }

  updateAddress(address: Address): Observable<Address> {
    return this.http.put<Address>(`http://localhost:8080/users/addresses/${address.addressId}`, address);
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/users/addresses/${addressId}`);
  }
  selectAddress(address: Address) {
    this.selectedAddressSource.next(address);
  }
}
