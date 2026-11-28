
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseOrder, PurchaseOrderRequest } from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  private readonly baseUrl =
    'https://procurement-management-system-production.up.railway.app/api/purchase-orders';

  constructor(private http: HttpClient) {}

  getPurchaseOrders(status?: string): Observable<PurchaseOrder[]> {
    let params = new HttpParams();

    if (status && status.trim()) {
      params = params.set('status', status.trim());
    }

    return this.http.get<PurchaseOrder[]>(this.baseUrl, { params });
  }

  getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  getPurchaseOrdersByRequisition(requisitionId: number): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.baseUrl}/requisition/${requisitionId}`);
  }

  getPurchaseOrdersBySupplier(supplierId: number): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.baseUrl}/supplier/${supplierId}`);
  }

  createPurchaseOrder(po: PurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.baseUrl, po);
  }

  updatePurchaseOrder(id: number, po: PurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.baseUrl}/${id}`, po);
  }

  updateStatus(id: number, status: string): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.baseUrl}/${id}/status`, { status });
  }

  deletePurchaseOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
