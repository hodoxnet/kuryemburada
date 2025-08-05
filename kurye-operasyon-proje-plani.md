# 📦 KURYE OPERASYON SİSTEMİ - PROJE PLANI

## 🛠️ TEKNOLOJİ STACK

### Backend
- **Framework:** NestJS (TypeScript)
- **Veritabanı:** PostgreSQL
- **ORM:** TypeORM / Prisma
- **API:** REST API + WebSocket (Socket.io)
- **Auth:** JWT + Refresh Token
- **Cache:** Redis (basit cache için)

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Maps:** Google Maps API
- **Form Handling:** React Hook Form + Zod

### DevOps & Altyapı
- **Container:** Docker & Docker Compose
- **Version Control:** Git

---

## 📋 FAZ 0 - PROJE ALTYAPISI VE HAZIRLIK

### Proje Kurulumu
- [x] Git repository oluşturma
- [x] Docker ve Docker Compose konfigürasyonu
- [x] Development ortamı hazırlığı

### Backend Altyapı
- [x] NestJS projesi oluşturma
- [x] PostgreSQL veritabanı kurulumu ve Docker entegrasyonu
- [x] TypeORM/Prisma entegrasyonu ve migration sistemi
- [x] Redis kurulumu (basit cache için)
- [x] JWT authentication modülü
- [x] Role-based access control (RBAC) sistemi
- [x] Error handling ve basit logging yapısı
- [x] Swagger/OpenAPI dokümantasyonu

### Frontend Altyapı
- [x] Next.js projesi kurulumu
- [x] Tailwind CSS ve shadcn/ui konfigürasyonu
- [x] Authentication middleware ve protected routes
- [x] API client yapısı (Axios wrapper)
- [x] Global state management kurulumu (Zustand)

### Geliştirme Ortamı
- [x] Docker imajları hazırlama
- [x] docker-compose.yml dosyası (development)
- [x] ESLint ve Prettier konfigürasyonu
- [x] Environment değişkenleri yönetimi (.env dosyaları)

---

## 📋 FAZ 1 - TEMEL ÖZELLİKLER

### 1. KULLANICI ROLLERİ VE YETKİLERİ

#### 1.1 Süper Admin
- [x] Firma başvuru onay/red modülü (Backend ✅, Frontend kısmen)
- [x] Kurye başvuru onay/red modülü (Backend ✅)
- [x] Fiyatlandırma yönetimi paneli (Backend ✅)
- [x] Sistem parametreleri yönetimi (Backend ✅)
- [ ] Tüm raporlara erişim yetkisi
- [ ] Ödeme onayları modülü
- [x] Kullanıcı yönetimi (CRUD) (Backend ✅)

#### 1.2 Firma
- [ ] Kurye çağırma arayüzü
- [ ] Sipariş takibi dashboard'u
- [ ] Raporlama modülü
- [ ] Ödeme işlemleri sayfası
- [ ] Profil yönetimi

#### 1.3 Kurye
- [ ] Sipariş kabul/red ekranı
- [ ] Teslimat durumu güncelleme
- [ ] Kazanç takibi dashboard'u
- [ ] Profil yönetimi

### 2. KAYIT VE ONAY SÜREÇLERİ

#### 2.1 Firma Kayıt Süreci
- [ ] Firma kayıt formu
  - [ ] Firma ticari unvanı
  - [ ] Vergi numarası ve vergi dairesi
  - [ ] KEP adresi
  - [ ] Yetkili kişi bilgileri
  - [ ] İletişim bilgileri (telefon, e-posta)
  - [ ] Firma adresi (il, ilçe, mahalle, detaylı adres)
  - [ ] Faaliyet alanı
  - [ ] Ticaret sicil numarası
  - [ ] İmza yetkilisi bilgileri
  - [ ] Banka hesap bilgileri
  - [ ] Sözleşme onayı
- [ ] Belge yükleme sistemi
- [ ] Admin onay workflow'u
- [ ] E-posta doğrulama

#### 2.2 Kurye Kayıt Süreci
- [ ] Kurye kayıt formu
  - [ ] TC kimlik numarası
  - [ ] Ad-soyad
  - [ ] Doğum tarihi
  - [ ] Ehliyet bilgileri (sınıf, alış tarihi, bitiş tarihi)
  - [ ] Araç bilgileri (plaka, marka, model, ruhsat)
  - [ ] Trafik sigortası bilgileri
  - [ ] İletişim bilgileri
  - [ ] E-devlet adres belgesi
  - [ ] Adli sicil kaydı
  - [ ] İkametgah belgesi
  - [ ] Vergi levhası (şahıs şirketi ise)
  - [ ] Banka hesap bilgileri
  - [ ] Acil durumda aranacak kişi
  - [ ] Sağlık raporu (opsiyonel)
- [ ] Belge yükleme ve validasyon
- [ ] Admin onay workflow'u
- [ ] SMS doğrulama

### 3. KURYE ÇAĞIRMA VE SİPARİŞ YÖNETİMİ

#### 3.1 Sipariş Oluşturma
- [ ] Sipariş oluşturma formu
  - [ ] Alıcı bilgileri (ad, telefon)
  - [ ] Teslimat adresi seçimi
  - [ ] Paket türü (evrak, kargo, yemek vb.)
  - [ ] Paket boyutu/ağırlığı
  - [ ] Aciliyet durumu
  - [ ] Özel notlar
  - [ ] Tahmini teslimat süresi
  - [ ] Ödeme şekli (nakit/kredi)
- [ ] Adres kaydetme ve hızlı seçim
- [ ] Fiyat hesaplama ve gösterimi

#### 3.2 Sipariş Atama Sistemi
- [ ] Otomatik bildirim sistemi
- [ ] Kabul/red süresi limiti
- [ ] Yeniden atama mekanizması

#### 3.3 Temel Teslimat Takibi
- [ ] Basit durum güncellemeleri (sipariş alındı, teslim edildi)
- [ ] Teslimat tamamlandı bildirimi

### 4. FİYATLANDIRMA VE ÖDEME SİSTEMİ

#### 4.1 Fiyatlandırma Modülleri
- [ ] Mesafe bazlı fiyatlandırma (km hesabı)
- [ ] Bölge bazlı sabit fiyat
- [ ] Paket tipi katsayısı
- [ ] Zaman dilimi katsayısı (gece, hafta sonu)
- [ ] Aciliyet ücreti
- [ ] Minimum sipariş tutarı

#### 4.2 Temel Cari Hesap Yönetimi
- [ ] Firma cari hesabı
- [ ] Kurye cari hesabı

#### 4.3 Temel Ödeme İşlemleri
- [ ] Manuel ödeme kayıtları
- [ ] Komisyon hesaplama
- [ ] Kurye ödemeleri (haftalık/aylık)

### 5. RAPORLAMA MODÜLLERİ

#### 5.1 Süper Admin Raporları
- [ ] Toplam sipariş sayıları ve tutarları
- [ ] Firma bazlı performans
- [ ] Kurye bazlı performans
- [ ] Bölgesel analiz
- [ ] Gelir-gider raporu
- [ ] Komisyon raporları

#### 5.2 Firma Raporları
- [ ] Sipariş özeti (günlük/haftalık/aylık)
- [ ] Teslimat performansı
- [ ] Harcama analizi
- [ ] En çok kullanılan güzergahlar
- [ ] Fatura ve ödemeler

#### 5.3 Kurye Raporları
- [ ] Kazanç özeti
- [ ] Tamamlanan siparişler
- [ ] Çalışma saatleri
- [ ] Tahsilat raporu

### 6. TEMEL BİLDİRİMLER
- [ ] Push notification
- [ ] SMS bildirimleri

---

## 📋 FAZ 2 - İLERİDE EKLENEBİLECEK ÖZELLİKLER (OPSİYONEL)

### Gelişmiş Özellikler
- [ ] Gerçek zamanlı kurye takibi
- [ ] Harita üzerinde canlı konum
- [ ] Online ödeme entegrasyonu
- [ ] Fatura otomasyonu
- [ ] Detaylı performans metrikleri
- [ ] Kurye puanlama sistemi
- [ ] Müşteri değerlendirmeleri

---

## 🔧 TEKNİK DETAYLAR

### Veritabanı Şeması (Temel Tablolar)
```sql
-- Kullanıcılar
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Firmalar
companies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  tax_number VARCHAR(50) UNIQUE,
  tax_office VARCHAR(255),
  kep_address VARCHAR(255),
  phone VARCHAR(20),
  address JSONB,
  bank_info JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Kuryeler
couriers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tc_number VARCHAR(11) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  phone VARCHAR(20),
  license_info JSONB,
  vehicle_info JSONB,
  bank_info JSONB,
  emergency_contact JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Siparişler
orders (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  courier_id INTEGER REFERENCES couriers(id),
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  pickup_address JSONB,
  delivery_address JSONB,
  package_type VARCHAR(50),
  package_size VARCHAR(50),
  urgency VARCHAR(50),
  notes TEXT,
  price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Ödemeler
payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Belgeler
documents (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50), -- 'company' veya 'courier'
  entity_id INTEGER,
  document_type VARCHAR(100),
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Fiyatlandırma Kuralları
pricing_rules (
  id SERIAL PRIMARY KEY,
  rule_type VARCHAR(50), -- 'distance', 'zone', 'package_type', 'time_slot'
  parameters JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Bildirimler
notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(50),
  title VARCHAR(255),
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### API Endpoint Listesi
```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

Firma İşlemleri:
GET    /api/companies/profile
PUT    /api/companies/profile
POST   /api/companies/register
GET    /api/companies/orders
GET    /api/companies/reports

Kurye İşlemleri:
GET    /api/couriers/profile
PUT    /api/couriers/profile
POST   /api/couriers/register
GET    /api/couriers/orders
PUT    /api/couriers/orders/:id/status
GET    /api/couriers/earnings

Sipariş İşlemleri:
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
DELETE /api/orders/:id
PUT    /api/orders/:id/assign
PUT    /api/orders/:id/status

Admin İşlemleri:
GET    /api/admin/companies
PUT    /api/admin/companies/:id/approve
PUT    /api/admin/companies/:id/reject
GET    /api/admin/couriers
PUT    /api/admin/couriers/:id/approve
PUT    /api/admin/couriers/:id/reject
GET    /api/admin/pricing-rules
POST   /api/admin/pricing-rules
PUT    /api/admin/pricing-rules/:id
GET    /api/admin/reports

Raporlama:
GET    /api/reports/orders
GET    /api/reports/earnings
GET    /api/reports/performance
```

### Klasör Yapısı
```
kurye-operasyon/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── companies/
│   │   ├── couriers/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── admin/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── common/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (admin)/
│   │   ├── (company)/
│   │   ├── (courier)/
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📊 PROJE TAKVİMİ

### 1. Ay - Altyapı ve Hazırlık
- [ ] Proje kurulumu ve konfigürasyonlar
- [ ] Veritabanı tasarımı ve migration'lar
- [ ] Authentication ve yetkilendirme sistemi
- [ ] Temel API endpoint'leri

### 2. Ay - Kayıt ve Yönetim Modülleri
- [ ] Firma kayıt ve onay süreci
- [ ] Kurye kayıt ve onay süreci
- [ ] Admin paneli temel özellikleri
- [ ] Belge yükleme sistemi

### 3. Ay - Sipariş ve Teslimat
- [ ] Sipariş oluşturma ve yönetim
- [ ] Kurye atama sistemi
- [ ] Teslimat takibi
- [ ] Bildirim sistemi

### 4. Ay - Ödeme ve Raporlama
- [ ] Fiyatlandırma motoru
- [ ] Cari hesap yönetimi
- [ ] Ödeme işlemleri
- [ ] Raporlama modülleri

### 5. Ay - Test ve İyileştirmeler
- [ ] Kapsamlı test senaryoları
- [ ] Bug düzeltmeleri
- [ ] Performans optimizasyonları
- [ ] Kullanıcı geri bildirimlerinin değerlendirilmesi

### 6. Ay - Canlıya Geçiş
- [ ] Production ortamı hazırlığı
- [ ] Pilot kullanıcılarla test
- [ ] Son düzeltmeler
- [ ] Resmi lansman

---

## 📝 NOTLAR

1. **Başlangıç Öncelikleri:**
   - Temel authentication ve yetkilendirme
   - Firma ve kurye kayıt süreçleri
   - Basit sipariş oluşturma ve takip
   - Manuel ödeme kayıtları

2. **Teknik Prensipler:**
   - Clean code ve SOLID prensipleri
   - API-first yaklaşım
   - Mobile-responsive tasarım
   - Güvenlik öncelikli geliştirme

3. **Geliştirme Metodolojisi:**
   - Agile/Scrum
   - 2 haftalık sprint'ler
   - Düzenli code review
   - Continuous Integration

---

*Bu doküman proje ilerledikçe güncellenecektir.*

**Son Güncelleme:** 2025-08-05
**Versiyon:** 2.3.0

---

## 📊 TAMAMLANAN GÖREVLER

### ✅ FAZ 0 - Proje Altyapısı (TAMAMLANDI)

**Tamamlanma Tarihi:** 2024-08-05

#### Tamamlanan İşler:
1. **Git Repository ve Versiyon Kontrolü**
   - `.gitignore` dosyası oluşturuldu
   - Git repository başlatıldı

2. **Backend Altyapısı (NestJS)**
   - NestJS v11 kurulumu tamamlandı
   - Prisma ORM entegrasyonu yapıldı
   - Detaylı veritabanı şeması oluşturuldu (User, Company, Courier, Order, Payment vb.)
   - Socket.io entegrasyonu hazır
   - JWT, Passport, bcrypt bağımlılıkları yüklendi
   - Redis cache için ioredis kuruldu

3. **Frontend Altyapısı (Next.js)**
   - Next.js 15 App Router kurulumu
   - Tailwind CSS v3 konfigürasyonu
   - shadcn/ui için components.json hazırlandı
   - Zustand state management kuruldu
   - React Hook Form ve Zod validation hazır
   - Axios, Socket.io-client, Recharts yüklendi

4. **Docker & DevOps**
   - Backend ve Frontend için Dockerfile'lar oluşturuldu
   - docker-compose.yml (production)
   - docker-compose.dev.yml (development + pgAdmin)
   - Health check'ler eklendi
   - Volume mapping yapılandırıldı

5. **Development Ortamı**
   - .env.example dosyaları (root, backend, frontend)
   - Makefile ile kolay komutlar
   - ESLint ve Prettier konfigürasyonları
   - README.md detaylı dokümantasyon

#### Kullanılan Teknolojiler:
- **Backend:** NestJS 11, Prisma, PostgreSQL 16, Redis 7
- **Frontend:** Next.js 15, React 19, Tailwind CSS 3
- **DevOps:** Docker, Docker Compose, Make

#### Tamamlanan Backend Özellikleri:
- **Authentication System:**
  - JWT Strategy ve Guard'lar
  - Login, Register, Logout, Refresh Token endpoint'leri
  - Role-based access control (RBAC)
  - Public ve Protected route decorator'ları
- **Error Handling:**
  - Global HTTP Exception Filter
  - Logging Interceptor
  - Custom Validation Pipe
- **API Documentation:**
  - Swagger/OpenAPI entegrasyonu
  - Tüm endpoint'ler için API dokümantasyonu
- **Security:**
  - Helmet.js entegrasyonu
  - CORS konfigürasyonu
  - Rate limiting (Throttler)

#### Tamamlanan Frontend Özellikleri:
- **API Client:**
  - Axios wrapper ile merkezi API yönetimi
  - Automatic token refresh mekanizması
  - Error handling
- **Authentication:**
  - Zustand ile auth state management
  - Protected route component'leri
  - Middleware ile route koruması
  - Role-based yönlendirmeler
- **Hooks & Utils:**
  - useAuth hook
  - Type definitions
  - Auth provider component

#### Sonraki Adımlar (FAZ 1):
- Firma kayıt ve onay süreçleri
- Kurye kayıt ve onay süreçleri
- Sipariş yönetim sistemi
- Ödeme ve fiyatlandırma modülleri

---

### ✅ FAZ 1 - Süper Admin Özellikleri (KISMİ TAMAMLANDI)

**Tamamlanma Tarihi:** 2025-08-05

#### Tamamlanan Admin Backend API'leri:
1. **Firma Yönetimi (/admin/companies)**
   - Tüm firmaları listeleme ve filtreleme
   - Firma detaylarını görüntüleme
   - Firma başvurusu onaylama/reddetme
   - Firma durumu güncelleme

2. **Kurye Yönetimi (/admin/couriers)**
   - Tüm kuryeleri listeleme ve filtreleme
   - Kurye detaylarını görüntüleme
   - Kurye başvurusu onaylama/reddetme
   - Kurye durumu güncelleme

3. **Fiyatlandırma Yönetimi (/admin/pricing)**
   - Fiyatlandırma kuralları CRUD işlemleri
   - Dinamik fiyat hesaplama sistemi
   - Mesafe, bölge, paket tipi, aciliyet bazlı fiyatlandırma

4. **Sistem Ayarları (/admin/system-settings)**
   - Sistem parametrelerini yönetme
   - Komisyon oranları, limit değerleri
   - Bildirim ayarları
   - Bakım modu yönetimi

5. **Kullanıcı Yönetimi (/admin/users)**
   - Kullanıcı CRUD işlemleri
   - Şifre sıfırlama
   - Kullanıcı istatistikleri
   - Role ve status bazlı filtreleme

#### Tamamlanan Admin Frontend Sayfaları:
1. **Admin Layout ve Dashboard**
   - Responsive sidebar menü
   - İstatistik kartları
   - Hızlı işlem butonları

2. **Firma Yönetimi Sayfası**
   - Firma listesi ve filtreleme
   - Onay/red modalları
   - Pagination desteği

#### Henüz Tamamlanmayan Admin Özellikleri:
- Kurye yönetimi frontend sayfası
- Fiyatlandırma yönetimi frontend sayfası
- Sistem ayarları frontend sayfası
- Kullanıcı yönetimi frontend sayfası
- Ödeme onayları modülü (backend + frontend)
- Detaylı raporlama modülleri