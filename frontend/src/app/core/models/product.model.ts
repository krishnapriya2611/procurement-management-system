export interface Product {
  productId?: number;
  sku: string;
  productName: string;
  description?: string;
  unit?: string;
  standardPrice: number;
  active: boolean;
}
