"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Home, Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function ApplicationSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Konfeti animasyonu
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const nextSteps = [
    {
      title: "Başvuru İncelemesi",
      description: "Başvurunuz uzman ekibimiz tarafından incelenecek",
      time: "1-3 iş günü"
    },
    {
      title: "Bilgilendirme",
      description: "Başvuru sonucunuz SMS ve e-posta ile bildirilecek",
      time: "E-posta & SMS"
    },
    {
      title: "Belge Doğrulama",
      description: "Yüklediğiniz belgeler kontrol edilip onaylanacak",
      time: "İnceleme süreci"
    },
    {
      title: "Hesap Aktivasyonu",
      description: "Onay durumunda hesabınız aktif edilecek ve sisteme giriş yapabileceksiniz",
      time: "Onay sonrası"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Başvurunuz Alındı!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Başvurunuz başarıyla tarafımıza ulaştı. En kısa sürede değerlendirip size dönüş yapacağız.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Bundan Sonra Ne Olacak?</h2>
            
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{step.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 mb-8"
        >
          <h3 className="font-semibold mb-3">Sorularınız mı var?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Başvuru süreciyle ilgili tüm sorularınız için bize ulaşabilirsiniz.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Telefon</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">0850 XXX XX XX</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">E-posta</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">basvuru@kuryemburada.com</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Not:</strong> Başvurunuz değerlendirilip size en kısa sürede geri dönüş yapılacaktır. 
              Başvuru sonucunuz e-posta ve SMS ile tarafınıza iletilecektir.
            </p>
          </div>
          
          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}