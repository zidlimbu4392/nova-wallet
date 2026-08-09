# Nova Wallet — Telegram Mini App

Криптокошелёк в стиле iOS/Telegram минимализма. Статика (HTML/CSS/JS без сборки),
раздаётся через nginx в Docker.

## Быстрый старт

```bash
docker compose up -d --build
```

Откроется на порту **8080**: http://<IP-сервера>:8080

Остановить:
```bash
docker compose down
```

Пересобрать после правок:
```bash
docker compose up -d --build
```

Посмотреть логи:
```bash
docker compose logs -f
```

---

## Как сделать Telegram Mini App

Telegram требует **HTTPS** домен. План:

### 1. Подготовьте домен

Купите/настройте домен (например `nova-wallet.example.com`) и направьте A-запись
на IP вашего сервера.

### 2. Получите HTTPS

**Вариант А — Cloudflare (проще всего):**
1. Создайте аккаунт Cloudflare, добавьте домен
2. В DNS включите оранжевое облако (proxy) для поддомена
3. В SSL/TLS поставьте "Flexible" или "Full"
4. Cloudflare даст HTTPS автоматически — больше ничего делать не нужно

**Вариант Б — Caddy как reverse proxy (auto-Let's Encrypt):**

Создайте рядом `Caddyfile`:
```
nova-wallet.example.com {
    reverse_proxy localhost:8080
}
```
Запустите Caddy (тоже можно в docker) — он сам получит сертификат.

**Вариант В — Nginx + Certbot:**
Погуглите "nginx certbot docker" — классический мануал на 5 минут.

### 3. Привяжите домен к боту в Telegram

1. Откройте [@BotFather](https://t.me/BotFather)
2. `/newbot` → создайте бота (или выберите существующего через `/mybots`)
3. Зайдите в `Bot Settings` → `Menu Button` → `Configure menu button`
   (или `Web App` → `Configure Web App`)
4. Укажите URL: `https://nova-wallet.example.com`
5. Готово — кнопка меню в боте откроет ваш мини-апп

### 4. Откройте мини-апп

В Telegram зайдите в вашего бота → нажмите кнопку меню (или `/start`)
→ мини-апп откроется в WebApp.

При открытии скрипт автоматически:
- вызовет `tg.ready()` и `tg.expand()`
- подставит safe-area для плавающего таббара
- задаст цвет шапки/фона

---

## Как проверить локально (без Telegram)

Просто откройте `index.html` в браузере — приложение работает и без Telegram
(рамка iPhone на десктопе, полный экран на мобиле).

## Структура

```
.
├── docker-compose.yml      # оркестрация
├── Dockerfile              # образ nginx:alpine + статики
├── nginx.conf              # конфиг: gzip, кеш, SPA
├── .dockerignore
├── index.html              # точка входа
└── assets/
    ├── styles/             # base / components / screens
    └── js/                 # data / store / ui / screens / app
```

## Технологии

- Чистый HTML/CSS/JS (без сборки, без зависимостей)
- Telegram WebApp SDK (подключается через CDN)
- Анимированный фон на canvas
- iOS-style дизайн-система
- Размер: ~110 KB всего
