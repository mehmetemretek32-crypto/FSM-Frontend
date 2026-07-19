import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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

  bekleyenIsler: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  // Saat dilimi kaymasını engelleyen metod
  toLocalISO(date: Date): string {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().substring(0, 19);
  }

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
    slotMinTime: '04:00:00',
    slotMaxTime: '20:00:00',
    hiddenDays: [0],

    eventDrop: (info) => {
      this.updateEventInDb(info.event);
    },

    eventResize: (info) => {
      this.updateEventInDb(info.event);
    },

    drop: (info) => {
      let workOrderId = info.draggedEl.getAttribute('data-id');
      if (!workOrderId) {
        const regexMatch = info.draggedEl.innerText.match(/#(\d+)/);
        workOrderId = regexMatch ? regexMatch[1] : '0';
      }

      const startDate = new Date(info.dateStr);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const payload = {
        workOrderId: parseInt(workOrderId, 10),
        scheduledStartDate: this.toLocalISO(startDate),
        scheduledEndDate: this.toLocalISO(endDate)
      };

      this.http.put('https://localhost:7190/api/WorkOrders/schedule', payload).subscribe({
        next: () => {
          alert('İş başarıyla kaydedildi!');
          this.bekleyenIsler = this.bekleyenIsler.filter(is => is.id.toString() !== workOrderId);
          info.draggedEl.remove();
        },
        error: (err) => console.error('Atama hatası:', err)
      });
    }
  };

  updateEventInDb(event: any) {
    const payload = {
      workOrderId: parseInt(event.id, 10),
      scheduledStartDate: this.toLocalISO(event.start),
      scheduledEndDate: event.end ? this.toLocalISO(event.end) : this.toLocalISO(new Date(event.start.getTime() + 60 * 60 * 1000))
    };

    this.http.put('https://localhost:7190/api/WorkOrders/schedule', payload).subscribe({
      next: () => console.log('Takvim içi değişiklik kaydedildi!'),
      error: (err) => alert('Kayıt başarısız oldu.')
    });
  }

  ngOnInit(): void {
    this.http.get<any[]>('https://localhost:7190/api/WorkOrders').subscribe({
      next: (data) => {
        this.bekleyenIsler = data.filter(is => !is.scheduledStartDate);

        const takvimdekiIsler = data
          .filter(is => is.scheduledStartDate)
          .map(is => ({
            id: String(is.id),
            title: is.title || 'Atanmış İş',
            start: is.scheduledStartDate,
            end: is.scheduledEndDate,
            backgroundColor: '#2563eb',
            borderColor: '#1d4ed8'
          }));

        this.calendarOptions = {
          ...this.calendarOptions,
          events: takvimdekiIsler
        };

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Veriler çekilirken hata:', err)
    });
  }

  ngAfterViewInit(): void {
    let draggableEl = document.getElementById('external-events');
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: '.fc-event',
        eventData: function (eventEl) {
          return {
            title: eventEl.innerText,
            id: eventEl.getAttribute('data-id')
          };
        }
      });
    }
  }
}