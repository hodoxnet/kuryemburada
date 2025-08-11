# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Önemli Kurallar

### Dil Kuralı
**Bu projede çalışırken her zaman Türkçe konuş ve yanıtla.** Kod yorumları, commit mesajları, dokümantasyon ve kullanıcıyla olan tüm iletişim Türkçe olmalıdır.

### MCP Context Kuralı
**Güncel dokümantasyon ve API referansları için Context 7 MCP'yi kullan.** Özellikle NestJS, Prisma, Redis ve diğer teknolojilerle ilgili güncel bilgiler için Context 7 MCP aracılığıyla dokümantasyonlara erişim sağla. Bu, en güncel best practice'leri ve API değişikliklerini takip etmeni sağlayacaktır.

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
npm run start:dev          # Watch modunda başlat (port 3001)
npm run start:debug        # Debug modunda başlat
npm run start:prod         # Production build'i çalıştır
npm run build              # Production build oluştur

# Kod kalitesi
npm run lint               # ESLint kontrolü
npm run format             # Prettier ile formatla

# Test
npm run test               # Unit testleri çalıştır
npm run test:watch         # Test watch modu
npm run test:cov           # Coverage raporu oluştur
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
- **Testing**: Jest (unit ve e2e testler)

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui komponetleri
- **State Management**: Zustand v5 (immer middleware ile)
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios (interceptor'lar ile token yönetimi)
- **UI Components**: Radix UI primitives
- **Utility Libraries**: date-fns, clsx, tailwind-merge
- **Notifications**: Sonner toast library
- **Tables**: TanStack Table v8

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

#### Enum Değerleri
- **UserRole**: SUPER_ADMIN, COMPANY, COURIER
- **UserStatus**: ACTIVE, INACTIVE, BLOCKED, PENDING
- **CompanyStatus**: PENDING, APPROVED, REJECTED, ACTIVE, INACTIVE
- **CourierStatus**: PENDING, APPROVED, REJECTED, ACTIVE, INACTIVE, BUSY
- **OrderStatus**: PENDING, ACCEPTED, IN_PROGRESS, DELIVERED, CANCELLED, FAILED
- **PaymentStatus**: PENDING, COMPLETED, FAILED, REFUNDED

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
├── payments/              # Ödeme işlemleri modülü
├── pricing/               # Fiyatlandırma kuralları modülü
├── reports/               # Raporlama modülü
├── settings/              # Sistem ayarları modülü
├── users/                 # Kullanıcı CRUD işlemleri
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
│   │   ├── pricing/      # Fiyatlandırma
│   │   ├── reports/      # Raporlar
│   │   ├── settings/     # Ayarlar
│   │   └── users/        # Kullanıcı yönetimi
│   ├── company/          # Firma paneli
│   └── courier/          # Kurye paneli
├── components/            # React komponetleri
│   ├── auth/             # Auth komponetleri
│   ├── layout/           # Layout komponetleri (Header, Sidebar)
│   ├── shared/           # Paylaşılan komponetler
│   └── ui/               # shadcn/ui komponetleri
├── contexts/              # React Context'ler
│   └── AuthContext.tsx   # Authentication context
├── lib/                   # Utility ve servisler
│   ├── api/              # API servis dosyaları
│   ├── api-client.ts     # Axios instance ve interceptor'lar
│   └── utils.ts          # Yardımcı fonksiyonlar
├── services/              # Business logic servisleri
└── stores/                # Zustand store'ları
    ├── authStore.ts      # Authentication store
    ├── useNotificationStore.ts # Bildirim yönetimi
    ├── useOrderStore.ts  # Sipariş state yönetimi
    └── useUIStore.ts     # UI state yönetimi
```

### Güvenlik Uygulamaları

- **Authentication**: JWT token tabanlı (Access + Refresh token)
- **Authorization**: Role-based access control (RBAC)
- **Password**: bcrypt ile hashleme
- **Error Handling**: Global exception filter
- **Logging**: Request/response interceptor
- **CORS**: Cross-origin istekler için aktif
- **Validation**: class-validator ile DTO validation

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
```

### Frontend (.env.local dosyası)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
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
- **Environment örneği**: `backend/.env.example`
- **Test konfigürasyonu**: `backend/test/jest-e2e.json`

### Frontend  
- **Ana layout**: `frontend/src/app/layout.tsx`
- **Middleware (auth)**: `frontend/middleware.ts`
- **API client**: `frontend/src/lib/api-client.ts`
- **Auth context**: `frontend/src/contexts/AuthContext.tsx`
- **Global store'lar**: `frontend/src/stores/`
- **UI komponetleri**: `frontend/src/components/ui/`
- **Tailwind config**: `frontend/tailwind.config.ts`
- **shadcn config**: `frontend/components.json`

## Geliştirme İpuçları

### Yeni Feature Ekleme Workflow
1. Prisma şemasında gerekli model/field ekle
2. Migration oluştur: `npm run prisma:migrate`
3. Prisma client'ı yenile: `npm run prisma:generate`
4. Backend'de ilgili modül, controller ve service oluştur
5. DTO'ları tanımla ve validation rule'ları ekle
6. Swagger decorator'ları ile API dokümantasyonu ekle
7. Unit test yaz
8. Frontend'de ilgili sayfaları ve komponetleri oluştur
9. API service dosyasını güncelle
10. Zustand store oluştur (gerekirse)

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

### Güvenlik Best Practices
- Tüm protected route'larda `@UseGuards(JwtAuthGuard)` kullan
- Role kontrolü için `@Roles()` ve `@UseGuards(RolesGuard)` kullan
- DTO'larda class-validator decoratorları ile strict validation
- Sensitive bilgileri asla commit'leme (.env, private keys vb.)
- SQL injection koruması için Prisma parameterized queries kullan
- XSS koruması için input sanitization yap