"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon, LogOut, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuthStore } from "@/stores/authStore";
import { AuthService } from "@/lib/auth";
import { toast } from "sonner";

export interface DrawerMenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItems: DrawerMenuItem[];
  title?: string;
}

export function MobileDrawer({ 
  open, 
  onOpenChange, 
  menuItems,
  title = "Kurye Paneli"
}: MobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    AuthService.clearAuth();
    toast.success('Çıkış yapıldı');
    router.push('/auth');
  };

  const handleItemClick = (href: string) => {
    router.push(href);
    onOpenChange(false); // Menü öğesine tıklandığında drawer'ı kapat
  };

  const isActive = (href: string) => {
    if (href === '/courier/dashboard') {
      return pathname === href || pathname === '/courier';
    }
    return pathname === href || pathname.startsWith(href + '/');
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-80 p-0 flex flex-col"
        aria-label="Ana navigasyon menüsü"
      >
        <VisuallyHidden>
          <SheetTitle>Navigasyon Menüsü</SheetTitle>
        </VisuallyHidden>

        {/* Header - Kullanıcı bilgisi */}
        <div className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Menü öğeleri */}
        <ScrollArea className="flex-1 py-2">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={item.href}
                  onClick={() => handleItemClick(item.href)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    active && "bg-primary/10 text-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      "h-5 w-5",
                      active ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span>{item.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    <ChevronRight className={cn(
                      "h-4 w-4",
                      active ? "text-primary" : "text-muted-foreground/50"
                    )} />
                  </div>
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Footer - Çıkış butonu */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Çıkış Yap
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}