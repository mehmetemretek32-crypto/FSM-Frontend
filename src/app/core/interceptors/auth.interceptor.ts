import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. LocalStorage'dan token'ı al
  // NOT: Token'ı kaydederken kullandığın isme ('token', 'jwt', vb.) dikkat et.
  const token = localStorage.getItem('token'); 

  // 2. Eğer token varsa, isteğin header'ına Bearer formatında ekle
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    // İstegi güncellenmiş haliyle yola devam ettir
    return next(authReq);
  }

  // 3. Token yoksa, isteği olduğu gibi gönder
  return next(req);
};