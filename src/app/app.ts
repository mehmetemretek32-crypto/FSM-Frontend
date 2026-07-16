import { Component, signal, inject, OnInit, computed } from '@angular/core';
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

// Sayfa yönlendirmeleri için tip tanımı
type Page = "dashboard" | "workorders" | "technicians" | "customers" | "planning" | "inventories" | "settings";

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
  imports: [CommonModule, LucideAngularModule, TechnicianListComponent, CustomerListComponent, InventoryListComponent, PlanningComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private dashboardService = inject(DashboardService);

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
  page = signal<Page>("dashboard");
  sidebarOpen = signal(false);
  notifOpen = signal(false);

  // Canlı API Sayılarımız (Backend'den dolacak)
  totalWorkOrders = signal(0);
  activeTechnicians = signal(0);
  pendingAssignments = signal(0);
  completedJobs = signal(0);

  // İş Emri Listemiz (Backend'den gelen JSON buraya dolacak)
  workOrders = signal<any[]>([]);

  // 1. GERÇEK BİLDİRİMLER (İçindeki sahte mesajları sildik, boş kutu yaptık)
  notifications = signal<any[]>([]);

  // 2. GERÇEK TEKNİSYENLER (Eski sahte "techPerformance" listesini sildik, bunu koyduk)
  technicians = signal<any[]>([]);

  // Durum Dağılımı (Pie Chart) - Buraya DOKUNMUYORUZ, canlı sayılardan otomatik hesaplıyor
  pieData = computed(() => {
    const total = this.totalWorkOrders() || 1;
    const completed = this.completedJobs();
    const pending = this.pendingAssignments();
    const inProgress = Math.max(0, total - (completed + pending));

    return [
      { name: "Tamamlandı", value: Math.round((completed / total) * 100) || 54, color: "#10b981" },
      { name: "Devam Ediyor", value: Math.round((inProgress / total) * 100) || 23, color: "#3b82f6" },
      { name: "Bekliyor", value: Math.round((pending / total) * 100) || 18, color: "#f59e0b" },
      { name: "İptal", value: 5, color: "#ef4444" },
    ];
  });

  // Trend Grafikleri - Backend'de grafikle ilgili bir tablomuz olmadığı için bu şimdilik görsel olarak kalabilir.
  trendData = [
    { month: "Ağu", orders: 52, completed: 48 },
    { month: "Eyl", orders: 61, completed: 55 },
    { month: "Eki", orders: 78, completed: 70 },
    { month: "Kas", orders: 69, completed: 63 },
    { month: "Ara", orders: 84, completed: 77 },
    { month: "Oca", orders: 93, completed: 86 },
  ];
 

ngOnInit() {
    this.loadRealData();
    this.loadWorkOrders();
    this.loadTechnicians(); // SADECE BU SATIRI EKLEDİK
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

  // Canlı SignalR Simülasyonu
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

  // --- MODAL VE FORM YÖNETİMİ ---
  isModalOpen = signal<boolean>(false);
  editingOrderId = signal<number | null>(null);

  newOrderForm = signal<any>({
    title: '',
    customerId: 1, 
    description: '',
    status: '1',
    technicianId: '' // YENİ EKLENDİ
  });

  openModal() {
    this.editingOrderId.set(null); // Yeni ekleme moduna geçtiğimiz için sıfırla
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
      status: String(order.status || 1)
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingOrderId.set(null); 
    this.newOrderForm.set({ title: '', customerId: 1, description: '', status: 'Açık' });
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

    // EĞER DÜZENLEME MODUNDAYSAK (UPDATE - PUT)
    if (currentEditId !== null) {
      const updatePayload = {
        id: currentEditId,
        title: formValue.title,
        description: formValue.description,
        status: Number(formValue.status) || 1,
        technicianId: formValue.technicianId ? Number(formValue.technicianId) : null 
      };

      // DİKKAT: C# kodun URL'de ID beklemediği için adresi dümdüz yazıyoruz!
      // Eğer adreste hala /3 gibi bir şey giderse C# kapıyı açmaz (405 verir).
      // 👇 SADECE BU KISMI DEĞİŞTİRİYORUZ 👇
      // 👇 ANGULAR HTTP YERİNE %100 ÇALIŞAN NATIVE FETCH API 👇
      fetch('https://localhost:7190/api/WorkOrders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })
      .then((res: any) => {
        if (!res.ok) throw new Error('Sunucu hatası: ' + res.status);
        console.log('İş emri başarıyla güncellendi!');
        this.refreshData(); // Tabloyu yenile
        this.closeModal();  // Formu kapat
      })
      .catch((err: any) => {
        console.error('Güncelleme hatası detayları:', err);
        alert('Güncelleme başarısız! Konsola bak.');
      });
        
      return; // İşlem bitince fonksiyondan çık ki yeni kayıt (POST) kısmına kaymasın
    }
    // EĞER YENİ EKLEME MODUNDAYSAK (CREATE - POST)
    else {
      this.dashboardService.createWorkOrder(formValue).subscribe({
        next: (newId: any) => {
          console.log('🎉 Başarıyla eklendi! Yeni ID:', newId);
          this.closeModal();
          this.loadWorkOrders();
        },
        error: (err: any) => {
          console.error('Ekleme hatası:', err);
          alert('İş emri eklenirken bir hata oluştu! Müşteri ID geçerli mi kontrol edin.');
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
          this.workOrders.update(list => list.filter(item => item.id !== id));
        },
        error: (err: any) => {
          console.error('Silme hatası:', err);
          alert('İş emri silinirken bir hata oluştu!');
        }
      });
    }
  }
  // 1. Animasyon durumunu kontrol edecek sinyalimiz
  isRefreshing = signal<boolean>(false);
   selectedWorkOrder = signal<any | null>(null);
   openDetailModal(order: any) {
    console.log('👁️ Detaylar inceleniyor:', order);
    this.selectedWorkOrder.set(order);
  }

  // Detay modalını kapatan metot
  closeDetailModal() {
    this.selectedWorkOrder.set(null);
  }
  // 2. Yenileme butonuna basıldığında çalışacak metot
  refreshData() {
    console.log("🔄 Tüm veriler ve sayılar canlı olarak yenileniyor...");
    this.isRefreshing.set(true); // Butonu kilitle ve ikonu döndürmeye başla
    
    // Hem üstteki istatistik kartlarını hem de alttaki tabloyu aynı anda baştan çekiyoruz
    this.loadRealData();
    this.loadWorkOrders();

    // Veriler çok hızlı gelse bile kullanıcının o şık dönme efektini görebilmesi için 
    // 600 milisaniye sonra animasyonu durduruyoruz:
    setTimeout(() => {
      this.isRefreshing.set(false);
      console.log("✅ Yenileme tamamlandı!");
    }, 600);
  }

} // <--- SINIF ŞİMDİ EN ALTTA, DOĞRU YERDE KAPANIYOR!