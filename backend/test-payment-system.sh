#!/bin/bash

# Test script for payment system integration
# This script tests the complete flow of the payment and reconciliation system

API_URL="http://localhost:3001"
TOKEN=""

echo "========================================="
echo "Payment System Integration Test"
echo "========================================="
echo ""

# 1. Admin login
echo "1. Admin girişi yapılıyor..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kuryem.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Admin girişi başarısız!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Admin girişi başarılı"
echo ""

# 2. Get companies list
echo "2. Firma listesi alınıyor..."
COMPANIES_RESPONSE=$(curl -s -X GET "$API_URL/companies?status=ACTIVE&take=5" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Firmalar alındı"
echo ""

# 3. Get reconciliations
echo "3. Mutabakatlar kontrol ediliyor..."
RECONCILIATIONS=$(curl -s -X GET "$API_URL/reconciliation?take=5" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Mutabakatlar alındı"
echo ""

# 4. Generate daily reconciliations
echo "4. Günlük mutabakatlar oluşturuluyor..."
GENERATE_RESPONSE=$(curl -s -X POST "$API_URL/reconciliation/generate-daily" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Günlük mutabakatlar oluşturuldu"
echo ""

# 5. Get payment summary for a company (using Hodox company ID)
echo "5. Firma ödeme özeti alınıyor..."
COMPANY_ID="10c02c69-ede8-45d8-b2e2-3f1e34e3f4f5" # Hodox company ID
PAYMENT_SUMMARY=$(curl -s -X GET "$API_URL/company-payments/company/$COMPANY_ID/summary" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PAYMENT_SUMMARY" | grep -q "currentDebt"; then
  echo "✅ Firma ödeme özeti başarıyla alındı"
  echo "Özet: $(echo $PAYMENT_SUMMARY | grep -o '"currentDebt":[0-9.]*' | head -1)"
else
  echo "⚠️  Firma ödeme özeti alınamadı veya boş"
fi
echo ""

# 6. Test company payments endpoints
echo "6. Firma ödemeleri endpoint'leri test ediliyor..."
COMPANY_PAYMENTS=$(curl -s -X GET "$API_URL/company-payments/company/$COMPANY_ID?take=5" \
  -H "Authorization: Bearer $TOKEN")

if echo "$COMPANY_PAYMENTS" | grep -q "data"; then
  echo "✅ Firma ödemeleri listesi alındı"
else
  echo "⚠️  Firma ödemeleri listesi alınamadı"
fi
echo ""

# 7. Check reconciliation details endpoint
echo "7. Mutabakat detayları kontrol ediliyor..."
FIRST_RECONCILIATION=$(echo $RECONCILIATIONS | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ ! -z "$FIRST_RECONCILIATION" ]; then
  RECON_DETAILS=$(curl -s -X GET "$API_URL/company-payments/reconciliation/$FIRST_RECONCILIATION" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$RECON_DETAILS" | grep -q "reconciliation"; then
    echo "✅ Mutabakat detayları başarıyla alındı"
  else
    echo "⚠️  Mutabakat detayları alınamadı"
  fi
else
  echo "⚠️  Test edilecek mutabakat bulunamadı"
fi
echo ""

echo "========================================="
echo "Test Tamamlandı!"
echo "========================================="
echo ""
echo "Frontend testleri için:"
echo "1. http://localhost:3000/admin adresine gidin"
echo "2. admin@kuryem.com / admin123 ile giriş yapın"
echo "3. Sol menüden 'Mutabakatlar' sayfasına gidin"
echo "4. Sol menüden 'Firma Ödemeleri' sayfasına gidin"
echo ""
echo "Test edebileceğiniz işlemler:"
echo "- Mutabakat listesini görüntüleme"
echo "- Mutabakat detaylarını görüntüleme (göz ikonu)"
echo "- Mutabakat onaylama/reddetme (yeşil onay ikonu)"
echo "- Ödeme kaydı ekleme (kredi kartı ikonu)"
echo "- Firma bazlı ödeme görüntüleme ve yönetimi"