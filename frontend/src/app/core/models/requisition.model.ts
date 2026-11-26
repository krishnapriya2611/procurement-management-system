export interface RequisitionItem {
  productId?: number;
  productSku?: string;
  productName: string;
  quantity: number;
  estimatedPrice: number;
}

export interface PurchaseRequisition {
  requisitionId?: number;
  requestNumber: string;
  requestDate: string;
  department: string;
  requestedBy: string;
  requiredDate: string;
  status: string;
  remarks?: string;
  items: RequisitionItem[];
}
