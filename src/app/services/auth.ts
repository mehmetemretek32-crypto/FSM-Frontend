import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode'; // 🆕

// 🆕 Token içindeki claim'lerin tipini tanımlıyoruz
interface DecodedToken {
  role?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/Auth`;

  isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));

  // 🆕 Rol bilgisini tutan sinyal — sayfa ilk açıldığında localStorage'daki token'dan okunur
  userRole = signal<string | null>(this.decodeRoleFromToken(localStorage.getItem('token')));

  // 🆕 Şablonlarda kolay kullanım için hazır kontrol sinyalleri
  isTechnician = computed(() => this.userRole() === 'Technician');
  isAdminOrDispatcher = computed(() => this.userRole() === 'Admin' || this.userRole() === 'Dispatcher');

  private decodeRoleFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // .NET'in ClaimTypes.Role'ü decode edilince genelde uzun bir URI anahtarıyla gelir,
      // bu yüzden hem kısa "role" hem de o uzun anahtarı kontrol ediyoruz.
      return decoded.role
        ?? decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        ?? null;
    } catch {
      return null;
    }
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap((response: any) => {
        const token = response.token;
        if (token) {
          localStorage.setItem('token', token);
          this.isLoggedIn.set(true);
          this.userRole.set(this.decodeRoleFromToken(token)); // 🆕
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
    this.userRole.set(null); // 🆕
  }
}