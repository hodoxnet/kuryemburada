"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Bike, 
  Building2, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  Shield,
  Users,
  Package,
  TrendingUp,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      icon: Clock,
      title: "Hızlı Teslimat",
      description: "Siparişleriniz aynı gün içinde teslim edilir"
    },
    {
      icon: Shield,
      title: "Güvenli İşlem",
      description: "256-bit SSL şifreleme ile güvenli teslimat"
    },
    {
      icon: Users,
      title: "Profesyonel Ekip",
      description: "Eğitimli ve deneyimli kurye kadromuz"
    },
    {
      icon: TrendingUp,
      title: "Canlı Takip",
      description: "Teslimatınızı anlık olarak takip edin"
    }
  ];

  const stats = [
    { value: "10K+", label: "Aktif Kurye" },
    { value: "500+", label: "İş Ortağı" },
    { value: "1M+", label: "Teslimat" },
    { value: "4.9", label: "Ortalama Puan" }
  ];

  const benefits = {
    courier: [
      "Esnek çalışma saatleri",
      "Yüksek kazanç potansiyeli",
      "Haftalık ödeme",
      "Sigorta ve sosyal güvence",
      "Ücretsiz eğitim programları",
      "Performans primleri"
    ],
    company: [
      "Hızlı ve güvenilir teslimat",
      "Rekabetçi fiyatlandırma",
      "Özel kurumsal çözümler",
      "7/24 müşteri desteği",
      "Detaylı raporlama",
      "API entegrasyonu"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-lightGray-200 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bike className="h-8 w-8 text-navy-500" />
            <span className="text-xl font-bold">KuryemBurada</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium hover:text-orange-500 transition-colors">
              Özellikler
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-orange-500 transition-colors">
              Nasıl Çalışır?
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-orange-500 transition-colors">
              İletişim
            </Link>
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Giriş Yap
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Türkiye'nin En Hızlı<br />
            <span className="text-orange-500">Kurye Platformu</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Binlerce kurye ve yüzlerce işletme ile Türkiye'nin her noktasına 
            güvenli ve hızlı teslimat yapıyoruz.
          </motion.p>

          {/* Application Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Courier Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onMouseEnter={() => setHoveredCard("courier")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 ${
                hoveredCard === "courier" ? "shadow-2xl scale-105" : "shadow-lg"
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-navy-500/10 to-orange-500/10" />
                <div className="relative p-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-navy-500/10 rounded-full">
                      <Bike className="h-12 w-12 text-navy-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Kurye Ol</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Kendi çalışma saatlerini belirle, yüksek kazanç elde et. 
                    Hemen başvur ve aramıza katıl!
                  </p>
                  <div className="space-y-2 text-left mb-6">
                    {benefits.courier.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/apply/courier">
                    <Button className="w-full group">
                      Kurye Başvurusu
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Company Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onMouseEnter={() => setHoveredCard("company")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 ${
                hoveredCard === "company" ? "shadow-2xl scale-105" : "shadow-lg"
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-navy-500/10" />
                <div className="relative p-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-navy-500/10 rounded-full">
                      <Building2 className="h-12 w-12 text-navy-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">İş Ortağı Ol</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    İşletmeniz için güvenilir kurye hizmeti alın. 
                    Özel fiyatlandırma ve kurumsal çözümler.
                  </p>
                  <div className="space-y-2 text-left mb-6">
                    {benefits.company.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/apply/company">
                    <Button className="w-full group bg-orange-500 hover:bg-orange-600 text-white">
                      Firma Başvurusu
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
              >
                <div className="text-2xl font-bold text-navy-500">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Neden KuryemBurada?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-navy-500/10 rounded-full">
                      <Icon className="h-8 w-8 text-navy-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 bg-lightGray-200 dark:bg-black">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-navy-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Başvur</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Kurye veya firma olarak hızlıca başvurunuzu yapın
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-navy-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Onay Al</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Başvurunuz incelendikten sonra onay bildirimi alın
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-navy-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Başla</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hemen teslimat yapmaya veya sipariş vermeye başlayın
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">İletişim</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Phone className="h-8 w-8 text-navy-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Telefon</h3>
              <p className="text-gray-600 dark:text-gray-400">+90 552 254 72 72</p>
            </div>
            <div className="text-center">
              <Mail className="h-8 w-8 text-navy-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">E-posta</h3>
              <p className="text-gray-600 dark:text-gray-400">info@kuryemburada.com</p>
            </div>
            <div className="text-center">
              <MapPin className="h-8 w-8 text-navy-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Adres</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Ferhatpaşa Mah. Mescit Sok. Rıza Civaş Pasajı No: 7/1 Çatalca / İstanbul</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-500 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-sm text-lightGray-300">
            © 2025 KuryemBurada. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
