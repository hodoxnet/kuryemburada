# Kurye Dashboard Mobil Navigasyon Sistemi

## 📱 Genel Bakış

Kurye dashboard'u için native app hissi veren mobil navigasyon sistemi. Web görünümü korunurken, mobil cihazlarda (<768px) modern ve kullanıcı dostu bir deneyim sunar.

## 🏗️ Bileşen Yapısı

### 1. MobileHeader
**Dosya:** `MobileHeader.tsx`  
**Props:**
- `title: string` - Aktif sayfanın başlığı
- `onMenuClick: () => void` - Drawer açma fonksiyonu

**Özellikler:**
- Sol: Hamburger menü ikonu (drawer tetikleyici)
- Orta: Dinamik sayfa başlığı
- Sağ: Bildirimler ve kullanıcı menüsü

### 2. MobileTabs
**Dosya:** `MobileTabs.tsx`  
**Props:**
- `tabs: TabItem[]` - Bottom navigation için tab öğeleri

**TabItem Interface:**
```typescript
interface TabItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}
```

**Özellikler:**
- Fixed bottom position
- 4 ana navigasyon öğesi (Dashboard, Yeni Siparişler, Aktif Teslimatlar, Kazançlar)
- Aktif tab vurgulanması
- Badge desteği (bildirim sayıları için)
- iOS Safe Area desteği

### 3. MobileDrawer
**Dosya:** `MobileDrawer.tsx`  
**Props:**
- `open: boolean` - Drawer açık/kapalı durumu
- `onOpenChange: (open: boolean) => void` - Durum değişim callback'i
- `menuItems: DrawerMenuItem[]` - Tüm menü öğeleri
- `title?: string` - Drawer başlığı

**Özellikler:**
- Tüm menü öğelerini listeler
- Kullanıcı profil bilgisi
- Aktif route vurgulanması
- ESC tuşu ile kapanma
- Dışarı tıklamayla kapanma
- Focus trap ve erişilebilirlik

### 4. CourierMobileLayout
**Dosya:** `CourierMobileLayout.tsx`  
**Props:**
- `children: React.ReactNode` - Sayfa içeriği
- `menuItems: DrawerMenuItem[]` - Menü öğeleri

**Özellikler:**
- Mobil bileşenleri koordine eder
- Route bazlı sayfa başlığı yönetimi
- Drawer state yönetimi
- Bildirim sayıları entegrasyonu
- Route değişimlerinde otomatik drawer kapama

## 🔧 Kullanım

### Layout Entegrasyonu

```typescript
// app/courier/layout.tsx
import { useIsMobile } from "@/hooks/useMediaQuery";
import { CourierMobileLayout } from "@/components/courier/mobile/CourierMobileLayout";

export default function CourierLayout({ children }) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <CourierMobileLayout menuItems={courierMenuItems}>
        {children}
      </CourierMobileLayout>
    );
  }
  
  // Desktop layout...
}
```

### useMediaQuery Hook

```typescript
// Temel kullanım
const matches = useMediaQuery('(max-width: 768px)');

// Hazır helper'lar
const isMobile = useIsMobile(); // max-width: 767px
const isTablet = useIsTablet(); // 768px - 1023px
const isDesktop = useIsDesktop(); // min-width: 1024px
```

## 📐 Responsive Davranış

- **< 768px (Mobile):** Mobil navigasyon aktif
  - MobileHeader görünür
  - MobileTabs görünür
  - Desktop sidebar gizli
  
- **>= 768px (Tablet/Desktop):** Desktop layout aktif
  - Geleneksel sidebar görünür
  - Mobile bileşenler gizli

## ♿ Erişilebilirlik

### Keyboard Navigation
- `Tab` / `Shift+Tab`: Öğeler arası gezinti
- `ESC`: Drawer'ı kapatma
- `Enter` / `Space`: Buton aktivasyonu

### ARIA Özellikleri
- `aria-label`: Tüm interaktif öğelerde
- `aria-current="page"`: Aktif route için
- `role` ve `aria-expanded`: Sheet/Drawer için
- Focus trap: Drawer açıkken

### Screen Reader Desteği
- Anlamlı etiketler
- Durum değişim anonsları
- Gizli başlıklar (VisuallyHidden)

### Reduced Motion
CSS'te `prefers-reduced-motion` desteği:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animasyonlar devre dışı */
}
```

## 🎨 Stil ve Tema

### Renk Paleti
Mevcut tema token'ları kullanılır:
- Primary: Ana vurgu rengi
- Secondary: İkincil öğeler
- Destructive: Uyarılar ve çıkış
- Muted: Pasif öğeler
- Background/Foreground: Arka plan ve metin

### Spacing
Tailwind default spacing sistemi:
- `p-4`: Standart padding
- `gap-3`: Öğeler arası boşluk
- `h-14`: Header yüksekliği
- `h-16`: Tab bar yüksekliği

## 🚀 Performans Optimizasyonları

1. **Lazy Loading:** Mobile bileşenler sadece gerektiğinde yüklenir
2. **Memoization:** Gereksiz re-render'lar önlenir
3. **useMediaQuery:** Breakpoint değişimlerinde minimal render
4. **CSS-based hiding:** JS yerine CSS ile gizleme/gösterme

## 🐛 Bilinen Sorunlar ve Çözümleri

### iOS Safe Area
Bottom tabs için safe area padding:
```css
.h-safe-area-inset-bottom {
  height: env(safe-area-inset-bottom, 0);
}
```

### Viewport Height
iOS Safari'de viewport height sorunu:
```css
@supports (-webkit-touch-callout: none) {
  .min-h-screen {
    min-height: -webkit-fill-available;
  }
}
```

### Body Scroll Lock
Drawer açıkken body scroll'u engelleme:
```css
.overflow-hidden-mobile {
  @media (max-width: 767px) {
    overflow: hidden !important;
    position: fixed !important;
    width: 100% !important;
  }
}
```

## 📋 Test Kontrol Listesi

- [ ] Mobile view'da sidebar gizli mi?
- [ ] Bottom tabs görünüyor ve çalışıyor mu?
- [ ] Drawer açılıp kapanıyor mu?
- [ ] Aktif route doğru vurgulanıyor mu?
- [ ] Badge sayıları görünüyor mu?
- [ ] ESC ile drawer kapanıyor mu?
- [ ] Dışarı tıklama ile drawer kapanıyor mu?
- [ ] Route değişiminde drawer kapanıyor mu?
- [ ] Keyboard navigation çalışıyor mu?
- [ ] Screen reader anonsları doğru mu?
- [ ] iOS Safe Area padding çalışıyor mu?
- [ ] Desktop'a geçişte layout değişiyor mu?

## 🔗 İlgili Dosyalar

- `/hooks/useMediaQuery.ts` - Responsive breakpoint hook'u
- `/app/courier/layout.tsx` - Ana layout entegrasyonu
- `/app/globals.css` - Mobile CSS utilities
- `/components/ui/sheet.tsx` - Drawer için base component
- `/components/ui/badge.tsx` - Bildirim sayıları için