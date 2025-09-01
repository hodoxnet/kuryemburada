'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Search,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    status: string;
  };
  courier?: {
    id: string;
    fullName: string;
    status: string;
  };
}

interface UserFormData {
  email: string;
  role: string;
  status: string;
  password?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  // Selected user for operations
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users?take=100');
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      toast.error('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      await apiClient.post('/users', formData);
      toast.success('Kullanıcı başarıyla oluşturuldu');
      setCreateDialog(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Kullanıcı oluşturulamadı:', error);
      toast.error(error.response?.data?.message || 'Kullanıcı oluşturulamadı');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.email) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      const updateData = { ...formData };
      delete updateData.password; // Şifre güncelleme ayrı endpoint'te
      
      await apiClient.patch(`/users/${selectedUser.id}`, updateData);
      toast.success('Kullanıcı başarıyla güncellendi');
      setEditDialog(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Kullanıcı güncellenemedi:', error);
      toast.error(error.response?.data?.message || 'Kullanıcı güncellenemedi');
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      await apiClient.post(`/users/${selectedUser.id}/reset-password`, {
        newPassword: passwordForm.newPassword,
      });
      toast.success('Şifre başarıyla sıfırlandı');
      setPasswordDialog(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Şifre sıfırlanamadı:', error);
      toast.error(error.response?.data?.message || 'Şifre sıfırlanamadı');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.delete(`/users/${selectedUser.id}`);
      toast.success('Kullanıcı başarıyla silindi');
      setDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Kullanıcı silinemedi:', error);
      toast.error(error.response?.data?.message || 'Kullanıcı silinemedi');
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setEditDialog(true);
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordDialog(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    });
    setSelectedUser(null);
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      SUPER_ADMIN: 'Süper Admin',
      COMPANY: 'Firma',
      COURIER: 'Kurye',
    };
    return roles[role] || role;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-600">Aktif</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Pasif</Badge>;
      case 'BLOCKED':
        return <Badge variant="destructive">Bloklu</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600">Bekliyor</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.company?.name) return user.company.name;
    if (user.courier?.fullName) return user.courier.fullName;
    return user.email;
  };

  const filteredUsers = users.filter(user =>
    getUserDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600 mt-2">Sistem kullanıcılarını yönetin</p>
        </div>
        <Button onClick={() => setCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kullanıcı
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Kullanıcılar ({filteredUsers.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Oluşturma Tarihi</TableHead>
                <TableHead>Son Güncelleme</TableHead>
                <TableHead className="text-center">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {searchTerm ? 'Arama kriterine uygun kullanıcı bulunamadı' : 'Henüz kullanıcı bulunmuyor'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{getUserDisplayName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.company && <Badge variant="outline">Firma</Badge>}
                      {user.courier && <Badge variant="outline">Kurye</Badge>}
                      {!user.company && !user.courier && <Badge variant="secondary">Admin</Badge>}
                    </TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.updatedAt), 'dd MMM yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPasswordDialog(user)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kullanıcı Oluşturma Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
            <DialogDescription>
              Sisteme yeni bir kullanıcı ekleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-posta*
              </Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol*
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Süper Admin</SelectItem>
                  <SelectItem value="COMPANY">Firma</SelectItem>
                  <SelectItem value="COURIER">Kurye</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Durum*
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Pasif</SelectItem>
                  <SelectItem value="PENDING">Bekliyor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Şifre*
              </Label>
              <Input
                id="password"
                type="password"
                className="col-span-3"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="En az 6 karakter"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateUser}>
              Kullanıcı Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kullanıcı Düzenleme Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogDescription>
              {selectedUser && getUserDisplayName(selectedUser)} kullanıcısını düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editEmail" className="text-right">
                E-posta*
              </Label>
              <Input
                id="editEmail"
                type="email"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editRole" className="text-right">
                Rol*
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Süper Admin</SelectItem>
                  <SelectItem value="COMPANY">Firma</SelectItem>
                  <SelectItem value="COURIER">Kurye</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editStatus" className="text-right">
                Durum*
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Pasif</SelectItem>
                  <SelectItem value="PENDING">Bekliyor</SelectItem>
                  <SelectItem value="BLOCKED">Bloklu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleEditUser}>
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Şifre Sıfırlama Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Şifre Sıfırla</DialogTitle>
            <DialogDescription>
              {selectedUser && getUserDisplayName(selectedUser)} kullanıcısının şifresini sıfırlayın
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newPassword" className="text-right">
                Yeni Şifre*
              </Label>
              <Input
                id="newPassword"
                type="password"
                className="col-span-3"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="En az 6 karakter"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword" className="text-right">
                Şifre Tekrar*
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className="col-span-3"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Şifreyi tekrar girin"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleChangePassword}>
              Şifreyi Sıfırla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedUser && getUserDisplayName(selectedUser)}</strong> kullanıcısını silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}