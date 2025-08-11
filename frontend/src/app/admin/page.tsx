import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Bike, Package, DollarSign } from "lucide-react";

const stats = [
  {
    title: "Toplam Firma",
    value: "148",
    change: "+12% geçen aya göre",
    icon: Building2,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Aktif Kurye",
    value: "276",
    change: "+8% geçen aya göre",
    icon: Bike,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Toplam Sipariş",
    value: "3,842",
    change: "+23% geçen aya göre",
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Aylık Gelir",
    value: "₺287,425",
    change: "+18% geçen aya göre",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Sistem genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Son Aktiviteler ve Bekleyen İşlemler */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bekleyen İşlemler */}
        <Card>
          <CardHeader>
            <CardTitle>Bekleyen İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div>
                  <p className="font-medium">Firma Başvuruları</p>
                  <p className="text-sm text-muted-foreground">Onay bekleyen</p>
                </div>
                <span className="text-2xl font-bold text-orange-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div>
                  <p className="font-medium">Kurye Başvuruları</p>
                  <p className="text-sm text-muted-foreground">Onay bekleyen</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">8</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div>
                  <p className="font-medium">Ödeme Onayları</p>
                  <p className="text-sm text-muted-foreground">İşlem bekleyen</p>
                </div>
                <span className="text-2xl font-bold text-red-600">23</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Son Aktiviteler */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Yeni firma onaylandı</p>
                  <p className="text-xs text-muted-foreground">ABC Lojistik - 5 dakika önce</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Kurye belgesi güncellendi</p>
                  <p className="text-xs text-muted-foreground">Ahmet Yılmaz - 12 dakika önce</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Fiyatlandırma kuralı eklendi</p>
                  <p className="text-xs text-muted-foreground">Gece tarifesi - 1 saat önce</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sistem ayarı güncellendi</p>
                  <p className="text-xs text-muted-foreground">Komisyon oranı - 2 saat önce</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}