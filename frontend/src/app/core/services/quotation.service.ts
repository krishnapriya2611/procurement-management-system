import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quotation, QuotationComparison, QuotationRequest } from '../models/quotation.model';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private readonly baseUrl = `${environment.apiUrl}/quotations`;

  constructor(private http: HttpClient) {}

  getQuotations(status?: string): Observable<Quotation[]> {
    let params = new HttpParams();
    if (status && status.trim()) {
      params = params.set('status', status.trim());
    }
    return this.http.get<Quotation[]>(this.baseUrl, { params });
  }

  getQuotationById(id: number): Observable<Quotation> {
    return this.http.get<Quotation>(`${this.baseUrl}/${id}`);
  }

  getQuotationsByRequisition(requisitionId: number): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(`${this.baseUrl}/requisition/${requisitionId}`);
  }

  compareQuotations(requisitionId: number): Observable<QuotationComparison> {
    return this.http.get<QuotationComparison>(`${this.baseUrl}/compare/${requisitionId}`);
  }

  createQuotation(quotation: QuotationRequest): Observable<Quotation> {
    return this.http.post<Quotation>(this.baseUrl, quotation);
  }

  updateQuotation(id: number, quotation: QuotationRequest): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.baseUrl}/${id}`, quotation);
  }

  updateStatus(id: number, status: string): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.baseUrl}/${id}/status`, { status });
  }

  deleteQuotation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
