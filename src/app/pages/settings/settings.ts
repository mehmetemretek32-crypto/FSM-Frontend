import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile/profile.service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  profileMessage: string = '';
  passwordMessage: string = '';

  ngOnInit(): void {
    // Profil Formu
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Şifre Formu
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Şifrelerin eşleştiğini kontrol eden özel doğrulayıcı
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmNewPassword')?.value
      ? null : { mismatch: true };
  }

  onProfileSubmit() {
    if (this.profileForm.valid) {
      this.profileService.updateProfile(this.profileForm.value).subscribe({
        next: (res) => {
          this.profileMessage = 'Profil başarıyla güncellendi!';
          setTimeout(() => this.profileMessage = '', 3000);
        },
        error: (err) => console.error('Profil güncelleme hatası', err)
      });
    }
  }

  onPasswordSubmit() {
    if (this.passwordForm.valid) {
      this.profileService.changePassword(this.passwordForm.value).subscribe({
        next: (res) => {
          this.passwordMessage = 'Şifre başarıyla değiştirildi!';
          this.passwordForm.reset();
          setTimeout(() => this.passwordMessage = '', 3000);
        },
        error: (err) => console.error('Şifre değiştirme hatası', err)
      });
    }
  }
}