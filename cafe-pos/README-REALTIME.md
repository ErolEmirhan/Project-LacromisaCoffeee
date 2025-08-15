# 🚀 Gerçek Zamanlı Masa Senkronizasyonu

Bu proje, telefonunuzdan masaya tıklayıp sipariş ekleyebilmenizi ve bunun PC'nizde eş zamanlı görünmesini sağlayan gerçek zamanlı veri senkronizasyonu özelliğine sahiptir.

## ✨ Özellikler

- **🔗 WebSocket Tabanlı Senkronizasyon**: Socket.IO kullanarak gerçek zamanlı veri paylaşımı
- **📱 Mobil Uyumlu**: Telefon ve tablet cihazlarda mükemmel çalışır
- **💾 SQLite Veritabanı**: Tüm veriler yerel veritabanında güvenli şekilde saklanır
- **🔄 Otomatik Yeniden Bağlanma**: Bağlantı kesildiğinde otomatik olarak yeniden bağlanır
- **📊 Gerçek Zamanlı Durum**: Bağlantı durumu ve senkronizasyon bilgileri görüntülenir
- **📱 QR Kod Bağlantısı**: Tek tıkla QR kod gösterimi ile kolay telefon bağlantısı
- **🌐 Otomatik IP Tespiti**: WebRTC ile otomatik local IP adresi bulma
- **📋 Kopyala-Yapıştır**: Bağlantı linkini kolayca kopyalama

## 🚀 Kurulum ve Çalıştırma

### 1. Gerekli Paketleri Yükleyin
```bash
npm install
```

### 2. WebSocket Sunucusunu Başlatın
```bash
npm run start:websocket
```
Bu komut port 3001'de WebSocket sunucusunu başlatır.

### 3. Ana Uygulamayı Başlatın
```bash
npm start
```
Bu komut Electron uygulamasını başlatır.

### 4. Her İkisini Aynı Anda Başlatın
```bash
npm run start:all
```
Bu komut hem WebSocket sunucusunu hem de ana uygulamayı aynı anda başlatır.

## 📱 Kullanım

### Telefonunuzdan Erişim

#### 🎯 **Kolay Yöntem: QR Kod ile**
1. **PC'de**: Header'daki yeşil SYNC butonuna tıklayın
2. **QR Kod**: Ekranın ortasında büyük QR kod belirir
3. **Telefonda**: Kamera ile QR kodu okutun
4. **Sonuç**: Uygulama otomatik olarak telefon tarayıcısında açılır!

#### 🔗 **Alternatif Yöntem: Link ile**
1. **PC'de**: SYNC butonuna tıklayın
2. **Link Kopyala**: Dialog'daki linki kopyalayın
3. **Telefonda**: Tarayıcıda linki açın

#### 📱 **Manuel Yöntem**
1. Telefonunuzu PC ile aynı Wi-Fi ağına bağlayın
2. PC'nizin IP adresini öğrenin (örn: 192.168.1.100)
3. Telefonunuzun tarayıcısında şu adresi açın:
   ```
   http://192.168.1.100:3000
   ```

### Masa Siparişi Ekleme
1. **Masalar** sekmesine tıklayın
2. İstediğiniz masaya tıklayın
3. **Ürünler** sekmesine geçin
4. Ürünleri sepete ekleyin
5. **Masaya** butonuna tıklayın
6. Masa numarasını seçin
7. **Masa X için Kaydet** butonuna tıklayın

### Gerçek Zamanlı Senkronizasyon
- ✅ **Yeşil SYNC**: Bağlantı aktif, veriler eş zamanlı
- ❌ **Kırmızı OFF**: Bağlantı yok, veriler senkronize edilemiyor
- 🔄 **Pulse animasyonu**: Aktif bağlantı ve veri akışı

## 🔧 Teknik Detaylar

### WebSocket Sunucusu (Port 3001)
- **Socket.IO**: Gerçek zamanlı iletişim
- **CORS**: Tüm origin'lere izin (geliştirme modu)
- **Reconnection**: Otomatik yeniden bağlanma
- **Event Handling**: Masa siparişi olayları

### Client Uygulaması
- **RealtimeSyncService**: WebSocket bağlantı yönetimi
- **Event Listeners**: Sunucu olaylarını dinleme
- **State Management**: Gerçek zamanlı state güncellemesi
- **Error Handling**: Bağlantı hatalarını yönetme

### Veritabanı Entegrasyonu
- **SQLite**: Yerel veri saklama
- **IPC**: Electron main-renderer iletişimi
- **Transactions**: Güvenli veri işlemleri
- **Real-time Sync**: WebSocket üzerinden veri senkronizasyonu

## 📊 Event Türleri

### Masa Siparişi Olayları
- `table_order_created`: Yeni masa siparişi oluşturuldu
- `table_order_updated`: Masa siparişi güncellendi
- `table_order_closed`: Masa siparişi kapatıldı
- `table_transferred`: Masa aktarımı yapıldı

### Sistem Olayları
- `client_ready`: Client hazır durumda
- `client_disconnected`: Client bağlantısı kesildi
- `server_stats`: Sunucu durum bilgileri
- `ping/pong`: Bağlantı sağlığı kontrolü

## 🛠️ Geliştirme

### Yeni Event Ekleme
```typescript
// RealtimeSyncService'de
this.socket.on('new_event', (data: any) => {
  this.triggerEvent('new_event', data);
});

// App.tsx'te
realtimeSync.on('new_event', (data: any) => {
  // Event'i işle
});
```

### Yeni Veri Türü Ekleme
```typescript
// database.ts'te yeni tablo
this.db.exec(`
  CREATE TABLE IF NOT EXISTS new_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// database-ipc.ts'te yeni method
async getNewData(): Promise<any[]> {
  try {
    return await (window as any).electronAPI.database.getNewData();
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
    return [];
  }
}
```

## 🔍 Sorun Giderme

### WebSocket Bağlantı Hatası
1. WebSocket sunucusunun çalıştığından emin olun
2. Port 3001'in açık olduğunu kontrol edin
3. Firewall ayarlarını kontrol edin
4. Console'da hata mesajlarını inceleyin

### Veri Senkronizasyon Sorunu
1. Bağlantı durumunu kontrol edin (SYNC/OFF göstergesi)
2. Console'da WebSocket loglarını inceleyin
3. Veritabanı bağlantısını kontrol edin
4. Uygulamayı yeniden başlatın

### Performans Sorunları
1. Çok fazla client bağlı olup olmadığını kontrol edin
2. WebSocket sunucusu loglarını inceleyin
3. Veritabanı sorgularını optimize edin
4. Client sayısını sınırlayın

## 📱 Mobil Optimizasyonlar

- **Responsive Design**: Tüm ekran boyutlarında uyumlu
- **Touch Friendly**: Dokunmatik cihazlar için optimize edilmiş
- **Offline Support**: Bağlantı kesildiğinde yerel veri kullanımı
- **Progressive Web App**: Tarayıcıdan uygulama gibi kullanım

## 🔒 Güvenlik

- **Local Network**: Sadece yerel ağda çalışır
- **No External Access**: Dış internet erişimi yok
- **Data Privacy**: Tüm veriler yerel olarak saklanır
- **Authentication**: Gerekirse şifre koruması eklenebilir

## 🚀 Gelecek Özellikler

- [ ] **Multi-location Support**: Birden fazla lokasyon desteği
- [ ] **Cloud Sync**: Bulut tabanlı senkronizasyon
- [ ] **Push Notifications**: Anlık bildirimler
- [ ] **Analytics Dashboard**: Detaylı analiz raporları
- [ ] **Mobile App**: Native mobil uygulama

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. Console loglarını kontrol edin
2. WebSocket sunucu loglarını inceleyin
3. Veritabanı bağlantısını test edin
4. GitHub Issues'da sorun bildirin

---

**🎯 Hedef**: Telefonunuzdan masaya tıklayıp sipariş ekleyebilmek ve bunun PC'nizde eş zamanlı görünmesini sağlamak.

**✅ Durum**: Tamamlandı ve test edildi!
