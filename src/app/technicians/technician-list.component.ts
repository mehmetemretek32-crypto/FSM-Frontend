import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule, Validators
} from '@angular/forms';
import {
  LucideAngularModule, Wrench, RefreshCw, Plus, Phone, Mail,
  CheckCircle2, AlertTriangle, Loader2, UserX, X
} from 'lucide-angular';
import { finalize } from 'rxjs';
import { TechnicianService } from '../services/technician.service';
import { TechnicianDto, WorkloadLevel } from '../models/technician.model';

@Component({
  selector: 'app-technician-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './technician-list.component.html'
})
export class TechnicianListComponent implements OnInit {
  private technicianService = inject(TechnicianService);
  private fb = inject(FormBuilder);

  // İkonlar
  readonly Wrench = Wrench;
  readonly RefreshCw = RefreshCw;
  readonly Plus = Plus;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertTriangle = AlertTriangle;
  readonly Loader2 = Loader2;
  readonly UserX = UserX;
  readonly X = X;

  // Reaktif state
  technicians = signal<TechnicianDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  togglingId = signal<number | null>(null);

  // Oluşturma modalı
  isModalOpen = signal<boolean>(false);
  submitting = signal<boolean>(false);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required]],
    isAvailable: [true]
  });

  ngOnInit(): void {
    this.loadTechnicians();
  }

  loadTechnicians(): void {
    this.loading.set(true);
    this.error.set(null);
    this.technicianService.getTechnicians()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.technicians.set(data ?? []),
        error: () => this.error.set('Teknisyenler yüklenemedi. Backend bağlantısını kontrol edin.')
      });
  }

  // --- İş yükü göstergesi mantığı ---
  workloadLevel(count: number): WorkloadLevel {
    if (count <= 0) return 'available';
    if (count <= 3) return 'moderate';
    return 'heavy';
  }

  workloadLabel(count: number): string {
    switch (this.workloadLevel(count)) {
      case 'available': return 'Atamaya Uygun';
      case 'moderate': return 'Orta Yoğunluk';
      default: return 'Yoğun İş Yükü';
    }
  }

  // Progress bar için yüzde (5+ işi full kabul ediyoruz)
  workloadPercent(count: number): number {
    return Math.min(100, (count / 5) * 100);
  }

  // --- Müsaitlik hızlı aksiyonu (PATCH) ---
  toggleAvailability(tech: TechnicianDto): void {
    const next = !tech.isAvailable;
    this.togglingId.set(tech.id);
    // Optimistik güncelleme
    this.patchLocal(tech.id, { isAvailable: next });

    this.technicianService.setAvailability(tech.id, next)
      .pipe(finalize(() => this.togglingId.set(null)))
      .subscribe({
        error: () => {
          // Hata durumunda geri al
          this.patchLocal(tech.id, { isAvailable: !next });
          this.error.set('Müsaitlik durumu güncellenemedi.');
        }
      });
  }

  private patchLocal(id: number, patch: Partial<TechnicianDto>): void {
    this.technicians.update(list =>
      list.map(t => (t.id === id ? { ...t, ...patch } : t))
    );
  }

  // --- Oluşturma modalı ---
  openModal(): void {
    this.form.reset({ fullName: '', email: '', phoneNumber: '', isAvailable: true });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.technicianService.createTechnician(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadTechnicians();
        },
        error: () => this.error.set('Teknisyen oluşturulamadı.')
      });
  }
}
