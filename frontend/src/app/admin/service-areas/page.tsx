'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, InfoWindow, DrawingManager } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  serviceAreaService, 
  ServiceArea, 
  CreateServiceAreaDto,
  ServiceAreaStatistics 
} from '@/lib/api/service-area.service';
import { toast } from 'sonner';
import { 
  MapPin,
  Search,
  Plus,
  Save,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  Activity,
  X,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 200px)',
  minHeight: '600px'
};

const center = {
  lat: 41.0082, // İstanbul merkez
  lng: 28.9784
};

const mapOptions: google.maps.MapOptions = {
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  zoomControl: true,
  mapTypeId: 'roadmap',
};

const libraries: ("drawing" | "geometry" | "places")[] = ['drawing', 'geometry', 'places'];

// İstanbul ilçeleri listesi
const istanbulDistricts = [
  'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler',
  'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beylikdüzü', 'Beyoğlu',
  'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt', 'Eyüpsultan',
  'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane', 'Kartal',
  'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer', 'Silivri',
  'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla', 'Ümraniye',
  'Üsküdar', 'Zeytinburnu'
];

// Polygon renkleri
const polygonOptions = {
  fillColor: '#3b82f6',
  fillOpacity: 0.3,
  strokeColor: '#2563eb',
  strokeOpacity: 1,
  strokeWeight: 2,
  clickable: true,
  draggable: false,
  editable: false,
  geodesic: false,
  zIndex: 1
};

const selectedPolygonOptions = {
  ...polygonOptions,
  fillColor: '#10b981',
  strokeColor: '#059669',
  strokeWeight: 3,
  zIndex: 2
};

const editablePolygonOptions = {
  ...selectedPolygonOptions,
  editable: true,
  draggable: true
};

export default function ServiceAreasPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<ServiceArea | null>(null);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [newPolygon, setNewPolygon] = useState<google.maps.Polygon | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLng | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
  const [statistics, setStatistics] = useState<ServiceAreaStatistics | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

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

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    placesServiceRef.current = new google.maps.places.PlacesService(map);
    geocoderRef.current = new google.maps.Geocoder();
  }, []);

  const searchDistrict = async (districtName: string) => {
    if (!placesServiceRef.current || !map) return;

    const request = {
      query: `${districtName} İstanbul Türkiye`,
      fields: ['name', 'geometry'],
    };

    placesServiceRef.current.findPlaceFromQuery(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
        const place = results[0];
        
        if (place.geometry?.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else if (place.geometry?.location) {
          map.setCenter(place.geometry.location);
          map.setZoom(13);
        }

        // İlçe sınırlarını çek
        fetchDistrictBoundaries(districtName);
      } else {
        toast.error('İlçe bulunamadı');
      }
    });
  };

  const fetchDistrictBoundaries = async (districtName: string) => {
    if (!geocoderRef.current || !map) return;

    try {
      // Geocoding API ile ilçe sınırlarını çekmeye çalış
      const response = await geocoderRef.current.geocode({
        address: `${districtName}, İstanbul, Türkiye`,
        componentRestrictions: {
          country: 'TR',
          administrativeArea: 'İstanbul',
        },
      });

      if (response.results && response.results[0]) {
        const result = response.results[0];
        
        // Viewport'u polygon olarak kullan (yaklaşık sınırlar)
        if (result.geometry.viewport) {
          const bounds = result.geometry.viewport;
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          
          // Dikdörtgen sınırlardan başlangıç polygonu oluştur
          const boundaries = [
            { lat: ne.lat(), lng: ne.lng() },
            { lat: ne.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: sw.lng() },
            { lat: sw.lat(), lng: ne.lng() },
          ];

          // Yeni polygon oluştur ve haritaya ekle
          if (newPolygon) {
            newPolygon.setMap(null);
          }

          const polygon = new google.maps.Polygon({
            paths: boundaries,
            ...editablePolygonOptions,
          });

          polygon.setMap(map);
          setNewPolygon(polygon);

          // Form verilerini güncelle
          setFormData(prev => ({
            ...prev,
            name: districtName,
            district: districtName,
            boundaries: boundaries,
          }));

          // Sheet'i aç
          setSheetOpen(true);
          setSearchOpen(false);

          toast.success(`${districtName} sınırları yüklendi. Düzenleyebilirsiniz.`);
        }
      }
    } catch (error) {
      console.error('Sınırlar alınamadı:', error);
      toast.error('İlçe sınırları alınamadı, manuel çizim yapabilirsiniz');
      enableDrawingMode();
    }
  };

  const enableDrawingMode = () => {
    if (!map) return;

    const manager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: editablePolygonOptions,
    });

    manager.setMap(map);
    setDrawingManager(manager);

    // Polygon çizimi tamamlandığında
    google.maps.event.addListener(manager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
      const path = polygon.getPath();
      const boundaries = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const latLng = path.getAt(i);
        boundaries.push({
          lat: latLng.lat(),
          lng: latLng.lng(),
        });
      }

      setNewPolygon(polygon);
      setFormData(prev => ({
        ...prev,
        boundaries: boundaries,
      }));

      // Drawing mode'u kapat
      manager.setDrawingMode(null);
      setSheetOpen(true);
    });
  };

  const handleSaveArea = async () => {
    try {
      let boundaries = formData.boundaries;

      // Eğer düzenleme modundaysa, polygon'dan güncel koordinatları al
      if (newPolygon) {
        const path = newPolygon.getPath();
        boundaries = [];
        for (let i = 0; i < path.getLength(); i++) {
          const latLng = path.getAt(i);
          boundaries.push({
            lat: latLng.lat(),
            lng: latLng.lng(),
          });
        }
      }

      const dataToSubmit = { ...formData, boundaries };

      if (editingArea) {
        await serviceAreaService.update(editingArea.id, dataToSubmit);
        toast.success('Bölge başarıyla güncellendi');
      } else {
        await serviceAreaService.create(dataToSubmit);
        toast.success('Bölge başarıyla oluşturuldu');
      }

      // Temizlik
      if (newPolygon) {
        newPolygon.setMap(null);
        setNewPolygon(null);
      }
      if (drawingManager) {
        drawingManager.setMap(null);
        setDrawingManager(null);
      }

      setSheetOpen(false);
      setEditingArea(null);
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

      fetchServiceAreas();
    } catch (error: any) {
      console.error('Bölge kaydedilemedi:', error);
      toast.error(error.response?.data?.message || 'Bölge kaydedilirken bir hata oluştu');
    }
  };

  const handleEditArea = (area: ServiceArea) => {
    setEditingArea(area);
    setSelectedArea(null);
    setInfoWindowPosition(null);

    // Form verilerini doldur
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

    // Mevcut polygon'u düzenlenebilir yap
    if (newPolygon) {
      newPolygon.setMap(null);
    }

    const polygon = new google.maps.Polygon({
      paths: area.boundaries,
      ...editablePolygonOptions,
    });

    polygon.setMap(map);
    setNewPolygon(polygon);
    setSheetOpen(true);

    // Bölgeye zoom yap
    const bounds = new google.maps.LatLngBounds();
    area.boundaries.forEach((coord: any) => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });
    map?.fitBounds(bounds);
  };

  const handleDeleteArea = async (area: ServiceArea) => {
    if (!confirm(`${area.name} bölgesini silmek istediğinizden emin misiniz?`)) return;

    try {
      await serviceAreaService.delete(area.id);
      toast.success('Bölge başarıyla silindi');
      setSelectedArea(null);
      setInfoWindowPosition(null);
      fetchServiceAreas();
    } catch (error: any) {
      console.error('Bölge silinemedi:', error);
      toast.error(error.response?.data?.message || 'Bölge silinirken bir hata oluştu');
    }
  };

  const handlePolygonClick = async (area: ServiceArea, event: any) => {
    // Eğer düzenleme modundaysa tıklamayı engelle
    if (editingArea || newPolygon) return;
    
    setSelectedArea(area);
    setInfoWindowPosition(event.latLng);

    // İstatistikleri yükle
    try {
      const stats = await serviceAreaService.getStatistics(area.id);
      setStatistics(stats);
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const startEditingExistingPolygon = (area: ServiceArea) => {
    setEditingArea(area);
    setSelectedArea(null);
    setInfoWindowPosition(null);

    // Form verilerini doldur
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

    // Mevcut polygon'u gizle ve düzenlenebilir versiyonu göster
    if (newPolygon) {
      newPolygon.setMap(null);
    }

    const polygon = new google.maps.Polygon({
      paths: area.boundaries,
      ...editablePolygonOptions,
    });

    polygon.setMap(map);
    setNewPolygon(polygon);

    // Bölgeye zoom yap
    const bounds = new google.maps.LatLngBounds();
    area.boundaries.forEach((coord: any) => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });
    map?.fitBounds(bounds);
  };

  const handleCancel = () => {
    if (newPolygon) {
      newPolygon.setMap(null);
      setNewPolygon(null);
    }
    if (drawingManager) {
      drawingManager.setMap(null);
      setDrawingManager(null);
    }
    setSheetOpen(false);
    setEditingArea(null);
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
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bölge Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Harita üzerinde hizmet bölgelerini yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                İlçe Ara
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="İlçe ara..." />
                <CommandEmpty>İlçe bulunamadı.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {istanbulDistricts.map((district) => (
                    <CommandItem
                      key={district}
                      onSelect={() => searchDistrict(district)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.district === district ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {district}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button onClick={enableDrawingMode}>
            <Plus className="w-4 h-4 mr-2" />
            Manuel Çiz
          </Button>
        </div>
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

      {/* Google Maps */}
      <Card>
        <CardContent className="p-0 relative">
          {loadError && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-500">Harita yüklenemedi</p>
                <p className="text-sm text-muted-foreground mt-2">Google Maps API anahtarınızı kontrol edin</p>
              </div>
            </div>
          )}
          {!isLoaded && !loadError && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Harita yükleniyor...</p>
              </div>
            </div>
          )}
          {isLoaded && !loadError && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={10}
              options={mapOptions}
              onLoad={onMapLoad}
              onUnmount={() => setMap(null)}
            >
              {/* Mevcut bölgeleri göster (düzenleme modunda değilse veya düzenlenen değilse) */}
              {serviceAreas.map((area) => {
                // Düzenleme modundaysa ve bu düzenlenen bölgeyse gösterme
                if (editingArea?.id === area.id) return null;
                
                return (
                  <Polygon
                    key={area.id}
                    paths={area.boundaries}
                    options={
                      selectedArea?.id === area.id
                        ? selectedPolygonOptions
                        : polygonOptions
                    }
                    onClick={(e) => handlePolygonClick(area, e)}
                  />
                );
              })}

              {/* Bilgi penceresi */}
              {selectedArea && infoWindowPosition && (
                <InfoWindow
                  position={infoWindowPosition}
                  onCloseClick={() => {
                    setSelectedArea(null);
                    setInfoWindowPosition(null);
                  }}
                >
                  <div className="p-2 min-w-[250px]">
                    <h3 className="font-semibold text-lg mb-2">{selectedArea.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">İlçe:</span> {selectedArea.district}</p>
                      <p><span className="font-medium">Taban Fiyat:</span> ₺{selectedArea.basePrice}</p>
                      <p><span className="font-medium">Km Başı:</span> ₺{selectedArea.pricePerKm}</p>
                      <p><span className="font-medium">Max Mesafe:</span> {selectedArea.maxDistance || '-'} km</p>
                      <p>
                        <span className="font-medium">Durum:</span>{' '}
                        <Badge variant={selectedArea.isActive ? 'success' : 'secondary'} className="ml-1">
                          {selectedArea.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </p>
                      {statistics && (
                        <div className="mt-2 pt-2 border-t">
                          <p><span className="font-medium">Toplam Sipariş:</span> {statistics.totalOrders}</p>
                          <p><span className="font-medium">Toplam Gelir:</span> ₺{statistics.totalRevenue.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => startEditingExistingPolygon(selectedArea)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Haritada Düzenle
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditArea(selectedArea)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Detayları Düzenle
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteArea(selectedArea)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </InfoWindow>
              )}
              
              {/* Düzenleme modunda floating butonlar ve bilgi */}
              {(editingArea || newPolygon) && (
                <>
                  {/* Bilgi mesajı */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-white px-6 py-3 rounded-lg shadow-lg border border-primary">
                      <p className="text-sm font-medium text-primary">
                        📍 Köşeleri sürükleyerek bölgeyi düzenleyin
                      </p>
                    </div>
                  </div>
                  
                  {/* Kontrol butonları */}
                  <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-10">
                    <Button
                      size="lg"
                      className="shadow-lg"
                      onClick={handleSaveArea}
                    >
                      <Save className="w-5 h-5 mr-2" />
                      Kaydet
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="shadow-lg bg-white"
                      onClick={handleCancel}
                    >
                      <X className="w-5 h-5 mr-2" />
                      İptal
                    </Button>
                  </div>
                </>
              )}
            </GoogleMap>
          )}
        </CardContent>
      </Card>

      {/* Bölge Düzenleme Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              {editingArea ? 'Bölge Düzenle' : 'Yeni Bölge Ekle'}
            </SheetTitle>
            <SheetDescription>
              Bölge bilgilerini girin ve haritada sınırları düzenleyin
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
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
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="pricePerKm">Km Başı (₺)</Label>
                <Input
                  id="pricePerKm"
                  type="number"
                  step="0.1"
                  value={formData.pricePerKm}
                  onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="priority">Öncelik</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">📍 Harita İpuçları:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Köşe noktalarını sürükleyerek sınırları düzenleyin</li>
                <li>• Kenarları sürükleyerek yeni köşe noktası ekleyin</li>
                <li>• Sağ tıklayarak köşe noktasını silin</li>
              </ul>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSaveArea}>
              <Save className="w-4 h-4 mr-2" />
              {editingArea ? 'Güncelle' : 'Kaydet'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}