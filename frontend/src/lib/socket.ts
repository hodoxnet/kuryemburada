import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  constructor() {
    this.init();
  }

  private init() {
    // API URL'sini environment variable'dan al
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Socket.IO client'ı initialize et
    this.socket = io(apiUrl, {
      autoConnect: false, // Manuel bağlantı kuracağız
      auth: {
        token: this.getAuthToken(),
      },
      transports: ['websocket', 'polling'], // Websocket'i öncelikle dene
    });

    // Event listener'ları kur
    this.setupEventListeners();
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return Cookies.get('token') || localStorage.getItem('token');
    }
    return null;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket bağlantısı kuruldu:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket bağlantısı kesildi:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 WebSocket bağlantı hatası:', error);
    });

    // Genel bildirim event'i
    this.socket.on('notification', (data) => {
      console.log('🔔 Bildirim alındı:', data);
      this.handleNotification(data);
    });

    // Yeni sipariş bildirimi (kuryelere)
    this.socket.on('new-order', (data) => {
      console.log('📦 Yeni sipariş bildirimi:', data);
      this.handleNotification(data);
    });

    // Sipariş kabul bildirimi (firmaya)
    this.socket.on('order-accepted', (data) => {
      console.log('✅ Sipariş kabul edildi:', data);
      this.handleNotification(data);
    });

    // Sipariş durumu güncelleme (firmaya)
    this.socket.on('order-status-update', (data) => {
      console.log('🔄 Sipariş durumu güncellendi:', data);
      this.handleNotification(data);
    });

    // Sipariş iptal bildirimi (kuryeye)
    this.socket.on('order-cancelled', (data) => {
      console.log('❌ Sipariş iptal edildi:', data);
      this.handleNotification(data);
    });

    // Room katılım onayı
    this.socket.on('joined-room', (data) => {
      console.log('🏠 Room\'a katıldı:', data);
    });
  }

  private handleNotification(data: any) {
    // Notification store'u güncelle (Zustand store)
    if (typeof window !== 'undefined') {
      // Zustand store'a bildirim ekle
      const event = new CustomEvent('socket-notification', { detail: data });
      window.dispatchEvent(event);

      // Zil sesi çal (eğer sound: true ise)
      if (data.sound) {
        this.playNotificationSound();
      }

      // Toast bildirimi göster (sonner kullanarak)
      if (data.title && data.message) {
        const toastEvent = new CustomEvent('socket-toast', { 
          detail: {
            type: 'info',
            title: data.title,
            message: data.message,
            data: data.data,
          }
        });
        window.dispatchEvent(toastEvent);
      }
    }
  }

  private playNotificationSound() {
    if (typeof window !== 'undefined') {
      try {
        // Öncelikle ses dosyasını dene
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5; // Ses seviyesi %50
        
        audio.play().catch(() => {
          // Ses dosyası yoksa, programatik beep sesi oluştur
          this.createBeepSound();
        });
      } catch (error) {
        // Hata durumunda programatik ses oluştur
        this.createBeepSound();
      }
    }
  }

  private createBeepSound() {
    try {
      // Web Audio API ile beep sesi oluştur
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Programatik ses oluşturulamadı:', error);
    }
  }

  // Manuel bağlantı kurma
  connect() {
    console.log('SocketService.connect() çağrıldı');
    console.log('Socket durumu:', { hasSocket: !!this.socket, isConnected: this.isConnected });
    
    if (this.socket && !this.isConnected) {
      const token = this.getAuthToken();
      console.log('Token durumu:', { hasToken: !!token, tokenLength: token?.length });
      
      if (token) {
        this.socket.auth = { token };
        console.log('WebSocket bağlantısı başlatılıyor...');
        this.socket.connect();
      } else {
        console.warn('Authentication token bulunamadı, WebSocket bağlantısı kurulmadı');
      }
    } else {
      console.log('Bağlantı kurulmadı çünkü:', { 
        hasSocket: !!this.socket, 
        isConnected: this.isConnected 
      });
    }
  }

  // Bağlantıyı kesme
  disconnect() {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
    }
  }

  // Kurye room'una katılma
  joinCourierRoom(courierId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-courier-room', { courierId });
    }
  }

  // Firma room'una katılma
  joinCompanyRoom(companyId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-company-room', { companyId });
    }
  }

  // Bağlantı durumunu kontrol et
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Socket instance'ına erişim (gerekirse)
  getSocket(): Socket | null {
    return this.socket;
  }

  // Token güncellendiğinde auth bilgisini güncelle
  updateAuth(token: string) {
    if (this.socket) {
      this.socket.auth = { token };
      // Eğer bağlıysa, yeniden bağlan
      if (this.isConnected) {
        this.socket.disconnect();
        this.socket.connect();
      }
    }
  }

  // Cleanup
  destroy() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Singleton instance
let socketService: SocketService | null = null;

export const getSocketService = (): SocketService => {
  if (typeof window !== 'undefined' && !socketService) {
    socketService = new SocketService();
  }
  return socketService!;
};

export default getSocketService;