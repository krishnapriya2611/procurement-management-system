import { Supplier } from './supplier.model';
import { PurchaseRequisition } from './requisition.model';

export interface PurchaseOrder {
  purchaseOrderId?: number;
  poNumber: string;
  supplier?: Supplier;
  purchaseRequisition?: PurchaseRequisition;
  orderDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  status: string;
}

export interface PurchaseOrderRequest {
  poNumber?: string;
  supplierId: number;
  requisitionId: number;
  orderDate?: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  status?: string;
}
