import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import { Address } from './address.model';
import {environment} from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/users`; // 替换为实际的API地址
  private selectedAddressSource = new Subject<Address>();
  selectedAddress$ = this.selectedAddressSource.asObservable();

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses/${localStorage.getItem('userId')}`);
  }

  createAddress(address: Omit<Address, 'address_id'>): Observable<Address> {
    console.log(`address是`+address.addressLine);
    return this.http.post<Address>(`${this.apiUrl}/addAddress`, address);
  }

  updateAddress(address: Address): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/updateAddress/${address.addressId}`, address);
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteAddress/${addressId}`);
  }
  selectAddress(address: Address) {
    this.selectedAddressSource.next(address);
  }

  getAddressById(addressId:string):Observable<Address>{
    return this.http.get<Address>(`${this.apiUrl}/getAddressById/${addressId}`);
  }
}
