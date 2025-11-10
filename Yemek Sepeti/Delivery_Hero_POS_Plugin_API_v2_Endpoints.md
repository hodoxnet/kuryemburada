# Delivery Hero POS Plugin API — v2 Endpoints & Additional Resources

> This document complements the core POS Plugin API by describing additional **v2** endpoints and resources including Order Status updates, Preparation lifecycle, Product modifications, Availability, Reports, and the **Catalog Import** API (replacement for the legacy Menu Import API).

---

## Update Order Status

Use this endpoint to change the order status **after** an order has been dispatched to your POS plugin. If a specific callback URL is **not present** in the order payload, **do not** send that type of callback.

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**POST** `/v2/order/status/{orderToken}`

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `orderToken` | string | ✔ | Unique order identifier in Delivery Hero systems (received in the `token` field at dispatch). |

### Allowed Statuses
| Status | Description |
|-------|-------------|
| `order_accepted` | **Direct integrations only.** Accepts the received order. Send to `dispatchOrderPayload.callbackUrls.orderAcceptedUrl`. Indirect integrations: acceptance happens on the Delivery Hero device; if URL is absent, skip. |
| `order_rejected` | **Direct integrations only.** Explicitly rejects the order with a **valid rejection reason** (see request schema). Send to `dispatchOrderPayload.callbackUrls.orderRejectedUrl`. |
| `order_picked_up` | Allowed only for **vendor delivery** and **pickup** orders. Send to `dispatchOrderPayload.callbackUrls.orderPickedUpUrl`. If URL is absent, skip. |

### Request Body (for `order_accepted`)
```json
{
  "status": "order_accepted",
  "acceptanceTime": "2016-10-05T00:00:00+05:00",
  "remoteOrderId": "123-xfal-90",
  "modifications": { "products": [] }
}
```

#### Field Details
- **status** *(string, required)* — One of `order_accepted` | `order_rejected` | `order_picked_up` (example shows `order_accepted`).  
- **acceptanceTime** *(date-time, required for `order_accepted`)* — Semantics depend on `expeditionType`:
  - **Customer pickup**: expected time when the order is **ready for pickup**. Prefer `pickup.pickupTime`; only change for strong reasons (customer will be informed).
  - **Vendor delivery**: expected **delivery time** to the customer. Prefer `delivery.expectedDeliveryTime`; deviations inform the customer.
  - **Own delivery (platform riders)**: expected **rider pickup time**; delivery ETA is calculated by internal systems. This field is **legacy**; prefer `delivery.riderPickUpTime`.
- **remoteOrderId** *(string, optional)* — POS plugin-side identifier used by Middleware (e.g., for cancellations).
- **modifications** *(object, optional)* — Product modifications to apply together with acceptance (see **Modify Order Products**).

### Responses
- **200** OK  
- **400** Bad Request  
- **401** Unauthorized  
- **403** Forbidden  
- **409** Conflict — Invalid status transition:  
  - **Retry** when: attempting to accept before dispatch **acknowledged** (currentState `ASSIGNED_TO_TRANSPORT` or `WAITING_FOR_ACKNOWLEDGEMENT`). Recommended retry: ~**every 10s for 5 minutes**.  
  - **Do not retry** when: order is **cancelled** or plugin **not allowed** to update (e.g., indirect integration).  
- **500** Internal Server Error

### Response Sample (200)
```json
{ "message": "Order status successfully changed." }
```

---

## Mark an order as prepared

Use only when the order is delivered by **Delivery Hero riders**. Notifies couriers that food is prepared and can be picked up at the vendor location. If the URL is not present in the dispatch payload, skip the event.

- Send to: `dispatchOrderPayload.callbackUrls.orderPreparedUpUrl`

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**POST** `/v2/orders/{orderToken}/preparation-completed`

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `orderToken` | string | ✔ | Unique order identifier (received in `token` at dispatch). |

### Responses
- **200** Order marked as preparation completed  
- **401** Unauthorized  
- **404** Order Not Found  
- **409** Conflict — current order state does not allow marking preparation completed (e.g., already **Cancelled**)  
- **500** Internal Server Error

### Response Sample (200)
```json
{ "code": "OK" }
```

---

## Adjust the preparation time

**Logistics Delivery only.** Dynamically adjust the original preparation time to reflect real-time kitchen load. May be used **pre** and **post** acceptance, until a **rider is assigned**. URL provided in `callbackUrls` of the dispatch payload.

- The valid **min/max** pickup time window and default adjustments are provided in the **dispatch payload** and are always relative to the **original** prep time (range validation does **not** shift after adjustments).

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**POST** `/v2/orders/{orderToken}/adjust-preparation-time`

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `orderToken` | string | ✔ | Unique order identifier (received in `token` at dispatch). |

### Request Body
```json
{ "expectedPickupAt": "2016-03-14T17:00:00.000Z" }
```

### Adjustment Allowed Matrix
| Vendor Accepted | Rider Accepted | Adjustment Allowed |
|---|---|---|
| No | No | Yes |
| No | Yes | Yes |
| Yes | Yes | No |
| Yes | No | Yes |

### Responses
- **204** No Content — adjustment succeeded  
- **400** Invalid Request (validation error). `preparation_time_adjustment_reject_reason` may include:  
  - `PREPARATION_TIME_EXCEEDS_ALLOWED_MAX_TIME` — exceeds country/region maximum  
  - `PREPARATION_TIME_BELOW_ALLOWED_MIN_TIME` — below current time or too short  
- **404** Order Not Found  
- **409** Order state does not allow setting the prep time (e.g., rider already assigned)  
- **500** Internal Server Error

### Error Response Sample
```json
{
  "code": "PREPARATION_TIME_EXCEEDS_ALLOWED_MAX_TIME",
  "message": "string"
}
```

---

## Modify Order Products

During the order lifecycle, vendors may need to modify products to avoid cancellation (e.g., items unavailable). Use this endpoint to **add/remove/change** products for an order.

- Pick the URL based on **callback URLs** in the dispatch.  
- Delivery Platform processes the request; result is notified via **Update Order Status** callback as either `PRODUCT_ORDER_MODIFICATION_SUCCESSFUL` or `PRODUCT_ORDER_MODIFICATION_FAILED`.  
- On success, plugin receives the **updated order** and must update local state.  
- **Only one** modification request can be in progress at a time.

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**POST** `/v2/order/{orderToken}/modifications/product`

### Path Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `orderToken` | string | ✔ | Unique order identifier (received at dispatch). |

### Request Body
- **type** *(string, required)* — `REMOVAL` \| `CHANGE` \| `ADDITION`  
- **properties** *(string[])* — Affected item properties  
- **modifications.products** — The product mutations

#### Example
```json
{
  "modifications": {
    "products": []
  }
}
```

### Responses
- **202** Accepted  
- **400** Field validation errors  
- **401** Unauthorized  
- **404** Invalid Order  
- **409** Another modification ongoing or order state not allowed  
- **500** Internal Server Error

### Response Sample (202)
```json
{ "message": "Order modification request has been accepted." }
```

---

## Deprecated Menu Import

The legacy XML-based menu import. **Deprecated** in favor of **Catalog Import API**.

### Submit a menu (XML) — Deprecated

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**POST** `/v2/chains/{chainCode}/remoteVendors/{posVendorId}/menuImport`

#### Path Parameters
| Name | Type | Required | Example | Description |
|------|------|----------|---------|-------------|
| `chainCode` | string | ✔ | `foo-chainId` | Identifies the POS group on Middleware side to avoid collisions between POS systems. |
| `posVendorId` | string | ✔ | `fooPosVendorId123` | Also known as `remoteId`. Together with `chainCode` identifies the vendor on plugin side. |

#### Image Requirements
- Minimum image size: **640 x 270** (width x height).  
- If you cannot provide the dimensions, submit the `Image` element as empty, e.g. `<Image></Image>`, otherwise the import will **fail**.

#### Request (application/xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Vendor xmlns="https://foodintegrations.com/Integration/Catalog">
    <Id>1</Id>
    <Menus>
        <Menu>
            <Id>m1</Id>
            <Title>Lunch Menu</Title>
            <Description>Only for lunching</Description>
            <StartHour>12:00:00</StartHour>
            <EndHour>17:00:00</EndHour>
            <MenuType>delivery</MenuType>
        </Menu>
        <Menu>
            <Id>m2</Id>
            <Title>Romantic Dinner</Title>
            <Description>late night snacks</Description>
            <StartHour>17:00:01</StartHour>
            <EndHour>23:59:59</EndHour>
            <MenuType>delivery</MenuType>
        </Menu>
    </Menus>
    <MenuCategories>
        <MenuCategory>
            <Id>s1</Id>
            <Title>Sushi and sudhim</Title>
            <Description>Yummi sushi</Description>
            <Products>
                <Product>
                    <Id>n12</Id>
                    <Title>Nigiri</Title>
                    <Description>Made of fresh Fish</Description>
                    <Image>http://example.com/</Image>
                    <ProductVariations>
                        <ProductVariation>
                            <Id>pv1</Id>
                            <Title>Tuna Nigiri</Title>
                            <Price>10.99</Price>
                            <ContainerPrice>0</ContainerPrice>
                        </ProductVariation>
                        <ProductVariation>
                            <Id>pv2</Id>
                            <Title>Salmon Nigiri</Title>
                            <Price>9.99</Price>
                            <ContainerPrice>0.99</ContainerPrice>
                        </ProductVariation>
                    </ProductVariations>
                </Product>
                <Product>
                    <Id>m36</Id>
                    <Title>Sushimi</Title>
                    <Description>Made of fresh Tuna</Description>
                    <Image></Image>
                    <ProductVariations>
                        <ProductVariation>
                            <Id>pv5</Id>
                            <Title>Salmon Sushimi</Title>
                            <Price>19.99</Price>
                            <ContainerPrice>0</ContainerPrice>
                        </ProductVariation>
                    </ProductVariations>
                </Product>
            </Products>
        </MenuCategory>
        <MenuCategory>
            <Id>s2</Id>
            <Title>Choices and Toppings</Title>
            <Description>Hidden category for Choices and Toppings</Description>
            <Products>
                <Product>
                    <Id>ttp1</Id>
                    <Title>Black Wasabi</Title>
                    <ProductVariations>
                        <ProductVariation>
                            <Id>ttp1</Id>
                            <Title>Black Wasabi</Title>
                            <Price>0</Price>
                            <ContainerPrice>0</ContainerPrice>
                        </ProductVariation>
                    </ProductVariations>
                </Product>
                <Product>
                    <Id>ttp6</Id>
                    <Title>Ginger leaves</Title>
                    <ProductVariations>
                        <ProductVariation>
                            <Id>ttp6</Id>
                            <Title>Ginger leaves</Title>
                            <Price>0</Price>
                            <ContainerPrice>0</ContainerPrice>
                        </ProductVariation>
                    </ProductVariations>
                </Product>
            </Products>
        </MenuCategory>
    </MenuCategories>
    <MenuProducts>
        <MenuProduct>
            <MenuId>m1</MenuId>
            <ProductId>n12</ProductId>
        </MenuProduct>
        <MenuProduct>
            <MenuId>m2</MenuId>
            <ProductId>m36</ProductId>
        </MenuProduct>
    </MenuProducts>
    <ToppingTemplates>
        <ToppingTemplate>
            <Id>tt1</Id>
            <Title>Test template</Title>
            <IsHalfHalf>0</IsHalfHalf>
            <QuantityMin>1</QuantityMin>
            <QuantityMax>12</QuantityMax>
        </ToppingTemplate>
        <ToppingTemplate>
            <Id>tt3</Id>
            <Title>Test template #3</Title>
            <IsHalfHalf>0</IsHalfHalf>
            <QuantityMin>1</QuantityMin>
            <QuantityMax>1</QuantityMax>
        </ToppingTemplate>
    </ToppingTemplates>
    <ToppingTemplateProducts>
        <ToppingTemplateProduct>
            <ToppingTemplateId>tt1</ToppingTemplateId>
            <ProductId>ttp1</ProductId>
            <Price>2.49</Price>
        </ToppingTemplateProduct>
        <ToppingTemplateProduct>
            <ToppingTemplateId>tt3</ToppingTemplateId>
            <ProductId>ttp6</ProductId>
            <Price>0.50</Price>
        </ToppingTemplateProduct>
    </ToppingTemplateProducts>
    <ProductVariationToppingTemplates>
        <ProductVariationToppingTemplate>
            <ProductVariationId>pv1</ProductVariationId>
            <ToppingTemplateId>tt1</ToppingTemplateId>
        </ProductVariationToppingTemplate>
    </ProductVariationToppingTemplates>
    <Translations>
        <Language>
            <Code>es</Code>
            <MenuCategoryTranslations>
                <MenuCategoryTranslation>
                    <Id>s2</Id>
                    <Title>Coberturas y opciones</Title>
                </MenuCategoryTranslation>
                <MenuCategoryTranslation>
                    <Id>s1</Id>
                    <Title>Sushi y sashimi</Title>
                    <Description>Sushi rico</Description>
                </MenuCategoryTranslation>
            </MenuCategoryTranslations>
            <ProductTranslations>
                <ProductTranslation>
                    <Id>ttp1</Id>
                    <Title>Wasabi negro</Title>
                </ProductTranslation>
                <ProductTranslation>
                    <Id>m36</Id>
                    <Title>Sushimi</Title>
                    <Description>Hecho de atún fresco</Description>
                </ProductTranslation>
                <ProductTranslation>
                    <Id>ttp6</Id>
                    <Title>Hojas de jengibre</Title>
                </ProductTranslation>
            </ProductTranslations>
        </Language>
        <Language>
            <Code>ru</Code>
            <MenuCategoryTranslations>
                <MenuCategoryTranslation>
                    <Id>s2</Id>
                    <Title>Выбор и начинок</Title>
                </MenuCategoryTranslation>
                <MenuCategoryTranslation>
                    <Id>s1</Id>
                    <Title>Суши и сашими</Title>
                    <Description>Yummi суши</Description>
                </MenuCategoryTranslation>
            </MenuCategoryTranslations>
            <ProductTranslations>
                <ProductTranslation>
                    <Id>ttp1</Id>
                    <Title>Васаби черный</Title>
                </ProductTranslation>
                <ProductTranslation>
                    <Id>m36</Id>
                    <Title>Суши вкус</Title>
                    <Description>Свежий Тунец факт</Description>
                </ProductTranslation>
                <ProductTranslation>
                    <Id>ttp6</Id>
                    <Title>имбирь листья</Title>
                </ProductTranslation>
            </ProductTranslations>
            <ProductVariationTranslations>
                <ProductVariationTranslation>
                    <Id>pv1</Id>
                    <Title>Product variation translation</Title>
                </ProductVariationTranslation>
            </ProductVariationTranslations>
        </Language>
        <Language>
            <Code>pl</Code>
            <ProductTranslations>
                <ProductTranslation>
                    <Id>ttp1</Id>
                    <Title>Wasabi czarny</Title>
                </ProductTranslation>
                <ProductTranslation>
                    <Id>m36</Id>
                    <Title>sushimi</Title>
                    <Description>Wykonane ze świeżego tuńczyka</Description>
                </ProductTranslation>
            </ProductTranslations>
            <ToppingTemplateTranslations>
                <ToppingTemplateTranslation>
                    <Id>tt1</Id>
                    <Title>Test template polish translation</Title>
                </ToppingTemplateTranslation>
            </ToppingTemplateTranslations>
        </Language>
    </Translations>
</Vendor>
```

#### Responses
- **200** OK  
- **404** Not Found  
- **500** Internal Server Error

**Response Sample (200)**
```json
{ "status": "SUBMITTED" }
```

### Submit a menu (XML) in response to a trigger — Deprecated

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**POST** `/v2/menu/{vendorCode}/{menuImportId}`

#### Path Parameters
| Name | Type | Required | Example | Description |
|------|------|----------|---------|-------------|
| `vendorCode` | string | ✔ | `VENDOR_CODE_0001` | Vendor identifier on the logistics side (from trigger request). |
| `menuImportId` | string | ✔ | `MENU_ID_007` | Unique identifier for this import (from trigger request). |

#### Request (application/xml)
*(Same XML schema as above; sample retained for completeness.)*

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Vendor xmlns="https://foodintegrations.com/Integration/Catalog">
    <Id>1</Id>
    <Menus>
        <Menu>
            <Id>m1</Id>
            <Title>Lunch Menu</Title>
            <Description>Only for lunching</Description>
            <StartHour>12:00:00</StartHour>
            <EndHour>17:00:00</EndHour>
            <MenuType>delivery</MenuType>
        </Menu>
        <Menu>
            <Id>m2</Id>
            <Title>Romantic Dinner</Title>
            <Description>late night snacks</Description>
            <StartHour>17:00:01</StartHour>
            <EndHour>23:59:59</EndHour>
            <MenuType>delivery</MenuType>
        </Menu>
    </Menus>
    <!-- ... (rest of sample identical to the previous XML) ... -->
</Vendor>
```

#### Responses
- **200** OK  
- **404** Not Found  
- **500** Internal Server Error

**Response Sample (200)**
```json
{ "status": "SUBMITTED" }
```

---

## POS Vendor Availability Status

### Get availability status

States whether the restaurant is **open** or **closed**. If **closed**, the restaurant is marked **offline** and cannot receive orders.

> **Implementation note:** A `204` response means the request is acknowledged but result is **not yet available** — retry after a few seconds.

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**GET** `/v2/chains/{chainCode}/remoteVendors/{posVendorId}/availability`

#### Path Parameters
| Name | Type | Required | Example | Description |
|------|------|----------|---------|-------------|
| `chainCode` | string | ✔ | `foo-chainId` | POS group identifier on Middleware. |
| `posVendorId` | string | ✔ | `fooPosVendorId123` | Also known as `remoteId`; identifies the vendor together with `chainCode`. |

#### Responses
- **200** OK  
- **204** No Content (result not yet ready)  
- **400** Bad Request  
- **403** Not authorized for this chain  
- **404** Not Found  
- **500** Internal Server Error

**Response Sample (200)**
```json
[
  {
    "availabilityState": "UNKNOWN",
    "availabilityStates": [],
    "changeable": false,
    "closedReason": "OTHER",
    "closingMinutes": [],
    "closingReasons": [],
    "platformId": "12",
    "platformKey": "TB",
    "platformRestaurantId": "123456789",
    "platformType": "TALABAT"
  },
  {
    "availabilityState": "OPEN",
    "availabilityStates": [],
    "changeable": true,
    "closingMinutes": [],
    "closingReasons": [],
    "platformId": "36",
    "platformKey": "FO_DE",
    "platformRestaurantId": "kg6y",
    "platformType": "FOODORA"
  },
  {
    "availabilityState": "OPEN",
    "availabilityStates": [],
    "changeable": true,
    "closingMinutes": [],
    "closingReasons": [],
    "platformId": "1",
    "platformKey": "LH_DE",
    "platformRestaurantId": "40788",
    "platformType": "DELIVERY_HERO"
  }
]
```

### Update availability status

Updates whether a restaurant is available to receive orders. First call **GET** to verify `changeable: true` for the target platform record.

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**PUT** `/v2/chains/{chainCode}/remoteVendors/{posVendorId}/availability`

#### Path Parameters
Same as **GET** above.

#### Request Body
```json
{
  "availabilityState": "OPEN",
  "platformKey": "TB",
  "platformRestaurantId": 123456789
}
```

- **availabilityState** *(enum)* — `CLOSED_UNTIL` | `CLOSED` | `INACTIVE` | `UNKNOWN` | `OPEN` | `CLOSED_TODAY`  
- **platformKey** *(string, required)* — e.g. `TB`  
- **platformRestaurantId** *(string, required)* — e.g. `123456789`

#### Responses
- **200** OK  
- **400** Bad Request  
- **403** Not authorized for this chain  
- **404** Not Found  
- **500** Internal Server Error

**Error Response Sample**
```json
{ "code": "POS_ERROR", "message": "dummy error message" }
```

### Update POS reachability status — **Deprecated**

Notifies when a POS device goes **online/offline** (supported on Foodora, Foodpanda, Talabat). Do **not** adopt if you are not already using it; prefer **Availability** API.

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**PUT** `/v2/chains/{chainCode}/remoteVendors/{posVendorId}/posReachabilityStatus`

#### Request Body
```json
{
  "message": "Some dummy message which can be sent",
  "reason": "Some reason code for logging/debugging which can be sent",
  "status": "online"
}
```

#### Responses
- **202** Accepted  
- **400** Bad Request  
- **403** Forbidden  
- **500** Internal Server Error

---

## POS Order Report Service

### Get list of order identifiers

Returns order identifiers for the **previous N hours**, filtered by chain and **status** (`cancelled` or `accepted`). Can be filtered to distinct vendors of a chain.

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**GET** `/v2/chains/{chainCode}/orders/ids`

#### Query Parameters
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `status` | string | ✔ | — | `cancelled` or `accepted` |
| `pastNumberOfHours` | number | — | 24 | Time frame (hours), 1..24 |
| `vendorId` | string | — | — | Vendor identifier on POS plugin side |

#### Response Sample (200)
```json
{
  "orderIdentifiers": [
    "01f91115-bf85-4830-932d-7133e12665c6",
    "05K91115-bf85-4830-932d-7133e12665c6",
    "02J91115-bf85-4830-932d-7133e12665c6"
  ],
  "count": 3
}
```

### Get order details

Typically used together with **Get list of order identifiers**.

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**GET** `/v2/chains/{chainCode}/orders/{orderId}`

#### Response Sample (200)
```json
{
  "order": {
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
    "callbackUrls": {},
    "status": "cancelled",
    "reason": null
  }
}
```

---

## Vendor Information

Retrieve platform vendor details from Delivery Hero. *(Coming soon; not yet implemented.)*

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**GET** `/v2/chains/{chainCode}/vendors/{posVendorId}/platform-vendors`

**Response Sample (200)**
```json
[
  {
    "platformVendorId": "string",
    "globalEntityId": "string",
    "posVendorId": "string"
  }
]
```

---

## Catalog Import

The **Catalog Import API** replaces the legacy **Menu Import API** and enables POS Vendors to **push catalog changes** automatically.

### Flow
1. POS Plugins send Catalog Import to Integration Middleware (**sync**).  
2. Middleware does a short validation and **acknowledges** (**sync**).  
3. Middleware validates the catalog (**async**): JSON schema, image accessibility, image properties (size/resolution).  
4. Middleware sends catalog to Delivery Hero platform (**async**).  
5. Middleware sends **status updates** to plugin callback URL (**async**).  
6. POS Plugins can **GET** status updates (**async**).

### Implementation Details
- Implement **Creation of Catalog Imports**.  
- (Optional but recommended) **Handle status callbacks** to get progress/failures/success info.

### Submit a catalog

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**PUT** `/v2/chains/{chainCode}/catalog`

#### Request Body
```json
{
  "callbackUrl": "https://example.com/callback",
  "catalog": { "items": {} },
  "vendors": ["VENDOR_ONE", "VENDOR_TWO"]
}
```

- **vendors** *(string[], required)* — POS Vendor Ids (non-empty)  
- **catalog** *(object, required)* — Vendor Catalog root object  
- **callbackUrl** *(string)* — Callback to receive status updates

#### Responses
- **202** Submitted  
- **400** Validation failed  
- **401** Authentication error  
- **404** chainCode or vendor not found  
- **500** Internal error

**Response Sample (202)**
```json
{ "status": "submitted", "catalogImportId": "string" }
```

**Callback Payload Sample**
```json
{
  "catalogImportId": "string",
  "status": "in_progress",
  "message": "string",
  "details": [{}]
}
```

### Submit a Catalog for Centralized Kitchen Vendors

Use **platform vendor identifiers** and a shared **global entity**.

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**PUT** `/v2/chains/{chainCode}/global-entity/{globalEntityId}/catalog`

#### Request Body
```json
{
  "callbackUrl": "https://example.com/callback",
  "catalog": { "items": {} },
  "platformVendors": ["VENDOR_ONE", "VENDOR_TWO"]
}
```

**Response Sample (202)**
```json
{ "status": "submitted", "catalogImportId": "string" }
```

**Callback Payload Sample**
```json
{
  "catalogImportId": "string",
  "status": "in_progress",
  "message": "string",
  "details": [{}]
}
```

### Get Catalog Import Logs

Returns catalog import logs for a vendor (queries limited to **last 30 days**).

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**GET** `/v2/chains/{chainCode}/vendors/{posVendorId}/menu-import-logs`

**Response Sample (200)**
```json
{ "menuImportLogs": { "pyhhud": [] } }
```

---

## Catalog Item Availability

Retrieve or update the availability of POS catalog items.

### Update catalog item availability

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**PUT** `/v2/chains/{chainCode}/vendors/{posVendorId}/catalog/items/availability`

#### Request Body (EnableCatalogItemRequest example)
```json
{
  "globalEntityId": "string",
  "items": ["string"],
  "type": "TOPPING",
  "isAvailable": true
}
```

- **globalEntityId** *(string, required)* — Global entity owner of the catalog item (if available).  
- **items** *(string[], required)* — POS Catalog Item Ids (non-empty).  
- **type** *(enum, required)* — `TOPPING` \| `ITEM`.  
- **isAvailable** *(boolean, required)* — Availability flag.

#### Responses
- **204** Success with no failures (empty body)  
- **200** Partial success — details in body  
- **400** Bad Request  
- **401** Unauthorized  
- **500** Internal Server Error  
- **502** Bad Gateway

**Partial Success Sample (200)**
```json
{ "status": "Success", "details": [{}] }
```

### [IN DEVELOPMENT] Get Unavailable Toppings & Items

**Endpoint**  
**GET** `/v2/chains/{chainCode}/vendors/{posVendorId}/catalog/items/unavailable`

**Response Sample (200)**
```json
[
  {
    "platformVendorId": "string",
    "globalEntityId": "string",
    "status": "Success",
    "unavailableItems": []
  }
]
```

---

## Modify Product Details

Submit a request to modify Product/Options for a **Platform Restaurant**.

**Supported Platforms:** *Pandora* (with defined update cases).

**Authorizations:** `BearerPluginAuth`

**Endpoint**  
**PUT** `/v2/chains/{chainCode}/globalEntityId/{globalEntityId}/restaurant/{platformVendorId}/modify-product`

### Request Body
```json
{
  "processId": "processIdOne",
  "batchId": "batchIdOne",
  "timestamp": "2023-06-05T10:00:00Z",
  "timestampLastChange": "2023-06-04T08:00:00Z",
  "callback": "https://example.com/callback",
  "product": {
    "description": "Updated product description",
    "descriptions": [],
    "name": "Updated Product",
    "names": [],
    "productId": "productIdOne",
    "parentId": "parentIdOne",
    "action": "upsert",
    "updatedFields": []
  }
}
```

### Responses
- **204** Accepted (no body) — status provided via callback  
- **400** Bad Request (with optional `constraintViolations`)  
- **401** Unauthorized  
- **500** Internal Server Error  
- **502** Bad Gateway

**Error Response Sample**
```json
{
  "message": "string",
  "constraintViolations": [{}]
}
```

**Callback Payload Sample**
```json
{
  "id": "productId1",
  "traceId": "modifyProductRequestId1",
  "status": "Success",
  "message": "Product modification succeeded"
}
```
