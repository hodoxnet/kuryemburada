# Repository Guidelines

Bu depo, NestJS (backend) ve Next.js (frontend) ile geliştirilen kurye operasyon yönetim sistemidir. Tüm iletişim ve dokümantasyon Türkçe olmalıdır.

## Project Structure & Module Organization
- Backend: `backend/src/` (modüller: `auth/`, `company/`, `courier/`, `orders/`, vb.), Prisma: `backend/prisma/` (schema, migrations, seed), testler: `backend/test/`.
- Frontend: `frontend/src/` (App Router `app/`, `components/`, `stores/`, `lib/`, `contexts/`), statikler: `frontend/public/`.
- Varlıklar: Yüklemeler `backend/uploads/`, .env örnekleri: `backend/.env.example`.

## Build, Test, and Development Commands
- Backend:
  - `cd backend && npm install` — bağımlılıkları kur.
  - `npm run start:dev` — geliştirme (3001).  
  - `npm run prisma:migrate` / `prisma:generate` / `prisma:seed` — veritabanı akışı.
  - `npm run test` / `test:e2e` / `test:cov` — Jest testleri ve coverage.
- Frontend:
  - `cd frontend && npm install` — bağımlılıkları kur.
  - `npm run dev` — geliştirme (3000).  
  - `npm run build && npm run start` — prod derleme ve sunum.
  - `npm run lint` — ESLint kontrolü.

## Coding Style & Naming Conventions
- Dil: TypeScript. Girinti: 2 boşluk.  
- Stil: ESLint + Prettier (otomatik format).  
- İsimlendirme: `PascalCase` (class/DTO), `camelCase` (değişken/fonksiyon), `SCREAMING_SNAKE_CASE` (env).  
- Dosya/klasör: modül odaklı; controller/service/DTO dosyaları ilgili modül altında. Örn: `backend/src/orders/orders.controller.ts`.

## Testing Guidelines
- Backend: Jest v30. Unit: `src/**/*.spec.ts`, E2E: `test/**/*.e2e-spec.ts`.  
  Çalıştırma: `npm run test`, `npm run test:e2e`, coverage: `npm run test:cov`.
- Frontend: Test konfigürasyonu henüz yok; eklenmeden önce tartışın.

## Commit & Pull Request Guidelines
- Commit: Conventional Commits önerilir. Örn: `feat(orders): kurye atama kuralı`.  
- PR: Açıklama, ilgili issue/tahta linki, backend/ frontend etki alanı, gerekli ise ekran görüntüsü, test ve lint yeşil, dokümantasyon güncel.

## Security & Configuration Tips
- Sırlar commitlenmez; `.env` kullanın. Örn: `backend/.env` (JWT, DB, Redis).  
- RBAC: `@Roles` ve `JwtAuthGuard` zorunlu alanlarda kullanılmalı.  
- DB: Şema değişince `prisma:migrate` → `prisma:generate` → `seed` akışını izleyin.

## Agent-Specific Instructions
- Modül uzmanları: `kurye-operasyon-uzmani` (kurye akışları), `firma-operasyon-yoneticisi` (firma akışları).  
- Dokümantasyon: Güncel API ve best practice için Context 7 MCP kullanın.
