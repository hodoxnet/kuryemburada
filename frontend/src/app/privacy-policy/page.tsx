"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, Users, MapPin, Bell, Database, Mail, FileText, Scale } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "3 Aralık 2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-[#1E3A8A] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10" />
            <h1 className="text-3xl md:text-4xl font-bold">Gizlilik Politikası</h1>
          </div>
          <p className="text-blue-100 text-lg">
            KuryemBurada olarak kişisel verilerinizin güvenliği bizim için önemlidir.
          </p>
          <Badge variant="secondary" className="mt-4">
            Son Güncelleme: {lastUpdated}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Giriş */}
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">
              Bu Gizlilik Politikası, KuryemBurada platformu ("Platform", "Uygulama", "Biz") tarafından sunulan
              hizmetleri kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını, saklandığını ve
              korunduğunu açıklamaktadır. Platformumuzu kullanarak bu politikayı kabul etmiş sayılırsınız.
            </p>
          </CardContent>
        </Card>

        {/* 1. Veri Sorumlusu */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">1. Veri Sorumlusu</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-semibold">KuryemBurada</p>
                <p className="text-sm text-muted-foreground">Web: kuryemburada.com</p>
                <p className="text-sm text-muted-foreground">E-posta: info@kuryemburada.com</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Toplanan Veriler */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">2. Toplanan Kişisel Veriler</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">

              {/* Kuryeler */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#F97316]" />
                  Kuryeler İçin
                </h3>
                <ul className="space-y-2 text-muted-foreground ml-7">
                  <li className="list-disc">Kimlik bilgileri (ad, soyad, T.C. kimlik numarası, doğum tarihi)</li>
                  <li className="list-disc">İletişim bilgileri (telefon numarası, e-posta adresi, adres)</li>
                  <li className="list-disc">Ehliyet bilgileri ve araç ruhsat bilgileri</li>
                  <li className="list-disc">Banka hesap bilgileri (IBAN)</li>
                  <li className="list-disc">Profil fotoğrafı</li>
                  <li className="list-disc">Konum bilgileri (GPS verileri)</li>
                  <li className="list-disc">Teslimat performans verileri ve değerlendirmeler</li>
                  <li className="list-disc">Cihaz bilgileri ve uygulama kullanım verileri</li>
                </ul>
              </div>

              {/* Firmalar */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#F97316]" />
                  Firmalar İçin
                </h3>
                <ul className="space-y-2 text-muted-foreground ml-7">
                  <li className="list-disc">Firma unvanı ve ticari bilgiler</li>
                  <li className="list-disc">Vergi numarası ve vergi dairesi</li>
                  <li className="list-disc">Yetkili kişi bilgileri (ad, soyad, telefon, e-posta)</li>
                  <li className="list-disc">Firma adresi ve şube bilgileri</li>
                  <li className="list-disc">Banka hesap bilgileri</li>
                  <li className="list-disc">Ticari belgeler (vergi levhası, imza sirküleri vb.)</li>
                  <li className="list-disc">Sipariş geçmişi ve işlem kayıtları</li>
                </ul>
              </div>

              {/* Alıcılar */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#F97316]" />
                  Teslimat Alıcıları İçin
                </h3>
                <ul className="space-y-2 text-muted-foreground ml-7">
                  <li className="list-disc">Ad ve soyad</li>
                  <li className="list-disc">Teslimat adresi</li>
                  <li className="list-disc">Telefon numarası</li>
                  <li className="list-disc">Teslimat notları ve tercihleri</li>
                </ul>
              </div>

            </CardContent>
          </Card>
        </section>

        {/* 3. Konum Bilgileri */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">3. Konum Bilgileri Kullanımı</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="font-semibold text-amber-800 mb-2">Önemli Bilgilendirme</p>
                <p className="text-amber-700 text-sm">
                  Kurye uygulaması, teslimat hizmetinin sağlanabilmesi için konum bilgilerinize erişim gerektirir.
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Konum bilgileriniz aşağıdaki amaçlarla kullanılmaktadır:
              </p>

              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="list-disc">Teslimat siparişlerinin size yönlendirilmesi</li>
                <li className="list-disc">Müşterilere tahmini teslimat süresi gösterimi</li>
                <li className="list-disc">En uygun teslimat rotasının belirlenmesi</li>
                <li className="list-disc">Teslimat durumunun gerçek zamanlı takibi</li>
                <li className="list-disc">Hizmet kalitesinin iyileştirilmesi</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed">
                Konum bilgileri yalnızca uygulama aktif kullanımdayken veya arka planda teslimat işlemi
                devam ederken toplanır. Uygulama ayarlarından konum izinlerini istediğiniz zaman
                yönetebilirsiniz, ancak bu durumda teslimat hizmeti veremeyebilirsiniz.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 4. Veri Kullanım Amaçları */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">4. Verilerin Kullanım Amaçları</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>Platform hizmetlerinin sunulması ve iyileştirilmesi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>Kurye ve firma başvurularının değerlendirilmesi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>Sipariş ve teslimat işlemlerinin yönetimi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>Ödeme işlemlerinin gerçekleştirilmesi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>Müşteri desteği ve iletişim</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>Yasal yükümlülüklerin yerine getirilmesi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>Dolandırıcılık ve suistimalin önlenmesi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>İstatistiksel analizler ve raporlama</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-bold">•</span>
                  <span>Bildirim ve kampanya iletişimi (onayınız dahilinde)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* 5. Veri Paylaşımı */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">5. Verilerin Paylaşımı</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-[#1E3A8A] pl-4">
                  <h4 className="font-semibold">Hizmet Sağlayıcılar</h4>
                  <p className="text-sm text-muted-foreground">
                    Ödeme işlemleri, harita hizmetleri, bulut depolama ve analiz hizmetleri sunan iş ortaklarımız
                  </p>
                </div>

                <div className="border-l-4 border-[#1E3A8A] pl-4">
                  <h4 className="font-semibold">Firmalar ve Kuryeler</h4>
                  <p className="text-sm text-muted-foreground">
                    Teslimat hizmetinin sağlanması için gerekli minimum bilgiler (ad, adres, telefon)
                  </p>
                </div>

                <div className="border-l-4 border-[#1E3A8A] pl-4">
                  <h4 className="font-semibold">Yetkili Kurumlar</h4>
                  <p className="text-sm text-muted-foreground">
                    Yasal zorunluluk halinde mahkemeler ve düzenleyici kurumlar
                  </p>
                </div>

                <div className="border-l-4 border-[#1E3A8A] pl-4">
                  <h4 className="font-semibold">Entegrasyon Partnerleri</h4>
                  <p className="text-sm text-muted-foreground">
                    Yemeksepeti, Getir gibi entegre platformlardan gelen sipariş bilgileri
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
                <p className="text-green-800 text-sm">
                  <strong>Taahhüdümüz:</strong> Kişisel verileriniz hiçbir koşulda reklam veya pazarlama
                  amacıyla üçüncü taraflara satılmaz veya kiralanmaz.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 6. Veri Güvenliği */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">6. Veri Güvenliği</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Kişisel verilerinizin güvenliğini sağlamak için aşağıdaki önlemleri alıyoruz:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Teknik Önlemler</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SSL/TLS şifreleme</li>
                    <li>• Güvenli sunucu altyapısı</li>
                    <li>• Düzenli güvenlik testleri</li>
                    <li>• Erişim kontrol sistemleri</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">İdari Önlemler</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Personel eğitimleri</li>
                    <li>• Gizlilik sözleşmeleri</li>
                    <li>• Erişim yetkilendirme</li>
                    <li>• Düzenli denetimler</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 7. Çerezler */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">7. Çerezler ve Benzer Teknolojiler</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Web sitemiz ve uygulamamız, hizmet kalitesini artırmak için çerezler ve benzer
                teknolojiler kullanmaktadır:
              </p>

              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="list-disc"><strong>Zorunlu Çerezler:</strong> Platform işlevselliği için gerekli</li>
                <li className="list-disc"><strong>Performans Çerezleri:</strong> Kullanım istatistikleri için</li>
                <li className="list-disc"><strong>İşlevsellik Çerezleri:</strong> Tercihlerinizi hatırlamak için</li>
              </ul>

              <p className="text-muted-foreground text-sm">
                Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 8. Saklama Süresi */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">8. Verilerin Saklanma Süresi</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca ve yasal
                yükümlülüklerimiz çerçevesinde saklanır:
              </p>

              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="list-disc">Hesap bilgileri: Hesap aktif olduğu sürece + 5 yıl</li>
                <li className="list-disc">İşlem kayıtları: 10 yıl (yasal zorunluluk)</li>
                <li className="list-disc">Konum verileri: 6 ay</li>
                <li className="list-disc">Destek talepleri: 3 yıl</li>
              </ul>

              <p className="text-muted-foreground text-sm">
                Saklama süresi dolan veriler güvenli şekilde silinir veya anonim hale getirilir.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 9. Haklarınız */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">9. KVKK Kapsamındaki Haklarınız</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                6698 sayılı KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:
              </p>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="bg-[#1E3A8A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <p className="text-sm text-muted-foreground">Kişisel verilerinizin işlenip işlenmediğini öğrenme</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="bg-[#1E3A8A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <p className="text-sm text-muted-foreground">İşlenmişse buna ilişkin bilgi talep etme</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="bg-[#1E3A8A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <p className="text-sm text-muted-foreground">İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="bg-[#1E3A8A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <p className="text-sm text-muted-foreground">Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="bg-[#1E3A8A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                  <p className="text-sm text-muted-foreground">Eksik veya yanlış işlenmişse düzeltilmesini isteme</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="bg-[#1E3A8A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                  <p className="text-sm text-muted-foreground">KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="bg-[#1E3A8A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
                  <p className="text-sm text-muted-foreground">İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="bg-[#1E3A8A] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
                  <p className="text-sm text-muted-foreground">Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 10. Bildirimler */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">10. Bildirimler ve İletişim Tercihleri</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Platformumuz üzerinden aşağıdaki bildirimleri alabilirsiniz:
              </p>

              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="list-disc"><strong>İşlemsel Bildirimler:</strong> Sipariş, teslimat ve ödeme bildirimleri (devre dışı bırakılamaz)</li>
                <li className="list-disc"><strong>Tanıtım Bildirimleri:</strong> Kampanya ve duyurular (tercihlerinize göre)</li>
                <li className="list-disc"><strong>Push Bildirimleri:</strong> Mobil uygulama bildirimleri (cihaz ayarlarından yönetilebilir)</li>
              </ul>

              <p className="text-muted-foreground text-sm">
                Bildirim tercihlerinizi uygulama ayarlarından veya hesap ayarlarınızdan yönetebilirsiniz.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 11. Çocukların Gizliliği */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">11. Çocukların Gizliliği</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                Platformumuz 18 yaşın altındaki bireylere yönelik değildir. Bilerek 18 yaşın altındaki
                kişilerden kişisel veri toplamıyoruz. Eğer 18 yaşın altında bir kullanıcının verilerini
                topladığımızı fark edersek, bu verileri derhal silmek için gerekli adımları atacağız.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 12. Politika Değişiklikleri */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">12. Politika Değişiklikleri</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                Bu Gizlilik Politikası'nı zaman zaman güncelleyebiliriz. Önemli değişiklikler yapıldığında,
                platformumuz üzerinden veya e-posta yoluyla bilgilendirileceksiniz. Değişiklikler,
                yayınlandıkları tarihten itibaren geçerli olacaktır. Platformu kullanmaya devam etmeniz,
                güncellenmiş politikayı kabul ettiğiniz anlamına gelir.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 13. İletişim */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-6 w-6 text-[#1E3A8A]" />
            <h2 className="text-2xl font-bold text-[#1E3A8A]">13. İletişim</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Gizlilik politikamız veya kişisel verilerinizle ilgili sorularınız için bizimle
                iletişime geçebilirsiniz:
              </p>

              <div className="bg-[#1E3A8A] text-white p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-4">KuryemBurada İletişim Bilgileri</h3>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>E-posta: info@kuryemburada.com</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>KVKK Başvuruları: kvkk@kuryemburada.com</span>
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm">
                KVKK kapsamındaki talepleriniz için kimlik doğrulama gerekebilir. Başvurularınız
                en geç 30 gün içinde yanıtlanacaktır.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KuryemBurada. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Bu gizlilik politikası {lastUpdated} tarihinde güncellenmiştir.
          </p>
        </div>

      </div>
    </div>
  );
}
