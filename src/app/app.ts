import { Component, signal, inject, OnInit, computed, effect } from '@angular/core';

import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard';
import { TechnicianListComponent } from './technicians/technician-list.component';
import { CustomerListComponent } from './customers/customer-list.component';
import { InventoryListComponent } from './features/inventories/inventory-list.component';
import { 
  LucideAngularModule, LayoutDashboard, Users, Wrench, Calendar, ClipboardList, 
  Bell, Search, TrendingUp, TrendingDown, MapPin, Clock, CheckCircle2, 
  AlertCircle, Plus, Filter, Download, RefreshCw, Wifi, Activity, 
  Star, Phone, Mail, Menu, X, Zap, Settings, LogOut, Eye, Edit3, Trash2, UserCheck, Package 
} from 'lucide-angular';
import { PlanningComponent } from './pages/planning/planning';
import { SignalrService } from './services/signalr';
import { SettingsComponent } from './pages/settings/settings';// Sayfa yönlendirmeleri için tip tanımı
import { AuthComponent } from './pages/auth/auth';
import { AuthService } from './services/auth';
type Page = "dashboard" | "workorders" | "technicians" | "customers" | "planning" | "inventories" | "settings"| "auth";

// Bildirimler için tip tanımı
export interface NotificationItem {
  id: number;
  type: 'critical' | 'warning' | 'info' | 'success';
  message: string;
  time: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TechnicianListComponent, CustomerListComponent, InventoryListComponent, PlanningComponent,SettingsComponent, AuthComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private dashboardService = inject(DashboardService);
  private signalrService = inject(SignalrService);
  private authService = inject(AuthService);
constructor() {
    // 1. Oturum kontrolü (Giriş yapıldıysa direkt dashboard'a atar)
    if (this.authService.isLoggedIn()) {
      this.page.set('dashboard');
    }

    // 2. Giriş durumunu reaktif takip eden effect
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.page.set('dashboard');
      } else {
        this.page.set('auth');
      }
    });
    effect(() => {
      const updateData = this.signalrService.workOrderUpdated();
      
      if (updateData) {
        console.log('🔔 Backendden canlı sinyal geldi, ekran yenileniyor!', updateData);
        
        this.refreshData();

        const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const newNotif: NotificationItem = {
          id: Date.now(),
          type: 'info',
          message: typeof updateData === 'string' ? updateData : 'Sistemde yeni bir güncelleme var!',
          time: now
        };
        this.notifications.update(list => [newNotif, ...list]);
      }
    });
  }

  // --- İKON TANIMLAMALARI ---
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly Wrench = Wrench;
  readonly Calendar = Calendar;
  readonly ClipboardList = ClipboardList;
  readonly Bell = Bell;
  readonly Search = Search;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly Plus = Plus;
  readonly Filter = Filter;
  readonly Download = Download;
  readonly RefreshCw = RefreshCw;
  readonly Wifi = Wifi;
  readonly Activity = Activity;
  readonly Star = Star;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly Menu = Menu;
  readonly X = X;
  readonly Zap = Zap;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly Eye = Eye;
  readonly Edit3 = Edit3;
  readonly Trash2 = Trash2;
  readonly UserCheck = UserCheck;
  readonly Package = Package;

  // --- REAKTİF STATE YÖNETİMİ (SIGNALS) ---
  page = signal<Page>("auth");
  sidebarOpen = signal(false);
  notifOpen = signal(false);

  // Canlı API Sayılarımız (Backend'den dolacak)
  totalWorkOrders = signal(0);
  activeTechnicians = signal(0);
  pendingAssignments = signal(0);
  completedJobs = signal(0);
// Envanterden çekilen malzemeleri tutacak sinyal
  inventoryItems = signal<any[]>([]);
  // İş Emri Listemiz (Backend'den gelen JSON buraya dolacak)
  workOrders = signal<any[]>([]);

  // 1. GERÇEK BİLDİRİMLER
  notifications = signal<any[]>([]);

  // 2. GERÇEK TEKNİSYENLER
  technicians = signal<any[]>([]);

  // --- MODAL VE FORM YÖNETİMİ ---
  isModalOpen = signal<boolean>(false);
  editingOrderId = signal<number | null>(null);
  isRefreshing = signal<boolean>(false);
  selectedWorkOrder = signal<any | null>(null);

  newOrderForm = signal<any>({
    title: '',
    customerId: 1, 
    description: '',
    status: '1',
    technicianId: ''
  });

  // Durum Dağılımı (Pie Chart) 
  // Durum Dağılımı (Pie Chart) - DÜZELTİLMİŞ HALİ
  pieData = computed(() => {
    const total = this.totalWorkOrders();
    const completed = this.completedJobs();
    const pending = this.pendingAssignments();

    // Veri yoksa grafiği patlatmamak için sıfırlıyoruz
    if (total === 0) {
      return [
        { name: "Tamamlandı", value: 0, color: "#10b981" },
        { name: "Devam Ediyor", value: 0, color: "#3b82f6" },
        { name: "Bekliyor", value: 0, color: "#f59e0b" },
        { name: "İptal", value: 0, color: "#ef4444" },
      ];
    }

    let inProgress = total - (completed + pending);
    if (inProgress < 0) inProgress = 0; 

    // Bütün '||' sahte verileri ve sabit 5 rakamı temizlendi!
    return [
      { name: "Tamamlandı", value: Math.round((completed / total) * 100), color: "#10b981" },
      { name: "Devam Ediyor", value: Math.round((inProgress / total) * 100), color: "#3b82f6" },
      { name: "Bekliyor", value: Math.round((pending / total) * 100), color: "#f59e0b" },
      { name: "İptal", value: 0, color: "#ef4444" }, 
    ];
  });

  // Trend Grafikleri 
  trendData = [
    { month: "Ağu", orders: 52, completed: 48 },
    { month: "Eyl", orders: 61, completed: 55 },
    { month: "Eki", orders: 78, completed: 70 },
    { month: "Kas", orders: 69, completed: 63 },
    { month: "Ara", orders: 84, completed: 77 },
    { month: "Oca", orders: 93, completed: 86 },
  ];

  // 👇 DÜZELTİLEN KISIM: SignalR Dinleyicisi 👇


    // 3. SignalR Canlı Bildirim Dinleyicisi (Sildiğini sandığın o kritik kod)
    
  ngOnInit() {
    this.loadRealData();
    this.loadWorkOrders();
    this.loadTechnicians();
    this.loadInventories();
  }

  // Backend API'mizden Sayıları Çeken Fonksiyon
  loadRealData() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data: any) => {
        console.log("🔥 Dashboard İstatistikleri Geldi:", data);
        this.totalWorkOrders.set(data.totalWorkOrders ?? data.TotalWorkOrders ?? 0);
        this.activeTechnicians.set(data.activeTechnicians ?? data.ActiveTechnicians ?? 0);
        this.pendingAssignments.set(data.pendingAssignments ?? data.PendingAssignments ?? 0);
        this.completedJobs.set(data.completedJobs ?? data.CompletedJobs ?? 0);
      },
      error: (err: any) => {
        console.error("Dashboard sayıları çekilemedi:", err);
      }
    });
  }

  // Backend'den İş Emirleri Listesini Çeken Fonksiyon
  loadWorkOrders(status?: number) {
    this.dashboardService.getWorkOrders(status).subscribe({
      next: (data: any) => {
        console.log("📋 İş Emirleri Listesi Başarıyla Alındı:", data);
        this.workOrders.set(data);
      },
      error: (err: any) => {
        console.error("İş emirleri tablosu yüklenemedi:", err);
      }
    });
  }

  // Backend'den Gerçek Teknisyenleri Çeken Metot
  loadTechnicians() {
    this.dashboardService.getTechnicians().subscribe({
      next: (data: any) => {
        console.log("👷 Gerçek Teknisyenler Geldi:", data);
        this.technicians.set(data);
      },
      error: (err: any) => console.error("Teknisyenler çekilemedi:", err)
    });
  }

  loadInventories() {
    this.dashboardService.getInventories().subscribe({
      next: (data: any) => {
        this.inventoryItems.set(data);
      },
      error: (err: any) => { 
        console.error('Envanter listesi çekilemedi:', err);
      }
    });
  }
  // Arayüzdeki "Ekle" butonuna basıldığında çalışacak ana metot
  addMaterialToOrder(inventoryItemIdStr: string, quantityStr: string) {
    const inventoryItemId = parseInt(inventoryItemIdStr, 10);
    const quantityUsed = parseInt(quantityStr, 10);
    
    // HTML'deki modalda düzenlediğimiz iş emrinin ID'sini alıyoruz
    const workOrderId = this.editingOrderId(); 

    if (!workOrderId) {
      alert('Hata: İş emri ID bulunamadı!');
      return;
    }

    if (!inventoryItemId || !quantityUsed || quantityUsed <= 0) {
      alert('Lütfen geçerli bir malzeme seçin ve adeti girin!');
      return;
    }

    const request = {
      workOrderId: workOrderId,
      inventoryItemId: inventoryItemId,
      quantityUsed: quantityUsed
    };

    // DashboardService üzerinden backend'e fırlatıyoruz!
    this.dashboardService.addMaterialToWorkOrder(request).subscribe({
      next: (res: any) => {
        alert('Malzeme başarıyla iş emrine eklendi ve stoktan düşüldü!');
        
        // İşlem bitince verileri tazeleyip, güncel stokları ekrana yansıtıyoruz
        // Eğer sayfayı yenilemek için kullandığın metot ismi farklıysa burayı güncelleyebilirsin
        this.refreshData(); 
        this.loadInventories(); 
      },
      error: (err: any) => {
        console.error('Malzeme eklenirken hata oluştu:', err);
        alert('Malzeme eklenirken bir hata oluştu. Lütfen konsolu kontrol edin.');
      }
    });
  }
 
  

  // Canlı SignalR Simülasyonu (Manuel Test)
  simulateSignalR() {
    this.totalWorkOrders.update(val => val + 1);
    this.pendingAssignments.update(val => val + 1);
    
    const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const newNotif: NotificationItem = {
      id: Date.now(),
      type: 'critical',
      message: `🚨 [SignalR - Canlı] Sahadan yeni acil iş emri (#${1000 + this.totalWorkOrders()}) düştü!`,
      time: `${now} (Az önce)`
    };

    this.notifications.update(list => [newNotif, ...list]);
  }

  openModal() {
    this.editingOrderId.set(null);
    this.newOrderForm.set({ title: '', customerId: 1, description: '', status: 'Açık' });
    this.isModalOpen.set(true);
  }

  openEditModal(order: any) {
    console.log('✏️ Kalem butonuna basıldı, gelen veri:', order);
    this.editingOrderId.set(order.id);
    this.newOrderForm.set({
      title: order.title || '',
      customerId: order.customerId || 1,
      description: order.description || '',
      status: String(order.status || 1),
      technicianId: order.technicianId || ''
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingOrderId.set(null); 
    this.newOrderForm.set({ title: '', customerId: 1, description: '', status: 'Açık', technicianId: '' });
  }

  updateForm(field: string, event: any) {
    const value = event.target.value;
    this.newOrderForm.update(current => ({
      ...current,
      [field]: field === 'customerId' ? Number(value) : value 
    }));
  }

  // --- KAYDET / GÜNCELLE METODU ---
 submitNewOrder() {
    const formValue = this.newOrderForm();
    if (!formValue.title.trim()) {
      alert('Lütfen iş emri başlığı giriniz!');
      return;
    }

    const currentEditId = this.editingOrderId();

    if (currentEditId !== null) {
      // Güncelleme Payload'ı
      const updatePayload = {
        id: currentEditId,
        title: formValue.title,
        description: formValue.description,
        state: Number(formValue.state) || 1,
        technicianId: formValue.technicianId ? Number(formValue.technicianId) : null,
        customerId: Number(formValue.customerId)
      };

      // FETCH YERİNE dashboardService KULLANDIK
      this.dashboardService.updateWorkOrder(currentEditId, updatePayload).subscribe({
        next: () => {
          console.log('İş emri başarıyla güncellendi!');
          this.refreshData(); // Tabloyu ve istatistikleri yenile
          this.closeModal();  // Formu kapat
        },
        error: (err: any) => {
          console.error('Güncelleme hatası:', err);
          alert('Güncelleme başarısız! Konsola bak.');
        }
      });
    } else {
      // Yeni Ekleme
      this.dashboardService.createWorkOrder(formValue).subscribe({
        next: (newId: any) => {
          console.log('🎉 Başarıyla eklendi! Yeni ID:', newId);
          this.closeModal();
          this.refreshData();
        },
        error: (err: any) => {
          console.error('Ekleme hatası:', err);
          alert('İş emri eklenirken bir hata oluştu!');
        }
      });
    }
  }

  // --- SİLME (DELETE) METODU ---
  deleteOrder(id: number) {
    console.log('🗑️ Çöp kutusuna basıldı, silinecek ID:', id);
    if (confirm(` #${id} numaralı iş emrini kalıcı olarak silmek (pasife çekmek) istediğinize emin misiniz?`)) {
      this.dashboardService.deleteWorkOrder(id).subscribe({
        next: () => {
          console.log(`🚀 #${id} başarıyla silindi!`);
          this.refreshData(); // Yerel filtreleme yerine direkt backend'den en taze veriyi çekelim
        },
        error: (err: any) => {
          console.error('Silme hatası:', err);
          alert('İş emri silinirken bir hata oluştu!');
        }
      });
    }
  }

  openDetailModal(order: any) {
    console.log('👁️ Detaylar inceleniyor:', order);
    this.selectedWorkOrder.set(order);
  }

  closeDetailModal() {
    this.selectedWorkOrder.set(null);
  }

  refreshData() {
    console.log("🔄 Tüm veriler ve sayılar canlı olarak yenileniyor...");
    this.isRefreshing.set(true); 
    
    this.loadRealData();
    this.loadWorkOrders();
    this.loadTechnicians();

    setTimeout(() => {
      this.isRefreshing.set(false);
      console.log("✅ Yenileme tamamlandı!");
    }, 600);
  }
}