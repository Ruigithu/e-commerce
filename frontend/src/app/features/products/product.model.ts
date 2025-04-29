export interface Product {
  productId: string;
  merchantId: string;     // 新增：关联商家ID
  name: string;
  price: number;
  description: string;
  stock: number;
  categoryId: string;     // 分类ID
  images: string[];       // 产品图片数组
  status: ProductStatus;  // 新增：产品状态
  createdAt: string;      // 新增：创建时间
  updatedAt: string;      // 新增：更新时间
  imageUrl:string;
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',      // 上架中
  INACTIVE = 'INACTIVE',  // 下架中
  DELETED = 'DELETED'     // 已删除
}
