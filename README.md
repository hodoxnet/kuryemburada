# 📦 Kurye Operasyon Sistemi

Modern ve ölçeklenebilir kurye operasyon yönetim sistemi.

## 🚀 Özellikler

- **Firma Yönetimi**: Firma kayıt, onay ve yönetim sistemi
- **Kurye Yönetimi**: Kurye başvuru, onay ve performans takibi
- **Sipariş Yönetimi**: Gerçek zamanlı sipariş oluşturma ve takibi
- **Ödeme Sistemi**: Esnek fiyatlandırma ve ödeme yönetimi
- **Raporlama**: Detaylı performans ve finansal raporlar
- **Bildirimler**: SMS ve push notification desteği

## 🛠️ Teknoloji Stack

### Backend
- NestJS (TypeScript)
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Swagger API Documentation
- Redis (Cache)

### Frontend (Yapılacak)
- Next.js 14+ (App Router)
- Tailwind CSS + shadcn/ui
- Zustand (State Management)
- Google Maps API

## 📋 Kurulum

### Gereksinimler

- Node.js v20+
- PostgreSQL 14+
- npm veya yarn

### Kurulum

1. **PostgreSQL veritabanı oluşturun:**
   ```sql
   CREATE DATABASE kuryemburadav1;
   ```

2. **Backend kurulumu:**
   ```bash
   cd backend
   npm install
   
   # .env dosyasını düzenleyin
   cp .env.example .env
   
   # Veritabanı migrasyonları
   npm run prisma:migrate
   npm run prisma:generate
   
   # Uygulamayı başlatın
   npm run start:dev
   ```

## 📚 API Dokümantasyonu

Backend çalıştıktan sonra Swagger dokümantasyonuna erişim:
```
http://localhost:3001/api-docs
```

## 🗂️ Proje Yapısı

```
kuryemburada/
├── backend/              # NestJS backend uygulaması
│   ├── src/
│   │   ├── auth/        # Authentication modülü
│   │   ├── prisma/      # Prisma service
│   │   ├── companies/   # Firma yönetimi (yapılacak)
│   │   ├── couriers/    # Kurye yönetimi (yapılacak)
│   │   ├── orders/      # Sipariş yönetimi (yapılacak)
│   │   └── ...
│   └── prisma/
│       └── schema.prisma # Veritabanı şeması
├── frontend/            # Next.js frontend (yapılacak)
└── kurye-operasyon-proje-plani.md # Detaylı proje planı
```

## 🔑 Kullanıcı Rolleri

- **SUPER_ADMIN**: Sistem yöneticisi - Tüm yetkiler
- **COMPANY**: Firma kullanıcısı - Sipariş oluşturma ve takip
- **COURIER**: Kurye - Teslimat yönetimi

## 📊 Veritabanı Şeması

Detaylı veritabanı şeması için: `backend/prisma/schema.prisma`

### Ana Tablolar:
- `User` - Kullanıcı bilgileri
- `Company` - Firma bilgileri
- `Courier` - Kurye bilgileri
- `Order` - Sipariş bilgileri
- `Payment` - Ödeme işlemleri
- `Document` - Belge yönetimi
- `Notification` - Bildirimler
- `PricingRule` - Fiyatlandırma kuralları

## 🧪 Test

```bash
cd backend

# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚦 Geliştirme Durumu

### ✅ Tamamlanan
- [x] Git repository oluşturma
- [x] NestJS backend altyapısı
- [x] Prisma ORM entegrasyonu
- [x] JWT authentication
- [x] Swagger API dokümantasyonu
- [x] Role-based access control
- [x] Environment konfigürasyonu

### 🔄 Devam Eden
- [ ] PostgreSQL veritabanı kurulumu
- [ ] Redis cache entegrasyonu
- [ ] Error handling ve logging

### 📅 Planlanan
- [ ] Frontend (Next.js) kurulumu
- [ ] Firma kayıt ve yönetim modülü
- [ ] Kurye kayıt ve yönetim modülü
- [ ] Sipariş yönetimi
- [ ] Ödeme sistemi
- [ ] Bildirim servisi
- [ ] Raporlama modülleri

## 📝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 🔒 Güvenlik

- JWT token ile authentication
- Bcrypt ile şifre hashleme
- Role-based yetkilendirme
- Environment değişkenleri ile hassas bilgi yönetimi
- CORS koruması

## 📄 Lisans

MIT

## 📞 İletişim

Proje ile ilgili sorularınız için issue açabilirsiniz.

---

**Not:** Bu proje aktif geliştirme aşamasındadır. Detaylı proje planı için `kurye-operasyon-proje-plani.md` dosyasını inceleyebilirsiniz.