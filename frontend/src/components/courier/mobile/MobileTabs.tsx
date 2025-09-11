"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TabItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface MobileTabsProps {
  tabs: TabItem[];
}

export function MobileTabs({ tabs }: MobileTabsProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === '/courier') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <button
              key={tab.href}
              onClick={() => handleTabClick(tab.href)}
              className={cn(
                "relative flex h-full flex-1 flex-col items-center justify-center gap-1 transition-colors",
                "hover:bg-accent focus:bg-accent focus:outline-none",
                active && "text-primary"
              )}
              aria-label={tab.title}
              aria-current={active ? "page" : undefined}
            >
              {/* İkon ve badge container */}
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge 
                    className="absolute -right-2 -top-2 h-4 min-w-4 rounded-full p-0 px-1 flex items-center justify-center text-[10px]"
                    variant="destructive"
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Badge>
                )}
              </div>

              {/* Başlık */}
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.title}
              </span>

              {/* Aktif göstergesi */}
              {active && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* iOS Safe Area için padding */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}