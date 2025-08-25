"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Building, ArrowLeft, Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { CompanyAuthService } from "@/lib/api/company-auth.service";

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    contactPersonName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.companyName || !formData.phone) {
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
        companyName: formData.companyName,
        phone: formData.phone,
        address: {
          street: 'Sample Street',
          city: 'Istanbul',
          district: 'Kadıköy',
          postalCode: '34000',
        },
        contactPerson: {
          fullName: formData.contactPersonName || 'Contact Person',
          phone: formData.phone,
        },
      };
      
      const data = await CompanyAuthService.register(registerData);
      
      toast.success('Firma kaydınız alınmıştır! Onay için bekleyiniz.');
      router.push('/company/login');
    } catch (error: any) {
      toast.error('Kayıt başarısız. Lütfen tekrar deneyin.');
      console.error('Company register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4">
      <Card className="w-full max-w-md border-blue-200">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-blue-700 dark:text-blue-400">
            Firma Kaydı
          </CardTitle>
          <CardDescription className="text-center">
            Yeni firma hesabı oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Firma Adı *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="ABC Lojistik Ltd. Şti."
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                  placeholder="info@firmaadi.com"
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
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
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPersonName">İletişim Kişisi</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactPersonName"
                  type="text"
                  placeholder="Ali Veli"
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  value={formData.contactPersonName}
                  onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                  disabled={loading}
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
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
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
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kayıt oluşturuluyor...
                </>
              ) : (
                <>
                  <Building className="mr-2 h-4 w-4" />
                  Firma Kaydı Oluştur
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Zaten hesabınız var mı?{" "}
              <Button
                variant="link"
                onClick={() => router.push('/company/login')}
                className="p-0 h-auto text-blue-600"
              >
                Giriş yapın
              </Button>
            </p>
            
            <Button
              variant="ghost"
              onClick={() => router.push('/auth')}
              className="text-sm hover:text-blue-600"
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