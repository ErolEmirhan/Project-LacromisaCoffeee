// Ses efektleri servisi
class SoundEffectsService {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    try {
      // Başarı sesi - ürün sepete eklendiğinde
      const successSound = new Audio('/sounds/success.mp3');
      successSound.volume = 0.6;
      this.sounds.set('success', successSound);

      // Sipariş kaydedildi sesi
      const orderSavedSound = new Audio('/sounds/order-saved.mp3');
      orderSavedSound.volume = 0.7;
      this.sounds.set('orderSaved', orderSavedSound);

      // Hata sesi
      const errorSound = new Audio('/sounds/error.mp3');
      errorSound.volume = 0.5;
      this.sounds.set('error', errorSound);

      // Bildirim sesi
      const notificationSound = new Audio('/sounds/notification.mp3');
      notificationSound.volume = 0.4;
      this.sounds.set('notification', notificationSound);

      // Ödeme başarılı sesi
      const paymentSuccessSound = new Audio('/sounds/payment-success.mp3');
      paymentSuccessSound.volume = 0.6;
      this.sounds.set('paymentSuccess', paymentSuccessSound);
    } catch (error) {
      console.log('Ses dosyaları yüklenemedi, uygulama sessiz çalışacak');
    }
  }

  // Test için basit ses oluştur
  private createTestSound(frequency: number = 440, duration: number = 200): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Test sesi oluşturulamadı:', error);
    }
  }

  // Ses çal
  play(soundName: string) {
    if (!this.isEnabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      try {
        // Ses dosyası yüklenmemişse sessiz çal
        sound.play().catch(() => {
          console.log(`Ses dosyası yüklenemedi: ${soundName}`);
        });
      } catch (error) {
        console.log(`Ses çalma hatası: ${soundName}`, error);
      }
    }
  }

  // Ürün sepete eklendiğinde
  playAddToCart() {
    if (this.isEnabled) {
      this.createTestSound(800, 300); // Yüksek ton, başarı sesi
    }
  }

  // Sipariş kaydedildiğinde
  playOrderSaved() {
    if (this.isEnabled) {
      this.createTestSound(600, 400); // Orta ton, sipariş kaydedildi sesi
    }
  }

  // Hata durumunda
  playError() {
    if (this.isEnabled) {
      this.createTestSound(200, 500); // Düşük ton, hata sesi
    }
  }

  // Bildirim geldiğinde
  playNotification() {
    this.play('notification');
  }

  // Ödeme başarılı olduğunda
  playPaymentSuccess() {
    if (this.isEnabled) {
      this.createTestSound(1000, 600); // Çok yüksek ton, ödeme başarılı sesi
    }
  }

  // Sesleri aç/kapat
  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  // Ses durumunu al
  isSoundEnabled() {
    return this.isEnabled;
  }

  // Ses seviyesini ayarla
  setVolume(soundName: string, volume: number) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // Tüm ses seviyelerini ayarla
  setGlobalVolume(volume: number) {
    this.sounds.forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
}

// Singleton instance
export const soundEffects = new SoundEffectsService();
export default soundEffects;
