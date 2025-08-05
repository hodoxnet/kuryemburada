# Kurye Operasyon Sistemi

Modern ve performanslı kurye yönetim platformu. Firmalar ve kuryeler arasında hızlı, güvenilir ve verimli teslimat süreçleri sağlar.

## Teknoloji Stack

### Backend
- **Framework:** NestJS (TypeScript)
- **Veritabanı:** PostgreSQL
- **ORM:** Prisma
- **Cache:** Redis
- **API:** REST API + WebSocket (Socket.io)
- **Auth:** JWT + Refresh Token
- **API Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Real-time:** Socket.io Client

### DevOps
- **Container:** Docker & Docker Compose
- **Database Management:** pgAdmin (development)

## Gereksinimler

- Node.js 20+
- Docker & Docker Compose
- Git

## Hızlı Kurulum

### 1. Repoyu Klonlayın

```bash
git clone <repo-url>
cd kuryemburada
```

### 2. Environment Dosyalarını Oluşturun

```bash
# Ana dizinde
cp .env.example .env

# Backend için
cp backend/.env.example backend/.env

# Frontend için
cp frontend/.env.example frontend/.env
```

### 3. Docker ile Başlatın

#### Development Ortamı (Önerilen)

```bash
# Veritabanı ve Redis'i başlatın
docker-compose -f docker-compose.dev.yml up -d

# Backend bağımlılıklarını yükleyin
cd backend
npm install

# Prisma migration'ları çalıştırın
npx prisma migrate dev --name init
npx prisma generate

# Backend'i başlatın
npm run start:dev

# Yeni terminal açın ve frontend'i başlatın
cd ../frontend
npm install
npm run dev
```

#### Tüm Servisleri Docker ile Başlatın

```bash
# Tüm servisleri başlatın
docker-compose up -d

# Logları izleyin
docker-compose logs -f
```

## Erişim Bilgileri

### Uygulamalar
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api-docs
- **pgAdmin:** http://localhost:5050

### Varsayılan Kredansiyeller

#### pgAdmin
- Email: admin@kurye.com
- Password: admin123

#### PostgreSQL
- User: kurye
- Password: kurye123
- Database: kurye_db

## Geliştirme Komutları

### Backend

```bash
cd backend

# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Tests
npm run test
npm run test:watch
npm run test:cov

# Prisma
npx prisma migrate dev    # Yeni migration oluştur
npx prisma generate       # Client'i güncelle
npx prisma studio        # Veritabanı GUI
npx prisma db seed      # Seed data (opsiyonel)

# Linting
npm run lint
npm run format
```

### Frontend

```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Linting
npm run lint
```

## Proje Yapısı

```
kuryemburada/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication modülü
│   │   ├── companies/      # Firma yönetimi
│   │   ├── couriers/       # Kurye yönetimi
│   │   ├── orders/         # Sipariş yönetimi
│   │   ├── payments/       # Ödeme işlemleri
│   │   ├── admin/          # Admin paneli
│   │   ├── notifications/  # Bildirimler
│   │   ├── common/         # Ortak modüller
│   │   └── main.ts         # Ana dosya
│   ├── prisma/
│   │   └── schema.prisma   # Veritabanı şeması
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React bileşenleri
│   │   └── lib/            # Yardımcı fonksiyonlar
│   ├── public/             # Statik dosyalar
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
└── README.md
```

## API Endpoints

Backend başlatıldıktan sonra Swagger dokümantasyonuna http://localhost:3000/api-docs adresinden erişebilirsiniz.

### Temel Endpoint'ler

- **Auth:** `/api/auth/*`
- **Companies:** `/api/companies/*`
- **Couriers:** `/api/couriers/*`
- **Orders:** `/api/orders/*`
- **Payments:** `/api/payments/*`
- **Admin:** `/api/admin/*`

## Veritabanı Şeması

Detaylı veritabanı şeması için `backend/prisma/schema.prisma` dosyasını inceleyebilirsiniz. Prisma Studio ile görsel olarak incelemek için:

```bash
cd backend
npx prisma studio
```

## Sorun Giderme

### Port Çakışmaları

Varsayılan portlar kullanımdaysa `.env` dosyasından değiştirebilirsiniz:
- Backend: 3000
- Frontend: 3001
- PostgreSQL: 5432
- Redis: 6379
- pgAdmin: 5050

### Docker İzin Hataları

```bash
# Docker daemon'u başlatın
sudo systemctl start docker

# Kullanıcıyı docker grubuna ekleyin
sudo usermod -aG docker $USER
```

### Prisma Migration Hataları

```bash
# Veritabanını sıfırlayın (DİKKAT: Tüm veri silinir!)
cd backend
npx prisma migrate reset

# Yeniden migration çalıştırın
npx prisma migrate dev
```

## Güvenlik Notları

- Production'da `.env` dosyalarındaki tüm secret key'leri değiştirin
- JWT secret'ları güçlü ve rastgele olmalı
- CORS ayarlarını production domain'e göre yapılandırın
- Rate limiting aktif olduğundan emin olun
- HTTPS kullanın (production)

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'e push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje özel lisans altındadır.

## İletişim

Destek için: destek@kurye.com

---

**Versiyon:** 1.0.0  
**Son Güncelleme:** 2024