<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Önemli Kurallar

### Dil Kuralı
**Bu projede çalışırken her zaman Türkçe konuş ve yanıtla.** Kod yorumları, commit mesajları, dokümantasyon ve kullanıcıyla olan tüm iletişim Türkçe olmalıdır.

### MCP Context Kuralı
**Güncel dokümantasyon ve API referansları için Context 7 MCP'yi kullan.** Özellikle NestJS, Prisma, Redis ve diğer teknolojilerle ilgili güncel bilgiler için Context 7 MCP aracılığıyla dokümantasyonlara erişim sağla. Bu, en güncel best practice'leri ve API değişikliklerini takip etmeni sağlayacaktır.

### Özelleşmiş Agent Kullanımı
Bu projede spesifik görevler için özelleşmiş agent'lar mevcuttur:

- **kurye-operasyon-uzmani**: Kurye başvuruları, onay süreçleri, sipariş kabul/teslimat operasyonları, kurye dashboard geliştirme, araç ve belge yönetimi, kurye durum yönetimi (PENDING, APPROVED, ACTIVE, BUSY) ve kurye-sipariş eşleştirme algoritmalarıyla ilgili tüm görevlerde kullan.

- **firma-operasyon-yoneticisi**: Firma yönetimi özellikleri, sipariş oluşturma iş akışları, firma operasyonları, onay süreçleri, firma dashboard geliştirme, firmalar için ödeme işlemleri, CompanyStatus yönetimi ve firma-sipariş ilişkileriyle ilgili görevlerde kullan.

Bu agent'ları ilgili modüllerle çalışırken proaktif olarak kullan.

## Proje Özeti

Bu proje, NestJS backend ve Next.js frontend kullanarak geliştirilmekte olan modern bir kurye operasyon yönetim sistemidir. Sistem, kurye firmalarını, kuryeleri, siparişleri ve ödemeleri rol tabanlı erişim kontrolü ile yönetir.

## Geliştirme Komutları

### Backend Komutları (`/backend` dizininde çalıştır)

```bash
# Bağımlılıkları yükle
npm install

# Veritabanı işlemleri
npm run prisma:generate    # Prisma client oluştur
npm run prisma:migrate     # Veritabanı migration'larını çalıştır
npm run prisma:studio      # Prisma Studio GUI'yi aç
npm run prisma:seed        # Veritabanını seed et

# Geliştirme
npm run start              # Production modunda başlat
npm run start:dev          # Watch modunda başlat (port 3001)
npm run start:debug        # Debug modunda başlat (port 9229)
npm run start:prod         # Production build'i çalıştır
npm run build              # Production build oluştur

# Kod kalitesi
npm run lint               # ESLint kontrolü
npm run format             # Prettier ile formatla

# Test
npm run test               # Unit testleri çalıştır
npm run test:watch         # Test watch modu
npm run test:cov           # Coverage raporu oluştur (coverage/ dizini)
npm run test:e2e           # E2E testleri çalıştır
npm run test:debug         # Debug modunda test çalıştır

# Tek bir test dosyası çalıştırma
npm run test -- auth.service.spec.ts
npm run test -- --testPathPattern=auth
```

### Frontend Komutları (`/frontend` dizininde çalıştır)

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme
npm run dev                # Development server (port 3000)
npm run build              # Production build oluştur
npm run start              # Production server başlat
npm run lint               # ESLint kontrolü
```

## Yüksek Seviye Mimari

### Teknoloji Stack'i

#### Backend
- **Framework**: NestJS v11 (TypeScript)
- **Veritabanı**: PostgreSQL (veritabanı adı: kuryemburadav1)
- **ORM**: Prisma v6
- **Authentication**: JWT (Passport.js) - Access ve Refresh token sistemi
- **Cache**: Redis (cache-manager v7) - TTL ve max items konfigürasyonu
- **Logging**: Winston - Dosya ve konsol transport'ları
- **API Dokümantasyon**: Swagger/OpenAPI (`http://localhost:3001/api-docs`)
- **Validation**: class-validator ve class-transformer
- **Testing**: Jest v30 (unit ve e2e testler)
- **File Upload**: Multer - Doküman ve görsel yükleme
- **Real-time Communication**: Socket.IO - WebSocket tabanlı bildirimler

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui komponetleri (New York theme)
- **State Management**: Zustand v5 (immer middleware ile)
- **Form Handling**: React Hook Form v7 + Zod validation
- **HTTP Client**: Axios (interceptor'lar ile token yönetimi)
- **UI Components**: Radix UI primitives
- **Maps**: Google Maps JavaScript API (@react-google-maps/api)
- **Utility Libraries**: date-fns, clsx, tailwind-merge
- **Notifications**: Sonner toast library
- **Tables**: TanStack Table v8
- **Animations**: Framer Motion v12
- **Real-time Communication**: Socket.IO Client - WebSocket tabanlı bildirimler

### Veritabanı Mimarisi

PostgreSQL veritabanı Prisma ORM ile yönetilir. Ana varlıklar ve ilişkileri:

#### Temel Tablolar
- **User**: Kimlik doğrulama ve rol yönetimi (SUPER_ADMIN, COMPANY, COURIER)
- **Company**: Sipariş oluşturan firma hesapları
- **Courier**: Teslimat personeli (araç ve belge takibi dahil)
- **Order**: Teslimat siparişleri (yaşam döngüsü takibi)
- **Payment**: Siparişlere bağlı finansal işlemler
- **Document**: Doğrulama belgeleri (ehliyet, sertifikalar)
- **Notification**: Kullanıcı bildirimleri
- **PricingRule**: Esnek fiyatlandırma kuralları
- **ServiceArea**: Hizmet bölgeleri tanımları
- **CompanyBalance**: Firma bakiye ve borç takibi
- **DailyReconciliation**: Günlük mutabakat kayıtları
- **CompanyPayment**: Firma ödeme işlemleri
- **RefreshToken**: JWT refresh token yönetimi ve rotasyon
- **AuditLog**: Sistem işlem logları

#### Enum Değerleri
- **UserRole**: SUPER_ADMIN, COMPANY, COURIER
- **UserStatus**: ACTIVE, INACTIVE, BLOCKED, PENDING
- **CompanyStatus**: PENDING, APPROVED, REJECTED, ACTIVE, INACTIVE
- **CourierStatus**: PENDING, APPROVED, REJECTED, ACTIVE, INACTIVE, BUSY
- **OrderStatus**: PENDING, ACCEPTED, IN_PROGRESS, DELIVERED, CANCELLED, REJECTED
- **PaymentStatus**: PENDING, COMPLETED, FAILED, REFUNDED
- **PaymentMethod**: CASH, CREDIT_CARD, BANK_TRANSFER
- **PackageType**: DOCUMENT, PACKAGE, FOOD, OTHER
- **PackageSize**: SMALL, MEDIUM, LARGE, EXTRA_LARGE
- **Urgency**: NORMAL, URGENT, VERY_URGENT
- **DeliveryType**: STANDARD, EXPRESS
- **DocumentType**: TRADE_LICENSE, TAX_CERTIFICATE, KEP_ADDRESS, IDENTITY_CARD, DRIVER_LICENSE, VEHICLE_REGISTRATION, INSURANCE, ADDRESS_PROOF, CRIMINAL_RECORD, HEALTH_REPORT, TAX_PLATE, OTHER
- **DocumentStatus**: PENDING, APPROVED, REJECTED
- **NotificationType**: ORDER_CREATED, ORDER_ACCEPTED, ORDER_REJECTED, ORDER_DELIVERED, ORDER_CANCELLED, PAYMENT_RECEIVED, PAYMENT_FAILED, ACCOUNT_APPROVED, ACCOUNT_REJECTED, SYSTEM
- **ReconciliationStatus**: PENDING, PAID, PARTIALLY_PAID, OVERDUE
- **CompanyPaymentType**: DAILY_RECONCILIATION, MANUAL_PAYMENT, REFUND, ADJUSTMENT

### Modül Yapısı

#### Backend Modülleri
```
backend/src/
├── app.module.ts          # Ana modül ve global konfigürasyonlar
├── auth/                  # JWT auth, role guards, password yönetimi
│   ├── auth.service.ts    # Login, register, token refresh
│   ├── jwt.strategy.ts    # JWT validation strategy
│   ├── roles.guard.ts     # Role-based access control
│   └── roles.decorator.ts # @Roles() decorator
├── company/               # Firma yönetimi modülü
├── courier/               # Kurye yönetimi modülü
├── orders/                # Sipariş yönetimi modülü
├── payments/              # Ödeme işlemleri modülü
├── pricing/               # Fiyatlandırma kuralları modülü
├── reports/               # Raporlama modülü
├── settings/              # Sistem ayarları modülü
├── service-area/          # Hizmet bölgeleri modülü
├── documents/             # Belge yükleme ve yönetimi
├── users/                 # Kullanıcı CRUD işlemleri
├── reconciliation/        # Günlük mutabakat işlemleri
├── company-payments/      # Firma ödeme işlemleri modülü
├── notifications/         # Bildirim servisi (WebSocket desteği)
├── prisma/                # Veritabanı servisi
│   └── prisma.service.ts  # Prisma client wrapper
├── cache/                 # Redis cache modülü
│   └── cache.module.ts    # Cache manager konfigürasyonu
├── logger/                # Winston logger modülü
└── common/                # Paylaşılan araçlar
    ├── decorators/        # Custom decorator'lar
    ├── exceptions/        # Global exception filter
    ├── interceptors/      # Logging ve transform interceptor'ları
    └── logger/            # Winston konfigürasyonu
```

#### Frontend Yapısı
```
frontend/src/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Auth layout grubu
│   │   └── login/        # Login sayfası
│   ├── admin/            # Admin paneli
│   │   ├── companies/    # Firma yönetimi
│   │   ├── couriers/     # Kurye yönetimi
│   │   ├── payments/     # Ödeme yönetimi
│   │   ├── reports/      # Raporlar
│   │   ├── service-areas/# Hizmet bölgeleri
│   │   ├── settings/     # Ayarlar
│   │   └── users/        # Kullanıcı yönetimi
│   ├── apply/            # Başvuru sayfaları
│   │   ├── company/      # Firma başvurusu
│   │   ├── courier/      # Kurye başvurusu
│   │   └── success/      # Başvuru başarılı
│   ├── company/          # Firma paneli
│   │   ├── new-order/    # Yeni sipariş
│   │   └── orders/       # Sipariş yönetimi
│   ├── courier/          # Kurye paneli
│   │   ├── available-orders/ # Müsait siparişler
│   │   ├── dashboard/    # Kurye dashboard
│   │   └── orders/       # Kurye siparişleri
│   └── unauthorized/     # Yetkisiz erişim sayfası
├── components/            # React komponetleri
│   ├── auth/             # Auth komponetleri
│   ├── layout/           # Layout komponetleri (Header, Sidebar)
│   ├── shared/           # Paylaşılan komponetler
│   │   ├── DataTable.tsx # Veri tablosu
│   │   ├── GoogleMap.tsx # Harita komponenti
│   │   └── StatusBadge.tsx # Durum göstergesi
│   └── ui/               # shadcn/ui komponetleri
├── contexts/              # React Context'ler
│   └── AuthContext.tsx   # Authentication context
├── lib/                   # Utility ve servisler
│   ├── api/              # API servis dosyaları
│   ├── api-client.ts     # Axios instance ve interceptor'lar
│   ├── auth.ts           # Auth yardımcı fonksiyonlar
│   └── utils.ts          # Genel yardımcı fonksiyonlar
├── services/              # Business logic servisleri
│   ├── auth.service.ts   # Auth servisi
│   └── order.service.ts  # Sipariş servisi
└── stores/                # Zustand store'ları
    ├── authStore.ts      # Authentication store
    ├── useAuthStore.ts   # Auth store hook
    ├── useNotificationStore.ts # Bildirim yönetimi
    ├── useOrderStore.ts  # Sipariş state yönetimi
    └── useUIStore.ts     # UI state yönetimi
```

### Güvenlik Uygulamaları

- **Authentication**: JWT token tabanlı (Access + Refresh token rotasyon sistemi)
- **Authorization**: Role-based access control (RBAC) - Guard'lar ile korumalı endpoint'ler
- **Password**: bcrypt ile hashleme (salt rounds: 10)
- **Error Handling**: Global exception filter ve custom error sınıfları
- **Logging**: Winston ile detaylı loglama (dosya + konsol)
- **CORS**: Cross-origin istekler için yapılandırılabilir
- **Validation**: class-validator ile DTO validation (whitelist aktif)
- **Rate Limiting**: Planlanmış (henüz implement edilmemiş)

### API Desenleri

Tüm API endpoint'leri RESTful prensipleri takip eder:
- Global exception filter ile tutarlı hata yanıtları
- class-validator ile DTO validation (whitelist aktif)
- Swagger/OpenAPI ile otomatik dokümantasyon
- Interceptor'lar ile request/response logging
- JWT Bearer token authentication
- Role-based authorization (@Roles decorator)
- Pagination, sorting ve filtering desteği
- Consistent response format

## Environment Değişkenleri

### Backend (.env dosyası)
```bash
# Application
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/kuryemburadav1?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d  # Refresh token süresi

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=3600
REDIS_MAX_ITEMS=100

# API Documentation
SWAGGER_TITLE="Kurye Operasyon API"
SWAGGER_DESCRIPTION="Kurye Operasyon Sistemi API Dokümantasyonu"
SWAGGER_VERSION=1.0.0
SWAGGER_PATH=api-docs

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email (ileride kullanım için)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=

# SMS (ileride kullanım için) 
SMS_API_KEY=
SMS_API_URL=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Payment Gateway (ileride kullanım için)
PAYMENT_API_KEY=
PAYMENT_API_SECRET=
```

### Frontend (.env.local dosyası)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Test Stratejisi

### Backend Testing
- **Framework**: Jest v30 + ts-jest
- **Unit Test**: `src/**/*.spec.ts` dosyaları
- **E2E Test**: `test/**/*.e2e-spec.ts` dosyaları  
- **Coverage**: `npm run test:cov` ile rapor oluştur (coverage dizini)
- **Test Database**: Test için ayrı veritabanı kullanımı önerilir
- **Mocking**: Jest mock fonksiyonları ve @nestjs/testing utilities

### Frontend Testing
Frontend için henüz test konfigürasyonu yapılmamış durumda.

## Önemli Dosya Yolları

### Backend
- **Ana uygulama başlatma**: `backend/src/main.ts`
- **Global modül konfigürasyonu**: `backend/src/app.module.ts`
- **Veritabanı şeması**: `backend/prisma/schema.prisma`
- **Migration'lar**: `backend/prisma/migrations/`
- **Seed dosyası**: `backend/prisma/seed.ts`
- **Environment örneği**: `backend/.env.example`
- **Test konfigürasyonu**: `backend/jest.config.js` ve `backend/test/jest-e2e.json`
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Static files (uploads)**: `backend/uploads/`
- **Log dosyaları**: `backend/logs/` (Winston log output)

### Frontend  
- **Ana layout**: `frontend/src/app/layout.tsx`
- **Middleware (auth)**: `frontend/middleware.ts`
- **API client**: `frontend/src/lib/api-client.ts`
- **Auth context**: `frontend/src/contexts/AuthContext.tsx`
- **Global store'lar**: `frontend/src/stores/`
- **UI komponetleri**: `frontend/src/components/ui/` (shadcn/ui)
- **Paylaşılan komponetler**: `frontend/src/components/shared/`
- **Tailwind config**: `frontend/tailwind.config.ts`
- **shadcn config**: `frontend/components.json` (New York theme)
- **Public assets**: `frontend/public/`

## Geliştirme İpuçları

### Yeni Feature Ekleme Workflow
1. Prisma şemasında gerekli model/field ekle
2. Migration oluştur: `npm run prisma:migrate dev --name feature_name`
3. Prisma client'ı yenile: `npm run prisma:generate`
4. Backend'de ilgili modül oluştur: `nest g module feature-name`
5. Controller ve service oluştur: `nest g controller feature-name` ve `nest g service feature-name`
6. DTO'ları tanımla ve validation rule'ları ekle
7. Swagger decorator'ları ile API dokümantasyonu ekle (@ApiTags, @ApiOperation, @ApiResponse)
8. Unit test yaz (*.spec.ts dosyaları)
9. Frontend'de ilgili sayfaları ve komponetleri oluştur
10. API service dosyasını güncelle veya yeni service oluştur
11. Zustand store oluştur (gerekirse)
12. Role-based erişim kontrollerini ekle (@Roles decorator)

### Debugging
- **Backend**: `npm run start:debug` ile 9229 portunda debugger aç
- **Frontend**: Browser DevTools, React Developer Tools, Next.js debug mode
- **Database**: `npm run prisma:studio` ile Prisma Studio GUI kullan
- **API Test**: Swagger UI veya Postman/Insomnia kullan

### Performance Optimizasyonu  
- Redis cache kullanımı için `@UseInterceptors(CacheInterceptor)` ekle
- Prisma query'lerinde `select` ve `include` ile veri seçimi yap
- Frontend'de React.memo ve useMemo kullan
- Image optimization için Next.js Image component kullan
- Bundle size analizi için `npm run build` sonrası .next/analyze/ kontrol et
- Lazy loading için Next.js dynamic imports kullan
- API response'larında pagination uygula

### Güvenlik Best Practices
- Tüm protected route'larda `@UseGuards(JwtAuthGuard)` kullan
- Role kontrolü için `@Roles()` ve `@UseGuards(RolesGuard)` kullan
- DTO'larda class-validator decoratorları ile strict validation
- Sensitive bilgileri asla commit'leme (.env, private keys vb.)
- SQL injection koruması için Prisma parameterized queries kullan
- XSS koruması için input sanitization yap
- Token rotation stratejisi ile refresh token güvenliği
- Frontend'de middleware ile route korumaları

## Kritik Konular ve Dikkat Edilmesi Gerekenler

1. **Port Konfigürasyonu**: Backend varsayılan olarak 3001 portunda çalışır (main.ts'de default 3000 ama .env'de 3001 önerilir)
2. **Database Adı**: PostgreSQL veritabanı adı `kuryemburadav1` olmalı
3. **Token Yönetimi**: Access token cookie'de saklanır, refresh token rotation uygulanır (RefreshToken tablosunda family tracking)
4. **Route Korumaları**: Frontend middleware.ts dosyası tüm route korumaları için kritik - JWT decode ile role bazlı yönlendirme
5. **Dosya Yükleme**: Belgeler `backend/uploads/` dizinine kaydedilir, static files olarak servis edilir
6. **Role Hiyerarşisi**: SUPER_ADMIN > COMPANY = COURIER
7. **Status Yönetimi**: User, Company ve Courier için ayrı status enum'ları mevcut
8. **Cache Strategy**: Redis ile cache-manager v7 kullanılıyor (TTL ve max items konfigürasyonu)
9. **WebSocket Bağlantısı**: Notifications modülü Socket.IO kullanır, real-time bildirimler için
10. **Mutabakat Sistemi**: DailyReconciliation ve CompanyPayment modülleri firma borç takibi için kritik
11. **Global Validation**: ValidationPipe whitelist ve forbidNonWhitelisted aktif - güvenlik için önemli

## Common Pitfalls ve Çözümleri

1. **Prisma Client Hatası**: Migration sonrası `npm run prisma:generate` komutunu çalıştırmayı unutma
2. **CORS Hatası**: Frontend farklı portta çalışıyorsa backend CORS ayarlarını kontrol et (main.ts'de credentials: true)
3. **Token Expired**: Refresh token mekanizması api-client.ts'de otomatik çalışır, family tracking ile güvenli
4. **File Upload Limiti**: MAX_FILE_SIZE env değişkeni ile ayarlanır (default: 10MB)
5. **Test Database**: Test için ayrı veritabanı kullan, production veritabanını kullanma
6. **Middleware Route Matching**: Frontend middleware'de matcher config'i güncellemeyi unutma
7. **WebSocket Connection**: Socket.IO client bağlantısı için credentials gerekli
8. **Enum Validation**: Yeni enum değerleri eklerken hem Prisma schema hem DTO'ları güncelle

## Renk Paletimiz

Güven ve Profesyonellik Odaklı                                                  │
Ana renk: Lacivert (#1E3A8A) – güven ve kurumsallık                                                                  │
İkincil renk: Turuncu (#F97316) – hız, dinamizm, enerji                                                              │
Destek rengi: Beyaz (#FFFFFF) – sade ve temiz arayüz                                                                 │
Ek vurgu: Açık gri (#F3F4F6) – modern dokunuş 