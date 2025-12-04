# Canlı - Test Ortam Bilgileri

> **İpucu:**  
> Satıcı ID ve API Key bilgilerinize Trendyol Go by Uber Eats Satıcı Paneli üzerinden sağ üstte bulunan **Mağaza Adınız → Hesap Bilgilerim** menüsünden ulaşabilirsiniz.

Trendyol Go by Uber Eats **test ortamına erişim için IP yetkilendirmesi gerekmektedir**.  
Prod ortamında IP yetkilendirmesi bulunmamakla birlikte, IP bazı sebeplerle engellenmiş olabilir.  
Hem test hem prod ortamında erişim sorunları yaşamanız durumunda IP adresiniz ile birlikte satıcı paneli üzerinden bildirim oluşturabilirsiniz.

---

# CANLI ORTAM BİLGİLERİ

- Canlı ortamda **herhangi bir IP yetkilendirmesine gerek yoktur**.

### **Endpoint**
```
https://api.tgoapis.com/integrator/
```

---

# TEST ORTAMI BİLGİLERİ

Test ortamı **hesap ve API bilgileriniz**, canlı ortam bilgilerinizden tamamen farklıdır.

---

## 1. Adım — IP Yetkilendirme  
(Test ortamına giriş için gerekli)

- Uygulama sunucularının IP adresleri Trendyol Go by Uber Eats'e bildirilmelidir.  
- Birden fazla IP tanımlanabilir; sonradan güncellenebilir.  
- **Statik IP’ler için yetkilendirme sağlanamamaktadır.**
- Ağ çıkış (public) IP adresinizin iletilmesi gerekmektedir.

**Test ortamı talebi ve IP yetkilendirmesi için:**  
📞 **0850 258 58 00** numaralı çağrı merkezinden satıcı bildirimi oluşturmalısınız.

> Test ortamında alınan **503 hatası IP yetkilendirmesi yapılmamış olmasından kaynaklanır.**

---

## 2. Adım — Test Hesabı Oluşturma  
(IP yetkilendirmesi gerektirir)

Test ortamı için:  
- Ortak test hesabını kullanabilir veya  
- Kendi test mağazanızı oluşturabilirsiniz.

Ortak test hesabı bilgileri için yine:  
📞 **0850 258 58 00** satıcı bildirimi açılmalıdır.

API bilgilerinize **Stage Partner** sayfanızdaki **Hesap Bilgilerim** bölümünden ulaşabilirsiniz.

---

## 3. Adım — Test İşlemlerinin Yapılması  
(IP yetkilendirmesi gerektirir)

Testlerinizi:  
- Test mağazanıza ait API bilgileri ile **kendi yazılımınız üzerinden**,  
- veya **Postman** ile gerçekleştirebilirsiniz.

---

## TEST ORTAMI PANELİ

```
https://stagepartner.tgoyemek.com/account/login
```
