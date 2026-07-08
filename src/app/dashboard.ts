import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO İnterfacelerimiz (Sınıfın dışında, en üstte!)
export interface CreateWorkOrderRequest {
  title: string;
  customerId: number;
  description: string;
  status: string;
}

export interface UpdateWorkOrderRequest {
  id: number;
  title: string;
  description: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7190/api';

  // 1. Dashboard İstatistiklerini Çekme
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Dashboard/stats`);
  }

  // 2. İş Emirlerini Listeleme (GET)
  getWorkOrders(status?: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/WorkOrders`);
  }

  // 3. Yeni İş Emri Ekleme (POST)
  createWorkOrder(request: CreateWorkOrderRequest): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/WorkOrders`, request);
  }

  // 4. İŞ EMRİ GÜNCELLEME (PUT) - BURASI EKSİKTİ!
  updateWorkOrder(id: number, request: UpdateWorkOrderRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/WorkOrders/${id}`, request);
  }

  // 5. İŞ EMRİ SİLME / PASİFE ÇEKME (DELETE) - HATA VEREN METOT BU!
  deleteWorkOrder(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/WorkOrders/${id}`);
  }
}