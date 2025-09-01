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
import { useNotificationStore } from "@/stores/useNotificationStore";

export function Header() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const getNotifications = useNotificationStore((s) => s.getNotifications);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const ownerKey = user ? `${user.role}:${user.company?.id || user.courier?.id || user.id}` : 'UNKNOWN';
  const notifications = getNotifications(ownerKey);
  const unreadCount = getUnreadCount(ownerKey);
  
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full p-0 px-1 flex items-center justify-center"
                    variant="destructive"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="px-3 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium">Bildirimler</span>
                <Button variant="ghost" size="sm" className="h-7" onClick={() => markAllAsRead(ownerKey)}>Hepsini okundu say</Button>
              </div>
              <div className="max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">Gösterilecek bildirim yok</div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${n.read ? '' : 'bg-accent/30'}`}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.actionUrl) {
                          router.push(n.actionUrl);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 h-2 w-2 rounded-full ${n.read ? 'bg-muted-foreground/40' : 'bg-primary'}`} />
                        <div className="flex-1">
                          <div className="font-medium leading-none line-clamp-1">{n.title}</div>
                          {n.message && (
                            <div className="mt-1 text-muted-foreground line-clamp-2">{n.message}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center"
                  onClick={() => {
                    const target = user?.role === 'COMPANY' ? '/company/notifications' : user?.role === 'COURIER' ? '/courier/notifications' : '/';
                    router.push(target);
                  }}
                >
                  Tüm bildirimleri gör
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
