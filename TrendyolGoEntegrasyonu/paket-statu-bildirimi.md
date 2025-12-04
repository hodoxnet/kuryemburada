# Paket Statü Bildirimi (`updatePackage`)

Bu bölüm, oluşturulan sipariş paketlerinin statülerinin Trendyol Go by Uber Eats sistemine bildirilmesi için kullanılan **Paket Statü Bildirimi (updatePackage)** süreçlerini açıklar.

---

## Genel Bilgi

Oluşturulan sipariş paketinin **kabul edildiği** ve **hazırlandığı** statülerinin bildirilmesi için kullanılır.

- **Hazırlandı (Invoiced) statüsü bildirimi**, hazırlanan siparişin tutarının Trendyol Go by Uber Eats'e aktarılması ve satıcılara yapılacak ödemelerin hesaplanması için **zorunludur**.

---

## İzin Verilen Statüler

Siparişe ait bir paketi **yalnızca iki paket statüsü** ile güncelleyebilirsiniz:

1. **Picking** — Sipariş Kabul Edildi Bildirimi  
2. **Invoiced** — Sipariş Hazırlandı Bildirimi  

> Diğer tüm statüler sistem tarafından **otomatik** olarak pakete aktarılmaktadır.

---

## Sıralı Statü Beslemesi

Statü güncellemeleri yapılırken aşağıdaki sıra takip edilmelidir:

1. **Sipariş Kabul Bildirimi** → `Picking`  
2. **Hazırlandı Bildirimi** → `Invoiced`  

Bu sıralama, sipariş sürecinin doğru ve tutarlı şekilde yönetilebilmesi için önemlidir.

---

## Provizyonsuz Satışlarda Önemli Bilgiler

Provizyonsuz satış yapan satıcılar için:

- `invoicedAmount` değeri **`null`** olarak gönderilmelidir.
- **`Invoiced` (Sipariş Hazırlandı)** statüsü beslenmeyen siparişler, **`Shipped` statüsüne geçmeyecektir.**

---

## Yeni Eklenen Alanlar

**Invoiced (Sipariş Hazırlandı)** statü bildirimine aşağıdaki alanlar eklenmiştir:

- `bagCount` — Poşet adedi
- `receiptLink` — Fiş görsel linki

Bu alanlar **zorunlu değildir**, ancak:

- Müşteri iletişimi,
- Mutabakat,
- Operasyonel takip

açılarından önemli oldukları için, bu bilgileri tutan satıcıların göndermesi tavsiye edilir. Bilgi tutulmuyorsa alanlar **`null`** gönderilebilir.

---

## Sipariş Paketi İşlem Akışı

Sipariş paketleri için önerilen işlem sıralaması aşağıdaki gibidir:

1. **Sipariş Kabul Edildi Bildirimi (`Picking`)**
2. **Alternatif Ürün Bildirimi veya Tedarik Edememe Bildirimi (`markItems` veya `unsupplied`)**
3. **Provizyon Aralığı Bilgisinin Alınması (`GET invoiceAmount`)**
4. **Sipariş Hazırlandı Bildirimi (`Invoiced`)**

> **Önemli Nokta:**  
> `Invoiced` (Sipariş Hazırlandı) adımından **hemen önce** provizyon aralığının **`GET invoiceAmount`** servisi ile çekilmesi ve sonrasında `Invoiced` bildiriminin yapılması gerekmektedir.

---

## Header Parametreleri

| Parametre         | Açıklama                              | Tip     | Zorunluluk |
|-------------------|----------------------------------------|---------|-----------|
| `x-agentname`     | Entegratör ismi                       | string  | Evet      |
| `x-executor-user` | İşlemi yapan kişinin e-posta adresi   | string  | Evet      |

---

## PUT `updatePackage` — Sipariş Kabul Edildi Bildirimi (`Picking`)

Bu endpoint, sipariş paketinin **kabul edildiğini** bildirmek için kullanılır.

- Endpoint kullanımında **request body gönderilmeyecektir**.
- `Picking` statüsü beslendiği anda, Trendyol Go by Uber Eats panelinde sipariş numarası üzerinde **"Sipariş kabul edilmiştir"** ifadesi görüntülenir.
- Bu statü ile kendi sisteminizde de sipariş durumlarını kontrol edebilirsiniz.

### Endpointler

**PROD:**

```http
PUT https://api.tgoapis.com/integrator/order/grocery/suppliers/{supplierid}/packages/{packageId}/picked
```

**STAGE:**

```http
PUT https://stageapi.tgoapis.com/integrator/order/grocery/suppliers/{supplierid}/packages/{packageId}/picked
```

---

## PUT `updatePackage` — Sipariş Hazırlandı Bildirimi (`Invoiced`)

Bu endpoint, siparişin **hazırlandığını** ve fiş tutarının Trendyol Go by Uber Eats tarafına bildirildiğini ifade eder.

- `Invoiced` statüsü beslendiği anda, Trendyol Go by Uber Eats panelinde sipariş numarası üzerinde **"Sipariş hazırlanmıştır"** ifadesi görüntülenir.
- Bu statü ile siparişlerinize ait durumu kendi tarafınızda da kontrol edebilirsiniz.
- `Invoiced` statüsü, sipariş hazırlandığında oluşan **fiş tutarı** ile beraber gönderilir ve bu tutar, tarafınıza yapılacak ödemelerin hesaplanmasında kullanılır.

> **Önemli:**  
> `Invoiced` statüsü beslenmeyen siparişler **`Shipped` durumuna geçirilemez.**

### Invoice Amount Aralığı

Beslenebilecek **min–max invoice amount aralığı** bilgisini almak için aşağıdaki servis kullanılmalıdır.  
Response içerisinde, girilebilecek minimum ve maksimum tutarlar döner.

---

## Provizyon ve Teslimat Ücreti (Model 1 - Kendi Kuryesi ile Teslimat)

**Model 1 (kendi kuryesi ile teslimat yapan ve provizyonlu çalışan satıcılar)** için `Invoiced` bildirimi yapılırken `invoiceAmount` alanı aşağıdaki şekilde kullanılmalıdır:

### Eğer `totalCargo > 0` ise:

- `invoiceAmount` alanı içinde:
  - Ürünlerin **provizyonlu final fiş tutarı**  
  - **+ teslimat ücreti toplamı**  
  yer almalıdır.
- Eğer `invoiceAmount` içerisine teslimat ücreti eklenmezse:
  - Müşteriden teslimat ücreti çekilemez.
  - Satıcı **eksik hakediş** alır.

### Eğer `totalCargo = 0` veya `null` ise:

- Satıcının müşteriye kestiği fişte **teslimat ücreti olmamalıdır.**
- `invoiceAmount` alanında **yalnızca ürünlerin provizyonlu final fiş tutarı** yer almalıdır.

### KDV Bilgisi (`invoiceTaxAmount`)

Siparişlerdeki provizyon farklarından doğan **KDV farklarının hesaplanabilmesi** için:

- Siparişteki **toplam KDV tutarı**, `invoiceTaxAmount` alanında beslenmelidir.
- Bu alan **boş bırakılırsa**, provizyon tutarında **KDV bulunmadığı** kabul edilir.

---

## Endpointler — `Invoiced` Bildirimi

**PROD:**

```http
PUT https://api.tgoapis.com/integrator/order/grocery/suppliers/{supplierid}/packages/{packageId}/invoiced
```

**STAGE:**

```http
PUT https://stageapi.tgoapis.com/integrator/order/grocery/suppliers/{supplierid}/packages/{packageId}/invoiced
```

---

## Örnek Servis İsteği — `Invoiced`

```json
{
  "invoiceAmount": 0,
  "bagCount": 3,
  "receiptLink": "https://fisgorsellinki.com/324523-34523-52345-3453245.jpeg",
  "invoiceTaxAmount": 0.0
}
```

> **Not:**  
> `bagCount` için maksimum **10 poşet** girilebilir.

---

## GET `invoiceAmount` — Provizyon Aralığı Bilgisi

Bu servis, ilgili sipariş için **girilebilecek minimum ve maksimum invoice amount aralığını** döner.

### Endpointler

**PROD:**

```http
GET https://api.tgoapis.com/integrator/order/grocery/suppliers/{supplierId}/orders/{orderId}/invoice-amount
```

**STAGE:**

```http
GET https://stageapi.tgoapis.com/integrator/order/grocery/suppliers/{supplierId}/orders/{orderId}/invoice-amount
```

### Örnek Servis Cevabı

```json
{
  "min": 17.25,
  "max": 24.74
}
```
