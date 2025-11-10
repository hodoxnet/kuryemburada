# Delivery Hero POS Plugin API (1.0.0)

**Download OpenAPI specification:** _Download_

Bu doküman, **POS Order Processing Service** (POS sipariş iletim sistemi) tarafından çağrılacak **POS eklentisi (plugin)** uç noktalarını açıklar. POS Order Processing Service, yeni sipariş iletim sistemimizdir ve kademeli olarak bu sisteme geçmekteyiz.

> POS Order Processing Service tarafındaki uç noktaların dokümantasyonu için ilgili sayfaya göz atın.

---

## Security

- Eklentinizin **her zaman geçerli bir SSL sertifikası** ile korunmasından siz sorumlusunuz.  
- Süresi dolmuş, self-signed veya olmayan bir sertifika ile eklenti uç noktalarına sipariş yönlendirilmesi **kabul edilmez** ve **başarısız olur**.

---

## Plugin Endpoints

### Dispatch Order

POS eklentilerinin **yeni siparişleri aldığı** dispatch uç noktası.

#### Order processing'in sürekli evrimi

Sipariş işleme akışı, mevcut kullanım senaryolarını iyileştirmek ve gelecektekileri kolaylaştırmak için **sürekli evrilmektedir**. Bu evrimin parçası olarak sipariş yükü (payload) **zamanla ek özellikler** kazanacaktır.  
Bu nedenle POS eklentinizin **tanımadığı ek alanları görmezden** gelebilmesi ve bu alanların işleyişi bozmamasını sağlaması kritik önemdedir.

#### Process new order

Bu uç noktaya yeni sipariş ulaştığında eklenti:

1. İsteği hızlıca **doğrulamalı** (validation),
2. Siparişi **kalıcı olarak kaydetmeli**,
3. Her şey yolundaysa **beklenen onayı** ilgili yanıtta döndürmelidir (bkz. Responses).

#### Acknowledge order

Sipariş onayının nasıl yapılacağı için bu metodun **Responses** bölümüne bakınız.

#### Order validation

- Doğrulama **başarısız olursa**, eklenti dispatch isteğine uygun bir **hata yanıtı** dönmelidir.  
- Doğrulama **başarılı** ve sipariş **persist** edildiyse, eklenti **siparişi onaylamalı** ve işleme akışını **asenkron** olarak sürdürmelidir.  
- Senkron istekle alma/doğrulama yapıyorsanız **asenkrona geçmeyi planlayın**. Geliştirdiğimiz yeni özelliklerle **senkron dispatch** akışı **desteklenmemektedir**.

#### Time to process the order

- Eklentinin yeni siparişleri alma, doğrulama ve onaylama işlemleri **birkaç saniyeyi geçmemelidir**.  
- Yanıt çok gecikirse POS Order Processing Service **zaman aşımı** tetikleyip **yeniden deneme** yapabilir. Bu, eklenti tarafında **sipariş çiftlenmesine** yol açabilir.  
- Yeniden denemeler için ayrıntılar: bkz. **Retry** bölümü.

#### Inform POS Order Processing Service

Sipariş onaylandıktan sonra eklenti, satıcının siparişi **karşılayıp karşılayamayacağını** (accept/reject) POS Order Processing Service’e **statü güncelleme** isteği göndererek bildirmelidir.

> **Önemli:** Halihazırda siparişleri dispatch isteğine **400** dönerek (senkron red akışı) reddediyorsanız, bu dokümanda anlatıldığı gibi **asenkron** akışa geçmeniz gerekir. Yeni özelliklerde senkron akış **desteklenmemektedir**.

#### Auto-closure

Siparişi **kabul/ret** için platforma göre değişen bir **süre penceresi** vardır. Bu süre içinde işlem yapılmazsa sipariş Delivery Hero sistemleri (bizim durumumuzda POS Order Processing Service) tarafından **otomatik iptal** edilir.

- Art arda çok sık gerçekleşirse satıcıyı belirli süre **otomatik kapatma** (auto-closure) uygulanabilir.
- Otomatik iptal süresi için **yerel ekibinizle** teyitleşiniz.

---

### Order Types

Üç sipariş tipi vardır:

1. **Own Delivery**: Sipariş, satıcıdan Delivery Hero kuryeleri tarafından **alınır** ve müşteriye **teslim edilir**.  
2. **Vendor Delivery**: Siparişi **satıcı** teslim eder.  
3. **Pickup**: Siparişi **müşteri**, satıcıdan **alır**.

> Dispatch istek gövdesi, sipariş tipine bağlı olarak **biraz** değişir.

#### Identify order type

- `expeditionType` alanı **pickup** ise: **Pickup Order**  
- `expeditionType` **delivery** ise: **Own Delivery** veya **Vendor Delivery**

#### Distinguish Own vs Vendor Delivery

- `delivery.riderPickupTime === null` ise: **Vendor Delivery**  
- `delivery.riderPickupTime` **dolu** ise: **Own Delivery**  
- Own Delivery için `delivery.address` **null** olur; Vendor Delivery’de **dolu** olur.

```ts
function getOrderType(order: Order): OrderType {
  if (order.expeditionType === "pickup") {
    return OrderType.Pickup;
  }

  if (order.expeditionType === "delivery") {
    return getOrderTypeForDeliveryOrder(order);
  }

  throw new WrongOrderTypeError();
}

function getOrderTypeForDeliveryOrder(order: Order): OrderType {
  if (order?.delivery?.riderPickupTime === null) {
    return OrderType.VendorDelivery;
  }
  return OrderType.OwnDelivery;
}
```

---

### Item Level Discounts and Sponsorship for Discounts

Satır (item) seviyesinde indirim bilgisi ve **sponsor** detayları.

- `sponsorships` dizisi **opsiyoneldir** ve her sponsor için en fazla **3** öğe içerebilir:
  - `PLATFORM` – platform katkısı
  - `VENDOR` – satıcı katkısı
  - `THIRD_PARTY` – üçüncü taraf katkısı
- Bir sponsor listede yoksa veya katkısı `0` ise, indirim o sponsora **atanmaz**. `sponsorships` hiç yoksa veya boşsa, **sponsorluk detaylarına erişilemez**.

Örnek (üst seviye indirimler):

```yaml
discounts:
  - name: First Order
    amount: "9"
    sponsorships:
      - sponsor: PLATFORM
        amount: "3"
      - sponsor: VENDOR
        amount: "3"
      - sponsor: THIRD_PARTY
        amount: "3"
```

> Satır seviyesi indirimler, `products` ve `selectedToppings` altına da aynı yapıda gelir. **Satır seviyesindeki** indirimlerin toplamı **üst seviye** indirimlere **dahil** edilir. Eşleme, **indirim adı** ile yapılır.

Örnek (ürün ve topping seviyesinde):

```yaml
product:
  categoryName: Burgers
  name: Cheese Burger
  paidPrice: "8.00"
  quantity: "1"
  remoteCode: REMOTE_CODE
  discounts:
    name: First Order
    amount: "6.00"
    sponsorships:
      - sponsor: PLATFORM
        amount: "2.00"
      - sponsor: VENDOR
        amount: "2.00"
      - sponsor: THIRD_PARTY
        amount: "2.00"
  selectedToppings:
    - children: []
      name: extra cheese
      price: "1.50"
      quantity: "1"
      id: ID
      remoteCode: REMOTE_CODE
      type: PRODUCT
      discounts:
        name: First Order
        amount: "1.50"
        sponsorships:
          - sponsor: PLATFORM
            amount: "0.50"
          - sponsor: VENDOR
            amount: "0.50"
          - sponsor: THIRD_PARTY
            amount: "0.50"
```

> İndirimleri ekledikten sonra POS eklentisi tarafında bir sorunla karşılaşırsanız lütfen yerel platform yetkilinize ulaşın.

---

### Note on Responses

#### Unexpected responses

- Middleware tarafında **beklenmeyen** kabul edilen HTTP kodları dışındakilerdir:  
  **[200, 201, 202, 400, 401, 429, 450, 500, 502]**  
- POS eklentileri bu liste **dışında** durum kodu **kullanmamalıdır**.

#### Responses leading to order dispatching retry

- **429** veya **5XX** durumda POS Order Processing Service **dispatch’i yeniden dener**.  
- Şu anda **en fazla 10 kez** yeniden deneme yapılır.

#### Span between retries

- Yeniden denemelerde **exponential backoff + jitter** kullanılır.  
- **Minimum** bekleme süresi: **30s**  
- **Maksimum** bekleme: ilk yeniden denemede **35s**’den başlar ve denemeler arasında üstel olarak **240s**’e kadar artar.

---

### Authorizations

- `MiddlewareJWTAuth`

---

## POST `/order/{remoteId}` — Dispatch Order

Yeni siparişleri almak için kullanılır.

### Path Parameters

| Param     | Tip    | Zorunlu | Örnek                   | Açıklama                                                                 |
|-----------|--------|---------|-------------------------|--------------------------------------------------------------------------|
| remoteId  | string | ✔       | `POS_RESTAURANT_0001`   | Siparişin iletileceği **POS eklentisi tarafındaki** satıcı benzersiz kimliği |

### Request Body (application/json)

> Aksi belirtilmedikçe alan açıklamaları orijinal metindeki gibi korunmuştur.

- **token** _(string, ≤512)_ ✔ — POS middleware tarafındaki sipariş benzersiz kimliği.  
- **code** _(string, ≤255)_ ✔ — Platformdaki sipariş benzersiz kodu (platforma göre değişir).  
- **comments** _(object)_ ✔ — Siparişe ait yorumlar.  
- **createdAt** _(string <date-time>)_ ✔ — Sipariş oluşturulma zamanı.  
- **customer** _(object)_ ✔ — Müşteri bilgileri. **KVKK/GDPR** gereği çoğu alan **dummy** ve **deprecated** olabilir.  
- **delivery** _(object)_ — Own/Vendor Delivery için bilgiler. Pickup siparişlerde **yoktur**.  
- **discounts** _(object[])_ ✔ — Siparişe uygulanan indirim listesi (0+).  
- **expeditionType** _(string)_ ✔ — `"pickup"` | `"delivery"`. Own vs Vendor ayrımı `delivery.riderPickupTime` ile yapılır.  
- **expiryDate** _(string <date-time>)_ ✔ — Siparişin **kabul/red** için son tarihi. Aşılırsa **otomatik iptal** olur.  
- **extraParameters** _(object)_ — Platforma özel ek parametreler (izin verilen platformlarda gelir). İzinli değilse **yok sayın**.  
- **invoicingInformation** _(object)_ — E-fatura bilgileri (`carrierType`, `carrierValue`) mevcutsa.  
- **localInfo** _(object)_ ✔ — Siparişin verildiği yere dair lokal bilgiler (çoğu alan **deprecated**).  
- **payment** _(object)_ ✔ — Ödeme bilgileri (online vs kapıda vb.).  
- **test** _(boolean, default: false)_ ✔ — Test siparişi mi? Tablet kabul akışında her zaman **false**.  
- **shortCode** _(string ≤255, default: null)_ — Kurye için günlük benzersiz kısa kod.  
- **preOrder** _(boolean, default: false)_ ✔ — **Ön sipariş** göstergesi.  
- **pickup** _(object | null, default: null)_ — **Pickup** siparişler için dolu; diğerlerinde **null**.  
- **platformRestaurant** _(object)_ ✔ — Siparişin ait olduğu **platform restoran** bilgileri.  
- **price** _(object)_ ✔ — Fiyat toplamları vb. bilgiler.  
- **products** _(object[])_ ✔ — Sipariş ürünleri (0+).  
- **corporateOrder** _(boolean, default: false, Deprecated)_ — Artık kullanılmıyor.  
- **corporateTaxId** _(string ≤512)_ ✔ — Müşteri vergi kimliği (bazı ülkelerde yasal). **Sadece restoran/food** siparişlerinde desteklenir.  
- **integrationInfo** _(object, default: {}, Deprecated)_ — Kullanılmıyor, her zaman `{}`.  
- **mobileOrder** _(boolean, default: true, Deprecated)_ — Kullanılmıyor, her zaman `true`.  
- **webOrder** _(boolean, default: false, Deprecated)_ — Kullanılmıyor, her zaman `false`.  
- **vouchers** _(object[], default: [], Deprecated)_ — Kullanılmıyor, her zaman boş dizi.  
- **PreparationTimeAdjustments** _(object)_ — Önerilen hazırlık süresi ayarları (dk) ve min/max zaman damgaları.  
- **callbackUrls** _(object)_ — Sipariş işleme durum güncellemeleri için **callback** URL’leri.

### Responses

- **200** — Acknowledge  
- **202** — Acknowledge  
- **400** — Invalid request.

### Request Sample

```json
{
  "token": "5f373562-591a-4db9-8609-7eec7880f28d",
  "code": "n0s1-w0k1",
  "comments": {
    "customerComment": "Please hurry, I am hungry"
  },
  "createdAt": "2016-03-14T17:00:00.000Z",
  "customer": {
    "email": "s188sduisddsnjknsj",
    "firstName": "food",
    "lastName": "panda",
    "mobilePhone": "+49 99999999",
    "flags": []
  },
  "delivery": {
    "address": {},
    "expectedDeliveryTime": "2016-03-14T17:50:00.000Z",
    "expressDelivery": false,
    "riderPickupTime": "2016-03-14T17:35:00.000Z"
  },
  "discounts": [
    {}
  ],
  "expeditionType": "pickup",
  "expiryDate": "2016-03-14T17:15:00.000Z",
  "extraParameters": {
    "property1": "string",
    "property2": "string"
  },
  "invoicingInformation": {
    "carrierType": "string",
    "carrierValue": "string"
  },
  "localInfo": {
    "countryCode": "DE",
    "currencySymbol": "€",
    "platform": "Foodpanda",
    "platformKey": "FP_DE"
  },
  "payment": {
    "status": "paid",
    "type": "paid"
  },
  "test": false,
  "shortCode": "42",
  "preOrder": false,
  "pickup": null,
  "platformRestaurant": {
    "id": "sq-abcd"
  },
  "price": {
    "deliveryFees": [],
    "grandTotal": "25.50",
    "payRestaurant": "25.50",
    "riderTip": "1.20",
    "totalNet": "19.45",
    "vatTotal": "2.50",
    "collectFromCustomer": "16.34"
  },
  "products": [
    {}
  ],
  "corporateTaxId": "example-tax-id",
  "callbackUrls": {
    "orderAcceptedUrl": "string",
    "orderRejectedUrl": "string",
    "orderPickedUpUrl": "string",
    "orderPreparedUrl": "string",
    "orderProductModificationUrl": "string",
    "orderPreparationTimeAdjustmentUrl": "string"
  }
}
```

### Response Sample (200)

```json
{
  "remoteResponse": {
    "remoteOrderId": "POS_RESTAURANT_0001_ORDER_000001"
  }
}
```

---

## PUT `/remoteId/{remoteId}/remoteOrder/{remoteOrderId}/posOrderStatus` — Update Order Status

Daha önce **dispatch edilmiş** bir sipariş için **durum güncellemelerini** eklentiye bildirmek amacıyla kullanılır.

- **Direct** entegrasyonlarda bu uç nokta **zorunludur**.  
- Bu uç nokta eklenti tarafındaki `remoteOrderId`’ye bağlıdır; bu nedenle `remoteOrderId` ya **dispatch** yanıtında ya da bir **sipariş durum güncelleme** yanıtında eklenti tarafından **dönülmelidir**.

### Authorizations

- `MiddlewareJWTAuth`

### Path Parameters

| Param        | Tip    | Zorunlu | Örnek                                  | Açıklama                                  |
|--------------|--------|---------|----------------------------------------|-------------------------------------------|
| remoteId     | string | ✔       | `POS_RESTAURANT_0001`                  | Eklenti tarafındaki satıcı kimliği        |
| remoteOrderId| string | ✔       | `POS_RESTAURANT_0001_ORDER_000001`     | Eklenti tarafındaki sipariş kimliği       |

### Request Body (application/json)

- **status** _(string)_ ✔ — Aşağıdaki değerlerden biri (**liste genişleyebilir**):
  - `ORDER_CANCELLED`
  - `ORDER_PICKED_UP`
  - `PRODUCT_ORDER_MODIFICATION_SUCCESSFUL`
  - `PRODUCT_ORDER_MODIFICATION_FAILED`
  - `COURIER_ARRIVED_AT_VENDOR`
- **message** _(string)_ ✔ — Durum açıklaması.  
  - `PRODUCT_ORDER_MODIFICATION_FAILED` için **hata kodu** burada yer alır. Mevcut hata kodları:
    - `VALIDATION_ERROR`
    - `INVALID_TOTAL_PRICE_CHANGE`
    - `MODIFICATION_HAS_NO_EFFECT`
    - `UNKNOWN_PRODUCT_ID`
    - `EXTRA_REMOVAL_NOT_SUPPORTED`
    - `PRODUCT_ADDITION_NOT_ALLOWED`
    - `PARTIAL_REMOVAL_NOT_ALLOWED`
    - `ERROR`
    - `QUANTITY_CANNOT_BE_ZERO`
    - `QUANTITY_REQUIRED`
    - `PRODUCT_ADDITION_WITH_TOPPINGS_NOT_ALLOWED`
    - `PRODUCT_REMOTE_CODE_REQUIRED`
    - `PRODUCT_ID_REQUIRED_FOR_MODIFICATION`
    - `SELECTED_TOPPINGS_MUST_BE_SET_FOR_TOPPING_MODIFICATION`
    - `PROPERTIES_MUST_BE_SET_FOR_MODIFICATION`
    - `PRODUCTS_MUST_BE_SET_FOR_MODIFICATION`
    - `SUB_PRODUCT_MODIFICATION_NOT_SUPPORTED`
  - **Not:** Bu liste **genişleyebilir**.
- **updatedOrder** _(object)_ — **PRODUCT_ORDER_MODIFICATION_SUCCESSFUL** durumunda **zorunlu**; değişiklik sonrası **güncel sipariş**.

### Responses

- **200** — OK  
- **401** — UNAUTHORIZED  
- **404** — NOT_FOUND  
- **500** — INTERNAL_SERVICE_ERROR  
- **502** — EXTERNAL_SERVICE_ERROR

### Request Sample

```json
{
  "status": "ORDER_CANCELLED",
  "message": "description of order status or just the error code",
  "updatedOrder": {
    "token": "5f373562-591a-4db9-8609-7eec7880f28d",
    "code": "n0s1-w0k1",
    "comments": {},
    "createdAt": "2016-03-14T17:00:00.000Z",
    "customer": {},
    "delivery": {},
    "discounts": [],
    "expeditionType": "pickup",
    "expiryDate": "2016-03-14T17:15:00.000Z",
    "extraParameters": {},
    "invoicingInformation": {},
    "localInfo": {},
    "payment": {},
    "test": false,
    "shortCode": "42",
    "preOrder": false,
    "pickup": null,
    "platformRestaurant": {},
    "price": {},
    "products": [],
    "corporateOrder": false,
    "corporateTaxId": "example-tax-id",
    "integrationInfo": {},
    "mobileOrder": true,
    "webOrder": false,
    "vouchers": [],
    "PreparationTimeAdjustments": {},
    "callbackUrls": {}
  }
}
```

---

## GET `/menuimport/{remoteId}` — Trigger Menu Import

Platforma **menü import** göndermek için eklentinin istek aldığı uç nokta.

- Eklenti bu isteği aldığında, **asenkron** olarak **menü** göndermelidir.  
- **Senkron** yanıt olarak **gövdesiz `202`** dönülür; ardından **menü** import **tetik yanıt** uç noktasına gönderilir (ilgili dokümana bakınız).

### Authorizations

- `MiddlewareJWTAuth`

### Path Parameters

| Param    | Tip    | Zorunlu | Örnek                 | Açıklama                                           |
|----------|--------|---------|-----------------------|----------------------------------------------------|
| remoteId | string | ✔       | `POS_RESTAURANT_0001` | Eklenti tarafındaki satıcı kimliği                 |

### Query Parameters

| Param         | Tip    | Zorunlu | Örnek                      | Açıklama                                                                 |
|---------------|--------|---------|----------------------------|--------------------------------------------------------------------------|
| vendorCode    | string | ✔       | `VENDOR_CODE_0001`         | Lojistik tarafındaki satıcı benzersiz kodu; import isteğinde kullanılmalı|
| menuImportId  | string | ✔       | `MENU_ID_007`              | Import edilecek menü için benzersiz kimlik; import isteğinde kullanılmalı|

### Responses

- **202** — OK! Request asynchronously accepted  
- **401** — UNAUTHORIZED  
- **404** — NOT_FOUND  
- **500** — INTERNAL_SERVICE_ERROR  
- **502** — EXTERNAL_SERVICE_ERROR

---

## Status of a Catalog Import

**Katalog import** isteği durum güncellemelerini almak için kullanılan uç nokta.

- Bu uç noktaya istek geldiğinde, eklenti **gövdesiz `200`** dönmelidir.  
- Eklenti daha fazla güncelleme dinlemek istemezse **gövdesiz `204`** dönebilir.

### Authorizations

- `MiddlewareJWTAuth`

### Request Body (application/json)

- **catalogImportId** _(string)_ — Katalog import isteği benzersiz kimliği.  
- **status** _(string)_ — Genel durum (**platform satıcılarının tamamı** baz alınır):
  - `in_progress` | `done` | `done_with_errors` | `failed`
- **message** _(string)_ — Hata veya duruma ilişkin açıklama.  
- **details** _(PlatformCatalogImportStatus[])_ — Her **platform satıcısı** için import durumu (**boş olamaz**).

### Responses

- **200** — OK! Catalog import status update was received successfully  
- **401** — UNAUTHORIZED  
- **404** — NOT_FOUND  
- **500** — INTERNAL_SERVICE_ERROR  
- **502** — EXTERNAL_SERVICE_ERROR
