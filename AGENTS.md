# Repository Guidelines

## Proje Yapısı ve Modül Organizasyonu
Monorepo iki ana klasörden oluşur: `backend/` (NestJS 11 + Prisma 6) ve `frontend/` (Next.js 15 App Router). Backend modülleri `src/` altında `auth`, `company`, `courier`, `orders`, `payments` vb. alt klasörlere ayrılır; paylaşılan yardımcılar `common/` içindedir. Prisma şeması `backend/prisma/schema.prisma`, migration’lar `backend/prisma/migrations/`, seed script’i `backend/prisma/seed.ts` dosyalarındadır. Frontend tarafında sayfalar `frontend/src/app/`, paylaşılan bileşenler `frontend/src/components/`, Zustand store’ları `frontend/src/stores/` yollarında tutulur.

## Build, Test ve Geliştirme Komutları
Backend’de `npm install`, ardından `npm run prisma:generate` ve gerekirse `npm run prisma:migrate` çalıştırın. Geliştirme için `npm run start:dev` (port 3001), prod testi için `npm run start:prod`. Lint/format için `npm run lint` ve `npm run format`. Testler `npm run test`, coverage `npm run test:cov`, uçtan uca senaryolar `npm run test:e2e`. Frontend için `npm install`, ardından `npm run dev` (port 3000), dağıtım öncesi `npm run build` ve `npm run start`. `npm run lint` ile Next lint kuralları denetlenir.

## Kodlama Stili ve İsimlendirme
TypeScript dosyalarında 2 boşluk veya varsayılan Prettier biçimlendirmesi kullanılır; `npm run format` otomatik stil sağlar. Dosya ve klasör adları kebab-case (`courier-dashboard`), sınıflar PascalCase (`CourierService`), fonksiyonlar camelCase (`fetchCourierOrders`). Nest controller/service dosyaları `*.controller.ts`, `*.service.ts` kalıbını takip eder; React bileşenleri `.tsx` uzantılıdır. ESLint konfigürasyonu (backend ve frontend) import sırası, kullanılmayan değişken ve tip güvenliğini zorunlu kılar.

## Test Rehberi
Backend testleri Jest 30 ile yazılır; unit dosyaları `src/**\/*.spec.ts`, e2e senaryoları `backend/test/**/*.e2e-spec.ts` dizinindedir. Yeni özelliklerde en az bir unit testi beklenir; kritik akışlarda coverage raporunu (`npm run test:cov`) 80%+ tutmaya çalışın. Test isimlerinde davranış odaklı bir dil kullanın (`should return courier orders when status is ACTIVE`). Frontend için resmi test seti yok; ancak karmaşık UI mantığı eklenirse React Testing Library veya Playwright önerilir.

## Commit ve Pull Request Kuralları
Geçmişte `docs: ...` gibi Conventional Commits önekleri kullanıldı; aynı formatta (`feat:`, `fix:`, `chore:`, `refactor:`) kısa özetler yazın ve İngilizce tercih edin. PR’larda kapsamlı açıklama, ilgili issue bağlantısı ve gerekliyse ekran görüntüsü veya API örneği ekleyin. Backend + frontend değişiklikleri tek PR’da ise her bölümü ayrı başlıklar altında açıklayın. Yeni migration, seed veya env değişikliklerini “Notlar” bölümünde listeleyin.

## Güvenlik ve Konfigürasyon İpuçları
Özel env değerlerini `.env` ve `.env.local` dosyalarına koyun, örnekleri `backend/.env.example` ve README’deki değişkenlerle senkron tutun. JWT gizleri, Google Maps anahtarı ve Redis bilgileri commit edilmemelidir. Dosya yüklemeleri `backend/uploads/` klasörüne iner; büyük dosyalar için `MAX_FILE_SIZE`’ı güncelleyin. Cache (Redis) ve logging (Winston) ayarlarını değiştirdiğinizde dökümantasyon güncelleyin.

## Agent ve Context Kullanımı
Doküman ve API referanslarını güncellemek için Context 7 MCP üzerinden NestJS, Prisma ve Redis kaynaklarına bakın. Kurye süreçleri, başvuru onayları veya kurye-dashboard geliştirmelerinde `kurye-operasyon-uzmani`; firma sipariş/ödeme akışlarında `firma-operasyon-yoneticisi` ajanını devreye alın. İlgili ajanların çıktıları PR açıklamasına kısa özet olarak eklenmelidir.
