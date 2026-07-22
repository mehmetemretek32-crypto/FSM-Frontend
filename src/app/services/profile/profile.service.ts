import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Backend'den beklediğimiz Request nesneleri
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  // HttpClient'ı inject ediyoruz
  private http = inject(HttpClient);
  
  // API URL'in (kendi backend portuna göre ayarla)
  private apiUrl = `${environment.apiUrl}/Users`;

  // Profil Güncelleme İsteği
  updateProfile(request: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-profile`, request);
  }

  // Şifre Değiştirme İsteği
  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, request);
  }
}