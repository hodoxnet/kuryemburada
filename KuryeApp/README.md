# 📱 Kurye App - React Native WebView

Cross-platform (iOS + Android) kurye uygulaması. Web uygulamasını React Native WebView içinde gösterir.

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js >= 18
- React Native development environment
  - iOS: Xcode 14+, macOS
  - Android: Android Studio, JDK 11
- CocoaPods (iOS için)

### Kurulum

```bash
# Proje dizinine git
cd KuryeApp

# Bağımlılıkları yükle
npm install
# veya
yarn install

# iOS için pod install
cd ios && pod install && cd ..
```

### Development

```bash
# Metro bundler başlat
npm start

# iOS'ta çalıştır
npm run ios

# Android'de çalıştır
npm run android
```

### URL Konfigürasyonu

`src/config/constants.ts` dosyasında:

```typescript
// Development
WEB_URL_DEV: 'http://localhost:3000/courier',

// Production
WEB_URL_PROD: 'https://yourdomain.com/courier',
```

## 📂 Proje Yapısı

```
KuryeApp/
├── src/
│   ├── components/
│   │   ├── WebViewContainer.tsx   # Ana WebView komponenti
│   │   ├── LoadingScreen.tsx      # Yükleme ekranı
│   │   └── NoConnection.tsx       # İnternet yok ekranı
│   ├── config/
│   │   ├── constants.ts           # Uygulama sabitleri
│   │   └── webview.config.ts      # WebView ayarları
│   ├── hooks/
│   │   ├── useNetworkStatus.ts    # İnternet kontrolü
│   │   └── useWebViewBridge.ts    # Native-Web iletişim
│   └── App.tsx                     # Ana uygulama
├── android/                        # Android native dosyalar
├── ios/                           # iOS native dosyalar
└── index.js                       # Entry point
```

## ⚙️ Platform Konfigürasyonları

### iOS

#### Info.plist Ayarları
```xml
<!-- App Transport Security -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>

<!-- Orientation - Sadece portrait -->
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
</array>
```

### Android

#### AndroidManifest.xml İzinler
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Development için -->
<application android:usesCleartextTraffic="true">
```

#### gradle.properties
```properties
android.useAndroidX=true
android.enableJetifier=true
hermesEnabled=true
```

## 🔧 WebView Özellikleri

### Desteklenen Özellikler
- ✅ JWT Cookie authentication
- ✅ Socket.IO real-time bildirimler
- ✅ JavaScript injection
- ✅ Native-Web mesajlaşma
- ✅ Swipe to refresh (iOS)
- ✅ Pull to refresh (Android)
- ✅ Back button yönetimi
- ✅ Network durumu kontrolü
- ✅ Tel/mailto link desteği

### WebView Konfigürasyonu
```typescript
// webview.config.ts
- JavaScript etkin
- DOM Storage etkin
- Cookie persistence
- Safe area desteği (iOS)
- Text zoom 100% (Android)
```

## 📱 Frontend WebView Desteği

Frontend tarafında WebView algılama ve optimizasyonlar:

### WebView Detection
```typescript
// frontend/src/lib/webview-utils.ts
isWebView()         // WebView kontrolü
getPlatform()       // Platform bilgisi
postToNative()      // Native'e mesaj
listenToNative()    // Native'den mesaj dinle
```

### WebView Hook Kullanımı
```typescript
// frontend/src/hooks/useWebView.ts
const { isWebView, platform, makePhoneCall } = useWebView();

if (isWebView) {
  makePhoneCall('5551234567');
}
```

### Meta Tag Optimizasyonları
```typescript
// frontend/src/app/layout.tsx
viewport: {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}
```

## 🛠️ Build & Deploy

### Development Build
```bash
# Android APK (debug)
npm run build:android:debug

# iOS (Xcode'da açar)
npm run ios
```

### Production Build

#### Android
```bash
# APK oluştur
npm run build:android:release

# Output: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS
```bash
# Xcode'da aç
cd ios && open KuryeApp.xcworkspace

# Xcode'da:
1. Product > Archive
2. Distribute App
3. App Store Connect
```

### Signing & Certificates

#### Android Keystore
```bash
# Keystore oluştur
keytool -genkey -v -keystore kurye-release.keystore -alias kurye-key -keyalg RSA -keysize 2048 -validity 10000

# android/app/build.gradle içinde ayarla
```

#### iOS Certificates
- Apple Developer Account gerekli
- Xcode'da Signing & Capabilities ayarla

## 🐛 Debug

### React Native Debugger
```bash
# Chrome DevTools
# Shake device veya Cmd+D (iOS) / Cmd+M (Android)
```

### WebView Console Logs
```javascript
// config/webview.config.ts içinde
// Development modda console.log'lar native'e iletilir
```

### Network İnceleme
- Flipper veya React Native Debugger kullan
- Charles Proxy ile HTTP trafiği incele

## 📝 Notlar

### Localhost Bağlantısı
- iOS Simulator: http://localhost:3000 çalışır
- Android Emulator: http://10.0.2.2:3000 kullan
- Real device: Bilgisayar IP'si kullan

### Performance
- Bundle boyutunu küçült (Hermes etkin)
- Image optimization
- Lazy loading
- Cache stratejisi

### Güvenlik
- Production'da `usesCleartextTraffic="false"`
- SSL certificate pinning (opsiyonel)
- JavaScript injection güvenliği

## 🚨 Bilinen Sorunlar

1. **Android Emulator localhost**: 10.0.2.2 kullan
2. **iOS Simulator slow**: Debug modda normal
3. **Cookie persistence**: Uygulama kapatılıp açıldığında cookies korunur

## 📚 Kaynaklar

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [React Native NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)

## 📄 Lisans

Private - Kurye App © 2024