'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  Users,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import whatsappAPI, { WhatsAppStatistics, WhatsAppSession } from '@/lib/api/whatsapp';

export function StatisticsTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WhatsAppStatistics | null>(null);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, sessionsData] = await Promise.all([
        whatsappAPI.getStatistics(period),
        whatsappAPI.getSessions(1, 10),
      ]);
      setStats(statsData);
      setSessions(sessionsData.data);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
      toast.error('İstatistikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStateLabel = (state: string) => {
    const states: Record<string, { label: string; color: string }> = {
      WELCOME: { label: 'Hoş Geldin', color: 'bg-blue-500' },
      SELECT_COMPANY: { label: 'Firma Seçimi', color: 'bg-purple-500' },
      ENTER_ORDER: { label: 'Sipariş Girişi', color: 'bg-yellow-500' },
      SHARE_LOCATION: { label: 'Konum Paylaşımı', color: 'bg-orange-500' },
      SHARE_CONTACT: { label: 'İletişim Bilgisi', color: 'bg-pink-500' },
      CONFIRM_ORDER: { label: 'Sipariş Onayı', color: 'bg-indigo-500' },
      WAITING_APPROVAL: { label: 'Onay Bekleniyor', color: 'bg-amber-500' },
      CONFIRM_PRICE: { label: 'Fiyat Onayı', color: 'bg-teal-500' },
      ORDER_CONFIRMED: { label: 'Sipariş Onaylandı', color: 'bg-green-500' },
      TRACKING: { label: 'Takip', color: 'bg-cyan-500' },
    };

    const stateInfo = states[state] || { label: state, color: 'bg-gray-500' };
    return (
      <Badge className={`${stateInfo.color} text-white`}>
        {stateInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Periyot Seçici */}
      <div className="flex items-center justify-between">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList>
            <TabsTrigger value="today">Bugün</TabsTrigger>
            <TabsTrigger value="week">Bu Hafta</TabsTrigger>
            <TabsTrigger value="month">Bu Ay</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* İstatistik Kartları */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mesajlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {period === 'today'
                  ? stats.todayMessages
                  : period === 'week'
                  ? stats.weekMessages
                  : stats.monthMessages}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Siparişler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {period === 'today'
                  ? stats.todayOrders
                  : period === 'week'
                  ? stats.weekOrders
                  : stats.monthOrders}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Dönüşüm Oranı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                %
                {period === 'today'
                  ? stats.todayConversionRate
                  : period === 'week'
                  ? stats.weekConversionRate
                  : stats.monthConversionRate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Aktif Oturumlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.activeSessions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Özet Kartları */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bugün</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mesaj</span>
                  <span className="font-medium">{stats.todayMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sipariş</span>
                  <span className="font-medium">{stats.todayOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dönüşüm</span>
                  <span className="font-medium">%{stats.todayConversionRate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bu Hafta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mesaj</span>
                  <span className="font-medium">{stats.weekMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sipariş</span>
                  <span className="font-medium">{stats.weekOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dönüşüm</span>
                  <span className="font-medium">%{stats.weekConversionRate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bu Ay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mesaj</span>
                  <span className="font-medium">{stats.monthMessages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sipariş</span>
                  <span className="font-medium">{stats.monthOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dönüşüm</span>
                  <span className="font-medium">%{stats.monthConversionRate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aktif Oturumlar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Son Aktif Oturumlar
          </CardTitle>
          <CardDescription>
            WhatsApp üzerinden aktif olan müşteri oturumları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aktif oturum bulunmuyor</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Son Mesaj</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-sm">
                      {session.phoneNumber}
                    </TableCell>
                    <TableCell>{session.customerName || '-'}</TableCell>
                    <TableCell>{getStateLabel(session.state)}</TableCell>
                    <TableCell>{session.companyName || '-'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(session.lastMessageAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
