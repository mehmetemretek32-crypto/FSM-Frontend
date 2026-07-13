import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CreateInventoryRequest, InventoryItem, UpdateInventoryRequest
} from './inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  // Diğer modüllerle tutarlı: backend base URL sabit (proje henüz environment.apiUrl kullanmıyor).
  private baseUrl = 'https://localhost:7190/api/Inventories';

  // GET /api/Inventories
  getInventories(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  // POST /api/Inventories -> oluşturulan id döner
  createInventory(request: CreateInventoryRequest): Observable<number> {
    return this.http.post<number>(this.baseUrl, request).pipe(catchError(this.handleError));
  }

  // PUT /api/Inventories
  updateInventory(request: UpdateInventoryRequest): Observable<void> {
    return this.http.put<void>(this.baseUrl, request).pipe(catchError(this.handleError));
  }

  // DELETE /api/Inventories/{id}
  deleteInventory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    const message = error.error instanceof ErrorEvent
      ? `İstemci hatası: ${error.error.message}`
      : `Sunucu hatası (${error.status}): ${error.message}`;
    console.error('[InventoryService]', message);
    return throwError(() => new Error(message));
  }
}
