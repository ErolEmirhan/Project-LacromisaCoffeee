import { io, Socket } from 'socket.io-client';

// Gerçek zamanlı veri senkronizasyonu için WebSocket servisi
export class RealtimeSyncService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSocket();
  }

  // WebSocket bağlantısını başlat
  private initializeSocket(): void {
    try {
      console.log('🔄 WebSocket bağlantısı başlatılıyor...');
      
      // Localhost'ta çalışan WebSocket sunucusuna bağlan
      this.socket = io('http://localhost:3001', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        forceNew: true
      });

      this.setupSocketEvents();
      console.log('✅ WebSocket bağlantısı başlatıldı');
    } catch (error) {
      console.error('❌ WebSocket bağlantısı başlatılamadı:', error);
    }
  }

  // Socket event'lerini kur
  private setupSocketEvents(): void {
    if (!this.socket) return;

    // Bağlantı başarılı
    this.socket.on('connect', () => {
      console.log('✅ WebSocket bağlandı, ID:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('client_ready', { 
        clientType: 'mobile', 
        timestamp: new Date().toISOString() 
      });
    });

    // Bağlantı kesildi
    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket bağlantısı kesildi:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Sunucu tarafından kesildi, yeniden bağlan
        this.socket?.connect();
      }
    });

    // Yeniden bağlanma denemesi
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log('🔄 WebSocket yeniden bağlandı, deneme:', attemptNumber);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    // Yeniden bağlanma hatası
    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket yeniden bağlanma başarısız');
      this.reconnectAttempts = this.maxReconnectAttempts;
    });

    // Bağlantı hatası
    this.socket.on('connect_error', (error: Error) => {
      console.error('❌ WebSocket bağlantı hatası:', error);
      this.isConnected = false;
    });

    // Masa siparişi güncellemesi
    this.socket.on('table_order_updated', (data: any) => {
      console.log('📊 Masa siparişi güncellendi:', data);
      this.triggerEvent('table_order_updated', data);
    });

    // Yeni masa siparişi
    this.socket.on('table_order_created', (data: any) => {
      console.log('🆕 Yeni masa siparişi oluşturuldu:', data);
      this.triggerEvent('table_order_created', data);
    });

    // Masa siparişi kapatıldı
    this.socket.on('table_order_closed', (data: any) => {
      console.log('🔒 Masa siparişi kapatıldı:', data);
      this.triggerEvent('table_order_closed', data);
    });

    // Masa aktarımı
    this.socket.on('table_transferred', (data: any) => {
      console.log('🔄 Masa aktarımı yapıldı:', data);
      this.triggerEvent('table_transferred', data);
    });

    // Genel veri güncellemesi
    this.socket.on('data_updated', (data: any) => {
      console.log('📈 Veri güncellendi:', data);
      this.triggerEvent('data_updated', data);
    });

    // Ping/Pong
    this.socket.on('ping', () => {
      this.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  // Event dinleyici ekle
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  // Event dinleyici kaldır
  off(event: string, callback: Function): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Event tetikle
  private triggerEvent(event: string, data: any): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)!;
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event callback hatası (${event}):`, error);
        }
      });
    }
  }

  // Sunucuya event gönder
  emit(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      try {
        this.socket.emit(event, data);
        console.log('📤 Event gönderildi:', event, data);
      } catch (error) {
        console.error('❌ Event gönderme hatası:', error);
      }
    } else {
      console.warn('⚠️ WebSocket bağlantısı yok, event gönderilemedi:', event);
    }
  }

  // Masa siparişi güncellemesi gönder
  emitTableOrderUpdate(tableNumber: number, orderData: any): void {
    this.emit('update_table_order', {
      tableNumber,
      orderData,
      timestamp: new Date().toISOString(),
      clientId: this.socket?.id
    });
  }

  // Yeni masa siparişi oluştur
  emitTableOrderCreate(tableNumber: number, orderData: any): void {
    this.emit('create_table_order', {
      tableNumber,
      orderData,
      timestamp: new Date().toISOString(),
      clientId: this.socket?.id
    });
  }

  // Masa siparişi kapat
  emitTableOrderClose(tableNumber: number): void {
    this.emit('close_table_order', {
      tableNumber,
      timestamp: new Date().toISOString(),
      clientId: this.socket?.id
    });
  }

  // Masa aktarımı
  emitTableTransfer(sourceTable: number, targetTable: number): void {
    this.emit('transfer_table', {
      sourceTable,
      targetTable,
      timestamp: new Date().toISOString(),
      clientId: this.socket?.id
    });
  }

  // Bağlantı durumunu kontrol et
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Bağlantıyı yeniden başlat
  reconnect(): void {
    if (this.socket) {
      console.log('🔄 WebSocket yeniden bağlanma deneniyor...');
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  // Bağlantıyı kapat
  disconnect(): void {
    if (this.socket) {
      console.log('🔄 WebSocket bağlantısı kapatılıyor...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Bağlantı durumunu al
  getConnectionStatus(): { connected: boolean; id?: string; attempts: number } {
    return {
      connected: this.isConnected,
      id: this.socket?.id,
      attempts: this.reconnectAttempts
    };
  }
}

// Singleton instance
let realtimeSyncInstance: RealtimeSyncService | null = null;

export const getRealtimeSync = (): RealtimeSyncService => {
  if (!realtimeSyncInstance) {
    realtimeSyncInstance = new RealtimeSyncService();
  }
  return realtimeSyncInstance;
};

export const closeRealtimeSync = (): void => {
  if (realtimeSyncInstance) {
    realtimeSyncInstance.disconnect();
    realtimeSyncInstance = null;
  }
};

export default RealtimeSyncService;
