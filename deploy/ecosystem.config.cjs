// PM2 yapılandırması — Next.js production sunucusu (next start)
// Kullanım:  pm2 start ecosystem.config.cjs && pm2 save
//
// Uygulama yalnızca 127.0.0.1:3000'de dinler; dışarıya açılması reverse proxy
// (OpenLiteSpeed / nginx) ile yapılır. .env dosyası proje kökünde olmalı —
// Next.js production'da .env dosyalarını otomatik yükler.

module.exports = {
  apps: [
    {
      name: "anlasmali-evlilik",
      cwd: "/home/anlasmalievlilik.com/app", // kendi yolunu yaz
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
