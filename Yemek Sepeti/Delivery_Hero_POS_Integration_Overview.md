# Delivery Hero POS Integration — Overview

> **Looking to integrate your system with foodpanda?**  
> Check out our new page for up-to-date developer docs, step-by-step implementation guide, and many more!

## Introduction
Through seamless **POS Integration**, vendors and POS providers reach a new level of intercommunication. Vendors can process orders through their POS System using Delivery Hero’s integration solution.

This documentation contains all information to start your POS Integration with Delivery Hero.

## Terminology
Here is a detailed explanation of key terms used throughout this documentation:

- **POS Clients**: Chains or POS providers seeking to receive orders coming from Delivery Hero directly on their POS System.
- **Vendors**: Physical location where the food is prepared.
- **POS System**: Point-of-sale software on POS Clients side which compiles orders and transactions (online and offline) for a certain number of vendors.
- **Integration Middleware**: Delivery Hero order transmission system, in charge of forwarding orders placed on Delivery Hero platforms to the Vendor POS System.
- **Plugin**: Adapter to be created by the POS Clients if they want to do POS Integrations with Delivery Hero. This adaptor serves to allow communication between Delivery Hero Integration Middleware and Vendor POS System.
- **Delivery Hero Vendor App**: Delivery Hero application for vendors where orders placed on a Delivery Hero platform can be processed (accepted or rejected). This application runs on a device provided by the Delivery Hero platform.

## Integration Process
1. **Request Credentials**
2. **Develop your Plugin**
3. **Provide the Plugin URL** to your local representative (must support **HTTPS** with a **valid SSL certificate**)
4. **Test orders** from a test vendor (your local representative will share test vendor details)
5. **Rollout**

## Request Credentials
You must request credentials to connect with **Integration Middleware** and start receiving orders.

- To request credentials, provide a valid **Public PGP Key** (more information about the PGP encryption method can be found in this video).
- After request approval, your local representative will share your **Credentials**. Credentials are encrypted with the PGP key shared in the request form.

**Credentials are composed of:**
- Username  
- Password  
- Secret  

Read more about **authentication** here.

> Request credentials by signing up below to request credentials.

## Order Integration Flows
Delivery Hero offers order integrations through two different flows:

- **Indirect Flow**
- **Direct Flow**

### Indirect Flow
Vendor is equipped with a **Delivery Hero Vendor App** to manage (accept or reject) incoming orders on a tablet. The **Integration Middleware** forwards **accepted** orders to the POS System.

**Illustration:** _Example 1 (diagram placeholder)_

> **Note:** Orders reach the plugins **only if accepted** on the Delivery Hero Vendor App first. Orders rejected or not accepted on the Vendor App will **never** be forwarded to the Vendor POS System.

**Example (simplified):** An order has been placed for the vendor **BONJOUR**. The dispatch flow is:
1. Customer places an order on a Delivery Hero platform (e.g., **Foodpanda**).
2. Foodpanda pushes that order to the Delivery Hero **BONJOUR App** running on a Delivery Hero device.
3. An employee at the vendor location **accepts** the order on the BONJOUR App.
4. Order is pushed to **Integration Middleware**, which forwards order details to the **BONJOUR plugin**.
5. Plugin dispatches the order to the **BONJOUR POS System**.

### Direct Flow
Vendor is **not** equipped with a Delivery Hero Vendor App and uses only its **POS system** to process orders from Delivery Hero.

**Illustration:** _Example 2 (diagram placeholder)_

**Example (simplified):**
1. Customer places an order at a restaurant belonging to **BONJOUR** on a Delivery Hero platform (e.g., **Foodpanda**).
2. **Foodpanda** pushes that order to **Integration Middleware**.
3. **Integration Middleware** forwards the order to the **BONJOUR plugin**.
4. BONJOUR plugin dispatches the order on the **BONJOUR POS System**.
5. An employee at the vendor location must **accept** or **reject** the order on the BONJOUR POS software.

> **Note:** Direct Integrations are **allowed case-by-case**. Reach out to your local point of contact to enquire and agree about using Direct Flow for your integration.

## Requirements
For a **Direct Flow** integration, the plugin and POS System must have the required functionalities to meet service levels comparable to the Delivery Hero Vendor App.

**Required functionalities include:**
- Ability to **manually accept and reject** orders on the POS System at the vendor location.
- Ability to handle **order cancellations** after the order was accepted on the POS System.
- Ability to mark that a vendor is **closed/busy** for *X* amount of time *(optional)*.
- Ability to **indicate a delay** of order delivery time *(optional)*.
- **Send back delivery time** to Delivery Hero when the order is accepted (programmable or manual), and include a **unique order identifier** on Vendor side.
- Provide a **reject reason** when an order is rejected (according to the available reject reasons).
- Notify Delivery Hero (manual push or algorithm) when **order is ready** to be picked up by the driver.
- POS Clients should inform Delivery Hero and send **unreachable** status for a vendor if it is not reachable from the POS System.
- POS Clients should inform Delivery Hero and send a **reachable** status when the vendor is back online.
- Use **Delivery Hero Vendor App** as a **fallback** so vendors can process orders in case of transmission issues between Integration Middleware and plugin.

## Build the Plugin
You must build a **plugin** to receive orders from Delivery Hero.  
Your plugin will translate incoming orders into a format your **POS system** understands.  
Technical specifications for **plugin-scope endpoints and actions** can be found here.

## Send Order Updates
Chains or POS providers use the **Integration Middleware** to accept or reject orders.  
Technical specification for **integration middleware–scope endpoints and actions** can be found here.

## Update Availability
The Integration Middleware API allows vendors to state if they are **open or closed**.  
If closed, the vendor will be marked **offline** on the Delivery Hero platform and customers **won’t** be able to place orders.  
Technical specification of the **availability endpoint** can be found here.

## Supported Platforms
Integration Middleware currently supports the platforms listed below. If you don’t see your platform, please reach out to your local representative.

### Asia/Pacific
- Foodpanda (Bangladesh)
- Foodpanda (Cambodia)
- Foodpanda (Hong Kong)
- Foodpanda (Japan)
- Foodpanda (Laos)
- Foodpanda Malaysia
- Foodpanda (Myanmar)
- Foodpanda (Pakistan)
- Foodpanda (Philippines)
- Foodpanda Singapore
- Foodpanda (Taiwan)
- Foodpanda (Thailand)

### Middle East/North Africa
- Hungerstation (Saudi Arabia)
- Otlob (Egypt)
- Talabat (United Arab Emirates)
- Talabat (Kuwait)
- Talabat (Bahrain)
- Talabat (Oman)
- Talabat (Qatar)
- Talabat (Jordan)

### Europe
- Damejidlo (Czech Republic)
- eFood (Greece)
- Foodora (Sweden)
- Foodora (Finland)
- Foodora (Norway)
- Foodpanda (Bulgaria)
- Foodpanda (Romania)
- Hungry (Denmark)
- Mjam (Austria)
- Netpincer (Hungary)
- Pauza (Croatia)

### Latin America
- PedidosYa (Argentina)
- PedidosYa (Bolivia)
- PedidosYa (Chile)
- PedidosYa (Panama)
- PedidosYa (Paraguay)
- PedidosYa (Uruguay)
- PedidosYa (Dominican Republic)
- PedidosYa (Venezuela)
- PedidosYa (Honduras)
- PedidosYa (El Salvador)
- PedidosYa (Nicaragua)
- PedidosYa (Peru)
- PedidosYa (Ecuador)
- PedidosYa (Costa Rica)
- PedidosYa (Guetamala)

## Post-production agreement
- Plugin maintainer should inform Delivery Hero about **upcoming system maintenance** by emailing **log-vendor-pos@deliveryhero.com** at least **24 hours** in advance. Strongly advised for **Indirect** flow and **compulsory** for **Direct** flow.
- Plugin maintainer should provide **contact details** to be used by Delivery Hero to escalate plugin technical issues (crucial for monitoring and reliable order dispatching).
- The integration might be **disabled** by Delivery Hero whenever there is a technical issue with the plugin and the contact is **not responding**. It will be **re-activated** once the issue is fixed.
- Features or the entire integration might get **disabled** if certain articles of the implementation contract are not fulfilled.

**Common examples of missing implementation:**
- Working **cancellation endpoint** on plugin side.
- **Rejecting** an order **without** providing a proper reject reason.
- **Accepting** an order with **wrongly formatted date-time**.
- Providing a **secured plugin endpoint** that **cannot be validated** via `curl`.

## Get Order Details
Integration Middleware also provides an **Order Report Service** to query order details for orders placed **less than 24 hours** ago. This service is **not** meant for order processing, only for requesting additional information about specific orders. Currently, **canceled** and **accepted** orders are supported.  
More information and technical specifications for this service can be found here.

## Update Menu
The manual process of requesting an update of **Catalog Data** from a Vendor on the Delivery Platform is **time-consuming**, **resource-intensive**, and **error-prone**. In the worst case, customers may try to order items that are **no longer available**—and the issue is amplified when the Vendor’s catalog changes frequently.

The **Catalog Import API** addresses this by allowing **POS Vendors** to push catalog changes automatically to the Platforms, reducing human effort.

When changes are less frequent, you should weigh the **benefits** of automation against **implementation/maintenance overhead**.

The **Catalog Import API** is the **replacement** for the legacy **Menu Import API**. New implementations of the legacy API are **not allowed**. Vendors already integrated with the legacy API should **migrate** once the new Catalog Import API is stable to benefit from new features and improvements. Your local contact will announce the **migration timeline** and the deprecation of the old Menu Importer API.
