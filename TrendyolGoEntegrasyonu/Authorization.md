# Authorization  
## API Bağlantısının Kurulması (Authorization)

> **Dikkat:**  
> API bilgileri üzerinden tüm entegrasyon işlemleri gerçekleştirileceğinden, API Key bilgilerinizin herhangi bir açık platformda (GitHub, GitLab vb.) paylaşılmaması son derece önemlidir.

Trendyol Go by Uber Eats Partner API entegrasyonunda tüm istekler **Basic Authentication** yöntemi ile yetkilendirilmelidir.

Basic Authentication için kullanılan bilgiler:

- **supplierId**
- **API KEY**
- **API SECRET KEY**

Bu bilgiler satıcı panelinde yer alan **Hesap Bilgilerim → Entegrasyon Bilgileri** ekranından alınmalıdır.

**Notlar:**

- Authentication bilgileri **PROD** ve **STAGE** ortamlarında farklılık gösterebilir.  
- Kullanılan endpoint ve ortam yapısına göre bilgiler güncellenmelidir.  
- Trendyol Go by Uber Eats (Market & Yemek) için API Key bilgileri her **supplierId** için tektir ve supplierId altında tanımlanan şubeler için **değişmez**.

Hatalı authentication yapılması durumunda:

```json
{
  "status": 401,
  "exception": "ClientApiAuthenticationException"
}
```

---

# Auth ve User-Agent Kullanımı

Trendyol Go by Uber Eats Partner API'ye gönderilen tüm isteklere aşağıdaki iki başlığın eklenmesi zorunludur:

- **Authorization**
- **User-Agent**

User-Agent bilgisi olmayan istekler **403 Forbidden** hatası ile engellenecektir.

### User-Agent Formatı

| Durum | Gönderilecek User-Agent |
|-------|--------------------------|
| Bir entegrasyon firması üzerinden işlem yapılıyorsa | `"SatıcıId - {EntegrasyonFirmasıAdı}"` |
| Satıcı kendi yazılımını kullanıyorsa | `"SatıcıId - SelfIntegration"` |

> **Not:** Entegratör firma ismi yalnızca alfanumerik karakterlerden oluşmalı ve maksimum **30 karakter** uzunluğunda olmalıdır.

### Örnekler

#### Örnek 1
- **SatıcıId:** 1234  
- **Entegratör firma:** TrendyolSoft  

Gönderilecek User-Agent:
```
1234 - TrendyolSoft
```

#### Örnek 2
- **SatıcıId:** 4321  
- **Entegratör firma yok (self integration)**  

Gönderilecek User-Agent:
```
4321 - SelfIntegration
```

---

# Trendyol Go by Uber Eats API Servis İstek Sınırlaması

Trendyol Go by Uber Eats Partner API için rate limit aşağıdaki gibidir:

- Aynı endpoint'e **10 saniye içerisinde maksimum 50 istek** yapılabilir.
- 51. istekte aşağıdaki hata döner:

```json
{
  "status": 429,
  "message": "too.many.requests"
}
```
