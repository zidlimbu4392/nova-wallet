/* ==========================================================================
   Nova Wallet — App (роутер, навигация, инициализация)
   ========================================================================== */

window.NovaApp = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore;
  const Screens = window.NovaScreens;

  // Конфиг нижней навигации (3 вкладки)
  const TABS = [
    { id: "dashboard", label: "Кошелёк",  icon: "assets/icons/wallet.svg"   },
    { id: "nft",       label: "NFT",      icon: "assets/icons/gem.svg"      },
    { id: "staking",   label: "Earn",     icon: "assets/icons/earnings.svg" }
  ];

  const appEl = () => document.getElementById("app");
  const tabEl = () => document.getElementById("tabbar");

  let pendingRerender = false;
  let isOverlayOpen = () =>
    document.getElementById("sheetHost").classList.contains("open") ||
    document.getElementById("pushHost").classList.contains("open");

  /* ---------- Рендер нижней навигации ---------- */
  function renderTabbar() {
    const cur = S.state.screen;
    tabEl().innerHTML = TABS.map(t => `
      <button class="tab ${t.id === cur ? "active" : ""}" data-tab="${t.id}" aria-label="${t.label}">
        <img class="tab-ico" src="${t.icon}" alt="" />
        <span class="tab-label">${t.label}</span>
      </button>`).join("");
    tabEl().querySelectorAll("[data-tab]").forEach(b => {
      b.addEventListener("click", () => S.setScreen(b.getAttribute("data-tab")));
    });
  }

  /* ---------- Рендер текущего экрана ---------- */
  function renderScreen() {
    const name = S.state.screen;
    const scr = Screens[name];
    const root = appEl();
    if (!scr) { root.innerHTML = "<div class='state'>Экран не найден</div>"; return; }
    // плавный переход: гасим, рендерим, проявляем
    root.style.opacity = "0";
    root.style.transform = "translateY(6px)";
    root.style.transition = "opacity .28s var(--ease-out), transform .28s var(--ease-out)";
    root.innerHTML = scr.render();
    // сброс скролла
    root.scrollTop = 0;
    if (scr.mount) {
      try { scr.mount(root); } catch (e) { console.error("mount error", name, e); }
    }
    requestAnimationFrame(() => {
      root.style.opacity = "1";
      root.style.transform = "translateY(0)";
    });
  }

  function rerender() {
    renderTabbar();
    renderScreen();
  }

  /* ---------- Подписка на изменения состояния ---------- */
  S.subscribe(() => {
    if (isOverlayOpen()) {
      pendingRerender = true;
    } else {
      rerender();
    }
  });

  document.addEventListener("nova:sheetclosed", checkRerender);
  document.addEventListener("nova:pushclosed", checkRerender);

  function checkRerender() {
    if (pendingRerender && !isOverlayOpen()) {
      pendingRerender = false;
      rerender();
    }
  }

  /* ---------- Статус-бар: часы ---------- */
  function updateClock() {
    const el = document.getElementById("statusTime");
    if (el) el.textContent = UI.fmtTimeHM();
  }

  /* ---------- Запуск ---------- */
  function init() {
    initTelegram();
    renderTabbar();
    renderScreen();
    updateClock();
    setInterval(updateClock, 1000 * 20);
  }

  /* ---------- Telegram Mini App ---------- */
  function initTelegram() {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor("#F2F2F7");
      if (tg.setBackgroundColor) tg.setBackgroundColor("#F2F2F7");
      if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
    } catch (e) { console.warn("TG init", e); }
    document.body.classList.add("tg");
    // safe area снизу — чтобы плавающий таббар не прилипал к краю ТГ
    const sa = tg.safeAreaInset;
    if (sa && sa.bottom) {
      document.documentElement.style.setProperty("--tg-safe-bottom", sa.bottom + "px");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { rerender, TABS };
})();
