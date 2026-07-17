import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection | undefined;

  // Angular 17 Signals: Arayüzün bu veriyi anlık dinlemesi için
  public workOrderUpdated = signal<any>(null);

  constructor() {
    this.startConnection();
  }

  public startConnection = () => {
    // API adresimiz (önceki ekran görüntülerine göre 7190 portundayız)
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7190/notificationHub')
      .withAutomaticReconnect() // Bağlantı koparsa otomatik tekrar dener
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('📡 SignalR Canlı Bağlantısı Başarıyla Kuruldu!');
        this.addListeners();
      })
      .catch(err => console.error('❌ SignalR Bağlantı Hatası: ', err));
  }

  private addListeners = () => {
    if (!this.hubConnection) return;

    // Backend'den 'ReceiveWorkOrderUpdate' isimli bir mesaj geldiğinde tetiklenir
    this.hubConnection.on('ReceiveWorkOrderUpdate', (data) => {
      console.log('🔄 Backendden Canlı Güncelleme Geldi:', data);
      
      // Signal'i güncelliyoruz, buna bağlı tüm ekranlar anında değişecek
      this.workOrderUpdated.set(data);
    });
  }
}