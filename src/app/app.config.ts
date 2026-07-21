import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // Yolunu kontrol et

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // HttpClient'ı sağlarken Interceptor'ımızı da devreye sokuyoruz
    provideHttpClient(withInterceptors([authInterceptor])) 
  ]
};