import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTechnicianRequest, TechnicianDto } from '../models/technician.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Technicians`;

  // GET /api/Technicians
  getTechnicians(): Observable<TechnicianDto[]> {
    return this.http.get<TechnicianDto[]>(this.baseUrl);
  }

  // POST /api/Technicians -> oluşturulan id döner
  createTechnician(request: CreateTechnicianRequest): Observable<number> {
    return this.http.post<number>(this.baseUrl, request);
  }

  // PATCH /api/Technicians/{id}/availability?isAvailable={bool}
  setAvailability(id: number, isAvailable: boolean): Observable<void> {
    const params = new HttpParams().set('isAvailable', isAvailable);
    return this.http.patch<void>(`${this.baseUrl}/${id}/availability`, null, { params });
  }
}
