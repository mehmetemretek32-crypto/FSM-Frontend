import {
  Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, X, Loader2, Package } from 'lucide-angular';
import { CreateInventoryRequest, InventoryItem } from './inventory.model';

@Component({
  selector: 'app-inventory-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './inventory-modal.component.html'
})
export class InventoryModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() open = false;
  @Input() item: InventoryItem | null = null;
  @Input() submitting = false;

  @Output() closed = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateInventoryRequest>();

  readonly X = X;
  readonly Loader2 = Loader2;
  readonly Package = Package;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    skuCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    unitPrice: [0.1, [Validators.required, Validators.min(0.1)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['open'] || changes['item']) && this.open) {
      if (this.item) {
        this.form.reset({
          name: this.item.name,
          skuCode: this.item.skuCode,
          stockQuantity: this.item.stockQuantity,
          unitPrice: this.item.unitPrice
        });
      } else {
        this.form.reset({ name: '', skuCode: '', stockQuantity: 0, unitPrice: 0.1 });
      }
    }
  }

  get isEdit(): boolean {
    return this.item !== null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }

  onClose(): void {
    this.closed.emit();
  }
}
