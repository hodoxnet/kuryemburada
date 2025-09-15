# KuryeApp - iOS ve Android Simülatör Başlatma Rehberi

## 📱 Proje Hakkında
KuryeApp, React Native 0.73.0 ile geliştirilmiş bir mobil uygulamadır. Bu rehber, iOS ve Android simülatörlerini adım adım nasıl başlatacağınızı gösterir.

## 🔧 Gereksinimler

### Genel Gereksinimler
- Node.js v18 veya üzeri
- npm veya yarn

### iOS Gereksinimleri
- macOS işletim sistemi (zorunlu)
- Xcode (App Store'dan indirin)
- Xcode Command Line Tools
- CocoaPods

### Android Gereksinimleri
- Java Development Kit (JDK) 11 veya 17
- Android Studio
- Android SDK
- Android Emulator

---

## 🍎 iOS Simülatör Başlatma Adımları

### Adım 1: Proje Dizinine Gidin
```bash
cd KuryeApp
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### Adım 3: iOS Pod Bağımlılıklarını Yükleyin
```bash
cd ios && pod install && cd ..
# veya tek komutla
npm run pod-install
```

### Adım 4: Metro Bundler'ı Başlatın (Terminal 1)
```bash
npm start
# veya
npx react-native start
```

### Adım 5: iOS Simülatörü Başlatın (Terminal 2)
```bash
npm run ios
# veya
npx react-native run-ios
```

### Belirli Bir Simülatör Seçmek İçin:
```bash
# Mevcut simülatörleri listele
xcrun simctl list devices

# Belirli bir simülatörde çalıştır
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### iOS Sorun Giderme
```bash
# Cache temizleme
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# Build klasörünü temizle
cd ios && rm -rf build && cd ..

# Xcode'dan temizleme
# Xcode'u aç > Product > Clean Build Folder (Shift+Cmd+K)
```

---

## 🤖 Android Simülatör Başlatma Adımları

### Adım 1: Android Studio'yu Açın ve AVD Manager'ı Başlatın
1. Android Studio'yu açın
2. "More Actions" > "AVD Manager" tıklayın
3. Bir emülatör oluşturun veya mevcut olanı başlatın

### Adım 2: Proje Dizinine Gidin
```bash
cd KuryeApp
```

### Adım 3: Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### Adım 4: Metro Bundler'ı Başlatın (Terminal 1)
```bash
npm start
# veya
npx react-native start
```

### Adım 5: Android Uygulamasını Çalıştırın (Terminal 2)
```bash
npm run android
# veya
npx react-native run-android
```

### Android Sorun Giderme
```bash
# Gradle cache temizle
cd android && ./gradlew clean && cd ..

# Tüm cache'i temizle
npm run clean

# ADB bağlantılarını kontrol et
adb devices

# ADB'yi yeniden başlat
adb kill-server && adb start-server
```

---

## 🚀 Hızlı Başlatma Komutları (Tek Seferde)

### iOS İçin Hızlı Başlatma
```bash
# Terminal 1
cd KuryeApp && npm install && cd ios && pod install && cd .. && npm start

# Terminal 2 (Metro başladıktan sonra)
cd KuryeApp && npm run ios
```

### Android İçin Hızlı Başlatma
```bash
# Terminal 1
cd KuryeApp && npm install && npm start

# Terminal 2 (Metro başladıktan sonra)
cd KuryeApp && npm run android
```

---

## 📋 Faydalı Komutlar

### Genel Komutlar
```bash
# Metro Bundler'ı başlat
npm start

# Metro cache'ini temizle
npx react-native start --reset-cache

# Loglara bak
npx react-native log-ios
npx react-native log-android
```

### Build Komutları
```bash
# Android Debug APK oluştur
npm run build:android:debug

# Android Release APK oluştur
npm run build:android:release

# iOS Build (Xcode gerekli)
npm run build:ios
```

---

## ⚠️ Önemli Notlar

1. **iOS Simülatör** sadece macOS'ta çalışır
2. İlk çalıştırmada **bağımlılıkların indirilmesi** zaman alabilir
3. Android Studio'da **emülatör açık** olduğundan emin olun
4. Metro Bundler **8081 portunu** kullanır, başka bir uygulama kullanıyorsa kapatın
5. **M1/M2 Mac** kullanıyorsanız, Rosetta modunda çalıştırmanız gerekebilir

---

## 🔍 Hata Durumunda

### Port 8081 Meşgul Hatası
```bash
# 8081 portunu kullanan işlemi bul ve kapat
lsof -i :8081
kill -9 <PID>
```

### Metro Bundler Bağlantı Hatası
```bash
# Metro'yu reset ile başlat
npx react-native start --reset-cache
```

### iOS Pod Hataları
```bash
# Pod repo'yu güncelle
cd ios && pod repo update && pod install && cd ..
```

### Android Gradle Hataları
```bash
# Gradle wrapper'ı yeniden oluştur
cd android && ./gradlew wrapper && cd ..
```

---

## 💡 İpuçları

- Simülatörde **Cmd+R** (iOS) veya **R+R** (Android) ile uygulamayı yenileyebilirsiniz
- **Cmd+D** (iOS) veya **Cmd+M** (Android) ile Developer Menu'yü açabilirsiniz
- Hot Reload varsayılan olarak aktiftir
- Chrome DevTools ile debug edebilirsiniz (Developer Menu > Debug)

---

## 📞 Destek

Sorun yaşıyorsanız:
1. Terminal loglarını kontrol edin
2. `npx react-native doctor` komutunu çalıştırın
3. React Native resmi dokümantasyonuna bakın: https://reactnative.dev

---

**Not:** Bu rehber KuryeApp projesine özeldir. React Native 0.73.0 versiyonu kullanılmaktadır.