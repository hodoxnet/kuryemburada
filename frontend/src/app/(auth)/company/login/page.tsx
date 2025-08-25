"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User, Lock, Building, ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { CompanyAuthService } from "@/lib/api/company-auth.service";
import { AuthService } from "@/lib/auth";

export default function CompanyLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    setLoading(true);
    
    try {
      const data = await CompanyAuthService.login(formData);
      
      // Token ve kullanıcı bilgisini merkezi AuthService ile kaydet
      AuthService.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      AuthService.setUser(data.user as any);
      // AuthContext'e sinyal gönder
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:updated'));
      }
      
      toast.success('Firma girişi başarılı!');
      router.push('/company');
    } catch (error: any) {
      toast.error('Giriş başarısız. Firma bilgilerinizi kontrol edin.');
      console.error('Company login error:', error);
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
            Firma Girişi
          </CardTitle>
          <CardDescription className="text-center">
            Firma hesabınızla giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="firma@ornek.com"
                  className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
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

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <Building className="mr-2 h-4 w-4" />
                  Firma Girişi
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Henüz firma hesabınız yok mu?
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/company/register')}
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Firma Kaydı Oluştur
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth')}
                className="text-sm hover:text-blue-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri dön
              </Button>
            </div>
            
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Demo Firma:</strong> firma@test.com / firma123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
