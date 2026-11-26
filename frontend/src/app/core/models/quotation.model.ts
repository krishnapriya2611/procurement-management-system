import { Supplier } from './supplier.model';
import { PurchaseRequisition } from './requisition.model';

export interface Quotation {
  quotationId?: number;
  quotationNumber: string;
  supplier?: Supplier;
  purchaseRequisition?: PurchaseRequisition;
  quotationDate: string;
  validityDate: string;
  quotedAmount: number;
  deliveryDays: number;
  status: string;
}

export interface QuotationRequest {
  quotationNumber?: string;
  supplierId: number;
  requisitionId: number;
  quotationDate?: string;
  validityDate: string;
  quotedAmount: number;
  deliveryDays: number;
  status?: string;
}

export interface QuotationItemDTO {
  quotationId: number;
  quotationNumber: string;
  supplierId: number;
  supplierCode: string;
  supplierCompanyName: string;
  quotationDate: string;
  validityDate: string;
  quotedAmount: number;
  deliveryDays: number;
  status: string;
}

export interface QuotationComparison {
  requisitionId: number;
  requestNumber: string;
  department: string;
  requiredDate: string;
  quotations: QuotationItemDTO[];
}
