export interface Address {
  addressId: string;
  userId: string;
  addressLine: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  receiverName: string;  // 注意这里应该使用 camelCase
}
