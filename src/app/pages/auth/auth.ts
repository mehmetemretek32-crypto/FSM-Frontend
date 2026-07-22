import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
 // Yolunu kendi klasörüne göre ayarla

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html'
})
export class AuthComponent {
  isLoginMode = true;
  loginForm: FormGroup;
  registerForm: FormGroup;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService); // Servisimizi inject ettik

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.loginForm.reset();
    this.registerForm.reset();
  }

  // GİRİŞ YAP TETİKLENDİĞİNDE
 onLoginSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Token kaydedildi ve AuthService içindeki isLoggedIn = true oldu!
        },
        error: (err) => {
          console.error('Giriş Başarısız:', err);
          alert('Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
        }
      });
    }
  }

  // KAYIT OL TETİKLENDİĞİNDE
  onRegisterSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          // Kayıt başarılı olduğunda kullanıcıyı giriş ekranına kaydırıyoruz
          alert('Kayıt başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
          this.toggleMode(); 
        },
        error: (err) => {
          console.error('Kayıt Başarısız:', err);
          alert(err.error?.message || 'Kayıt olurken bir hata oluştu. Bu e-posta kullanılıyor olabilir.');
        }
      });
    }
  }
}