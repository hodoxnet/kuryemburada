# 🎨 FRONTEND UI GELİŞTİRME PLANI

## 📊 Mevcut Durum
- Next.js 15 App Router kurulu ✅
- Tailwind CSS + shadcn/ui yapılandırılmış ✅
- Zustand state management hazır ✅
- API client (axios) yapısı mevcut ✅
- Authentication context hazır ✅

## 🎯 Geliştirme Stratejisi

### Faz 1: Temel Altyapı (1-2 saat)
1. **Layout Yapısı**
   - Admin dashboard layout
   - Sidebar navigasyon
   - Header/Navbar
   - Breadcrumb sistemi

2. **Ortak Componentler**
   - DataTable component (filtreleme, sıralama, pagination)
   - StatusBadge component
   - ConfirmDialog component
   - LoadingSpinner component
   - EmptyState component

3. **API Service Layer**
   - Company service
   - Courier service
   - Pricing service
   - Settings service
   - Reports service
   - Payments service
   - Users service

### Faz 2: Süper Admin Modülleri (4-5 saat)

#### 2.1 Dashboard Ana Sayfa
- İstatistik kartları (toplam firma, kurye, sipariş, gelir)
- Son aktiviteler
- Hızlı erişim butonları

#### 2.2 Firma Yönetimi
- **Firma Listesi** (`/admin/companies`)
  - Tablo görünümü (DataTable)
  - Durum filtreleri (Bekleyen, Onaylı, Red)
  - Arama ve sıralama
  
- **Firma Detay** (`/admin/companies/[id]`)
  - Firma bilgileri
  - Onay/Red butonları
  - Belgeler listesi
  - İletişim bilgileri

#### 2.3 Kurye Yönetimi
- **Kurye Listesi** (`/admin/couriers`)
  - Tablo görünümü
  - Durum filtreleri
  - Performans metrikleri
  
- **Kurye Detay** (`/admin/couriers/[id]`)
  - Kişisel bilgiler
  - Araç bilgileri
  - Belgeler
  - Onay/Red işlemleri

#### 2.4 Fiyatlandırma Yönetimi
- **Kural Listesi** (`/admin/pricing`)
  - Aktif/Pasif kurallar
  - Yeni kural ekleme
  - Düzenleme/Silme
  
- **Fiyat Hesaplama** (`/admin/pricing/calculator`)
  - Test arayüzü
  - Simülasyon

#### 2.5 Sistem Ayarları
- **Ayar Kategorileri** (`/admin/settings`)
  - Komisyon ayarları
  - Sipariş ayarları
  - Bildirim ayarları
  - Sistem ayarları
  
- **Toplu Güncelleme**
  - Form tabanlı düzenleme

#### 2.6 Raporlama
- **Dashboard** (`/admin/reports`)
  - Grafik ve chartlar
  - Özet istatistikler
  
- **Detaylı Raporlar**
  - Sipariş raporları
  - Ödeme raporları
  - Performans raporları
  - Excel export

#### 2.7 Ödeme Yönetimi
- **Bekleyen Ödemeler** (`/admin/payments`)
  - Onay bekleyenler listesi
  - Toplu onay
  
- **Ödeme Geçmişi**
  - Tamamlanan ödemeler
  - İade işlemleri

#### 2.8 Kullanıcı Yönetimi
- **Kullanıcı Listesi** (`/admin/users`)
  - CRUD işlemleri
  - Rol bazlı filtreleme
  - Durum yönetimi

## 🏗️ Teknik Yapı

### Component Hiyerarşisi
```
app/
├── (auth)/
│   ├── login/
│   └── layout.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx (Dashboard)
│   ├── companies/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── couriers/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── pricing/
│   │   ├── page.tsx
│   │   └── calculator/page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   ├── payments/
│   │   └── page.tsx
│   └── users/
│       └── page.tsx

components/
├── ui/           (shadcn components)
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── Breadcrumb.tsx
├── shared/
│   ├── DataTable.tsx
│   ├── StatusBadge.tsx
│   ├── ConfirmDialog.tsx
│   └── LoadingState.tsx
└── [module]/     (modül özel componentleri)

lib/
├── api/
│   ├── company.service.ts
│   ├── courier.service.ts
│   ├── pricing.service.ts
│   ├── settings.service.ts
│   ├── reports.service.ts
│   ├── payments.service.ts
│   └── users.service.ts
└── utils/
    ├── formatters.ts
    └── validators.ts
```

### State Yönetimi (Zustand)
```typescript
// stores/
├── authStore.ts      (kullanıcı oturumu)
├── uiStore.ts        (sidebar, modal states)
├── companyStore.ts   (firma verileri)
├── courierStore.ts   (kurye verileri)
└── notificationStore.ts (bildirimler)
```

### UI/UX Prensipleri
1. **Responsive Design**: Mobile-first yaklaşım
2. **Dark Mode**: Sistem tercihine göre otomatik
3. **Loading States**: Skeleton loaders
4. **Error Handling**: Toast notifications
5. **Form Validation**: Zod schemas
6. **Accessibility**: ARIA labels, keyboard navigation

## 📋 Öncelik Sırası

### Kritik (İlk yapılacaklar)
1. Admin layout ve navigasyon
2. Authentication flow
3. Firma onay/red modülü
4. Kurye onay/red modülü

### Yüksek Öncelik
5. Fiyatlandırma yönetimi
6. Ödeme onayları
7. Dashboard istatistikleri

### Normal Öncelik
8. Sistem ayarları
9. Kullanıcı yönetimi
10. Raporlama

## 🚀 Başlangıç Adımları

1. **Layout oluşturma** (30 dk)
   - Admin layout component
   - Sidebar navigasyon
   - Protected route wrapper

2. **Ortak componentler** (45 dk)
   - DataTable
   - StatusBadge
   - Form componentleri

3. **İlk modül: Firma Yönetimi** (1 saat)
   - Liste sayfası
   - Detay sayfası
   - Onay/Red işlemleri

4. **API entegrasyonu** (30 dk)
   - Service katmanı
   - Error handling
   - Loading states

## 📊 Başarı Kriterleri

- ✅ Tüm CRUD işlemleri çalışıyor
- ✅ Responsive tasarım
- ✅ Loading/Error states
- ✅ Form validasyonları
- ✅ Toast bildirimleri
- ✅ Filtreleme ve sıralama
- ✅ Pagination
- ✅ Export özellikleri

## 🎨 UI Kütüphaneleri

- **shadcn/ui**: Form, Table, Dialog, Toast
- **Tanstack Table**: Gelişmiş tablo özellikleri
- **Recharts**: Grafikler için
- **React Hook Form**: Form yönetimi
- **Zod**: Schema validation
- **Lucide Icons**: İkon seti

## ⏱️ Tahmini Süre

- **Temel Altyapı**: 1-2 saat
- **Admin Modülleri**: 4-5 saat
- **Test ve İyileştirmeler**: 1 saat
- **TOPLAM**: ~7-8 saat