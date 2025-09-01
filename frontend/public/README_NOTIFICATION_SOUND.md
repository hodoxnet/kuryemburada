# Bildirim Sesi Kurulumu

## Önemli Not
`notification-sound.mp3` dosyası şu anda bir placeholder dosyasıdır. Gerçek bir MP3 ses dosyası ile değiştirilmesi gerekmektedir.

## Ses Dosyası Gereksinimleri

- **Format:** MP3
- **Dosya Adı:** notification-sound.mp3
- **Süre:** 1-2 saniye (tavsiye edilen)
- **Dosya Boyutu:** Maksimum 100KB (performans için)
- **Ses Seviyesi:** Orta seviye (çok yüksek olmamalı)

## Ücretsiz Ses Kaynakları

1. **Freesound** - https://freesound.org/
   - Ücretsiz ses efektleri
   - Creative Commons lisansları
   - Kayıt gerektirir

2. **Zapsplat** - https://zapsplat.com/
   - Binlerce ücretsiz ses efekti
   - Ücretsiz hesap ile indirme

3. **SoundJay** - https://www.soundjay.com/
   - Basit bildirim sesleri
   - Direkt indirme

4. **Notification Sounds** - https://notificationsounds.com/
   - Özel bildirim sesleri
   - MP3 formatında

## Kurulum Adımları

1. Yukarıdaki kaynaklardan uygun bir bildirim sesi indirin
2. Dosya adını `notification-sound.mp3` olarak değiştirin
3. Mevcut placeholder dosyasını indirdiğiniz ses dosyasıyla değiştirin
4. Dosyayı `/frontend/public/` klasörüne yerleştirin

## Test Etme

Ses dosyasını test etmek için:
1. Kurye olarak giriş yapın
2. Yeni bir sipariş bildirimi geldiğinde ses otomatik olarak çalacaktır
3. Ses her 2 saniyede bir tekrar edecektir
4. Modal kapatıldığında ses duracaktır

## Ses Ayarları

`OrderNotificationModal.tsx` dosyasında ses ayarlarını değiştirebilirsiniz:

```javascript
// Ses seviyesini ayarlama (0.0 - 1.0 arası)
audioRef.current.volume = 0.5;

// Tekrar aralığını değiştirme (milisaniye cinsinden)
soundIntervalRef.current = setInterval(() => {
  playNotificationSound();
}, 2000); // 2000ms = 2 saniye
```