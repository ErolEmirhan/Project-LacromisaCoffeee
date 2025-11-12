import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';

export class AutoUpdaterService {
  private mainWindow: BrowserWindow | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
  }

  private setupAutoUpdater() {
    // GitHub releases'dan güncelleme kontrolü
    autoUpdater.autoDownload = false; // Otomatik indirme kapalı, kullanıcıya soracağız
    autoUpdater.autoInstallOnAppQuit = true;

    // Güncelleme mevcut olduğunda
    autoUpdater.on('update-available', (info) => {
      console.log('🔄 Güncelleme mevcut:', info.version);
      this.mainWindow?.webContents.send('update-available', {
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate
      });
    });

    // Güncelleme yok
    autoUpdater.on('update-not-available', (info) => {
      console.log('✅ Uygulama güncel:', info.version);
      this.mainWindow?.webContents.send('update-not-available', info);
    });

    // İndirme başladı
    autoUpdater.on('download-progress', (progressObj) => {
      console.log(`📥 İndiriliyor: ${progressObj.percent.toFixed(2)}%`);
      this.mainWindow?.webContents.send('download-progress', {
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });
    });

    // İndirme tamamlandı
    autoUpdater.on('update-downloaded', (info) => {
      console.log('✅ Güncelleme indirildi:', info.version);
      this.mainWindow?.webContents.send('update-downloaded', info);
    });

    // Hata
    autoUpdater.on('error', (err) => {
      console.error('❌ Güncelleme hatası:', err);
      this.mainWindow?.webContents.send('update-error', err.message);
    });
  }

  // Manuel güncelleme kontrolü
  checkForUpdates() {
    console.log('🔍 Güncelleme kontrol ediliyor...');
    autoUpdater.checkForUpdates();
  }

  // Güncellemeyi indir
  downloadUpdate() {
    console.log('📥 Güncelleme indiriliyor...');
    autoUpdater.downloadUpdate();
  }

  // Güncellemeyi yükle ve yeniden başlat
  installUpdate() {
    console.log('🔄 Güncelleme yükleniyor ve uygulama yeniden başlatılıyor...');
    autoUpdater.quitAndInstall();
  }

  // Otomatik kontrol başlat (her 4 saatte bir)
  startAutoCheck(intervalHours: number = 4) {
    // İlk kontrolü hemen yap
    setTimeout(() => this.checkForUpdates(), 10000); // 10 saniye sonra

    // Periyodik kontrol
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalHours * 60 * 60 * 1000);
  }

  // Otomatik kontrolü durdur
  stopAutoCheck() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }
}

// IPC Handler'ları
export function setupAutoUpdaterIPC() {
  let updaterService: AutoUpdaterService | null = null;

  ipcMain.handle('updater-init', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      updaterService = new AutoUpdaterService(window);
      updaterService.startAutoCheck(4); // Her 4 saatte bir kontrol
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('updater-check', () => {
    if (updaterService) {
      updaterService.checkForUpdates();
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('updater-download', () => {
    if (updaterService) {
      updaterService.downloadUpdate();
      return { success: true };
    }
    return { success: false };
  });

  ipcMain.handle('updater-install', () => {
    if (updaterService) {
      updaterService.installUpdate();
      return { success: true };
    }
    return { success: false };
  });
}

