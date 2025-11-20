# Yemeksepeti POS Entegrasyonu Teknik Bilgiler

## 1. Kimlik Doğrulama (Inbound – MiddlewareJWTAuth)

### İmza Algoritması ve JWT Detayları

- **İmza algoritması**: RSA 3072  
- **JWT kullanımı**: Hayır  
- **Authorization biçimi**:  
  - `Authorization: Bearer <token>`
- **Ek zorunlu header**: İlgili dökümanda belirtilmedi (correlation id vb. özel bir zorunluluk bildirilmedi)

> Not: Soruda belirtilen HS256 / RS256 / JWKS / iss / aud / sub / exp / iat / kid / clock skew / key rotation detayları, mevcut yanıtta paylaşılmamış, yalnızca imza algoritmasının RSA 3072 olduğu ve Bearer formatı kullanıldığı belirtilmiştir.

---

## 2. Kimlik Doğrulama (Outbound – BearerPluginAuth)

### Erişim Belirteci Edinimi

- **Grant type**: OAuth2 **client_credentials**
- **Token kullanım süresi (TTL)**: `1800 saniye` (30 dakika)
- **UAT / Prod endpoint**:  
  - Testler doğrudan **Prod** üzerinden yapıldığı için ayrı bir **UAT endpoint’i bulunmamaktadır**.

---

## 3. Ortamlar ve Ağ

### IP Allowlist (Outbound Trafiği)

Middleware’in dışarıya çıkarken kullanacağı IP adresleri:

- `63.32.225.161`
- `18.202.96.85`
- `52.208.41.152`

### HTTP Yanıt Kodları

- Plugin’e gönderilen isteklerde **200** ve **202** dönüşleri servis tarafından **kabul edilmektedir**.

### TTFB / Timeout Önerisi

- TTFB / timeout değeri **uç noktaya göre değişmekle birlikte**, genellikle:
  - **5 ila 10 dakika** aralığındadır.

### Outbound v2 Çağrıları

- Talep edilen **“Outbound v2”** çağrılarına dair net tanım paylaşılmamıştır.
- “v2 çağrıları”nın ne olduğu anlaşılmadığı belirtilmiştir.
- **Rate limit**: Özel bir hız limiti tanımlı değildir.
- **UAT ortamı**:  
  - Testler **Prod** ortamı üzerinden yürütüldüğü için **ayrı bir UAT base URL’i yoktur**.

---

## 4. Marka / Vendor Kimlikleri

### chainCode

- **Türkiye’de chainCode zorunludur.**
- **Uzunluk**: 8 hanelidir.
- **Üreten taraf**:
  - Şube entegrasyona dahil edilirken, **marka bazlı olarak Yemeksepeti tarafından belirlenir**.

### vendorID (posVendorId)

- Entegrasyona dahil etmek istediğiniz şubenin **vendorID** bilgisi:
  - **Yemeksepeti tarafından belirlenir**, şubeye özeldir ve değişmez.
  - **Uzunluk**: 4 hanelidir.

### remoteID

- **RemoteID**, şubeleri kendi sisteminizde ayırt etmek için kullanılır.
- Format:
  - Rakam
  - Harf
  - Ya da **karışık** (alfa-numerik) formatta olabilir.
- **RemoteID**, entegrasyon tarafınızdan üretilir ve Yemeksepeti’ne iletilir.

---

## 5. İptal ve Geri Bildirimler

### posOrderStatus Statüleri

- Middleware’in plugin’e gönderdiği `posOrderStatus` statülerinin (örneğin `ORDER_CANCELLED`, `COURIER_ARRIVED_AT_VENDOR` vb.) tüm kapsamı detaylı dökümanda yer almaktadır.

### remoteOrderId Zorunluluğu

- **`remoteOrderId`’yi ACK sırasında dönmeniz zorunludur.**
- Döneceğiniz formatlar ve istek örnekleri, resmi dokümanda detaylı şekilde belirtilmiştir.

---

## 6. KVKK / PII

### PII ve Maskeleme Politikası

- TR tarafındaki PII (ad, telefon vb.) saklama ve maskeleme politikaları için:
  - **Türkiye’deki KVKK kanunu** baz alınmalıdır.
- **Saklama süresi** ve **imha / anonimleştirme** süreleri için:
  - Şirketinizin KVKK uyum politikaları (saklama ve imha süreleriniz) esas alınmalıdır.
- Ayrıca olası talep süreci ve SLA’ler için iç KVKK süreçleriniz uygulanmalıdır.

---

## 7. Katalog / Ürün Operasyonları

### Catalog Import Durumu

- **Catalog Import** özelliğinin TR’de **pasif** olduğu belirtilmiştir.

### “Modify Order Products” ve “Availability” Uçları

- Menü üzerinde yapacağınız tüm işlemler şu an için TR’de **aktif değildir**.
- Şubeler:
  - Fiyat,
  - Menü değişikliği vb. işlemleri **Partner paneli üzerinden** gerçekleştirmelidir.

### Mevcut Manuel Süreç (Menü Mapping)

Catalog import aktif olana kadar süreç şu şekilde ilerlemektedir:

1. Entegrasyon yapmak istediğiniz restoranın menüsünü **Yemeksepeti’nden talep edersiniz**.
2. Restoranın menüsü **Excel formatında** tarafınıza iletilir.
3. Kendi sisteminizdeki ürünlere karşılık gelecek şekilde **`remote_code`** sütununu doldurursunuz.
4. Güncellenmiş Excel dosyasını Yemeksepeti’ne iletirsiniz.
5. Menü mapping işlemi bu dosya üzerinden gerçekleştirilir.

---

## 8. Monitoring / Operasyon

### Korelasyon Header’ları

- Zorunlu korelasyon header’ları (örn. `X-Request-Id`) ile ilgili özel bir zorunluluk belirtilmemiştir.  
  (Bu tip header gereksinimleri varsa resmi dokümanda yer alacaktır.)

### Arıza / Kapama / Eskalasyon Süreci

- Arıza, kapama, bakım vb. durumlarda:
  - **POS Support** mail adresi ile iletişime geçmeniz beklenir.
- Uzun süreli bakım ve global tarafta alert oluşacak durumlarda:
  - Entegrasyonunuz **sorun düzelene kadar geçici olarak kapatılabilir.**

### Planlı Bakım Bildirimleri

- `log-vendor-pos@deliveryhero.com` adresinin TR için de planlı bakım bildirim adresi olarak yeterli olduğu belirtilmiştir.

---

## 9. Marka Bazlı Endpoint

“Her marka için ayrı endpoint host edilmesi” önerisi ile ilgili:

- **Ayrı host / subdomain zorunlu değildir.**
- Aşağıdaki gibi **path bazlı ayrım** kabul edilebilir:
  - `https://api.domain.com/yemeksepeti/<brand>/...`

---

## 10. Test Süreci ve Test Restoran Bilgileri

### Test Restoran

- Tüm işlemleri test edebilmek ve sistemi deneyebilmek için tarafınıza **test restoranı** tanımlanacaktır.

Test restoranı ile ilgili örnek bilgiler:

- **chainCode**
- **remoteId (posVendorId)**
- Varsa **brandCode / platform restoran kimliği**
- Desteklenen sipariş türleri:
  - `pickup`
  - `vendor delivery`
  - `own delivery`
- Desteklenen ödeme tipleri

### Test Sürecinin Başlangıcı

1. Öncelikle **credentials talebi** oluşturmanız gerekir.
2. Talep oluşturduktan sonra:
   - Bilgi vermeniz halinde çözümlemeniz için **PGP bilgisi paylaşılacaktır.**
3. Sürecin tamamında:
   - Adım adım **destek sağlanacağı** belirtilmektedir.

---