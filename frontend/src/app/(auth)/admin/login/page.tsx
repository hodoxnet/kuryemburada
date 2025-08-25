"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User, Lock, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminAuthService } from "@/lib/api/admin-auth.service";
import { AuthService } from "@/lib/auth";

export default function AdminLoginPage() {
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
      const data = await AdminAuthService.login(formData);
      
      // Token ve kullanıcı bilgisini merkezi AuthService ile kaydet
      AuthService.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      AuthService.setUser(data.user as any);
      // AuthContext'e sinyal gönder
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:updated'));
      }
      
      toast.success('Admin girişi başarılı!');
      router.push('/admin');
    } catch (error: any) {
      toast.error('Giriş başarısız. Admin bilgilerinizi kontrol edin.');
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-red-700 dark:text-red-400">
            Sistem Yöneticisi Girişi
          </CardTitle>
          <CardDescription className="text-center">
            Admin hesabınızla giriş yapın
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
                  placeholder="admin@kuryem.com"
                  className="pl-10 border-red-200 focus:border-red-400 focus:ring-red-400"
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
                  className="pl-10 border-red-200 focus:border-red-400 focus:ring-red-400"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Girişi
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/auth')}
                className="text-sm hover:text-red-600"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri dön
              </Button>
            </div>
            
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p className="text-xs text-red-700 dark:text-red-300">
                <strong>Demo Admin:</strong> admin@kuryem.com / admin123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
