# Yemeksepeti API Dokümantasyonu

**Son Güncelleme:** 18 Ocak 2025
**Platform:** DeliveryHero / Yemeksepeti
**API Versiyonu:** 1.0.0

## 📚 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Başlangıç ve Kurulum](#başlangıç-ve-kurulum)
3. [Authentication](#authentication)
4. [API Endpoint'leri](#api-endpointleri)
5. [Webhook'lar](#webhooklar)
6. [Veri Modelleri](#veri-modelleri)
7. [Hata Kodları](#hata-kodları)
8. [Rate Limiting](#rate-limiting)
9. [Test Ortamı](#test-ortamı)
10. [İletişim ve Destek](#iletişim-ve-destek)

---

## 🌐 Genel Bakış

Yemeksepeti, DeliveryHero grubunun bir parçası olarak POS (Point of Sale) sağlayıcılarına entegrasyon API'leri sunmaktadır. Bu API'ler, restoran siparişlerini, menüleri ve mağaza yönetimini otomatize etmek için kullanılır.

### Resmi Dokümantasyon Kaynakları

- **Ana Portal:** https://integration.yemeksepeti.com/
- **DeliveryHero Developer Portal:** https://developers.deliveryhero.com/
- **POS Middleware API:** https://integration-middleware.stg.restaurant-partners.com/apidocs/pos-middleware-api
- **Web Service:** https://messaging.yemeksepeti.com/MessagingWebService/Integration.asmx

### API Mimarisi

Yemeksepeti entegrasyon API'leri iki ana bölüme ayrılır:

1. **Integration Middleware API:** Plugin tarafından çağrılacak endpoint'ler
2. **Plugin API:** POS sağlayıcı tarafından geliştirilecek, Yemeksepeti platformundan sipariş ve güncellemeleri alacak yazılım

---

## 🚀 Başlangıç ve Kurulum

### Entegrasyon Adımları

1. **NDA Anlaşması İmzalama**
   - Entegrasyona başlamadan önce Gizlilik Anlaşması (NDA) imzalanmalıdır

2. **Teknik Onay Alma**
   - Yemeksepeti teknik ekibinden onay alınması gerekir

3. **API Erişim Talebi**
   - Kimlik bilgileri ve erişim yetkisi talep edilmelidir

4. **Test Entegrasyonu Kurulumu**
   - Test restoran hesabı talep edilmelidir

5. **Geliştirme Başlangıcı**
   - API implementasyonu ve plugin geliştirme

6. **End-to-End Testing**
   - Yemeksepeti ile birlikte kapsamlı test

7. **Production Kurulumu**
   - Canlı ortam konfigürasyonu

8. **Pilot Restoran Başlatma**
   - Seçili restoranlarla pilot uygulama

9. **Ölçeklendirme**
   - Tüm restoranlar için yaygınlaştırma

### IP Whitelist Gereksinimleri

Integration Middleware üzerinden sipariş alabilmek için aşağıdaki IP adreslerinin whitelist'e eklenmesi gerekmektedir:

```
Production IP'leri:
- [Yemeksepeti destek ekibinden alınmalıdır]

Test IP'leri:
- [Yemeksepeti destek ekibinden alınmalıdır]
```

---

## 🔐 Authentication

### Kimlik Doğrulama Süreci

#### 1. PGP Anahtar Çifti Oluşturma

Güvenlik için PGP (Pretty Good Privacy) anahtar çifti oluşturulmalıdır:

```bash
# PGP anahtar çifti oluşturma
gpg --full-generate-key

# Public key'i dışa aktarma
gpg --armor --export your-email@example.com > public_key.asc
```

#### 2. Kimlik Bilgileri Talebi

Form doldurma: https://developers.deliveryhero.com/documentation/pos.html#request-credentials

Gerekli bilgiler:
- Şirket adı
- İletişim bilgileri
- PGP public key
- Entegrasyon detayları

#### 3. Access Token Alma

Kimlik bilgileri alındıktan sonra, API kullanımı için access token alınmalıdır:

```http
POST /auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_encrypted_password"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### 4. API İsteklerinde Token Kullanımı

```http
GET /api/v1/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📡 API Endpoint'leri

### Order Management API

#### 1. Update Order Status
**Endpoint:** `POST /api/v1/orders/{orderId}/status`

**Açıklama:** Sipariş durumunu güncelleme (kabul/red/teslim alındı)

**Request Body:**
```json
{
  "status": "ACCEPTED",
  "estimated_preparation_time": 25,
  "rejection_reason": null,
  "notes": "Sipariş hazırlanıyor"
}
```

**Status Değerleri:**
- `ACCEPTED`: Sipariş kabul edildi
- `REJECTED`: Sipariş reddedildi
- `PREPARING`: Hazırlanıyor
- `READY`: Teslimata hazır
- `PICKED_UP`: Kurye tarafından alındı
- `DELIVERED`: Teslim edildi
- `CANCELLED`: İptal edildi

#### 2. Mark Order as Prepared
**Endpoint:** `POST /api/v1/orders/{orderId}/prepared`

**Açıklama:** Yemeksepeti kuryeleri için siparişi "hazır" olarak işaretleme

**Request Body:**
```json
{
  "preparation_time_actual": 20,
  "is_ready_for_pickup": true
}
```

#### 3. Get Order Details
**Endpoint:** `GET /api/v1/orders/{orderId}`

**Response:**
```json
{
  "order_id": "YS-2025011812345",
  "restaurant_id": "rest_123",
  "customer": {
    "name": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "address": {
      "street": "Atatürk Caddesi No:15",
      "district": "Kadıköy",
      "city": "İstanbul",
      "postal_code": "34710",
      "coordinates": {
        "lat": 40.9876,
        "lng": 29.0234
      }
    }
  },
  "items": [
    {
      "item_id": "item_456",
      "name": "Adana Kebap",
      "quantity": 2,
      "unit_price": 150.00,
      "modifications": [
        {
          "name": "Acısız",
          "price": 0
        }
      ],
      "notes": "Soğansız olsun"
    }
  ],
  "payment": {
    "method": "ONLINE",
    "status": "PAID",
    "total": 300.00,
    "delivery_fee": 15.00,
    "tip": 10.00
  },
  "delivery": {
    "type": "YEMEKSEPETI_COURIER",
    "estimated_time": "2025-01-18T13:30:00Z",
    "courier": {
      "name": "Mehmet Kaya",
      "phone": "+905559876543"
    }
  },
  "created_at": "2025-01-18T12:45:00Z",
  "updated_at": "2025-01-18T12:50:00Z"
}
```

### Catalog Management API

#### 1. Submit Catalog
**Endpoint:** `PUT /api/v1/catalog`

**Açıklama:** Menü oluşturma, güncelleme ve silme

**Request Body:**
```json
{
  "restaurant_id": "rest_123",
  "menus": [
    {
      "menu_id": "menu_001",
      "name": "Ana Yemekler",
      "description": "Özel kebap çeşitleri",
      "is_active": true,
      "categories": [
        {
          "category_id": "cat_001",
          "name": "Kebaplar",
          "items": [
            {
              "item_id": "item_001",
              "name": "Adana Kebap",
              "description": "El yapımı Adana kebap",
              "price": 150.00,
              "image_url": "https://example.com/adana.jpg",
              "is_available": true,
              "preparation_time": 20,
              "allergens": ["gluten"],
              "nutritional_info": {
                "calories": 450,
                "protein": 35,
                "carbs": 25,
                "fat": 20
              },
              "modifiers": [
                {
                  "modifier_id": "mod_001",
                  "name": "Baharat Seçimi",
                  "type": "SINGLE_CHOICE",
                  "required": true,
                  "options": [
                    {
                      "name": "Acılı",
                      "price": 0
                    },
                    {
                      "name": "Acısız",
                      "price": 0
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### 2. Catalog Import Status
**Endpoint:** `GET /api/v1/catalog/import/{importId}/status`

**Response:**
```json
{
  "import_id": "import_789",
  "status": "PROCESSING",
  "progress": 75,
  "errors": [],
  "warnings": [
    {
      "item_id": "item_002",
      "message": "Fiyat bilgisi eksik"
    }
  ],
  "created_at": "2025-01-18T10:00:00Z"
}
```

#### 3. Update Item Availability
**Endpoint:** `POST /api/v1/catalog/items/availability`

**Request Body:**
```json
{
  "restaurant_id": "rest_123",
  "items": [
    {
      "item_id": "item_001",
      "is_available": false,
      "out_of_stock_until": "2025-01-18T18:00:00Z"
    }
  ]
}
```

#### 4. Get Unavailable Items
**Endpoint:** `GET /api/v1/catalog/items/unavailable?restaurant_id=rest_123`

### Store Management API

#### 1. Update Vendor Availability
**Endpoint:** `PUT /api/v1/stores/{storeId}/availability`

**Request Body:**
```json
{
  "status": "OPEN",
  "opening_hours": {
    "monday": [
      {
        "open": "10:00",
        "close": "22:00"
      }
    ]
  },
  "special_hours": [
    {
      "date": "2025-01-01",
      "status": "CLOSED",
      "reason": "Yılbaşı tatili"
    }
  ],
  "busy_mode": {
    "is_busy": false,
    "extra_preparation_time": 0
  }
}
```

**Status Değerleri:**
- `OPEN`: Açık
- `CLOSED`: Kapalı
- `BUSY`: Yoğun (ekstra hazırlık süresi)
- `PAUSED`: Geçici olarak durduruldu

#### 2. Get Vendor Availability
**Endpoint:** `GET /api/v1/stores/{storeId}/availability`

### Order Report Service

#### 1. Get Order IDs (Last 24 Hours)
**Endpoint:** `GET /api/v1/reports/orders/ids`

**Query Parameters:**
- `from`: Başlangıç tarihi (ISO 8601)
- `to`: Bitiş tarihi (ISO 8601)
- `status`: Sipariş durumu filtresi

**Response:**
```json
{
  "order_ids": [
    "YS-2025011812345",
    "YS-2025011812346",
    "YS-2025011812347"
  ],
  "total_count": 156,
  "date_range": {
    "from": "2025-01-17T00:00:00Z",
    "to": "2025-01-18T00:00:00Z"
  }
}
```

#### 2. Get Order Detail
**Endpoint:** `GET /api/v1/reports/orders/{orderId}`

---

## 🔔 Webhook'lar

### Webhook Güvenliği

Tüm webhook istekleri HMAC-SHA256 ile imzalanır:

```javascript
// Webhook imza doğrulama örneği
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 1. Order Dispatch Webhook
**Event:** `order.dispatched`

**Payload:**
```json
{
  "event_type": "order.dispatched",
  "event_id": "evt_123456",
  "timestamp": "2025-01-18T12:30:00Z",
  "data": {
    "order_id": "YS-2025011812345",
    "restaurant_id": "rest_123",
    "customer": {
      "name": "Müşteri Adı",
      "phone": "+905551234567",
      "address": "Teslimat adresi"
    },
    "items": [...],
    "payment": {...},
    "delivery": {...}
  }
}
```

### 2. Order Status Update Webhook
**Event:** `order.status.updated`

**Payload:**
```json
{
  "event_type": "order.status.updated",
  "event_id": "evt_123457",
  "timestamp": "2025-01-18T12:35:00Z",
  "data": {
    "order_id": "YS-2025011812345",
    "old_status": "PENDING",
    "new_status": "CANCELLED",
    "reason": "Müşteri iptal etti",
    "updated_by": "CUSTOMER"
  }
}
```

### 3. Catalog Import Status Webhook
**Event:** `catalog.import.completed`

**Payload:**
```json
{
  "event_type": "catalog.import.completed",
  "event_id": "evt_123458",
  "timestamp": "2025-01-18T10:15:00Z",
  "data": {
    "import_id": "import_789",
    "status": "SUCCESS",
    "imported_items": 45,
    "failed_items": 2,
    "warnings": 3,
    "details": {...}
  }
}
```

### Webhook Configuration

Webhook URL'leri Yemeksepeti panel üzerinden veya API ile yapılandırılabilir:

```http
POST /api/v1/webhooks/configure
Content-Type: application/json

{
  "restaurant_id": "rest_123",
  "webhooks": [
    {
      "event_type": "order.dispatched",
      "url": "https://your-domain.com/webhooks/order-dispatched",
      "is_active": true,
      "retry_config": {
        "max_retries": 3,
        "retry_interval": 60
      }
    }
  ]
}
```

---

## 📊 Veri Modelleri

### Order Model

```typescript
interface Order {
  order_id: string;
  restaurant_id: string;
  platform_order_id: string;
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  payment: Payment;
  delivery: Delivery;
  notes?: string;
  special_requirements?: string[];
  estimated_preparation_time?: number;
  actual_preparation_time?: number;
  created_at: DateTime;
  updated_at: DateTime;
  completed_at?: DateTime;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: Address;
  notes?: string;
  order_count?: number;
  is_vip?: boolean;
}

interface Address {
  full_address: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  district: string;
  city: string;
  postal_code?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  delivery_instructions?: string;
}

interface OrderItem {
  item_id: string;
  name: string;
  category?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifications?: Modification[];
  notes?: string;
  is_gift?: boolean;
}

interface Modification {
  modifier_id: string;
  name: string;
  option: string;
  price: number;
}

interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  service_fee?: number;
  discount?: number;
  tip?: number;
  total: number;
  currency: string;
  transaction_id?: string;
  paid_at?: DateTime;
}

interface Delivery {
  type: DeliveryType;
  estimated_time: DateTime;
  actual_time?: DateTime;
  distance?: number;
  courier?: Courier;
  tracking_url?: string;
}

interface Courier {
  id?: string;
  name: string;
  phone: string;
  vehicle_type?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

// Enums
enum OrderStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  PREPARING = "PREPARING",
  READY = "READY",
  PICKED_UP = "PICKED_UP",
  ON_THE_WAY = "ON_THE_WAY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED"
}

enum PaymentMethod {
  ONLINE = "ONLINE",
  CASH = "CASH",
  CREDIT_CARD = "CREDIT_CARD",
  MEAL_CARD = "MEAL_CARD"
}

enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

enum DeliveryType {
  YEMEKSEPETI_COURIER = "YEMEKSEPETI_COURIER",
  RESTAURANT_COURIER = "RESTAURANT_COURIER",
  PICKUP = "PICKUP"
}
```

### Menu Model

```typescript
interface Menu {
  menu_id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  display_order?: number;
  categories: Category[];
  availability?: Availability;
  created_at: DateTime;
  updated_at: DateTime;
}

interface Category {
  category_id: string;
  name: string;
  description?: string;
  display_order?: number;
  is_active: boolean;
  items: MenuItem[];
}

interface MenuItem {
  item_id: string;
  sku?: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  images?: string[];
  is_available: boolean;
  is_featured?: boolean;
  preparation_time?: number;
  max_quantity?: number;
  tags?: string[];
  allergens?: string[];
  nutritional_info?: NutritionalInfo;
  modifiers?: Modifier[];
  stock?: Stock;
}

interface Modifier {
  modifier_id: string;
  name: string;
  description?: string;
  type: ModifierType;
  required: boolean;
  min_selections?: number;
  max_selections?: number;
  options: ModifierOption[];
}

interface ModifierOption {
  option_id: string;
  name: string;
  price: number;
  is_default?: boolean;
  is_available: boolean;
}

interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
}

interface Stock {
  quantity: number;
  low_stock_threshold?: number;
  out_of_stock_until?: DateTime;
}

interface Availability {
  schedule?: Schedule[];
  special_hours?: SpecialHour[];
}

interface Schedule {
  day: DayOfWeek;
  periods: TimePeriod[];
}

interface TimePeriod {
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

interface SpecialHour {
  date: string; // "YYYY-MM-DD"
  periods?: TimePeriod[];
  is_closed: boolean;
  reason?: string;
}

enum ModifierType {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
}

enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY"
}
```

---

## ❌ Hata Kodları

### HTTP Status Kodları

| Kod | Açıklama | Çözüm |
|-----|----------|-------|
| 200 | Başarılı | - |
| 201 | Oluşturuldu | - |
| 400 | Geçersiz istek | Request payload'ı kontrol edin |
| 401 | Yetkisiz | Token'ı yenileyin |
| 403 | Yasak | İzinleri kontrol edin |
| 404 | Bulunamadı | Resource ID'yi kontrol edin |
| 409 | Çakışma | Duplicate kontrolü yapın |
| 422 | İşlenemeyen varlık | Validation hatalarını düzeltin |
| 429 | Çok fazla istek | Rate limit'e dikkat edin |
| 500 | Sunucu hatası | Yemeksepeti desteğe başvurun |
| 503 | Servis kullanılamıyor | Bakım durumunu kontrol edin |

### Uygulama Hata Kodları

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Sipariş bulunamadı",
    "details": {
      "order_id": "YS-2025011812345"
    }
  }
}
```

| Kod | Açıklama | Çözüm |
|-----|----------|-------|
| ORDER_NOT_FOUND | Sipariş bulunamadı | Order ID'yi kontrol edin |
| INVALID_STATUS_TRANSITION | Geçersiz durum değişimi | İş akışını kontrol edin |
| RESTAURANT_CLOSED | Restoran kapalı | Açılış saatlerini kontrol edin |
| ITEM_OUT_OF_STOCK | Ürün stokta yok | Stok durumunu güncelleyin |
| PAYMENT_FAILED | Ödeme başarısız | Ödeme detaylarını kontrol edin |
| CATALOG_IMPORT_FAILED | Menü import hatası | Validation hatalarını düzeltin |
| INVALID_COORDINATES | Geçersiz koordinatlar | GPS verilerini kontrol edin |
| DUPLICATE_ORDER | Mükerrer sipariş | Idempotency key kullanın |
| WEBHOOK_DELIVERY_FAILED | Webhook teslim edilemedi | Webhook URL'yi kontrol edin |
| RATE_LIMIT_EXCEEDED | Rate limit aşıldı | İstek sayısını azaltın |

---

## ⏱️ Rate Limiting

### Limit Değerleri

| Endpoint Tipi | Limit | Periyod | Başlık |
|--------------|-------|---------|---------|
| Order Management | 100 | 1 dakika | X-RateLimit-Limit |
| Catalog Management | 10 | 1 dakika | X-RateLimit-Limit |
| Store Management | 50 | 1 dakika | X-RateLimit-Limit |
| Report Service | 20 | 1 dakika | X-RateLimit-Limit |

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705577400
```

### Rate Limit Aşımı

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit aşıldı",
    "retry_after": 60
  }
}
```

---

## 🧪 Test Ortamı

### Test Endpoint'leri

```
Base URL: https://integration-test.yemeksepeti.com/api/v1
Webhook Test: https://webhook-test.yemeksepeti.com/
```

### Test Hesapları

Test hesapları için Yemeksepeti teknik ekibinden talep edilmelidir:

```
Email: pos-tr-support@deliveryhero.com
Konu: Test Restoran Hesabı Talebi
```

### Mock Data Generator

Test ortamında mock sipariş oluşturma:

```http
POST /test/orders/generate
Content-Type: application/json

{
  "restaurant_id": "test_rest_123",
  "count": 5,
  "interval_seconds": 30,
  "order_type": "DELIVERY"
}
```

### Test Senaryoları

1. **Sipariş Akışı Testi**
   - Yeni sipariş webhook'u alma
   - Sipariş kabul etme
   - Hazırlık durumu güncelleme
   - Teslimata hazır işaretleme
   - Teslimat tamamlama

2. **Menü Senkronizasyon Testi**
   - Tam menü yükleme
   - Kısmi güncelleme
   - Ürün stok durumu değiştirme
   - Fiyat güncelleme

3. **Hata Senaryoları**
   - Timeout handling
   - Invalid token recovery
   - Webhook retry mekanizması
   - Rate limit handling

### Postman Collection

Yemeksepeti API Postman koleksiyonu:
https://www.postman.com/tagondev/workspace/yemeksepeti/

---

## 📞 İletişim ve Destek

### Teknik Destek

**Email:** pos-tr-support@deliveryhero.com
**Çalışma Saatleri:** Pazartesi-Cuma 09:00-18:00
**Acil Durumlar:** +90 212 XXX XX XX (7/24)

### Bakım Bildirimleri

Plugin bakımları en az 24 saat önceden bildirilmelidir:

```
To: pos-tr-support@deliveryhero.com
Subject: [MAINTENANCE] Plugin Bakım Bildirimi
Body:
- Bakım tarihi ve saati
- Tahmini süre
- Etkilenen servisler
- İletişim bilgileri
```

### Dokümantasyon Güncellemeleri

En güncel dokümantasyon için:
- https://integration.yemeksepeti.com/
- https://developers.deliveryhero.com/

### Community ve Forumlar

- **GitHub:** https://github.com/yemeksepeti
- **Developer Forum:** https://developers.deliveryhero.com/community

---

## 🔄 Versiyon Geçmişi

| Versiyon | Tarih | Değişiklikler |
|----------|-------|---------------|
| 1.0.0 | 2024-01 | İlk release |
| 1.1.0 | 2024-06 | Webhook improvements |
| 1.2.0 | 2024-11 | New catalog API |
| 1.3.0 | 2025-01 | Performance updates |

---

## 📝 Ek Notlar

### Önemli Kurallar

1. **Otomatik Onay:** Sipariş otomatik onay fonksiyonu uygulanabilir
2. **Timezone:** Tüm tarih/saat değerleri UTC formatında
3. **Para Birimi:** Tüm fiyatlar TRY cinsinden, kuruş hassasiyetinde
4. **Encoding:** UTF-8 character encoding kullanılmalı
5. **Idempotency:** Kritik işlemler için idempotency key kullanılmalı

### Best Practices

1. **Webhook Handling:**
   - Webhook'ları asenkron işleyin
   - Hızlı response (< 3 saniye) verin
   - İşlemi queue'ya alıp arka planda işleyin

2. **Error Recovery:**
   - Exponential backoff ile retry
   - Circuit breaker pattern kullanın
   - Hataları loglayın ve monitör edin

3. **Performance:**
   - Response'ları cache'leyin
   - Batch işlemleri tercih edin
   - Connection pooling kullanın

4. **Security:**
   - API key'leri güvenli saklayın
   - HTTPS kullanın
   - Webhook imzalarını doğrulayın
   - Rate limiting uygulayın

### Yasal Uyarılar

- NDA anlaşması olmadan API kullanılamaz
- API kullanım şartlarına uyulmalıdır
- Müşteri verilerinin güvenliği sağlanmalıdır
- KVKK/GDPR uyumluluğu gereklidir

---

## 🚀 Hızlı Başlangıç Örneği

### Node.js ile Basit Entegrasyon

```javascript
const axios = require('axios');
const crypto = require('crypto');

class YemeksepetiAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'https://integration.yemeksepeti.com/api/v1';
    this.username = config.username;
    this.password = config.password;
    this.webhookSecret = config.webhookSecret;
    this.token = null;
  }

  // Authentication
  async login() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        username: this.username,
        password: this.password
      });
      this.token = response.data.access_token;
      return this.token;
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  }

  // Get order details
  async getOrder(orderId) {
    if (!this.token) await this.login();

    try {
      const response = await axios.get(`${this.baseURL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await this.login();
        return this.getOrder(orderId);
      }
      throw error;
    }
  }

  // Accept order
  async acceptOrder(orderId, preparationTime = 25) {
    if (!this.token) await this.login();

    try {
      const response = await axios.post(
        `${this.baseURL}/orders/${orderId}/status`,
        {
          status: 'ACCEPTED',
          estimated_preparation_time: preparationTime
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Accept order failed:', error.message);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // Handle incoming webhook
  handleWebhook(payload, signature) {
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    switch (payload.event_type) {
      case 'order.dispatched':
        return this.handleNewOrder(payload.data);
      case 'order.status.updated':
        return this.handleOrderStatusUpdate(payload.data);
      case 'catalog.import.completed':
        return this.handleCatalogImport(payload.data);
      default:
        console.log('Unknown event type:', payload.event_type);
    }
  }

  async handleNewOrder(orderData) {
    console.log('New order received:', orderData.order_id);
    // Process new order
    // Auto-accept if configured
    // Send to POS system
    // Update local database
  }

  async handleOrderStatusUpdate(updateData) {
    console.log('Order status updated:', updateData.order_id, updateData.new_status);
    // Update local order status
    // Notify restaurant staff
    // Update POS system
  }

  async handleCatalogImport(importData) {
    console.log('Catalog import completed:', importData.import_id, importData.status);
    // Check for errors
    // Update local catalog cache
    // Notify admin if issues
  }
}

// Usage example
const api = new YemeksepetiAPI({
  username: process.env.YEMEKSEPETI_USERNAME,
  password: process.env.YEMEKSEPETI_PASSWORD,
  webhookSecret: process.env.YEMEKSEPETI_WEBHOOK_SECRET
});

// Express webhook endpoint
app.post('/webhooks/yemeksepeti', async (req, res) => {
  try {
    const signature = req.headers['x-yemeksepeti-signature'];
    await api.handleWebhook(req.body, signature);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Bad Request');
  }
});
```

---

## 📚 Ek Kaynaklar

### Resmi Kaynaklar
- [Yemeksepeti Entegrasyon Portalı](https://integration.yemeksepeti.com/)
- [DeliveryHero Developer Portal](https://developers.deliveryhero.com/)
- [API Status Page](https://status.yemeksepeti.com/)

### Üçüncü Parti Araçlar
- [Postman Collection](https://www.postman.com/tagondev/workspace/yemeksepeti/)
- [GitHub - Unofficial API](https://github.com/e4c6/yemeksepeti_api)

### Eğitim Materyalleri
- Video tutorials (Yemeksepeti Partner Portal)
- Integration checklist
- Best practices guide
- Troubleshooting guide

---

**Son Güncelleme:** 18 Ocak 2025
**Dokümantasyon Versiyonu:** 2.0.0
**Hazırlayan:** KuryemBurada Teknik Ekip