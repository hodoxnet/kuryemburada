# 📝 CHANGELOG

## [1.0.1] - 2025-08-10

### ✅ Tamamlanan - Backend Altyapı

#### Proje Kurulumu
- Git repository oluşturma
- Development ortamı hazırlığı
- Monorepo yapısı için .gitignore konfigürasyonu

#### Backend Altyapı
- NestJS projesi oluşturma
- PostgreSQL veritabanı kurulumu (kuryemburadav1)
- Prisma ORM entegrasyonu ve migration sistemi
- JWT authentication modülü
- Role-based access control (RBAC) sistemi
- Swagger/OpenAPI dokümantasyonu
- ESLint ve Prettier konfigürasyonu
- Environment değişkenleri yönetimi (.env)

#### Veritabanı Şeması
Aşağıdaki tablolar oluşturuldu:
- **User**: Kullanıcı yönetimi
- **Company**: Firma bilgileri
- **Courier**: Kurye bilgileri  
- **Order**: Sipariş yönetimi
- **Payment**: Ödeme işlemleri
- **Document**: Belge yönetimi
- **Notification**: Bildirimler
- **PricingRule**: Fiyatlandırma kuralları
- **SystemSetting**: Sistem ayarları
- **AuditLog**: Denetim kayıtları

#### API Endpoints
Mevcut endpoint'ler:
- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/change-password` - Şifre değiştirme (JWT korumalı)

#### Güvenlik
- JWT token authentication
- Bcrypt ile şifre hashleme  
- Role-based yetkilendirme (SUPER_ADMIN, COMPANY, COURIER)
- CORS koruması
- Environment değişkenleri ile hassas bilgi yönetimi

### 📍 Erişim Bilgileri
- Backend URL: http://localhost:3001
- Swagger Dokümantasyon: http://localhost:3001/api-docs
- Veritabanı: PostgreSQL - kuryemburadav1

### 🔄 Devam Eden
- Redis cache entegrasyonu
- Error handling ve logging sistemi

### 📅 Sonraki Adımlar
- Frontend (Next.js) kurulumu
- Firma kayıt ve yönetim modülü
- Kurye kayıt ve yönetim modülü
- Sipariş yönetimi
- Ödeme sistemi
- Bildirim servisi
- Raporlama modülleri

---

## [1.0.0] - 2025-08-10
- İlk proje planı oluşturuldu