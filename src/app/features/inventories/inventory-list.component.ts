import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, Package, PackageX, Search, Plus, Pencil,
  Trash2, RefreshCw, AlertTriangle, Loader2
} from 'lucide-angular';
import { finalize } from 'rxjs';
import { InventoryService } from './inventory.service';
import { CreateInventoryRequest, InventoryItem } from './inventory.model';
import { InventoryModalComponent } from './inventory-modal.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, InventoryModalComponent],
  templateUrl: './inventory-list.component.html'
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  // İkonlar
  readonly Package = Package;
  readonly PackageX = PackageX;
  readonly Search = Search;
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly RefreshCw = RefreshCw;
  readonly AlertTriangle = AlertTriangle;
  readonly Loader2 = Loader2;

  // Reaktif state
  items = signal<InventoryItem[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  search = signal<string>('');
  deletingId = signal<number | null>(null);

  // Modal state
  isModalOpen = signal<boolean>(false);
  editingItem = signal<InventoryItem | null>(null);
  submitting = signal<boolean>(false);

  // Client-side arama filtresi (isim veya SKU koduna göre)
  filteredItems = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.items();
    return this.items().filter(i =>
      i.name.toLowerCase().includes(term) ||
      i.skuCode.toLowerCase().includes(term)
    );
  });

  totalValue = computed(() =>
    this.items().reduce((sum, i) => sum + i.unitPrice * i.stockQuantity, 0)
  );

  ngOnInit(): void {
    this.loadInventories();
  }

  loadInventories(): void {
    this.loading.set(true);
    this.error.set(null);
    this.inventoryService.getInventories()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.items.set(data ?? []),
        error: () => this.error.set('Envanter yüklenemedi. Backend bağlantısını kontrol edin.')
      });
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  // --- Modal aksiyonları ---
  openCreate(): void {
    this.editingItem.set(null);
    this.isModalOpen.set(true);
  }

  openEdit(item: InventoryItem): void {
    this.editingItem.set(item);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingItem.set(null);
  }

  onSave(value: CreateInventoryRequest): void {
    const editing = this.editingItem();
    this.submitting.set(true);

    if (editing) {
      this.inventoryService.updateInventory({ id: editing.id, ...value })
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: () => {
            // Signal ile anlık güncelleme
            this.items.update(list =>
              list.map(i => (i.id === editing.id ? { ...i, ...value } : i))
            );
            this.closeModal();
          },
          error: () => this.error.set('Ürün güncellenemedi.')
        });
    } else {
      this.inventoryService.createInventory(value)
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: (newId) => {
            const created: InventoryItem = {
              id: typeof newId === 'number' ? newId : Date.now(),
              ...value,
              totalUsageCount: 0
            };
            this.items.update(list => [created, ...list]);
            this.closeModal();
          },
          error: () => this.error.set('Ürün oluşturulamadı.')
        });
    }
  }

  // --- Silme ---
  deleteItem(item: InventoryItem): void {
    if (!confirm(`"${item.name}" ürününü kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    this.deletingId.set(item.id);
    this.inventoryService.deleteInventory(item.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => this.items.update(list => list.filter(i => i.id !== item.id)),
        error: () => this.error.set('Ürün silinemedi.')
      });
  }
}
