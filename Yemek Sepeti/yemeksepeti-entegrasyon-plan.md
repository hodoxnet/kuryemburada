# Yemeksepeti Entegrasyon Plani

## Genel Bakış
Bu doküman, mevcut kurye operasyon sistemine Yemeksepeti entegrasyonunu eklemek için hazırlanmış kapsamlı bir yol haritasıdır. Proje 3 ana fazda gerçekleştirilecektir.

## 1. Arka Plan ve Hedef
- Firmalar kendi Yemeksepeti API anahtarlarını sisteme tanımlayarak siparişlerini anlık izlemek ve mevcut kurye operasyon akışlarına bağlamak istiyor.
- Mevcut NestJS + Next.js tabanlı sistemde dış uygulamalardan gelen siparişlerin otomatik olarak işlenmesi, kurye atama ve faturalama süreçleriyle uyumlu hale getirilmeli.
- Hedef: Dış sipariş akışının (Yemeksepeti) firmalar panelinde anlık görüntülenmesi, kurye çağır akışının bilgileri otomatik doldurması ve tüm raporlama/ödeme süreçlerine entegrasyonu.

## FAZLAR

### FAZ 1: Altyapı ve Temel Entegrasyon (10 gün)
**Hedef:** Eksik altyapı kurulumu ve Yemeksepeti API entegrasyonunun temel yapısı

#### Yapılacaklar:
1. **Eksik Altyapı Bileşenleri Kurulumu (3 gün)**
   - @nestjs/schedule kurulumu ve konfigürasyonu
   - @nestjs/bull ve BullMQ kurulumu
   - @nestjs/event-emitter kurulumu
   - @nestjs/axios ve HTTP Client Service
   - CryptoService implementasyonu

2. **Database ve Model Yapısı (2 gün)**
   - CompanyIntegration tablosu migration
   - ExternalOrder tablosu migration
   - Order tablosuna external field'lar eklenmesi
   - Seed data hazırlanması

3. **Yemeksepeti Modülü Temel Yapısı (3 gün)**
   - yemeksepeti.module.ts oluşturulması
   - YemeksepetiApiService implementasyonu
   - DTO'ların hazırlanması
   - API authentication mekanizması

4. **API Key Yönetimi (2 gün)**
   - CompanyIntegrationService oluşturulması
   - API key şifreleme/şifre çözme
   - Connection test endpoint'i
   - Security middleware'leri

### FAZ 2: Sipariş Senkronizasyonu ve İş Akışları (10 gün)
**Hedef:** Siparişlerin otomatik alınması, dönüştürülmesi ve sistemle entegrasyonu

#### Yapılacaklar:
1. **Polling/Scheduler Mekanizması (3 gün)**
   - Cron job konfigürasyonu
   - Queue processor implementasyonu
   - Retry ve error handling mekanizmaları
   - Circuit breaker pattern

2. **Order Mapping ve Transformation (3 gün)**
   - Yemeksepeti -> Internal order mapper
   - Status mapping tablosu
   - Data validation ve normalization
   - External data storage strategy

3. **WebSocket Entegrasyonu (2 gün)**
   - NotificationsGateway'e entegrasyon
   - Yeni event type'ları (EXTERNAL_ORDER_RECEIVED)
   - Real-time bildirim akışı
   - Frontend socket listener'lar

4. **Kurye Atama Akışı (2 gün)**
   - CreateExternalOrder metodu
   - Auto-fill mekanizması
   - Kurye-sipariş eşleştirme güncelleme
   - Status senkronizasyonu

### FAZ 3: Frontend ve Kullanıcı Deneyimi (10 gün)
**Hedef:** Kullanıcı arayüzlerinin geliştirilmesi ve test/stabilizasyon

#### Yapılacaklar:
1. **Firma Ayarlar Sayfası (3 gün)**
   - API key management formu
   - Connection test UI
   - Integration status dashboard
   - Error handling ve feedback

2. **Sipariş Yönetimi Güncellemeleri (3 gün)**
   - External source badge'leri
   - Filtreleme ve sorting özellikleri
   - Yemeksepeti ikon/renk kodları
   - Detail modal güncellemeleri

3. **Kurye Çağır Modal Güncellemeleri (2 gün)**
   - External order dropdown
   - Auto-fill form logic
   - Validation ve UX iyileştirmeleri
   - Loading states ve error handling

4. **Test ve Stabilizasyon (2 gün)**
   - Unit test coverage
   - Integration testleri
   - E2E senaryoları
   - Bug fixing ve optimization

## 1.1 Mevcut Sistem Altyapisi Analizi

### ✅ Sistemde Mevcut Olan Ozellikler
- **WebSocket/Real-time Altyapi**: Socket.io entegrasyonu, NotificationsGateway ve NotificationsService mevcut
- **Bildirim Sistemi**: Database ve real-time notification sistemi aktif
- **Room-based Yonetim**: courier-{id}, company-{id} room yapisi kullaniliyor
- **Frontend Socket Entegrasyonu**: SocketContext ve socket service hazirlaniyor
- **Authentication**: JWT token tabanli kimlik dogrulama sistemi
- **Role-based Access Control**: Guards ve decoratorlar ile yetkilendirme
- **Redis Cache**: cache-manager v7 ile entegre
- **File Upload**: Multer ile dokuman yukleme sistemi
- **Logging**: Winston logger entegrasyonu
- **Prisma ORM**: Veritabani islemleri icin Prisma v6

### ❌ Sistemde Eksik Olan ve Eklenmesi Gereken Altyapi
- **Scheduler/Cron Job**: Periyodik gorevler icin @nestjs/schedule modulu yok
- **Queue System**: BullMQ veya benzeri kuyruk sistemi yok
- **Event-Driven Architecture**: @nestjs/event-emitter veya EventEmitter2 yok
- **HTTP Client Service**: Harici API cagrilari icin merkezi HttpService yok (@nestjs/axios)
- **Crypto/Encryption Service**: API key sifreleme icin ozel servis yok (sadece bcrypt var)
- **Circuit Breaker Pattern**: Harici servis cagrilari icin circuit breaker yok
- **Rate Limiter**: API cagrilari icin rate limiting mekanizmasi yok

## 2. Gereksinimler

### 2.1 Fonksiyonel Gereksinimler
- Firma profili altinda Yemeksepeti API kimlik bilgileri (API key, secret vb.) tanimlama ve guncelleme ekrani.
- API kimlik bilgilerinin gecerligini test eden "baglantiyi dogrula" fonksiyonu.
- Yemeksepeti siparislerinin anlik veya kisa araliklarla sisteme aktarilmasi (polling veya webhook).
- Aktarilan siparislerin firma panelindeki listelerde kaynak etiketleriyle gorunmesi ve filtrelenmesi.
- Firma panelinde "Kurye cagir" akisi icinde Yemeksepeti siparisini secip form alanlarini otomatik doldurma.
- Siparis durum guncelleme senkronizasyonu (Yemeksepeti -> Biz, gerekirse Biz -> Yemeksepeti).
- Yemeksepeti siparisleri icin ozel raporlama ve filtreleme.

### 2.2 Teknik Gereksinimler
- NestJS tarafinda yeni bir `yemeksepeti` modulu (service + controller + scheduler + DTO) olusturma.
- Prisma semasinda firma bazli entegrasyon ayarlari ve Yemeksepeti siparis kayitlari icin yeni tablolar.
- API key gibi gizli bilgileri sifreleyerek saklamak; loglarda maskelemek.
- Scheduler/polling icin NestJS Scheduler veya kuyruya gecis gerekiyorsa BullMQ kullanimi.
- Hata toleransi icin retry, rate-limit, circuit breaker ve gozlemlenebilirlik bilesenleri.

### 2.3 Eksik Altyapi Bilesenleri Kurulum Plani

#### 2.3.1 Scheduler Modulu Kurulumu
```bash
npm install --save @nestjs/schedule
npm install --save-dev @types/cron
```
```typescript
// app.module.ts'e eklenecek
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [ScheduleModule.forRoot(), ...]
})
```

#### 2.3.2 Queue System (BullMQ) Kurulumu
```bash
npm install --save @nestjs/bull bull
npm install --save-dev @types/bull
```
```typescript
// app.module.ts'e eklenecek
import { BullModule } from '@nestjs/bull';
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),
  ]
})
```

#### 2.3.3 Event-Driven Architecture Kurulumu
```bash
npm install --save @nestjs/event-emitter
```
```typescript
// app.module.ts'e eklenecek
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [EventEmitterModule.forRoot(), ...]
})
```

#### 2.3.4 HTTP Client Service Kurulumu
```bash
npm install --save @nestjs/axios axios
```
```typescript
// common/services/http-client.service.ts
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
  constructor(private readonly httpService: HttpService) {}

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.request<T>(config)
    );
    return response.data;
  }
}
```

#### 2.3.5 Crypto Service Implementasyonu
```typescript
// common/services/crypto.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.INTEGRATION_ENCRYPTION_KEY, 'hex');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### 2.3 Guvenlik ve Uyumluluk
- API anahtarlarini saklarken AES tabanli sifreleme anahtari kullanmak (ConfigModule uzerinden okuyarak).
- Yetkilendirme: Sadece ilgili firmanin kullanicilari entegrasyon bilgilerini gorsun/dunyasinda degistirebilsin.
- Loglarda PII ve gizli alanlari maskelemek.
- Yemeksepeti tarafinda varsa IP allowlist gereksinimleri icin devops ile koordine olmak.

## 3. Yemeksepeti API Arastirmasi ve Varsayimlar
- Context 7 MCP araciligiyla Yemeksepeti entegrasyon dokumantasyonunu (auth, siparis endpointleri, webhook destegi) incelemek.
- Webhook destege gore: yoksa polling periyodu 30-60 sn arasi belirlenecek; varsa webhook icin public endpoint ve imza dogrulama planlanacak.
- Siparis veri modeli (adres, odeme, kampanya, durum kodlari) netlestirilecek.
- Rate limit ve hata kodlari dokumante edilerek retry stratejisi cikarilacak.

## 4. Mimari Yaklasim

### 4.1 Veri Akisi
1. Firma paneli API anahtarini kaydeder -> backend `CompanyIntegrationService` sifreleyerek saklar.
2. Scheduler veya webhook Yemeksepeti siparisini alir -> `ExternalOrderIngestionService` uzerinden Prisma kaydi ve event publish.
3. Publish edilen event mevcut `OrdersService` araciligiyla dahili siparise donusturulup `status=PENDING_EXTERNAL` gibi yeni bir durumla tutulur.
4. Firma paneli siparis listesi Yemeksepeti etiketli kayitlari gosterir.
5. Kurye panelinde "Kurye cagir" modalinde Yemeksepeti siparisi secilerek order create DTO otomatik doldurulur ve kurye atama akisi calisir.

### 4.1.1 Mevcut WebSocket Sistemi ile Entegrasyon
```typescript
// Yemeksepeti siparisi geldiginde mevcut NotificationsGateway kullanimi
async handleYemeksepetiOrder(order: YemeksepetiOrderDto) {
  // Dahili order'a donustur
  const internalOrder = await this.convertToInternalOrder(order);

  // Mevcut bildirim sistemini kullan
  this.notificationsGateway.sendNewOrderToCouriers({
    ...internalOrder,
    externalSource: 'YEMEKSEPETI',
    externalOrderId: order.id
  });

  // Firmaya da bildirim gonder
  this.notificationsGateway.sendNotificationToRoom(
    `company-${internalOrder.companyId}`,
    {
      type: 'EXTERNAL_ORDER_RECEIVED',
      title: 'Yemeksepeti Siparisi',
      message: `Yeni Yemeksepeti siparisi alindi: ${order.orderNumber}`,
      data: internalOrder
    }
  );
}
```

### 4.2 Backend Degisiklikleri
- Yeni modul: `backend/src/yemeksepeti/`
  - `yemeksepeti.module.ts`: HttpModule, Scheduler ve Config bagimliliklarini toplamak.
  - `yemeksepeti.service.ts`: API client, auth header olusturma, request/response mapleme.
  - `yemeksepeti.controller.ts`: Webhook endpointleri (varsa) ve firma bazli health check.
  - `yemeksepeti.scheduler.ts`: Polling job mantigi.
  - `dto/` altinda istek-cevap semalari.
  - `mappers/` ile Yemeksepeti JSON -> dahili DTO donusumleri.
  - Gerekirse `guards` veya `interceptors` ile rate limit ve hata yakalama.
- `company` modulune `CompanyIntegrationSettingsService` eklenerek API key CRUD isleri ayrilacak.
- `orders` modulune `externalSource`, `externalOrderId`, `externalPayloadSnapshot`, `sourceStatus` gibi alanlar eklenecek.
- `common` katmaninda HTTP client wrapper (timeout, retry, circuit breaker) paylasilacak.

### 4.3 Frontend Degisiklikleri
- `frontend/src/app/company/settings/integrations/yemeksepeti` altında yeni ayar sayfasi.
- API key formu (React Hook Form + Zod) -> `frontend/src/lib/api/company-integrations.ts` servisi.
- Firma siparis listesi: TanStack Table'a `externalSource` etiketi, filtre ve ikon eklemek.
- Kurye panelindeki "Kurye cagir" modali: Harici siparis secimi dropdown ve otomatik form doldurma.
- Entegrasyon durumu (baglandi, hata, beklemede) icin durum rozeti ve toaster bildirimleri.

## 5. Veri Modeli ve Migration Plani

### 5.1 Yeni Tablolar

#### CompanyIntegration Tablosu
```prisma
model CompanyIntegration {
  id                String   @id @default(uuid())
  companyId         String
  provider          String   // "YEMEKSEPETI", "GETIR" vb.
  apiKeyEncrypted   String
  apiSecretEncrypted String?
  webhookSecret     String?
  metadata          Json?    // Ek ayarlar
  isActive          Boolean  @default(true)
  lastSyncedAt      DateTime?
  syncStatus        String?  // "SUCCESS", "FAILED", "IN_PROGRESS"
  errorMessage      String?
  errorCount        Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])
  externalOrders ExternalOrder[]

  @@unique([companyId, provider])
  @@index([provider, isActive])
}
```

#### ExternalOrder Tablosu
```prisma
model ExternalOrder {
  id                String   @id @default(uuid())
  integrationId     String
  companyId         String
  provider          String   // "YEMEKSEPETI"
  externalOrderId   String
  status            String   // Harici platform durumu
  payload           Json     // Ham veri
  mappedOrderId     String?  // Dahili Order.id referansi
  lastSyncStatus    String?  // "PENDING", "SYNCED", "FAILED"
  lastSyncAt        DateTime?
  syncError         String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  integration CompanyIntegration @relation(fields: [integrationId], references: [id])
  company     Company @relation(fields: [companyId], references: [id])
  order       Order?  @relation(fields: [mappedOrderId], references: [id])

  @@unique([provider, externalOrderId])
  @@index([companyId, status])
  @@index([mappedOrderId])
}
```

### 5.2 Mevcut Order Tablosuna Eklenecek Alanlar
```prisma
model Order {
  // Mevcut alanlar korunacak...

  // Yeni eklenecek alanlar
  externalSource      String?      // "YEMEKSEPETI", "GETIR" vb.
  externalOrderId     String?      @unique
  externalData        Json?        // Harici platform ozel verileri
  externalStatus      String?      // Harici platform durumu
  isExternal          Boolean      @default(false)
  lastExternalSyncAt  DateTime?
  syncError           String?

  // Yeni relation
  externalOrders      ExternalOrder[]

  @@index([externalSource, externalOrderId])
  @@index([companyId, isExternal])
}
```

### 5.3 Migration Plani
```bash
# 1. Migration olustur
npx prisma migrate dev --name add_yemeksepeti_integration

# 2. Seed dosyasini guncelle
# prisma/seed.ts dosyasina demo entegrasyon verileri ekle
```

## 6. Servisler ve Is Akislari

### 6.1 API Key Yonetimi
- Endpointler:
  - `POST /companies/:id/integrations/yemeksepeti` -> API key kaydet.
  - `PUT /companies/:id/integrations/yemeksepeti` -> guncelle.
  - `POST /companies/:id/integrations/yemeksepeti/test` -> baglanti testi.
- DTO + class-validator kullanarak validasyon, hassas alanlar response icinde maskelenecek.
- API key saklama: AES-256-GCM ile sifreleme; anahtar `.env` uzerinden `INTEGRATION_ENCRYPTION_KEY`.

### 6.2 Siparis Alma Mekanizmasi
- Polling job: Aktif API key olan firmalar icin scheduler queue calisir.
- Incremental sync: `lastSyncedAt` alanina gore delta cekme.
- Retry politikasi: Exponential backoff, maksimum deneme sayisi ve hatalarda alert uretmek.
- Webhook varsa: `X-Yemeksepeti-Signature` gibi header ile HMAC imza dogrulama, tekrar eden istekleri engelleme.

### 6.3 Siparis Haritalama
- Yemeksepeti -> dahili DTO mapleme tablosu olusturulacak:
  - Musteri bilgileri -> `Order.customer` veya yeni bir JSON alani.
  - Teslimat adresi -> `Order.address` JSON.
  - Siparis kalemleri -> `OrderItem` yapisi varsa oraya, yoksa `externalData` icinde tutulacak.
  - Odeme tipi -> `PaymentMethod` enumuna esleme.
- Harici durumlar -> dahili enum mapleme (ornegin `PREPARING` -> `PENDING`, `OUT_FOR_DELIVERY` -> `IN_PROGRESS`).
- Tuhaf durumlarda debug icin tum ham payload `ExternalOrder.payload` alaninda saklanacak.

### 6.4 Kurye Cagir Akisi
- Firma panelindeki siparis kartina "Kurye cagir" butonu eklemek.
- Modal acildiginda Yemeksepeti siparisleri listeleyip secilecek siparisin bilgileri `OrderCreateDto` icine otomatik doldurulacak.
- `OrdersService.createExternalOrder` metodu ile yeni order olusacak, `ExternalOrder.mappedOrderId` guncellenecek.
- Kurye atama ve statu degisimleri mevcut servisler uzerinden yurutulecek.
- Gerekiyorsa Yemeksepeti tarafina statu guncellemesi gondermek icin `YemeksepetiStatusService` yazilacak.

## 7. Konfigurasyon ve Guvenlik
- Yeni environment degiskenleri: `YESEPETI_BASE_URL`, `YESEPETI_TIMEOUT_MS`, `INTEGRATION_ENCRYPTION_KEY`.
- `ConfigModule` u guncelleyerek bu degiskenleri type-safe sekilde enjekte etmek.
- Production ortaminda secret yonetimi icin Vault veya AWS SSM kullanimi planlamak.
- Rate limit icin global veya modul bazli interceptor eklemek.
- Monitoring: harici cagri metrikleri (Prometheus) ve Winston loglarinda provider etiketi.

## 8. Izleme, Loglama ve Alerting
- Sync job basarisi/basarizligi icin metrikler: `yemeksepeti_sync_total`, `yemeksepeti_sync_fail_total`.
- Winston loglarinda `externalOrderId` iceren correlation id kullanmak.
- Ardisik hatalarda (ornegin 3 hata) Notification modulunu kullanarak Slack/email uyarisi gondermek.
- Prisma `ExternalOrder` tablosuna `lastSyncStatus` ve `lastErrorAt` alanlari ekleyip backlog izlemek.

## 9. Test ve Dogrulama Stratejisi
- Unit test: `YemeksepetiService` icin HTTP client mock, mapping fonksiyonlarinin birim testleri.
- Integration test: Testcontainers (Postgres + Redis) ile API key CRUD ve sync pipeline testleri.
- E2E test: Mock Yemeksepeti API (Wiremock veya Nest mock controller) kullanarak end-to-end senaryolar.
- Frontend test: Playwright veya Cypress ile kurye cagir modalinin otomatik doldurma davranisini test etmek.
- Yuk testi: Polling job concurrency icin k6 senaryosu calistirmak.
- QA checklist: API key maskelenmesi, hatali kimlik bilgisi, rate limit cevaplari, kurye atama akisi.

## 10. Yol Haritasi (Iterasyon Bazli)

### Faz 1: Eksik Altyapi Kurulumu (5 gun)
1. **Gun 1-2**: Scheduler, Queue System (BullMQ) ve Event-Driven Architecture kurulumu
   - @nestjs/schedule, @nestjs/bull, @nestjs/event-emitter paketlerinin kurulumu
   - app.module.ts guncellemeleri
   - Temel konfigurasyonlar

2. **Gun 3-4**: HTTP Client ve Crypto Service implementasyonu
   - @nestjs/axios kurulumu
   - HttpClientService olusturma (retry, timeout, circuit breaker)
   - CryptoService implementasyonu (AES-256-GCM sifreleme)

3. **Gun 5**: Common module organizasyonu ve test
   - Servislerin module'e eklenmesi
   - Birim testler
   - Entegrasyon testleri

### Faz 2: Yemeksepeti Modulu Gelistirme (7 gun)
1. **Gun 6-7**: Veritabani ve temel modul yapisi
   - Prisma migration (CompanyIntegration, ExternalOrder tablolari)
   - yemeksepeti.module.ts kurulumu
   - DTO'larin olusturulmasi

2. **Gun 8-10**: API Client ve Authentication
   - YemeksepetiApiService implementasyonu
   - Token yonetimi
   - API method'larinin yazilmasi

3. **Gun 11-12**: Scheduler ve Queue implementasyonu
   - Polling job setup (@Cron decorators)
   - BullMQ processor implementasyonu
   - Error handling ve retry logic

### Faz 3: Siparis Senkronizasyon (5 gun)
1. **Gun 13-14**: Order mapping ve donusum logic
   - Yemeksepeti -> Internal order donusumu
   - Validation ve error handling
   - ExternalOrder kayit yonetimi

2. **Gun 15-16**: WebSocket entegrasyonu
   - Mevcut NotificationsGateway'e entegrasyon
   - Yeni event type'lari ekleme
   - Real-time bildirimler

3. **Gun 17**: Status senkronizasyonu
   - Bidirectional status update (opsiyonel)
   - Webhook endpoint'leri (varsa)

### Faz 4: Frontend Entegrasyonu (6 gun)
1. **Gun 18-19**: Firma ayarlar sayfasi
   - API key yonetim formu
   - Baglanti test butonu
   - Entegrasyon durumu gosterimi

2. **Gun 20-21**: Siparis listesi guncellemeleri
   - External source badge'leri
   - Filtreleme opsiyonlari
   - Yemeksepeti ikonu/renk kodlari

3. **Gun 22-23**: Kurye cagir modal guncellemeleri
   - Harici siparis secim dropdown
   - Otomatik form doldurma
   - Validation ve UX iyilestirmeleri

### Faz 5: Test ve Stabilizasyon (4 gun)
1. **Gun 24-25**: Test coverage
   - Unit testler (%80 coverage hedefi)
   - Integration testler
   - E2E senaryolar

2. **Gun 26-27**: Load testing ve optimizasyon
   - k6 veya Artillery ile yuk testi
   - Database query optimizasyonu
   - Caching strategy implementasyonu

### Faz 6: Deployment ve Monitoring (3 gun)
1. **Gun 28**: Production deployment hazirlik
   - Environment variable setup
   - Secret management (Vault/AWS SSM)
   - Deployment scripti hazirlama

2. **Gun 29-30**: Monitoring ve alerting
   - Prometheus metrikleri setup
   - Grafana dashboard'lari
   - Alert kurallari

**Toplam: 30 is gunu**

### Haftalik Kontrol Noktalari
- **Hafta 1**: Altyapi kurulumu tamamlanmis olmali
- **Hafta 2**: Yemeksepeti modulu ve API client hazir
- **Hafta 3**: Senkronizasyon pipeline calisir durumda
- **Hafta 4**: Frontend entegrasyonu tamamlanmis
- **Hafta 5**: Test ve stabilizasyon
- **Hafta 6**: Production-ready ve monitoring aktif

## 11. Riskler ve Mitigasyonlar
- Yemeksepeti API belirsizligi: Dokumantasyon eksigi icin erken POC ve destek ekibi ile iletisim.
- Rate limit/perf: Polling surelerini ayarlamak, incremental sync ve backoff desteklemek.
- Veri tutarsizligi: Tum harici payload `ExternalOrder.payload` alaninda saklanacak, yeniden isleme scripti hazirlanacak.
- Guvenlik: API key sizintisi riskine karsi sifreleme, secret rotation hatirlatmalari.
- Operasyonel karma: Farkli siparis akislari icin UI/UX testleri ve kurye-operasyon-uzmani ile akis simulasyonlari.

## 12. Acik Sorular
- Yemeksepeti webhook destegi var mi? Polling periyodu icin resmi limit nedir?
- API kimlik bilgileri firma bazli mi yoksa sube bazli mi? Birden fazla key desteklemek gerekiyor mu?
- Siparis statu guncellemesini Yemeksepeti tarafina geri yazmak zorunda miyiz? Hangi endpoint kullanilacak?
- Siparis odemeleri (komisyon, kampanya) nasil raporlanacak? Finans modulune entegrasyon kapsaminda mi?
- Canli yayina cikis icin hangi firmalar pilot olacak ve hangi metrikleri takip edecegiz?

## 13. Sonraki Adimlar

### Hemen Baslanacak Isler (Oncelik Sirasi)
1. **Eksik NPM paketlerinin kurulumu**:
   ```bash
   cd backend
   npm install --save @nestjs/schedule @nestjs/bull bull @nestjs/event-emitter @nestjs/axios axios
   npm install --save-dev @types/cron @types/bull
   ```

2. **Common module olusturma ve servisleri ekleme**:
   - `/backend/src/common/services/` dizini olustur
   - HttpClientService.ts
   - CryptoService.ts
   - CommonModule.ts

3. **Yemeksepeti API dokumantasyonu arastirmasi**:
   - Context 7 MCP kullanarak guncel dokumanlari bul
   - Auth mekanizmasi (OAuth2, API Key, vb.)
   - Endpoint listesi ve response formatlari
   - Rate limit ve webhook destegi

4. **POC (Proof of Concept) hazirligi**:
   - Mock Yemeksepeti API servisi olustur
   - Test verileri hazirla
   - Entegrasyon akisini simule et

### Takip Eden Adimlar
5. **Teknik tasarim dokumani hazirlama**:
   - Detayli API mapping tablosu
   - Sequence diagram'lar
   - Error handling stratejisi

6. **Sprint planlama**:
   - JIRA/Azure DevOps'ta epic ve task'lari olustur
   - Story point tahminleri
   - Sprint kapasitesi belirleme

7. **Development ortami hazirligi**:
   - Feature branch stratejisi
   - CI/CD pipeline guncellemeleri
   - Test ortami kurulumu

## 14. Basari Kriterleri

### Teknik Basari Kriterleri
- ✅ Yemeksepeti API'den siparislerin %99.9 basari oraniyla cekilmesi
- ✅ 30 saniye icerisinde yeni siparislerin sisteme yansimasi
- ✅ API key'lerin guvenli saklanmasi (AES-256-GCM)
- ✅ Gunluk 10.000+ siparis isleyebilme kapasitesi
- ✅ WebSocket uzerinden anlik bildirimler
- ✅ %80+ unit test coverage
- ✅ Zero-downtime deployment

### Is Basari Kriterleri
- ✅ Firma basina ortalama entegrasyon suresi < 5 dakika
- ✅ Manuel siparis girisi %90 azalmasi
- ✅ Kurye atama suresi %50 iyilesmesi
- ✅ Musteri memnuniyeti skoru artisi
- ✅ Siparis takip hassasiyeti %100

## 15. Ozet

Bu plan, mevcut kurye operasyon sistemine Yemeksepeti entegrasyonunu eklemek icin kapsamli bir yol haritasi sunmaktadir.

**Ana odak noktalari:**
1. Eksik altyapi bilesenlerinin kurulumu (Scheduler, Queue, Event-Driven, HTTP Client, Crypto)
2. Mevcut WebSocket ve bildirim sisteminin kullanilmasi
3. Guvenli API key yonetimi ve sifreleme
4. Verimli siparis senkronizasyonu ve mapping
5. Kullanici dostu frontend entegrasyonu

**Toplam sure:** 30 is gunu (6 hafta)
**Kritik bagimliliklar:** Yemeksepeti API dokumantasyonu ve erisim bilgileri

Plan, sistemin mevcut guclü yanlarindan faydalanarak minimum yapisal degisiklikle maksimum deger uretmeyi hedeflemektedir.
