import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Varsayılan admin kullanıcısı
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kuryem.com' },
    update: {},
    create: {
      email: 'admin@kuryem.com',
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Admin kullanıcı oluşturuldu:', admin.email);

  // Varsayılan sistem ayarları
  const defaultSettings = [
    { key: 'commission.rate', value: 0.15, description: 'Komisyon oranı' },
    { key: 'commission.minAmount', value: 5, description: 'Minimum komisyon tutarı' },
    { key: 'order.maxCancellationTime', value: 5, description: 'İptal süresi (dakika)' },
    { key: 'order.autoAssignRadius', value: 5, description: 'Otomatik atama yarıçapı (km)' },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Sistem ayarları oluşturuldu');

  // Hizmet bölgeleri oluştur
  const serviceAreas = [
    {
      name: 'Beylikdüzü',
      city: 'İstanbul',
      district: 'Beylikdüzü',
      boundaries: [
        { lat: 40.9802, lng: 28.6434 },
        { lat: 41.0166, lng: 28.6434 },
        { lat: 41.0166, lng: 28.7090 },
        { lat: 40.9802, lng: 28.7090 },
      ],
      basePrice: 15,
      pricePerKm: 3,
      maxDistance: 30,
      isActive: true,
      priority: 1,
    },
    {
      name: 'Avcılar',
      city: 'İstanbul',
      district: 'Avcılar',
      boundaries: [
        { lat: 40.9739, lng: 28.7090 },
        { lat: 41.0050, lng: 28.7090 },
        { lat: 41.0050, lng: 28.7650 },
        { lat: 40.9739, lng: 28.7650 },
      ],
      basePrice: 15,
      pricePerKm: 3,
      maxDistance: 25,
      isActive: true,
      priority: 1,
    },
    {
      name: 'Esenyurt',
      city: 'İstanbul',
      district: 'Esenyurt',
      boundaries: [
        { lat: 41.0166, lng: 28.6434 },
        { lat: 41.0583, lng: 28.6434 },
        { lat: 41.0583, lng: 28.7090 },
        { lat: 41.0166, lng: 28.7090 },
      ],
      basePrice: 17,
      pricePerKm: 3.5,
      maxDistance: 35,
      isActive: true,
      priority: 1,
    },
    {
      name: 'Başakşehir',
      city: 'İstanbul',
      district: 'Başakşehir',
      boundaries: [
        { lat: 41.0583, lng: 28.7650 },
        { lat: 41.1200, lng: 28.7650 },
        { lat: 41.1200, lng: 28.8500 },
        { lat: 41.0583, lng: 28.8500 },
      ],
      basePrice: 20,
      pricePerKm: 4,
      maxDistance: 40,
      isActive: true,
      priority: 1,
    },
    {
      name: 'Bakırköy',
      city: 'İstanbul',
      district: 'Bakırköy',
      boundaries: [
        { lat: 40.9594, lng: 28.7650 },
        { lat: 40.9900, lng: 28.7650 },
        { lat: 40.9900, lng: 28.8500 },
        { lat: 40.9594, lng: 28.8500 },
      ],
      basePrice: 18,
      pricePerKm: 3.5,
      maxDistance: 30,
      isActive: true,
      priority: 1,
    },
  ];

  for (const area of serviceAreas) {
    await prisma.serviceArea.upsert({
      where: { name: area.name },
      update: {},
      create: area as any,
    });
    console.log('Hizmet bölgesi oluşturuldu:', area.name);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed işlemi tamamlandı!');
  })
  .catch(async (e) => {
    console.error('Seed hatası:', e);
    await prisma.$disconnect();
    process.exit(1);
  });