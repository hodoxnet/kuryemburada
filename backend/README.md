# Kurye Operasyon Sistemi - Backend

## Teknoloji Stack

- **Framework:** NestJS
- **Veritabanı:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **API Dokümantasyonu:** Swagger/OpenAPI

## Kurulum

### Gereksinimler

- Node.js (v20+)
- PostgreSQL
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **PostgreSQL veritabanı oluşturun:**
   ```sql
   CREATE DATABASE kuryemburadav1;
   ```

3. **Environment değişkenlerini ayarlayın:**
   - `.env.example` dosyasını kopyalayın ve `.env` olarak kaydedin
   - Veritabanı bağlantı bilgilerini güncelleyin

4. **Prisma migrasyonlarını çalıştırın:**
   ```bash
   npx prisma migrate dev
   ```

5. **Prisma Client'ı oluşturun:**
   ```bash
   npx prisma generate
   ```

## Çalıştırma

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Dokümantasyonu

Uygulama çalıştırıldıktan sonra Swagger dokümantasyonuna şu adresten erişebilirsiniz:
```
http://localhost:3001/api-docs
```

## Veritabanı Yönetimi

### Yeni migration oluşturma
```bash
npx prisma migrate dev --name migration_name
```

### Veritabanı şemasını görüntüleme
```bash
npx prisma studio
```

## Test

```bash
# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Test coverage
npm run test:cov
```

## Proje Yapısı

```
src/
├── auth/           # Authentication modülü
├── prisma/         # Prisma service ve modül
├── companies/      # Firma yönetimi (yapılacak)
├── couriers/       # Kurye yönetimi (yapılacak)
├── orders/         # Sipariş yönetimi (yapılacak)
├── payments/       # Ödeme işlemleri (yapılacak)
├── admin/          # Admin paneli (yapılacak)
├── reports/        # Raporlama (yapılacak)
├── notifications/  # Bildirimler (yapılacak)
└── main.ts         # Uygulama giriş noktası
```

## Güvenlik

- JWT token kullanılarak authentication sağlanır
- Role-based access control (RBAC) ile yetkilendirme yapılır
- Tüm hassas bilgiler environment değişkenlerinde saklanır
- Password'ler bcrypt ile hash'lenir

## API Endpoints (Mevcut)

### Authentication
- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/change-password` - Şifre değiştirme

## Roller

- `SUPER_ADMIN` - Sistem yöneticisi
- `COMPANY` - Firma kullanıcısı
- `COURIER` - Kurye kullanıcısı

## Lisans

MIT