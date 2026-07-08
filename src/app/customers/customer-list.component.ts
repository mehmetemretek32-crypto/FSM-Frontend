import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, ReactiveFormsModule, Validators
} from '@angular/forms';
import {
  LucideAngularModule, Users, RefreshCw, Plus, Phone, Mail, MapPin,
  Building2, History, AlertTriangle, Loader2, UserX, X, ClipboardList
} from 'lucide-angular';
import { finalize } from 'rxjs';
import { CustomerService } from '../services/customer.service';
import { CustomerDto, CustomerWorkOrder } from '../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private fb = inject(FormBuilder);

  // İkonlar
  readonly Users = Users;
  readonly RefreshCw = RefreshCw;
  readonly Plus = Plus;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly Building2 = Building2;
  readonly History = History;
  readonly AlertTriangle = AlertTriangle;
  readonly Loader2 = Loader2;
  readonly UserX = UserX;
  readonly X = X;
  readonly ClipboardList = ClipboardList;

  // Liste state
  customers = signal<CustomerDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Oluşturma modalı
  isModalOpen = signal<boolean>(false);
  submitting = signal<boolean>(false);

  // Geçmiş / timeline drawer
  historyCustomer = signal<CustomerDto | null>(null);
  historyOrders = signal<CustomerWorkOrder[]>([]);
  historyLoading = signal<boolean>(false);
  historyError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    companyName: [''],
    phoneNumber: ['', [Validators.required]],
    email: ['', [Validators.email]],
    address: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.customerService.getCustomers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.customers.set(data ?? []),
        error: () => this.error.set('Müşteriler yüklenemedi. Backend bağlantısını kontrol edin.')
      });
  }

  fullName(c: CustomerDto): string {
    return `${c.firstName} ${c.lastName}`.trim();
  }

  // --- Oluşturma modalı ---
  openModal(): void {
    this.form.reset({
      firstName: '', lastName: '', companyName: '',
      phoneNumber: '', email: '', address: ''
    });
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
    this.customerService.createCustomer(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadCustomers();
        },
        error: () => this.error.set('Müşteri oluşturulamadı.')
      });
  }

  // --- Geçmiş / timeline drawer ---
  openHistory(customer: CustomerDto): void {
    this.historyCustomer.set(customer);
    this.historyOrders.set([]);
    this.historyError.set(null);
    this.historyLoading.set(true);
    this.customerService.getCustomerWorkOrders(customer.id)
      .pipe(finalize(() => this.historyLoading.set(false)))
      .subscribe({
        next: (data) => this.historyOrders.set(data ?? []),
        error: () => this.historyError.set('İş emri geçmişi yüklenemedi.')
      });
  }

  closeHistory(): void {
    this.historyCustomer.set(null);
  }

  statusLabel(status: number): string {
    switch (status) {
      case 1: return 'Bekliyor';
      case 2: return 'İşlemde';
      case 3: return 'Tamamlandı';
      default: return 'Bilinmiyor';
    }
  }
}
