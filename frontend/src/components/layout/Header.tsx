"use client";

import { Bell, User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { AuthService } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  
  const handleLogout = () => {
    clearAuth();
    AuthService.clearAuth();
    toast.success('Çıkış yapıldı');
    router.push('/auth');
  };

  // Kullanıcı adını role göre belirle
  const getUserDisplayName = () => {
    if (!user) return 'Kullanıcı';
    
    switch (user.role) {
      case 'SUPER_ADMIN':
        return 'Süper Admin';
      case 'COMPANY':
        return user.company?.name || user.email;
      case 'COURIER':
        return user.courier ? `${user.courier.firstName} ${user.courier.lastName}` : user.email;
      default:
        return user.email;
    }
  };

  // Kullanıcı tipini belirle
  const getUserType = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'SUPER_ADMIN':
        return 'Yönetici';
      case 'COMPANY':
        return 'Firma';
      case 'COURIER':
        return 'Kurye';
      default:
        return '';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center justify-between md:ml-64">
        {/* Sol taraf - Breadcrumb veya başlık için boşluk */}
        <div className="ml-12 md:ml-0">
          {/* Breadcrumb componenti buraya eklenebilir */}
        </div>

        {/* Sağ taraf - Bildirimler ve kullanıcı menüsü */}
        <div className="flex items-center gap-4">
          {/* Bildirimler */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              variant="destructive"
            >
              3
            </Badge>
          </Button>

          {/* Kullanıcı menüsü */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{getUserDisplayName()}</span>
                  {getUserType() && (
                    <span className="text-xs text-muted-foreground mt-1">{getUserType()}</span>
                  )}
                  {user?.email && user.role !== 'SUPER_ADMIN' && (
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Ayarlar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
