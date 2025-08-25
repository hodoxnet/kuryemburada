"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Truck, ArrowLeft, Mail, Lock, User, Phone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { CourierAuthService } from "@/lib/api/courier-auth.service";

export default function CourierRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    tcNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.fullName || !formData.phone || !formData.tcNumber) {
      toast.error("Lütfen tüm zorunlu alanları doldurun");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Şifreler eşleşmiyor");
      return;
    }

    setLoading(true);
    
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        tcNumber: formData.tcNumber,
        phone: formData.phone,
        vehicleInfo: {
          type: 'motorcycle',
          brand: 'Sample Brand',
          model: 'Sample Model',
          year: '2020',
          plateNumber: '34 ABC 123',
        },
        licenseInfo: {
          licenseNumber: 'ABC123456',
          licenseType: 'A',
          expiryDate: '2030-12-31',
        },
      };
      
      const data = await CourierAuthService.register(registerData);
      
      toast.success('Kurye başvurunuz alınmıştır! Onay için bekleyiniz.');
      router.push('/courier/login');
    } catch (error: any) {
      toast.error('Başvuru başarısız. Lütfen tekrar deneyin.');
      console.error('Courier register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <Truck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-green-700 dark:text-green-400">
            Kurye Başvurusu
          </CardTitle>
          <CardDescription className="text-center">
            Kurye olmak için başvuru yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Ad Soyad *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ali Veli"
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tcNumber">TC Kimlik No *</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tcNumber"
                  type="text"
                  placeholder="12345678901"
                  maxLength={11}
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                  value={formData.tcNumber}
                  onChange={(e) => setFormData({ ...formData, tcNumber: e.target.value.replace(/\D/g, '') })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ali@ornek.com"
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+90 555 123 45 67"
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifre *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Başvuru gönderiliyor...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Kurye Başvurusu Yap
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Zaten hesabınız var mı?{" "}
              <Button
                variant="link"
                onClick={() => router.push('/courier/login')}
                className="p-0 h-auto text-green-600"
              >
                Giriş yapın
              </Button>
            </p>
            
            <Button
              variant="ghost"
              onClick={() => router.push('/auth')}
              className="text-sm hover:text-green-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}