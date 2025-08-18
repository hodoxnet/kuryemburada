"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/shared/LoadingState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User,
  Car,
  Bell,
  Shield,
  MapPin,
  Phone,
  Mail,
  Save,
  Key,
  Globe,
  Moon,
  Sun,
  Volume2,
  Smartphone,
  CreditCard,
  Clock,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CourierProfile {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleColor: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  licenseNumber: string;
  licenseExpiry: string;
}

interface NotificationSettings {
  newOrderNotification: boolean;
  orderStatusNotification: boolean;
  paymentNotification: boolean;
  promotionNotification: boolean;
  systemNotification: boolean;
  emailNotification: boolean;
  smsNotification: boolean;
  pushNotification: boolean;
}

interface WorkSettings {
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
  maxDailyOrders: number;
  preferredAreas: string[];
  autoAcceptOrders: boolean;
  minOrderValue: number;
}

const WORK_DAYS = [
  { key: 'monday', label: 'Pazartesi' },
  { key: 'tuesday', label: 'Salı' },
  { key: 'wednesday', label: 'Çarşamba' },
  { key: 'thursday', label: 'Perşembe' },
  { key: 'friday', label: 'Cuma' },
  { key: 'saturday', label: 'Cumartesi' },
  { key: 'sunday', label: 'Pazar' }
];

export default function CourierSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [profile, setProfile] = useState<CourierProfile>({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    vehicleType: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleYear: new Date().getFullYear(),
    vehiclePlate: "",
    vehicleColor: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    licenseNumber: "",
    licenseExpiry: ""
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newOrderNotification: true,
    orderStatusNotification: true,
    paymentNotification: true,
    promotionNotification: false,
    systemNotification: true,
    emailNotification: true,
    smsNotification: true,
    pushNotification: true
  });

  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    maxDailyOrders: 50,
    preferredAreas: [],
    autoAcceptOrders: false,
    minOrderValue: 0
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // TODO: Gerçek API endpoint'leri eklendiğinde bu kısım güncellenecek
      
      // Mock data for development
      if (user?.courier) {
        setProfile({
          fullName: user.courier.fullName || "",
          phone: user.courier.phone || "",
          email: user.email || "",
          address: user.courier.address || "",
          emergencyContact: "Ahmet Yılmaz",
          emergencyPhone: "+90 555 123 45 67",
          vehicleType: "MOTORCYCLE",
          vehicleBrand: "Honda",
          vehicleModel: "CBR 150",
          vehicleYear: 2022,
          vehiclePlate: "34 ABC 123",
          vehicleColor: "Kırmızı",
          insuranceNumber: "12345678901",
          insuranceExpiry: "2025-12-31",
          licenseNumber: "987654321",
          licenseExpiry: "2029-08-15"
        });
      }
    } catch (error) {
      console.error("Ayarlar yüklenemedi:", error);
      toast.error("Ayarlar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profil bilgileri güncellendi");
    } catch (error) {
      console.error("Profil güncellenemedi:", error);
      toast.error("Profil güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Bildirim ayarları güncellendi");
    } catch (error) {
      console.error("Bildirim ayarları güncellenemedi:", error);
      toast.error("Bildirim ayarları güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWorkSettings = async () => {
    try {
      setSaving(true);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Çalışma ayarları güncellendi");
    } catch (error) {
      console.error("Çalışma ayarları güncellenemedi:", error);
      toast.error("Çalışma ayarları güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır");
      return;
    }

    try {
      setSaving(true);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Şifre başarıyla güncellendi");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Şifre güncellenemedi:", error);
      toast.error("Şifre güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleWorkingDaysChange = (day: string) => {
    setWorkSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  if (loading) {
    return <LoadingState text="Ayarlarınız yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Profil bilgilerinizi ve uygulama ayarlarınızı yönetin.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="vehicle">Araç</TabsTrigger>
          <TabsTrigger value="work">Çalışma</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
        </TabsList>

        {/* Profil Ayarları */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <Separator />

              <h4 className="font-medium">Acil Durum İletişimi</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Acil Durum Kişisi</Label>
                  <Input
                    id="emergencyContact"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Acil Durum Telefonu</Label>
                  <Input
                    id="emergencyPhone"
                    value={profile.emergencyPhone}
                    onChange={(e) => setProfile(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Araç Ayarları */}
        <TabsContent value="vehicle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Araç Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Araç Tipi</Label>
                  <Select
                    value={profile.vehicleType}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, vehicleType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Araç tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOTORCYCLE">Motosiklet</SelectItem>
                      <SelectItem value="SCOOTER">Scooter</SelectItem>
                      <SelectItem value="BICYCLE">Bisiklet</SelectItem>
                      <SelectItem value="CAR">Araba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleBrand">Marka</Label>
                  <Input
                    id="vehicleBrand"
                    value={profile.vehicleBrand}
                    onChange={(e) => setProfile(prev => ({ ...prev, vehicleBrand: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Model</Label>
                  <Input
                    id="vehicleModel"
                    value={profile.vehicleModel}
                    onChange={(e) => setProfile(prev => ({ ...prev, vehicleModel: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Yıl</Label>
                  <Input
                    id="vehicleYear"
                    type="number"
                    value={profile.vehicleYear}
                    onChange={(e) => setProfile(prev => ({ ...prev, vehicleYear: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate">Plaka</Label>
                  <Input
                    id="vehiclePlate"
                    value={profile.vehiclePlate}
                    onChange={(e) => setProfile(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleColor">Renk</Label>
                  <Input
                    id="vehicleColor"
                    value={profile.vehicleColor}
                    onChange={(e) => setProfile(prev => ({ ...prev, vehicleColor: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium">Belgeler</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Ehliyet No</Label>
                  <Input
                    id="licenseNumber"
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">Ehliyet Son Geçerlilik</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={profile.licenseExpiry}
                    onChange={(e) => setProfile(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceNumber">Sigorta Poliçe No</Label>
                  <Input
                    id="insuranceNumber"
                    value={profile.insuranceNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceExpiry">Sigorta Son Geçerlilik</Label>
                  <Input
                    id="insuranceExpiry"
                    type="date"
                    value={profile.insuranceExpiry}
                    onChange={(e) => setProfile(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Çalışma Ayarları */}
        <TabsContent value="work" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Çalışma Saatleri ve Tercihler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workingHoursStart">Başlangıç Saati</Label>
                  <Input
                    id="workingHoursStart"
                    type="time"
                    value={workSettings.workingHoursStart}
                    onChange={(e) => setWorkSettings(prev => ({ ...prev, workingHoursStart: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHoursEnd">Bitiş Saati</Label>
                  <Input
                    id="workingHoursEnd"
                    type="time"
                    value={workSettings.workingHoursEnd}
                    onChange={(e) => setWorkSettings(prev => ({ ...prev, workingHoursEnd: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Çalışma Günleri</Label>
                <div className="grid gap-2 md:grid-cols-4">
                  {WORK_DAYS.map(day => (
                    <div key={day.key} className="flex items-center space-x-2">
                      <Switch
                        id={day.key}
                        checked={workSettings.workingDays.includes(day.key)}
                        onCheckedChange={() => handleWorkingDaysChange(day.key)}
                      />
                      <Label htmlFor={day.key} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxDailyOrders">Günlük Maksimum Sipariş</Label>
                  <Input
                    id="maxDailyOrders"
                    type="number"
                    value={workSettings.maxDailyOrders}
                    onChange={(e) => setWorkSettings(prev => ({ ...prev, maxDailyOrders: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Minimum Sipariş Tutarı (₺)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    value={workSettings.minOrderValue}
                    onChange={(e) => setWorkSettings(prev => ({ ...prev, minOrderValue: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAccept">Otomatik Sipariş Kabulü</Label>
                  <p className="text-sm text-muted-foreground">
                    Kriterlerinize uygun siparişler otomatik kabul edilir
                  </p>
                </div>
                <Switch
                  id="autoAccept"
                  checked={workSettings.autoAcceptOrders}
                  onCheckedChange={(checked) => setWorkSettings(prev => ({ ...prev, autoAcceptOrders: checked }))}
                />
              </div>

              <Button onClick={handleSaveWorkSettings} disabled={saving}>
                {saving ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bildirim Ayarları */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Tercihleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Sipariş Bildirimleri</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newOrderNotification">Yeni Sipariş</Label>
                      <p className="text-sm text-muted-foreground">
                        Yeni siparişler geldiğinde bildirim alın
                      </p>
                    </div>
                    <Switch
                      id="newOrderNotification"
                      checked={notifications.newOrderNotification}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, newOrderNotification: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderStatusNotification">Sipariş Durum Değişiklikleri</Label>
                      <p className="text-sm text-muted-foreground">
                        Sipariş durumunuz değiştiğinde bildirim alın
                      </p>
                    </div>
                    <Switch
                      id="orderStatusNotification"
                      checked={notifications.orderStatusNotification}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, orderStatusNotification: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Finansal Bildirimler</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paymentNotification">Ödeme Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">
                      Ödeme işlemlerinizde bildirim alın
                    </p>
                  </div>
                  <Switch
                    id="paymentNotification"
                    checked={notifications.paymentNotification}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, paymentNotification: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Genel Bildirimler</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="promotionNotification">Promosyon ve Kampanyalar</Label>
                      <p className="text-sm text-muted-foreground">
                        Kampanya ve fırsatlardan haberdar olun
                      </p>
                    </div>
                    <Switch
                      id="promotionNotification"
                      checked={notifications.promotionNotification}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, promotionNotification: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemNotification">Sistem Bildirimleri</Label>
                      <p className="text-sm text-muted-foreground">
                        Sistem güncellemeleri ve önemli duyurular
                      </p>
                    </div>
                    <Switch
                      id="systemNotification"
                      checked={notifications.systemNotification}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, systemNotification: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Bildirim Kanalları</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="emailNotification">E-posta</Label>
                    </div>
                    <Switch
                      id="emailNotification"
                      checked={notifications.emailNotification}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailNotification: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <Label htmlFor="smsNotification">SMS</Label>
                    </div>
                    <Switch
                      id="smsNotification"
                      checked={notifications.smsNotification}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, smsNotification: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label htmlFor="pushNotification">Push Bildirimi</Label>
                    </div>
                    <Switch
                      id="pushNotification"
                      checked={notifications.pushNotification}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, pushNotification: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving ? (
                  <>Kaydediliyor...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Güvenlik Ayarları */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Şifre Değiştir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleChangePassword} 
                disabled={saving || !passwords.currentPassword || !passwords.newPassword}
              >
                {saving ? (
                  <>Güncelleniyor...</>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Şifreyi Güncelle
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Tehlikeli Alan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Hesap Silme</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Hesabınızı kalıcı olarak silmek istiyorsanız bu işlemi gerçekleştirebilirsiniz. 
                  Bu işlem geri alınamaz ve tüm verileriniz silinir.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Hesabı Sil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hesabınızı silmek istediğinizden emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu işlem geri alınamaz. Hesabınız, tüm verileriniz ve teslimat geçmişiniz kalıcı olarak silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Evet, Hesabı Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}