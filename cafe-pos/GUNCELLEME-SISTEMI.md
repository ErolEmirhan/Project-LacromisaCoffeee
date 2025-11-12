# 🚀 Makara POS - Otomatik Güncelleme Sistemi

## 📋 Genel Bakış

Bu dokümanda Makara POS uygulamasının uzaktan otomatik güncelleme sisteminin nasıl çalıştığı ve nasıl kullanılacağı anlatılmaktadır.

## 🎯 Nasıl Çalışır?

1. **Kafedeki Uygulama**: Her 4 saatte bir GitHub'daki yeni sürüm kontrolü yapar
2. **Yeni Sürüm Bulunca**: Kullanıcıya bildirim gösterir
3. **Kullanıcı Onayı**: Kullanıcı güncellemeyi indirir
4. **Otomatik Kurulum**: Uygulama yeniden başlatılır ve güncelleme otomatik kurulur

## 🔧 Kurulum Adımları

### 1. GitHub Repository Ayarları

```bash
# GitHub'da yeni bir repository oluşturun veya mevcut repository'yi kullanın
# Repository adı: makara-pos
```

### 2. Package.json Düzenleme

`package.json` dosyasında `YOUR_USERNAME` yazan yerleri kendi GitHub kullanıcı adınızla değiştirin:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/KULLANICI_ADINIZ/makara-pos.git"
},
"build": {
  "publish": [{
    "provider": "github",
    "owner": "KULLANICI_ADINIZ",
    "repo": "makara-pos"
  }]
}
```

### 3. GitHub Token Oluşturma

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" tıklayın
3. İsim: "Makara POS Release"
4. Yetki: `repo` (tüm repo yetkilerini seçin)
5. Token'ı kopyalayın ve güvenli bir yerde saklayın

### 4. Ortam Değişkeni Ayarlama

**Windows PowerShell:**
```powershell
$env:GH_TOKEN="github_pat_YOUR_TOKEN_HERE"
```

**Windows CMD:**
```cmd
set GH_TOKEN=github_pat_YOUR_TOKEN_HERE
```

**Linux/Mac:**
```bash
export GH_TOKEN="github_pat_YOUR_TOKEN_HERE"
```

## 📦 Güncelleme Yayınlama

### Adım 1: Versiyon Güncelleme

`package.json` dosyasındaki versiyon numarasını artırın:

```json
{
  "version": "1.0.1"  // 1.0.0'dan 1.0.1'e
}
```

### Adım 2: Build Oluşturma

```bash
npm run make
```

Bu komut `out/make/` klasöründe kurulum dosyalarını oluşturur.

### Adım 3: GitHub Release Oluşturma

#### Manuel Yol:

1. GitHub repository'nize gidin
2. "Releases" → "Create a new release"
3. Tag: `v1.0.1` (versiyonla aynı)
4. Title: "Makara POS v1.0.1"
5. Description: Değişiklikleri yazın
6. `out/make/` klasöründeki kurulum dosyalarını yükleyin
7. "Publish release"

#### Otomatik Yol (electron-builder ile):

```bash
npm run publish
```

## 🔄 Güncelleme Süreci (Kafede)

### Otomatik Kontrol

- Uygulama her 4 saatte bir otomatik kontrol yapar
- İlk açılıştan 10 saniye sonra kontrol yapar
- Yeni sürüm varsa bildirim gösterir

### Manuel Kontrol

Admin Panel → Ayarlar → "Güncellemeleri Kontrol Et" butonu

### Güncelleme Akışı

1. **Bildirim**: "Yeni Güncelleme Mevcut!" dialogu açılır
2. **İndirme**: "Güncellemeyi İndir" butonuna tıklayın
3. **İlerleme**: İndirme ilerlemesi gösterilir
4. **Kurulum**: "Şimdi Yeniden Başlat" butonuna tıklayın
5. **Tamamlandı**: Uygulama yeniden başlar ve güncelleme kurulu olur

## 📝 Güncelleme Notları Yazma

Release oluştururken değişiklikleri açıklayın:

```markdown
## 🎉 Yeni Özellikler
- Modern kategori tasarımı
- Pembe/magenta renk teması

## 🐛 Hata Düzeltmeleri
- Sepet hesaplama hatası düzeltildi

## ⚡ İyileştirmeler
- Performans optimizasyonları
```

## 🛡️ Güvenlik

- Güncellemeler şifreli olarak (HTTPS) indirilir
- GitHub'dan güvenilir kaynak
- Dijital imza ile doğrulama (opsiyonel)

## 📊 Versiyon Numaralandırma

Semantic Versioning (SemVer) kullanın:

- **1.0.0 → 1.0.1**: Hata düzeltmeleri (Patch)
- **1.0.0 → 1.1.0**: Yeni özellikler (Minor)
- **1.0.0 → 2.0.0**: Büyük değişiklikler (Major)

## ❓ Sorun Giderme

### Güncelleme Kontrolü Çalışmıyor

1. İnternet bağlantısını kontrol edin
2. GitHub repository'nin public olduğundan emin olun
3. `package.json`'daki repository URL'sini kontrol edin

### İndirme Başarısız

1. Disk alanını kontrol edin
2. Antivirüs yazılımını geçici olarak devre dışı bırakın
3. Güvenlik duvarı ayarlarını kontrol edin

### Kurulum Başarısız

1. Uygulamayı yönetici olarak çalıştırın
2. Eski versiyon tamamen kapatıldığından emin olun
3. Kurulum klasörüne yazma izni olduğundan emin olun

## 🎓 Test Etme

### Development Ortamında Test

```bash
# Versiyon 1.0.1 ile release oluşturun
npm run make

# GitHub'a yükleyin

# Uygulamayı 1.0.0 versiyonu ile açın
# Güncelleme kontrolü yapın
# 1.0.1 versiyonunu görmeli
```

## 📞 Destek

Sorun yaşarsanız:

1. GitHub Issues'da bildirin
2. Log dosyalarını kontrol edin: `%APPDATA%/makara-pos/logs/`
3. Geliştirici konsolu: Ctrl+Shift+I

## 🔮 İleri Seviye

### Farklı Güncelleme Kanalları

- **Stable**: Kararlı sürümler (production)
- **Beta**: Test sürümleri
- **Alpha**: Deneysel sürümler

### Otomatik Rollback

Güncelleme başarısız olursa eski versiyona dönüş:

```typescript
autoUpdater.on('error', () => {
  // Eski versiyona dön
});
```

### Zorunlu Güncellemeler

Kritik güvenlik güncellemeleri için:

```typescript
if (criticalUpdate) {
  // Kullanıcı reddedemez, zorunlu güncelleme
}
```

## ✅ Checklist (Her Güncelleme İçin)

- [ ] Versiyon numarasını artır
- [ ] Değişiklikleri test et
- [ ] Build oluştur (`npm run make`)
- [ ] GitHub Release oluştur
- [ ] Release notlarını yaz
- [ ] Kurulum dosyalarını yükle
- [ ] Test ortamında dene
- [ ] Production'a yayınla

## 🎉 Özet

Artık kafenizdeki bilgisayarda çalışan Makara POS uygulamasını evden uzaktan güncelleyebilirsiniz:

1. Kodda değişiklik yap → GitHub'a push
2. Versiyon artır → Build oluştur
3. GitHub Release yayınla
4. Kafedeki uygulama otomatik algılar
5. Kullanıcı günceller → Hazır! ✨

