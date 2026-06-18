#!/usr/bin/env bash
# VPS güncelleme scripti — kod değişince yeni sürümü yayına alır.
# Kullanım (sunucuda, proje kökünde):  bash deploy/deploy.sh
set -euo pipefail

APP_NAME="anlasmali-evlilik"

echo "==> Son kod çekiliyor (git pull)..."
git pull --ff-only

echo "==> Bağımlılıklar (npm ci) — postinstall prisma generate çalışır..."
npm ci

# Şema senkronu (VERİYİ SİLMEZ; --force-reset YOK). Yeni tablo/kolon varsa ekler.
echo "==> prisma db push (şema senkronu, veri silinmez)..."
npx prisma db push

echo "==> Production build..."
npm run build

echo "==> PM2 yeniden başlatılıyor..."
pm2 restart "$APP_NAME" --update-env
pm2 save

echo "==> Bitti. Durum:"
pm2 status "$APP_NAME"
