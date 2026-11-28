
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseRequisition } from '../models/requisition.model';

@Injectable({
  providedIn: 'root'
})
export class RequisitionService {

  private readonly baseUrl =
    'https://procurement-management-system-production.up.railway.app/api/requisitions';

  constructor(private http: HttpClient) {}

  getRequisitions(search?: string, status?: string): Observable<PurchaseRequisition[]> {
    let params = new HttpParams();

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (status && status.trim()) {
      params = params.set('status', status.trim());
    }

    return this.http.get<PurchaseRequisition[]>(this.baseUrl, { params });
  }

  getRequisitionById(id: number): Observable<PurchaseRequisition> {
    return this.http.get<PurchaseRequisition>(`${this.baseUrl}/${id}`);
  }

  createRequisition(requisition: PurchaseRequisition): Observable<PurchaseRequisition> {
    return this.http.post<PurchaseRequisition>(this.baseUrl, requisition);
  }

  updateRequisition(id: number, requisition: PurchaseRequisition): Observable<PurchaseRequisition> {
    return this.http.put<PurchaseRequisition>(`${this.baseUrl}/${id}`, requisition);
  }

  updateStatus(id: number, status: string): Observable<PurchaseRequisition> {
    return this.http.patch<PurchaseRequisition>(`${this.baseUrl}/${id}/status`, { status });
  }

  deleteRequisition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
