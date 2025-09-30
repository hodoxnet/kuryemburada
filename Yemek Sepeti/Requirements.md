# Yemeksepeti Entegrasyon Gereksinimleri

## 1. İş Gereksinimleri

### 1.1 Temel İhtiyaçlar
- Firmalar Yemeksepeti üzerinden gelen siparişleri mevcut sistemde yönetebilmeli
- Siparişler otomatik olarak sisteme aktarılmalı
- Kurye ataması mevcut sistemle entegre çalışmalı
- Raporlama ve faturalama süreçlerine dahil edilmeli

### 1.2 Kullanıcı Hikayeleri

#### Firma Perspektifi
- **Hikaye 1:** Firma yöneticisi olarak, Yemeksepeti API bilgilerimi sisteme tanımlayabilmeliyim
- **Hikaye 2:** Firma yöneticisi olarak, Yemeksepeti siparişlerimi gerçek zamanlı görebilmeliyim
- **Hikaye 3:** Firma yöneticisi olarak, Yemeksepeti siparişi için hızlıca kurye atayabilmeliyim
- **Hikaye 4:** Firma yöneticisi olarak, entegrasyon durumunu ve hataları görebilmeliyim

#### Kurye Perspektifi
- **Hikaye 5:** Kurye olarak, Yemeksepeti siparişlerini diğer siparişlerden ayırt edebilmeliyim
- **Hikaye 6:** Kurye olarak, Yemeksepeti sipariş detaylarını tam olarak görebilmeliyim

#### Sistem Admin Perspektifi
- **Hikaye 7:** Admin olarak, tüm firma entegrasyonlarını monitör edebilmeliyim
- **Hikaye 8:** Admin olarak, entegrasyon hatalarını tespit edip müdahale edebilmeliyim

## 2. Fonksiyonel Gereksinimler

### 2.1 Entegrasyon Yönetimi
- **FR-001:** Firma bazlı API key tanımlama
- **FR-002:** API key şifreleme ve güvenli saklama
- **FR-003:** Bağlantı test fonksiyonu
- **FR-004:** Entegrasyon aktif/pasif yapabilme
- **FR-005:** Çoklu entegrasyon desteği (ileriye dönük)

### 2.2 Sipariş Senkronizasyonu
- **FR-006:** Periyodik sipariş senkronizasyonu (30-60 saniye)
- **FR-007:** Incremental sync (sadece yeni/güncel siparişler)
- **FR-008:** Sipariş durum senkronizasyonu
- **FR-009:** Hata durumunda retry mekanizması
- **FR-010:** Duplicate sipariş kontrolü

### 2.3 Sipariş Yönetimi
- **FR-011:** External source gösterimi
- **FR-012:** Yemeksepeti siparişlerini filtreleme
- **FR-013:** Otomatik form doldurma (kurye çağır)
- **FR-014:** Sipariş detayları mapping
- **FR-015:** Ödeme bilgisi entegrasyonu

### 2.4 Bildirimler
- **FR-016:** Yeni sipariş bildirimi
- **FR-017:** Entegrasyon hata bildirimi
- **FR-018:** Bağlantı kopması uyarısı
- **FR-019:** Rate limit uyarısı
- **FR-020:** Başarılı senkronizasyon bildirimi

### 2.5 Raporlama
- **FR-021:** Yemeksepeti sipariş raporu
- **FR-022:** Entegrasyon performans raporu
- **FR-023:** Hata log raporu
- **FR-024:** Finansal özet raporu
- **FR-025:** Kurye performans raporu (external)

## 3. Teknik Gereksinimler

### 3.1 Altyapı
- **TR-001:** @nestjs/schedule modülü kurulumu
- **TR-002:** BullMQ queue sistemi entegrasyonu
- **TR-003:** Event-driven architecture kurulumu
- **TR-004:** HTTP client service implementasyonu
- **TR-005:** Redis cache kullanımı

### 3.2 Güvenlik
- **TR-006:** AES-256-GCM şifreleme
- **TR-007:** API key maskeleme (loglarda)
- **TR-008:** Rate limiting
- **TR-009:** Circuit breaker pattern
- **TR-010:** HMAC signature validation (webhook)

### 3.3 Performans
- **TR-011:** 10.000+ günlük sipariş kapasitesi
- **TR-012:** 30 saniye maksimum gecikme
- **TR-013:** %99.9 uptime hedefi
- **TR-014:** Concurrent polling desteği
- **TR-015:** Database query optimizasyonu

### 3.4 Veri Yönetimi
- **TR-016:** CompanyIntegration tablosu
- **TR-017:** ExternalOrder tablosu
- **TR-018:** Order tablosu genişletme
- **TR-019:** Audit trail
- **TR-020:** Soft delete desteği

### 3.5 Monitoring
- **TR-021:** Prometheus metrikleri
- **TR-022:** Winston loglama
- **TR-023:** Health check endpoint
- **TR-024:** Performance monitoring
- **TR-025:** Alert mekanizmaları

## 4. Kalite Gereksinimleri

### 4.1 Kullanılabilirlik
- Basit ve anlaşılır API key tanımlama arayüzü
- Tek tıkla bağlantı testi
- Açıklayıcı hata mesajları
- Görsel durum göstergeleri
- Responsive tasarım

### 4.2 Güvenilirlik
- Otomatik retry mekanizması
- Graceful degradation
- Data consistency garantisi
- Transaction desteği
- Backup ve recovery planı

### 4.3 Bakım Kolaylığı
- Modüler kod yapısı
- Comprehensive logging
- Detaylı dokümantasyon
- Unit test coverage %80+
- CI/CD pipeline entegrasyonu

### 4.4 Esneklik
- Farklı entegrasyon provider desteği
- Configurable polling intervals
- Dynamic field mapping
- Extensible architecture
- Plugin sistemi (ileriye dönük)

## 5. Kısıtlamalar

### 5.1 Teknik Kısıtlamalar
- Mevcut tech stack ile uyumlu olmalı (NestJS, Next.js, PostgreSQL)
- Prisma ORM kullanılmalı
- JWT authentication korunmalı
- Redis cache kullanılmalı
- TypeScript zorunlu

### 5.2 İş Kısıtlamaları
- 30 iş günü içinde tamamlanmalı
- Mevcut sistemin çalışmasını etkilememeli
- Pilot firma ile test edilmeli
- Yemeksepeti API limitlerine uyulmalı
- KVKK uyumlu olmalı

### 5.3 Operasyonel Kısıtlamalar
- 7/24 çalışabilmeli
- Zero-downtime deployment
- Rollback capability
- Disaster recovery plan
- SLA %99.9

## 6. Kabul Kriterleri

### 6.1 Fonksiyonel Kabul
- [ ] API key tanımlama ve test etme çalışıyor
- [ ] Siparişler 60 saniye içinde senkronize oluyor
- [ ] Kurye çağır formu otomatik dolduruluyor
- [ ] Bildirimler doğru zamanda geliyor
- [ ] Raporlarda Yemeksepeti verileri görünüyor

### 6.2 Teknik Kabul
- [ ] Unit test coverage %80 üzeri
- [ ] Integration testleri başarılı
- [ ] Load test 10K sipariş/gün başarılı
- [ ] Security audit geçildi
- [ ] Performance SLA karşılanıyor

### 6.3 Kullanıcı Kabul
- [ ] Firma kullanıcıları eğitim aldı
- [ ] Kurye kullanıcıları bilgilendirildi
- [ ] Admin dokümantasyonu hazır
- [ ] Pilot test başarılı
- [ ] Feedback toplantısı yapıldı

## 7. Riskler ve Azaltma Stratejileri

### 7.1 Teknik Riskler
| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|-------------------|
| Yemeksepeti API değişikliği | Orta | Yüksek | Versioning ve monitoring |
| Rate limit aşımı | Yüksek | Orta | Intelligent polling ve caching |
| Data inconsistency | Düşük | Yüksek | Transaction ve audit log |
| Security breach | Düşük | Çok Yüksek | Encryption ve access control |
| Performance degradation | Orta | Orta | Caching ve optimization |

### 7.2 İş Riskleri
| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|-------------------|
| Yemeksepeti işbirliği eksikliği | Orta | Yüksek | Erken iletişim ve dokümantasyon |
| Kullanıcı direnç | Düşük | Orta | Eğitim ve change management |
| Yasal uyumsuzluk | Düşük | Yüksek | Legal review ve compliance check |
| Bütçe aşımı | Orta | Orta | Agile yaklaşım ve MVP |
| Zaman aşımı | Orta | Orta | Fazlı yaklaşım ve prioritization |

## 8. Bağımlılıklar

### 8.1 Dahili Bağımlılıklar
- Mevcut authentication sistemi
- WebSocket altyapısı
- Notification servisi
- Order management modülü
- Payment modülü

### 8.2 Harici Bağımlılıklar
- Yemeksepeti API erişimi
- Yemeksepeti dokümantasyonu
- SSL sertifikası (webhook için)
- Redis server
- PostgreSQL database

## 9. Varsayımlar

- Yemeksepeti REST API kullanıyor
- OAuth2 veya API key authentication mevcut
- Rate limit makul seviyede (60 req/min)
- Webhook desteği mevcut (opsiyonel)
- JSON format kullanılıyor
- Türkçe karakter desteği var
- Test ortamı sağlanacak

## 10. Kapsam Dışı

- Yemeksepeti dışındaki platformlar (Getir, Trendyol vb.)
- Müşteri yorum entegrasyonu
- Kampanya yönetimi
- Menü senkronizasyonu
- Stok takibi
- Muhasebe entegrasyonu (ilk fazda)
- SMS bildirimleri (ilk fazda)
- Mobil uygulama güncellemeleri (ilk fazda)