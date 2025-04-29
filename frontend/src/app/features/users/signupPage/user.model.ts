export interface User {
  userId: string;

  isMerchant: boolean;    // 是否是商家
  merchantId?: string;    // 如果是商家，关联到商家ID
}
