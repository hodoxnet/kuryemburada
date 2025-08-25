"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User, Lock, Truck, ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { CourierAuthService } from "@/lib/api/courier-auth.service";
import { AuthService } from "@/lib/auth";

export default function CourierLoginPage() {
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
      const data = await CourierAuthService.login(formData);
      
      // Token ve kullanıcı bilgisini merkezi AuthService ile kaydet
      AuthService.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      AuthService.setUser(data.user as any);
      // AuthContext'e sinyal gönder
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:updated'));
      }
      
      toast.success('Kurye girişi başarılı!');
      router.push('/courier/dashboard');
    } catch (error: any) {
      toast.error('Giriş başarısız. Kurye bilgilerinizi kontrol edin.');
      console.error('Courier login error:', error);
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
            Kurye Girişi
          </CardTitle>
          <CardDescription className="text-center">
            Kurye hesabınızla giriş yapın
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
                  placeholder="kurye@ornek.com"
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
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
                  className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-400"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Kurye Girişi
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Henüz kurye hesabınız yok mu?
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/courier/register')}
                className="w-full border-green-200 text-green-600 hover:bg-green-50"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Kurye Başvurusu Yap
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth')}
                className="text-sm hover:text-green-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri dön
              </Button>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <p className="text-xs text-green-700 dark:text-green-300">
                <strong>Demo Kurye:</strong> kurye@test.com / kurye123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
