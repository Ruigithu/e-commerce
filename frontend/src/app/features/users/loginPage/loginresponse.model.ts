import {Address} from '../addresss/address.model';

export interface LoginResponse {
  userId: String;
  userName:String;
  defaultAddress:Address;
}
