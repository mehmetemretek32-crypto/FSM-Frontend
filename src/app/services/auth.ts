import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // .NET API adresin
  private apiUrl = `${environment.apiUrl}/Auth`;

  // Giriş durumunu takip eden reaktif sinyal
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));

  // Giriş İsteği
  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap((response: any) => {
        const token = response.token; 
        if (token) {
          localStorage.setItem('token', token);
          this.isLoggedIn.set(true); // Giriş başarılı bayrağını tetikliyoruz
        }
      })
    );
  }

  // Kayıt İsteği
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Çıkış Yapma
  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
  }
}