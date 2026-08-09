# Security audit — Nova Wallet

> **Status: security audit has NOT been performed.** This document is the
> first honest pass over the code. Do not run this app with real funds or real
> user data until the HIGH findings are closed.

Date: 2026-08-09 · Source: repository code (index.html, backend/src, prisma).

---

## Summary

| # | Зона | Статус | Серьёзность |
|---|------|--------|-------------|
| 1 | Админ-дашборд `/admin` без документированного ACL/пароля | НЕ проверено/НЕ закрыто | HIGH |
| 2 | Экономика симулирована (нет реальных платежей/ончейна) | by design | HIGH (ожидания) |
| 3 | `/api/cron/prices` без авторизации/рейт-лимита | НЕ проверено | MEDIUM |
| 4 | Нет тестов (backend, Prisma, фронт) | НЕ закрыто | MEDIUM |
| 5 | Секреты: `.env` gitignored, нет ротации/CI-secrets | НЕ закрыто | MEDIUM |
| 6 | Репо-гигиена: legacy tarballs, был .deb-бинарник | Частично (убрано) | LOW |
| 7 | Нет мониторинга/структурированных логов | НЕ закрыто | LOW |

---

## Finding 1 — HIGH: админ-панель `/admin` без видимого ACL

**Где:** `backend/src/app` — маршрут/страница `/admin`.

В репозитории не видно пароля/ролей для `/admin`. Если эндпоинт доступен
публично без проверки — любой с URL получит данные пользователей/транзакций.

**Фикс:**
1. Добавить явную аутентификацию `/admin` (пароль + локдаун, или роль).
2. Проверить, что `/api/*` не отдаёт данные без валидного initData.
3. Аудит-лог всех admin-действий.

---

## Finding 2 — HIGH (ожидания): деньги симулированы

Send/swap/stake и балансы — **симуляция**: нет реального платёжного шлюза,
ончейн-сеттлмента, KYC или кастоди. Если планируются реальные деньги —
это полностью новая система (платёжный провайдер, крипто-подпись, escrow).

---

## Finding 3 — MEDIUM: `/api/cron/prices` и публичные GET без защиты

**Где:** `backend/src/app` — эндпоинты `/api/wallet`, `/api/token/:id`,
`/api/cron/prices`.

Не проверено, что cron-эндпоинт не публичный. Если он открыт — флуд запросами
к Binance и лишняя нагрузка.

**Фикс:** секретный заголовок для cron (или internal-only), рейт-лимиты на
все публичные GET.

---

## Finding 4 — MEDIUM: нет тестов

**Где:** весь репозиторий (0 тестов).

**Фикс:** тесты на initData auth, Zod-схемы, Prisma-запросы, cron-обновление
цен, admin-доступ.

---

## Finding 5 — MEDIUM: секреты

- `.env` (DATABASE_URL, TELEGRAM_BOT_TOKEN) — gitignored, но нет ротации и
  нет CI-secrets.
- Нет least-privilege DB-юзера для приложения.

**Фикс:** отдельный DB-юзер с ограниченными правами; секреты только в
CI-secrets/env; ротация токена бота.

---

## Finding 6 — LOW: гигиена репозитория

- Бинарник `cloudflared-linux-amd64.deb` **удалён** из git.
- Остались десятки `nova-wallet-vNN-*.tar.gz` (история версий) — распухают
  репозиторий; вынести в отдельный release-архив.

---

## Finding 7 — LOW: мониторинг

Только stdout/stderr. Нет метрик, алертов, структурированных логов.

---

## Что держит (проверено по коду)

| Контроль | Где | Статус |
|---|---|---|
| initData HMAC-SHA256 валидация | `backend/src/lib/telegram-auth.ts` | ✓ |
| Zod-валидация POST (send/swap/stake) | `backend/src/lib/schemas.ts` | ✓ |
| Prisma ORM (параметризованные запросы) | `backend/src/lib/prisma.ts` | ✓ |
| Auto-регистрация новых пользователей | telegram-auth | ✓ |
| `.env` в .gitignore | `.gitignore` | ✓ |

---

## После закрытия (верификация)

1. `/admin` без валидных кредов → 403/401; с валидными → работает.
2. `/api/cron/prices` без секретного заголовка → 403.
3. Все POST проходят Zod-схемы (невалидный body → 422).
4. Юнит+интеграционные тесты зелёные; audit-лог admin-действий заполняется.
