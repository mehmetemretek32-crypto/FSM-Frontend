import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [FullCalendarModule, HttpClientModule], 
  templateUrl: './planning.html',
  styleUrl: './planning.scss'
})
export class PlanningComponent implements OnInit, AfterViewInit {

  // SOL TARAFTAKİ DİNAMİK LİSTEYİ TUTACAK DEĞİŞKEN (YENİ EKLENDİ)
  bekleyenIsler: any[] = [];

  // HttpClient'ı burada constructor ile alıyoruz
  constructor(private http: HttpClient) {}

  calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: 'tr',
    editable: true,
    droppable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    hiddenDays: [0],

    // İŞTE BACKEND'E VERİ GÖNDEREN SİHİRLİ FONKSİYON:
    drop: (info) => {
      // 1. Zekice ID Bulma: HTML'de ID yoksa bile yazının içindeki (#1) rakamını cımbızla çeker!
      let workOrderId = info.draggedEl.getAttribute('data-id');
      if (!workOrderId) {
        const regexMatch = info.draggedEl.innerText.match(/#(\d+)/);
        workOrderId = regexMatch ? regexMatch[1] : '0';
      }

      // 2. C#'ın Kusursuz Anlayacağı Tarih Formatı (ISO 8601)
      const startDate = new Date(info.dateStr);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 saat sonrası

      const payload = {
        workOrderId: parseInt(workOrderId, 10),
        technicianId: 1, 
        scheduledStartDate: startDate.toISOString(),
        scheduledEndDate: endDate.toISOString()
      };

      this.http.post('https://localhost:7190/api/WorkOrders/assign', payload).subscribe({
        next: () => {
          alert('İş başarıyla kaydedildi! Artık F5 atsan da gitmeyecek.');
          
          // Sürüklenen işi Angular state'inden (sol listeden) sil (YENİ EKLENDİ)
          this.bekleyenIsler = this.bekleyenIsler.filter(is => is.id.toString() !== workOrderId);
          
          info.draggedEl.remove(); // DOM'dan da temizle
        },
        error: (err) => console.error('Atama hatası:', err)
      });
    }
  };

  ngOnInit(): void {
    // Sayfa açıldığında veritabanındaki işleri getir
    this.http.get<any[]>('https://localhost:7190/api/WorkOrders').subscribe({
      next: (data) => {
        
        // 1. TARİHİ OLMAYANLARI SOL LİSTEYE AT (YENİ EKLENDİ)
        this.bekleyenIsler = data.filter(is => !is.scheduledStartDate);

        // 2. TARİHİ OLANLARI TAKVİME BAS (MEVCUT)
        const takvimdekiIsler = data
          .filter(is => is.scheduledStartDate) 
          .map(is => ({
            id: String(is.id),
            title: is.title || 'Atanmış İş', // Sende title yoksa uygun alanı yaz
            start: is.scheduledStartDate,
            end: is.scheduledEndDate,
            backgroundColor: '#2563eb', // Takvimde şık bir mavi dursun
            borderColor: '#1d4ed8'
          }));

        // Takvim ayarlarına bu verileri göm (Angular güncellesin diye objeyi yeniliyoruz)
        this.calendarOptions = { 
          ...this.calendarOptions, 
          events: takvimdekiIsler 
        };
      },
      error: (err) => console.error('Veriler çekilirken hata:', err)
    });
  }

  ngAfterViewInit(): void {
    let draggableEl = document.getElementById('external-events');
    if (draggableEl) {
      // FullCalendar'ın sürükle-bırak olayını bu kapsayıcıya tanımlıyoruz.
      // İçindeki elemanlar sonradan gelse bile itemSelector sayesinde algılayacak.
      new Draggable(draggableEl, {
        itemSelector: '.fc-event',
        eventData: function(eventEl) {
          return {
            title: eventEl.innerText,
            id: eventEl.getAttribute('data-id')
          };
        }
      });
    }
  }
}