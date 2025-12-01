# Yemeksepeti Credentials Request Mail

---

**Konu:** Kuryemburada POS Entegrasyonu - Credentials ve Test Restoran Talebi

**Ek:** yemeksepeti-public-key.asc

---

Merhaba,

Kuryemburada POS entegrasyonu için credentials ve test restoran bilgilerini talep ediyorum. Elimizdeki TR dokümantasyonu inceledik; testler prod ortamında yapılacak bilgisi doğrultusunda aşağıdaki detaylara ihtiyacımız var:

## 1) Kimlik Doğrulama Bilgileri

### Inbound Çağrılar için Bearer Token:
- Middleware'in dispatch/status çağrılarında göndereceği statik token
- RSA 3072 imzadan bağımsız, JWT kullanılmıyor bilgisi iletildi
- Bu token ile gelen istekleri doğrulayacağız

### Outbound (client_credentials) için OAuth Bilgileri:
- **client_id**
- **client_secret**
- **Token endpoint URL** (OAuth2 token alma için)
- **Prod base URL** (v2 order status & diğer callback API'leri)
- **Token TTL:** 1800 sn olarak biliyoruz, tekrar teyit edebilir misiniz?

### PGP Public Key:
- Credentials'ların şifreli iletilmesi için **Public PGP Key** ektedir
- Key Type: RSA 3072 bit
- Email: hodoxcomtr@gmail.com
- Dosya: `yemeksepeti-public-key.asc`

## 2) Test Restoran Bilgileri

Test için gerekli restoran detayları:
- **chainCode** (8 hane)
- **posVendorId (vendorID)** (4 hane)
- **remoteId** (biz oluşturabiliriz; örnek vermenizi isterseniz iletebilirsiniz)
- **brandCode / platform restoran kimliği** (varsa)
- **Pickup address** (lat/lng koordinatları dahil)
- Desteklenen **sipariş tipleri** (pickup / vendor delivery / own delivery)
- Desteklenen **ödeme tipleri**

## 3) Plugin Endpoint Bilgileri

Bizim tarafımızda hazır olan endpoint'ler:
- **Plugin Base URL:** `https://api.kuryemburada.com/yemeksepeti`
- **SSL Certificate:** Aktif (Let's Encrypt)
- **Dispatch Endpoint:** `POST /yemeksepeti/order/:remoteId`
- **Status Update Endpoint:** `PUT /yemeksepeti/remoteId/:remoteId/posOrderStatus`

## 4) Ağ/TLS Ayarları

Dokümantasyondan aldığımız bilgiler:
- **Middleware IP'leri:** 63.32.225.161, 18.202.96.85, 52.208.41.152
- **mTLS** veya ek zorunlu header yok diyebilir miyiz?
- **Timeout önerisi:** 5-10 dakika arası
- **HTTP Response Codes:** 200 ve 202 kabul edilecek

## 5) İletişim Bilgileri

- **Şirket:** Kuryemburada
- **İletişim Email:** hodoxcomtr@gmail.com
- **Website:** https://kuryemburada.com
- **API Base:** https://api.kuryemburada.com

## 6) Operasyon ve Destek

Dokümanda belirtilen süreçler:
- **POS Support** mail adresi ile iletişim
- **Planlı bakımlar için:** log-vendor-pos@deliveryhero.com
- **Arıza/eskalasyon süreci** doküman kapsamında

---

Test sürecine başlamak ve entegrasyonu tamamlamak için yukarıdaki bilgilere ihtiyacımız var. Adım adım destek sağlanacağı belirtilmiş; süreç boyunca koordineli çalışmaya hazırız.

Teşekkürler,

**Kuryemburada Entegrasyon Ekibi**
hodoxcomtr@gmail.com
https://kuryemburada.com
