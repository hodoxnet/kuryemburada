"use client";

import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthService } from "@/lib/auth";

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const getNotifications = useNotificationStore((s) => s.getNotifications);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  const ownerKey = user ? `${user.role}:${user.courier?.id || user.id}` : 'UNKNOWN';
  const notifications = getNotifications(ownerKey);
  const unreadCount = getUnreadCount(ownerKey);

  const handleLogout = () => {
    clearAuth();
    AuthService.clearAuth();
    toast.success('Çıkış yapıldı');
    router.push('/auth');
  };

  const getUserDisplayName = () => {
    if (!user) return 'Kullanıcı';
    if (user.role === 'COURIER' && user.courier) {
      const firstName = user.courier.firstName || '';
      const lastName = user.courier.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || user.email || 'Kurye';
    }
    return user.email || 'Kullanıcı';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      {/* Sol - Hamburger menü */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onMenuClick}
        aria-label="Menüyü aç"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Orta - Sayfa başlığı */}
      <h1 className="flex-1 text-center text-base font-semibold truncate px-2">
        {title}
      </h1>

      {/* Sağ - Bildirimler ve profil */}
      <div className="flex items-center gap-1">
        {/* Bildirimler */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full p-0 px-1 flex items-center justify-center text-[10px]"
                  variant="destructive"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-0">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <span className="text-sm font-medium">Bildirimler</span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs" 
                  onClick={() => markAllAsRead(ownerKey)}
                >
                  Tümünü okundu işaretle
                </Button>
              )}
            </div>
            <div className="max-h-64 overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Bildirim yok
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${
                      n.read ? '' : 'bg-accent/30'
                    }`}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.actionUrl) {
                        router.push(n.actionUrl);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-1 h-2 w-2 rounded-full ${
                        n.read ? 'bg-muted-foreground/40' : 'bg-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium leading-none line-clamp-1">
                          {n.title}
                        </div>
                        {n.message && (
                          <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {n.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 5 && (
              <div className="border-t">
                <Button 
                  variant="ghost" 
                  className="w-full h-9 text-sm"
                  onClick={() => router.push('/courier/notifications')}
                >
                  Tüm bildirimleri gör
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Kullanıcı menüsü */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{getUserDisplayName()}</span>
                <span className="text-xs text-muted-foreground mt-0.5">Kurye</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/courier/settings')}>
              Ayarlar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/courier/documents')}>
              Belgelerim
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}