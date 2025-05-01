import {Address} from '../addresss/address.model';

export interface LoginResponse {
  isMerchant:boolean;
  userId: String;
  userName:String;
  merchantId:String;
  defaultAddress:Address;
}
