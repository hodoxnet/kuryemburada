# Yeni Sipariş Paketlerini Çekme

Bu servis, **Trendyol Go by Uber Eats** sisteminden sipariş paketi bilgilerini çekmek için kullanılır.  
Aşağıdaki başlıklar, servisin doğru anlaşılması ve etkin kullanımı için detayları içermektedir.

---

## orderNumber ve id Değerleri

- `orderNumber`: Sipariş datası alınırken gelen bu alan, siparişin **Trendyol Go by Uber Eats** sistemindeki **ana sipariş numarasını** temsil eder.
- `id`: Aynı seviyede yer alan bu alan, ilgili `orderNumber` için oluşturulmuş **sipariş paketini** temsil eder.

Ek bilgi:

- Bir sipariş paketi içinde bir ya da birden fazla kalem iptal edildiğinde, sistem **`orderNumber` aynı kalmak kaydıyla** sipariş paketini bozar ve **yeni bir `id` değeri** oluşturur.

---

## Tarih Bilgileri

- `orderDate`: Timestamp (milliseconds) formatında, **GMT +3** olarak iletilir.
- `createdDate`: **GMT** formatında iletilir.

> **Önemli:**  
> Tarih bilgilerini işlerken ve dönüştürürken (`convert` işlemleri) bu fark mutlaka dikkate alınmalıdır.

---

## Sipariş Paketleri Çekme Süresi

- Sipariş paketlerini çekme servisi ile **son 3 aylık** sipariş bilgisine ulaşılabilir.

---

## Sipariş Statüleri

Sipariş paketlerinize herhangi bir statü (örn: `Picking`, `Invoiced`) gönderirseniz, siparişleri çekerken bu statülere göre sorgulama yaparak **yeni siparişlerinizi daha rahat filtreleyebilirsiniz.**

Bazı örnek sorgu kullanımları:

- **İptal olan siparişleri çekerken:**
  - `status=Cancelled,UnSupplied`
- **Paketi bölünmüş olan siparişleri çekerken:**
  - `status=UnPacked`

---

## Adres Bilgisi

Adres bilgisi aşağıdaki alanlar kullanılarak oluşturulabilir:

- `address1`
- `address2`
- `apartmentNumber`
- `floor`
- `doorNumber`
- `district`
- `city`
- `addressDescription`

> **Model 2 için özel durum:**  
> Sipariş paketlerini çekme servisinden **Model 2** (Trendyol Go by Uber Eats kuryesi ile teslimat yapan satıcılar) için `"address"` alanı altındaki field'lar **"Trendyol Go by Uber Eats - Market"** olarak dönmektedir. Detaylara ilgili payloadlardan ulaşabilirsiniz.

---

## Gramajlı Ürünler

Gramajlı ürünlerde:

- `lines` altında yer alan `product` nesnesi içindeki `weight` objesi kullanılır.

Örnek:

```json
"weight": {
  "typeName": "Gr",
  "defaultSaleUnitValue": "500"
}
```

---

## Kurye Bilgisi

Go kuryesi ile çalışan satıcılar için:

- `isCourierNearby` alanı eklenmiştir.
- Kurye şubeye yaklaştığında bu alan **`true`** olarak güncellenir.

---

## Teslimat Ücreti

Sipariş paketlerini çekme servisi aracılığıyla **teslimat ücreti** bilgisi de iletilir:

- İlgili bilgi payload içinde **`totalCargo`** alanında bulunur.

---

## Fiyat ile İlgili Alanlar

Aşağıdaki bilgiler, örnek olarak **barcode1234** barkodlu ve 2 adet alınmış bir ürün üzerinden açıklanmıştır:

- **`amount`**  
  2 adet alınmış ürünün her birinin **indirimden önceki fiyatını** listeler.

- **`discount`**  
  2 adet alınmış ürünün her birine denk gelen **indirim tutarını** listeler.  
  > Fatura keserken kalem indirimi gösterimi yapan satıcıların bu alanı kullanmaması tavsiye edilir. `lineItemDiscount` alanını kontrol ediniz.

- **`price`**  
  2 adet alınmış ürünün her birinin **indirimden önceki fiyatını** listeler.  
  > Fatura keserken kalem indirimi gösterimi yapan satıcıların bu alanı kullanmaması tavsiye edilir. `lineItemPrices` alanını kontrol ediniz.

- **`lineItemPrices`**  
  Liste olarak, ürünün **her bir tanesine denk gelen indirim sonrası gerçek fiyatı** listelenir. (Satıcının kasasından geçen indirimlerdir.)

- **`lineItemDiscounts`**  
  Liste olarak, ürünün **her bir tanesine denk gelen gerçek indirim tutarı** listelenir.

---

## Sipariş Entegrasyon Modelinde Kupon ve Promosyon Senaryoları

> **Not:**  
> Kupon ve promosyon içerisinde yer alan `sellerCoverageRatio` alanı **0'dan büyük** değer aldığında `sellerPaid` değeri **true** olur.

Aşağıda kupon ve promosyon durumlarına göre senaryolar ve aksiyonlar yer almaktadır:

### Case 1: Kupon ve Promosyon Yoksa

- Entegrasyon modelinde sipariş içindeki kupon ve promosyon alanları **boş** döner.
- Line veya item bazlı `price` değerlerinden **herhangi bir kupon veya promosyon tutarı düşülmez.**

---

### Case 2: Siparişte `sellerPaid = false` Kupon veya Promosyon Varsa

- Entegrasyon modelinde kupon ve promosyon alanları **boş** döner.
- Line veya item bazlı `price` değerlerinden kupon veya promosyon tutarı **düşülmez.**

---

### Case 3: Siparişte `sellerPaid = true` Promosyon (Satıcının Kasasından Geçmeyen Promosyon)

- Entegrasyon modelinde **promosyon alanı dolu** gelir.
- `item` altındaki `price` değerinden promosyon tutarı **düşmez.**

---

### Case 4: Siparişte `sellerPaid = true` Promosyon (Satıcının Kasasından Geçen Promosyon)

- Entegrasyon modelinde **promosyon alanı dolu** gelir.
- `item` altındaki `price` değerinden promosyon tutarı **düşer.**

---

### Case 5: Siparişte `sellerPaid = true` Kupon Varsa

- Entegrasyon modelinde **kupon alanı dolu** gelir.
- `item` altındaki `price` değerinden kupon tutarı **düşmez.**

---

### Dikkat

> Entegrasyon modelindeki **`item.price`** alanından sadece **satıcının kasasından geçen** (`sellerPaid = true`, `type = Seller`) **promosyon tutarı düşer.**  
> Bunun dışındaki **hiçbir promosyon ya da kupon değeri** bu alandan düşmez.

---

## Header Parametreleri

| Parametre       | Açıklama                          | Tip     | Zorunluluk |
|-----------------|-----------------------------------|---------|-----------|
| `x-agentname`   | Entegratör ismi                  | string  | Evet      |
| `x-executor-user` | İşlemi yapan kişinin e-posta adresi | string  | Evet      |

---

## Endpointler

### GET `getShipmentPackages`

**PROD**:

```http
GET https://api.tgoapis.com/integrator/order/grocery/suppliers/{supplierId}/packages
```

**STAGE**:

```http
GET https://stageapi.tgoapis.com/integrator/order/grocery/suppliers/{supplierId}/packages
```

---

### GET `getShipmentPackageIds`

**PROD**:

```http
GET https://api.tgoapis.com/integrator/order/grocery/suppliers/{supplierId}/packages/ids?id={shipmentPackageId}
```

---

### GET `orderNumber`

**PROD**:

```http
GET https://api.tgoapis.com/integrator/order/grocery/suppliers/{supplierId}/packages/order-number/{orderNumber}
```

---

## Önerilen Endpoint

Örnek, statüye ve şubeye göre filtrelenmiş paket listesi endpoint'i:

```http
https://api.tgoapis.com/integrator/order/grocery/suppliers/123456/packages?storeId=164&status=Shipped&status=Delivered&sortDirection=DESC
```

---

## Servis Parametreleri

| Parametre      | Parametre Değer Örneği                                 | Açıklama                                                                 | Tip    |
|----------------|--------------------------------------------------------|-------------------------------------------------------------------------|--------|
| `startDate`    | —                                                      | Belirli bir tarihten sonraki siparişleri getirir. Timestamp (ms)       | long   |
| `endDate`      | —                                                      | Belirli bir tarihe kadar olan siparişleri getirir. Timestamp (ms)      | long   |
| `page`         | —                                                      | Sadece belirtilen sayfadaki bilgileri döndürür                         | int    |
| `size`         | Maksimum `200`                                        | Bir sayfada listelenecek maksimum adeti belirtir                       | int    |
| `supplierId`   | —                                                      | İlgili tedarikçinin ID bilgisi                                         | long   |
| `storeId`      | —                                                      | İlgili şube ID bilgisi                                                 | long   |
| `status`       | `Created, Picking, Invoiced, Shipped, Cancelled, Delivered, Returned, UnPacked, UnSupplied` | Siparişlerin statülerine göre bilgileri getirir                        | string |
| `sortDirection` | `ASC`                                                 | Eskiden yeniye doğru sıralar                                           | string |
| `sortDirection` | `DESC`                                                | Yeniden eskiye doğru sıralar                                           | string |

---

## Örnek Servis Cevabı

```json
{
  "totalElements": 32677,
  "totalPages": 32677,
  "page": 0,
  "size": 1,
  "content": [
    {
      "id": "1000000216178",
      "orderId": "1002048400330",
      "orderNumber": "2048400330",
      "sellerId": 107386,
      "storeId": 116,
      "customer": {
        "id": 710790400,
        "firstName": "OMS",
        "lastName": "GROCERY",
        "note": "Gelirken bir paket süt alır mısınız",
        "email": "pftest+6xjqppkakj1a@trendyolmail.com"
      },
      "packageStatus": "Created",
      "deliveryModel": "STORE",
      "zoneId": "vkhcspvzzlur",
      "scheduleType": "INSTANT",
      "timeSlotId": "stzogjwugfup",
      "eta": "20 dk",
      "estimatedDeliveryStartDate": 1678257496438,
      "estimatedDeliveryEndDate": 1678264696438,
      "shipmentAddress": {
        "firstName": "OMS",
        "lastName": "GROCERY",
        "address1": "1234 sokak no 1",
        "address2": "",
        "city": " İstanbul ",
        "cityCode": 34,
        "cityId": 133,
        "district": "Küçük Çekmece",
        "districtId": 54,
        "neighborhoodId": 32,
        "neighborhood": "Cennet mh.",
        "apartmentNumber": "1",
        "floor": "3",
        "doorNumber": "2",
        "addressDescription": "Okulun yanı",
        "postalCode": "34343",
        "countryCode": "TR",
        "latitude": "40.979224",
        "longitude": "29.066674",
        "phone": "0212 365 34 03",
        "identityNumber": "32323232322"
      },
      "invoiceAddress": {
        "firstName": "OMS",
        "lastName": "GROCERY",
        "address1": "1234 sokak no 1",
        "address2": "",
        "city": " İstanbul ",
        "cityCode": 34,
        "cityId": 133,
        "district": "Küçük Çekmece",
        "districtId": 54,
        "neighborhoodId": 32,
        "neighborhood": "Cennet mh.",
        "apartmentNumber": "1",
        "floor": "3",
        "doorNumber": "2",
        "addressDescription": "Okulun yanı",
        "postalCode": "34343",
        "countryCode": "TR",
        "latitude": "40.979224",
        "longitude": "29.066674",
        "phone": "0212 365 34 03",
        "identityNumber": "32323232322"
      },
      "currencyCode": "TRY",
      "grossAmount": 313.81,
      "totalDiscount": 8,
      "totalPrice": 305.81,
      "sellerInvoiceAmount": 760.4,
      "invoiceTaxAmount": 0,
      "lines": [
        {
          "amount": 20.48,
          "price": 20.48,
          "barcode": "496616523",
          "vatBaseAmount": 20,
          "product": {
            "name": "Diş Macunu 500 Gr",
            "productSaleName": "Diş Macunu 500 Gr",
            "brandName": "İpana",
            "imageUrls": null,
            "weight": null
          },
          "items": [
            {
              "id": "1000000495105",
              "packageItemId": "1000000534941",
              "isCancelled": false,
              "price": 20.48,
              "discount": 0.4,
              "isAlternative": false,
              "isCollected": false
            }
          ]
        }
      ],
      "orderDate": 1678257496405,
      "lastModifiedDate": 1678257497502,
      "receiptLink": "",
      "sellerAccepted": false,
      "sellerAcceptedDate": 0,
      "prevStatus": "",
      "similarProduct": null,
      "cancelInfo": null,
      "isCourierNearby": false,
      "totalCargo": 9.99
    }
  ]
}
```
