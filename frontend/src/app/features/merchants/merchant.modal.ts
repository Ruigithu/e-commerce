// merchant.modal.ts
export enum MerchantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED'
}

export interface Merchant {
  merchantId: string;
  userId: string;         // 关联到用户账号
  storeName: string;      // 店铺名称
  description: string;    // 店铺描述
  logo: string;           // 店铺logo
  contactEmail: string;   // 联系邮箱
  contactPhone: string;   // 联系电话
  address: string;        // 店铺地址
  createdAt: string;      // 创建时间
  status: MerchantStatus; // 商家状态（活跃/暂停/关闭）
  rating: number;         // 评分（来自用户评价）
}
