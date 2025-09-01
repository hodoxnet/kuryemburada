'use client';

import { useRouter } from 'next/navigation';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const typeToBadge = (type: string) => {
  switch (type) {
    case 'success': return 'default';
    case 'warning': return 'outline';
    case 'error': return 'destructive';
    default: return 'secondary';
  }
};

export default function CompanyNotificationsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const ownerKey = user ? `${user.role}:${user.company?.id || user.courier?.id || user.id}` : 'UNKNOWN';
  const getNotifications = useNotificationStore((s) => s.getNotifications);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);
  const notifications = getNotifications(ownerKey);
  const unreadCount = getUnreadCount(ownerKey);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bildirimler</h1>
          <p className="text-muted-foreground">Firma hesabınıza ait tüm bildirimler.</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={() => markAllAsRead(ownerKey)}>
              Hepsini okundu say ({unreadCount})
            </Button>
          )}
          <Button variant="ghost" onClick={clearAll}>Tümünü temizle</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son Bildirimler</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Henüz bildirim yok.</div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 ${n.read ? '' : 'bg-accent/30'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={typeToBadge(n.type)}>{n.type}</Badge>
                        {!n.read && <span className="text-xs text-primary">Yeni</span>}
                      </div>
                      <h3 className="mt-1 font-medium">{n.title}</h3>
                      {n.message && (
                        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{n.message}</p>
                      )}
                      {n.actionUrl && (
                        <Button
                          variant="link"
                          className="p-0 h-auto mt-2"
                          onClick={() => {
                            markAsRead(n.id);
                            router.push(n.actionUrl!);
                          }}
                        >
                          Detaya git
                        </Button>
                      )}
                    </div>
                    {!n.read && (
                      <Button size="sm" variant="secondary" onClick={() => markAsRead(n.id)}>Okundu</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
