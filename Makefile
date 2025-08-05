.PHONY: help install dev start stop clean build test migrate seed

# Varsayılan hedef
help:
	@echo "Kurye Operasyon Sistemi - Komutlar"
	@echo ""
	@echo "  make install     - Tüm bağımlılıkları yükle"
	@echo "  make dev         - Development ortamını başlat"
	@echo "  make start       - Production ortamını başlat"
	@echo "  make stop        - Tüm servisleri durdur"
	@echo "  make clean       - Container'ları ve volume'ları temizle"
	@echo "  make build       - Docker image'larını build et"
	@echo "  make test        - Testleri çalıştır"
	@echo "  make migrate     - Veritabanı migration'larını çalıştır"
	@echo "  make seed        - Veritabanına örnek veri ekle"
	@echo "  make logs        - Docker loglarını göster"
	@echo "  make ps          - Çalışan servisleri göster"

# Bağımlılıkları yükle
install:
	@echo "Backend bağımlılıkları yükleniyor..."
	cd backend && npm install
	@echo "Frontend bağımlılıkları yükleniyor..."
	cd frontend && npm install
	@echo "Environment dosyaları oluşturuluyor..."
	cp -n .env.example .env || true
	cp -n backend/.env.example backend/.env || true
	cp -n frontend/.env.example frontend/.env || true
	@echo "Kurulum tamamlandı!"

# Development ortamını başlat
dev:
	@echo "Development servisleri başlatılıyor..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Veritabanı hazır olması bekleniyor..."
	sleep 5
	@echo "Migration'lar çalıştırılıyor..."
	cd backend && npx prisma migrate dev --name init || true
	cd backend && npx prisma generate
	@echo ""
	@echo "Servisler hazır!"
	@echo "Backend'i başlatmak için: cd backend && npm run start:dev"
	@echo "Frontend'i başlatmak için: cd frontend && npm run dev"
	@echo "pgAdmin: http://localhost:5050"

# Production ortamını başlat
start:
	@echo "Production servisleri başlatılıyor..."
	docker-compose up -d
	@echo "Servisler başlatıldı!"
	@echo "Frontend: http://localhost:3001"
	@echo "Backend: http://localhost:3000"

# Servisleri durdur
stop:
	@echo "Servisler durduruluyor..."
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	@echo "Servisler durduruldu!"

# Temizlik
clean:
	@echo "Container'lar ve volume'lar temizleniyor..."
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	@echo "Temizlik tamamlandı!"

# Docker image'larını build et
build:
	@echo "Docker image'ları build ediliyor..."
	docker-compose build --no-cache
	@echo "Build tamamlandı!"

# Testleri çalıştır
test:
	@echo "Backend testleri çalıştırılıyor..."
	cd backend && npm test
	@echo "Testler tamamlandı!"

# Migration'ları çalıştır
migrate:
	@echo "Migration'lar çalıştırılıyor..."
	cd backend && npx prisma migrate dev
	cd backend && npx prisma generate
	@echo "Migration'lar tamamlandı!"

# Seed data ekle
seed:
	@echo "Seed data ekleniyor..."
	cd backend && npx prisma db seed
	@echo "Seed data eklendi!"

# Docker logları
logs:
	docker-compose logs -f

# Çalışan servisleri göster
ps:
	docker-compose ps
	docker-compose -f docker-compose.dev.yml ps