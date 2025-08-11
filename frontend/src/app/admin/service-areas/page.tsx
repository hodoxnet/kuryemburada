'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  serviceAreaService, 
  ServiceArea, 
  CreateServiceAreaDto,
  ServiceAreaStatistics 
} from '@/lib/api/service-area.service';
import { toast } from 'sonner';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye, 
  MapPin,
  TrendingUp,
  Package,
  DollarSign,
  Activity
} from 'lucide-react';

export default function ServiceAreasPage() {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<ServiceArea | null>(null);
  const [statistics, setStatistics] = useState<ServiceAreaStatistics | null>(null);
  const [formData, setFormData] = useState<CreateServiceAreaDto>({
    name: '',
    city: 'İstanbul',
    district: '',
    boundaries: [],
    basePrice: 15,
    pricePerKm: 3,
    maxDistance: 30,
    isActive: true,
    priority: 0,
  });
  const [boundariesText, setBoundariesText] = useState('');

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  const fetchServiceAreas = async () => {
    try {
      setLoading(true);
      const data = await serviceAreaService.getAll();
      setServiceAreas(data);
    } catch (error) {
      console.error('Bölgeler yüklenemedi:', error);
      toast.error('Bölgeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (area?: ServiceArea) => {
    if (area) {
      setSelectedArea(area);
      setFormData({
        name: area.name,
        city: area.city,
        district: area.district,
        boundaries: area.boundaries,
        basePrice: area.basePrice,
        pricePerKm: area.pricePerKm,
        maxDistance: area.maxDistance,
        isActive: area.isActive,
        priority: area.priority,
      });
      setBoundariesText(JSON.stringify(area.boundaries, null, 2));
    } else {
      setSelectedArea(null);
      setFormData({
        name: '',
        city: 'İstanbul',
        district: '',
        boundaries: [],
        basePrice: 15,
        pricePerKm: 3,
        maxDistance: 30,
        isActive: true,
        priority: 0,
      });
      setBoundariesText('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedArea(null);
  };

  const handleSubmit = async () => {
    try {
      // Boundaries JSON parse et
      let boundaries = [];
      try {
        boundaries = JSON.parse(boundariesText);
      } catch (e) {
        toast.error('Sınır koordinatları geçerli JSON formatında değil');
        return;
      }

      const dataToSubmit = { ...formData, boundaries };

      if (selectedArea) {
        await serviceAreaService.update(selectedArea.id, dataToSubmit);
        toast.success('Bölge başarıyla güncellendi');
      } else {
        await serviceAreaService.create(dataToSubmit);
        toast.success('Bölge başarıyla oluşturuldu');
      }
      handleCloseDialog();
      fetchServiceAreas();
    } catch (error: any) {
      console.error('Bölge kaydedilemedi:', error);
      toast.error(error.response?.data?.message || 'Bölge kaydedilirken bir hata oluştu');
    }
  };

  const handleToggleActive = async (area: ServiceArea) => {
    try {
      await serviceAreaService.toggleActive(area.id);
      toast.success(`${area.name} bölgesi ${area.isActive ? 'pasif' : 'aktif'} yapıldı`);
      fetchServiceAreas();
    } catch (error) {
      console.error('Durum değiştirilemedi:', error);
      toast.error('Durum değiştirilirken bir hata oluştu');
    }
  };

  const handleDelete = async () => {
    if (!selectedArea) return;

    try {
      await serviceAreaService.delete(selectedArea.id);
      toast.success('Bölge başarıyla silindi');
      setDeleteDialogOpen(false);
      setSelectedArea(null);
      fetchServiceAreas();
    } catch (error: any) {
      console.error('Bölge silinemedi:', error);
      toast.error(error.response?.data?.message || 'Bölge silinirken bir hata oluştu');
    }
  };

  const handleShowStatistics = async (area: ServiceArea) => {
    try {
      const stats = await serviceAreaService.getStatistics(area.id);
      setStatistics(stats);
      setSelectedArea(area);
      setStatsDialogOpen(true);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
      toast.error('İstatistikler yüklenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bölge Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Hizmet bölgelerini ve fiyatlandırmalarını yönetin
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Bölge
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bölge</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceAreas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktif Bölge</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceAreas.filter(a => a.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Taban Fiyat</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{(serviceAreas.reduce((sum, a) => sum + a.basePrice, 0) / serviceAreas.length || 0).toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Km Fiyatı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{(serviceAreas.reduce((sum, a) => sum + a.pricePerKm, 0) / serviceAreas.length || 0).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bölge Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Hizmet Bölgeleri</CardTitle>
          <CardDescription>
            Sistemde tanımlı tüm hizmet bölgeleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bölge Adı</TableHead>
                <TableHead>İlçe</TableHead>
                <TableHead>Taban Fiyat</TableHead>
                <TableHead>Km Başı</TableHead>
                <TableHead>Max Mesafe</TableHead>
                <TableHead>Öncelik</TableHead>
                <TableHead>Sipariş Sayısı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell>{area.district}</TableCell>
                  <TableCell>₺{area.basePrice}</TableCell>
                  <TableCell>₺{area.pricePerKm}</TableCell>
                  <TableCell>{area.maxDistance ? `${area.maxDistance} km` : '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{area.priority}</Badge>
                  </TableCell>
                  <TableCell>{area._count?.orders || 0}</TableCell>
                  <TableCell>
                    <Badge variant={area.isActive ? 'success' : 'secondary'}>
                      {area.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShowStatistics(area)}>
                          <Eye className="mr-2 h-4 w-4" />
                          İstatistikler
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDialog(area)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(area)}>
                          <Activity className="mr-2 h-4 w-4" />
                          {area.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedArea(area);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bölge Ekleme/Düzenleme Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedArea ? 'Bölge Düzenle' : 'Yeni Bölge Ekle'}
            </DialogTitle>
            <DialogDescription>
              Hizmet bölgesi bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Bölge Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Beylikdüzü"
                />
              </div>
              <div>
                <Label htmlFor="district">İlçe</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Örn: Beylikdüzü"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="basePrice">Taban Fiyat (₺)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="pricePerKm">Km Başı Fiyat (₺)</Label>
                <Input
                  id="pricePerKm"
                  type="number"
                  step="0.1"
                  value={formData.pricePerKm}
                  onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="maxDistance">Max Mesafe (km)</Label>
                <Input
                  id="maxDistance"
                  type="number"
                  value={formData.maxDistance || ''}
                  onChange={(e) => setFormData({ ...formData, maxDistance: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Opsiyonel"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Öncelik (büyük olan önce kontrol edilir)</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="boundaries">
                Sınır Koordinatları (JSON formatında)
              </Label>
              <Textarea
                id="boundaries"
                rows={6}
                value={boundariesText}
                onChange={(e) => setBoundariesText(e.target.value)}
                placeholder='[
  {"lat": 40.9802, "lng": 28.6434},
  {"lat": 41.0166, "lng": 28.6434},
  {"lat": 41.0166, "lng": 28.7090},
  {"lat": 40.9802, "lng": 28.7090}
]'
              />
              <p className="text-xs text-muted-foreground mt-1">
                Poligon koordinatlarını saat yönünde JSON formatında girin
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {selectedArea ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* İstatistikler Dialog */}
      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedArea?.name} İstatistikleri</DialogTitle>
          </DialogHeader>
          {statistics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Sipariş</p>
                  <p className="text-2xl font-bold">{statistics.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bekleyen</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pendingOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tamamlanan</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.completedOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">İptal Edilen</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.cancelledOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                  <p className="text-2xl font-bold">₺{statistics.totalRevenue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ortalama Sipariş</p>
                  <p className="text-2xl font-bold">₺{statistics.avgOrderPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bölgeyi Sil</DialogTitle>
            <DialogDescription>
              {selectedArea?.name} bölgesini silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}