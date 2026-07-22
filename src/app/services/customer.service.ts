import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCustomerRequest, CustomerDto, CustomerWorkOrder } from '../models/customer.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Customers`;

  // GET /api/Customers
  getCustomers(): Observable<CustomerDto[]> {
    return this.http.get<CustomerDto[]>(this.baseUrl);
  }

  // POST /api/Customers -> oluşturulan id döner
  createCustomer(request: CreateCustomerRequest): Observable<number> {
    return this.http.post<number>(this.baseUrl, request);
  }

  // GET /api/Customers/{id}/workorders -> timeline için iş emri geçmişi
  getCustomerWorkOrders(id: number): Observable<CustomerWorkOrder[]> {
    return this.http.get<CustomerWorkOrder[]>(`${this.baseUrl}/${id}/workorders`);
  }
}
