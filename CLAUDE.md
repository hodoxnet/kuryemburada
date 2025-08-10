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
npm run prisma:seed        # Veritabanını seed et (varsa)

# Geliştirme
npm run start:dev          # Watch modunda başlat (port 3001)
npm run start:debug        # Debug modunda başlat
npm run start:prod         # Production build'i çalıştır

# Kod kalitesi
npm run lint               # ESLint kontrolü
npm run format             # Prettier ile formatla

# Test
npm run test               # Unit testleri çalıştır
npm run test:watch         # Test watch modu
npm run test:cov           # Coverage raporu oluştur
npm run test:e2e           # E2E testleri çalıştır

# Tek bir test dosyası çalıştırma
npm run test -- auth.service.spec.ts
```

### Frontend Komutları (`/frontend` dizininde çalıştır)

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme
npm run dev                # Development server (port 3000)
npm run build              # Production build oluştur
npm run start              # Production server başlat
npm run lint               # Lint kontrolü
```

## Yüksek Seviye Mimari

### Teknoloji Stack'i

#### Backend
- **Framework**: NestJS v11 (TypeScript)
- **Veritabanı**: PostgreSQL (veritabanı adı: kuryemburadav1)
- **ORM**: Prisma v6
- **Authentication**: JWT (Passport.js)
- **Cache**: Redis (cache-manager)
- **Logging**: Winston
- **API Dokümantasyon**: Swagger (`http://localhost:3001/api-docs`)

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios

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

Backend NestJS modüler mimarisini takip eder:

```
backend/src/
├── app.module.ts          # Ana modül ve global konfigürasyonlar
├── auth/                  # JWT auth, role guards, password yönetimi
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── roles.guard.ts
│   └── roles.decorator.ts
├── prisma/                # Veritabanı servisi
│   └── prisma.service.ts
├── cache/                 # Redis cache modülü
│   └── cache.module.ts
└── common/                # Paylaşılan araçlar
    ├── decorators/        # Custom decorator'lar
    ├── exceptions/        # Exception filter'lar
    ├── interceptors/      # Logging interceptor
    └── logger/            # Winston konfigürasyonu
```

### Güvenlik Uygulamaları

- **Authentication**: JWT token tabanlı
- **Authorization**: Role-based access control (RBAC)
- **Password**: bcrypt ile hashleme
- **Error Handling**: Global exception filter
- **Logging**: Request/response interceptor
- **CORS**: Cross-origin istekler için aktif
- **Validation**: class-validator ile DTO validation

### API Desenleri

Tüm API endpoint'leri RESTful prensipleri takip eder:
- Global exception filter ile tutarlı hata yanıtları
- class-validator ile request validation
- Swagger ile otomatik dokümantasyon
- Interceptor'lar ile request/response logging

## Environment Değişkenleri

### Backend (.env dosyası)
```bash
# Veritabanı
DATABASE_URL="postgresql://username:password@localhost:5432/kuryemburadav1"

# JWT
JWT_SECRET="your-secret-key"

# Port
PORT=3001

# Redis (opsiyonel)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env.local dosyası)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Test Stratejisi

### Backend Testing
- **Framework**: Jest
- **Unit Test**: `src/**/*.spec.ts` dosyaları
- **E2E Test**: `test/**/*.e2e-spec.ts` dosyaları
- **Coverage**: `npm run test:cov` ile rapor oluştur

### Frontend Testing
Frontend için henüz test konfigürasyonu yapılmamış durumda.

## Önemli Dosya Yolları

- **Backend konfigürasyonu**: `backend/src/main.ts`
- **Veritabanı şeması**: `backend/prisma/schema.prisma`
- **Migration'lar**: `backend/prisma/migrations/`
- **Frontend ana layout**: `frontend/src/app/layout.tsx`
- **API client**: `frontend/src/lib/api-client.ts`
- **Auth context**: `frontend/src/contexts/AuthContext.tsx`
- **Global store'lar**: `frontend/src/stores/`

## Geliştirme İpuçları

1. **Yeni bir feature eklerken**:
   - Önce Prisma şemasını güncelle
   - Migration oluştur: `npm run prisma:migrate`
   - Backend servisini oluştur
   - Frontend component'ini ekle

2. **Debugging**:
   - Backend: `npm run start:debug` ve VSCode debugger kullan
   - Frontend: React Developer Tools ve Next.js debug mode

3. **Performance**:
   - Redis cache decorator'ünü kullan: `@UseCache()`
   - Prisma query optimization için `include` ve `select` kullan

4. **Güvenlik**:
   - Tüm endpoint'lerde authentication guard kullan
   - Role-based access için `@Roles()` decorator kullan
   - DTO'larda validation rule'ları tanımla