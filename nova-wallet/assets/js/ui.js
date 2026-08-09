/* ==========================================================================
   Nova Wallet — UI helpers (формат, иконки, toast, sheet, sparkline, QR)
   ========================================================================== */

window.NovaUI = (function () {
  "use strict";

  /* ---------------- ФОРМАТИРОВАНИЕ ---------------- */
  function fmtUSD(n, opts = {}) {
    const { max = 2, sign = false, compact = false } = opts;
    if (n == null || isNaN(n)) n = 0;
    const v = Math.abs(n).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: max
    });
    const prefix = sign && n > 0 ? "+" : (n < 0 ? "−" : "");
    return prefix + (compact && Math.abs(n) >= 1000
      ? "$" + (Math.abs(n) / 1000).toFixed(1) + "K"
      : "$" + v);
  }

  function fmtNum(n, max = 4) {
    if (n == null) return "0";
    return (+n).toLocaleString("en-US", { maximumFractionDigits: max });
  }

  function fmtTokenAmt(n) {
    if (n == null) return "0";
    const abs = Math.abs(n);
    let max = 4;
    if (abs >= 1000) max = 2;
    else if (abs >= 1) max = 4;
    else if (abs > 0) max = 6;
    return (+n).toLocaleString("en-US", { maximumFractionDigits: max });
  }

  function fmtPct(n) {
    const s = n > 0 ? "+" : (n < 0 ? "−" : "");
    return s + Math.abs(n).toFixed(2) + "%";
  }

  function shortAddr(a, left = 6, right = 4) {
    if (!a) return "";
    if (a.length <= left + right + 2) return a;
    return a.slice(0, left) + "…" + a.slice(-right);
  }

  function fmtTimeHM() {
    const d = new Date();
    return d.getHours() + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  /* ---------------- ИКОНКИ (feather-style, 24x24, stroke) ---------------- */
  const I = {
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3H5a2 2 0 0 1-2-2V9"/><circle cx="16" cy="13" r="1.3" fill="currentColor" stroke="none"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-5-5L5 21"/></svg>',
    trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 7-7"/><path d="M17 7h4v4"/></svg>',
    coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><ellipse cx="16" cy="14" rx="5" ry="2.6"/><path d="M11 14.2V17c0 1.5 2.2 2.7 5 2.7s5-1.2 5-2.7v-3"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>',
    arrowDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>',
    arrowsLR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/></svg>',
    switch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v12a3 3 0 0 0 3 3h7"/><path d="m14 16 3 3 3-3"/><path d="M17 20V8a3 3 0 0 0-3-3H7"/><path d="m10 8-3-3-3 3"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17l9-10"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M4 12h16"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4"/><path d="M8 8l4-4 4 4"/><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10.5 20a2 2 0 0 0 3 0"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    qrcode: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h4v-4"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0 0 12 0c0-5-6-11-6-11z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>'
  };

  function icon(name) {
    const svg = I[name] || "";
    if (!svg) return "";
    // Добавляем явный размер, чтобы SVG не разъезжался
    if (svg.indexOf('width=') === -1) {
      return svg.replace('<svg ', '<svg width="24" height="24" ');
    }
    return svg;
  }

  /* ---------------- ИКОНКА ТОКЕНА ---------------- */
  function tokenIcon(t, size = "") {
    const cls = "token-ico" + (size ? " " + size : "");
    // Поддержка градиента "c1→c2"
    if (t.icon) { const sz = size === "lg" ? "56" : size === "sm" ? "30" : "40"; return `<img class="${cls}" src="${t.icon}" alt="${t.symbol}" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover" />`; } if (t.icon) { const sz = size === "lg" ? "56" : size === "sm" ? "30" : "40"; return `<img class="${cls}" src="${t.icon}" alt="${t.symbol}" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover" />`; } if (t.icon) { const sz = size === "lg" ? "56" : size === "sm" ? "30" : "40"; return `<img class="${cls}" src="${t.icon}" alt="${t.symbol}" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover" />`; } let bg = t.color;
    if (t.color && t.color.includes("→")) {
      const [a, b] = t.color.split("→");
      bg = `linear-gradient(135deg, ${a}, ${b})`;
    }
    return `<span class="${cls}" style="background:${bg}">${t.glyph}</span>`;
  }

  /* ---------------- SPARKLINE (SVG) ---------------- */
  function sparkline(values, w = 320, h = 56, color = "#0A84FF") {
    const min = Math.min(...values), max = Math.max(...values);
    const range = max - min || 1;
    const step = w / (values.length - 1);
    const pts = values.map((v, i) => [i * step, h - ((v - min) / range) * (h - 8) - 4]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = `${line} L${w} ${h} L0 ${h} Z`;
    const id = "sg" + Math.random().toString(36).slice(2, 8);
    const last = pts[pts.length - 1];
    return `
      <svg class="dash-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#${id})"/>
        <path d="${line}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
        <circle cx="${last[0]}" cy="${last[1]}" r="3.5" fill="${color}"/>
        <circle cx="${last[0]}" cy="${last[1]}" r="7" fill="${color}" fill-opacity="0.18"/>
      </svg>`;
  }

  /* ---------------- QR-КОД (детерминированный, canvas) ---------------- */
  // Генерируем правдоподобный QR-паттерн по хешу строки.
  function drawQR(canvas, text, size = 196) {
    const ctx = canvas.getContext("2d");
    const N = 33; // модулей
    const cell = size / N;
    // Простой хеш -> псевдослучайная решётка
    function hash(str, seed) {
      let h = 2166136261 ^ seed;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return (h >>> 0) / 4294967295;
    }
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#1C1C1E";
    // Данные
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const on = hash(text + "|" + x + "|" + y, x * 7 + y * 13) > 0.5;
        if (on) ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
      }
    }
    // Очистка зон под finder-квадраты
    function clearZone(x, y, n) {
      ctx.clearRect(x * cell, y * cell, n * cell, n * cell);
    }
    function finder(x, y) {
      clearZone(x, y, 7);
      ctx.fillStyle = "#1C1C1E";
      ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell);
      ctx.fillStyle = "#fff";
      ctx.fillRect((x + 1) * cell, (y + 1) * cell, 5 * cell, 5 * cell);
      ctx.fillStyle = "#1C1C1E";
      ctx.fillRect((x + 2) * cell, (y + 2) * cell, 3 * cell, 3 * cell);
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    // Очистка разделителей + timing pattern засветка
    ctx.fillStyle = "#fff";
    ctx.clearRect(7 * cell, 0, cell, 7 * cell);
    ctx.clearRect(0, 7 * cell, 7 * cell, cell);
    ctx.clearRect((N - 8) * cell, 0, cell, 7 * cell);
    ctx.clearRect((N - 7) * cell, 7 * cell, 7 * cell, cell);
    ctx.clearRect(0, (N - 8) * cell, 7 * cell, cell);
    ctx.clearRect(7 * cell, (N - 7) * cell, cell, 7 * cell);
    // alignment pattern (правый нижний уголок)
    const ax = N - 9, ay = N - 9;
    ctx.clearRect(ax * cell, ay * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = "#1C1C1E";
    ctx.fillRect(ax * cell, ay * cell, 5 * cell, 5 * cell);
    ctx.fillStyle = "#fff";
    ctx.fillRect((ax + 1) * cell, (ay + 1) * cell, 3 * cell, 3 * cell);
    ctx.fillStyle = "#1C1C1E";
    ctx.fillRect((ax + 2) * cell, (ay + 2) * cell, cell, cell);
  }

  /* ---------------- TOAST ---------------- */
  function toast(msg, type = "default") {
    const host = document.getElementById("toastHost");
    const el = document.createElement("div");
    el.className = "toast " + (type === "success" ? "success" : type === "error" ? "error" : "");
    const ico = type === "success" ? I.check : type === "error" ? I.alert : I.bell;
    el.innerHTML = `<span class="t-ico">${ico}</span><span>${msg}</span>`;
    host.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0"; el.style.transform = "translateY(-10px)";
      setTimeout(() => el.remove(), 320);
    }, 2400);
  }

  /* ---------------- SHEET (нижняя шторка) ---------------- */
  let openSheet = null;

  function closeSheet() {
    if (!openSheet) return;
    const host = document.getElementById("sheetHost");
    const sheet = openSheet;
    sheet.classList.add("closing");
    const backdrop = host.querySelector(".sheet-backdrop");
    if (backdrop) {
      backdrop.style.transition = "opacity .3s var(--ease-in-out)";
      backdrop.style.opacity = "0";
    }
    setTimeout(() => {
      host.classList.remove("open");
      host.innerHTML = "";
      openSheet = null;
      document.dispatchEvent(new CustomEvent("nova:sheetclosed"));
    }, 300);
  }

  // opts: { title, body, footer, onMount }
  function sheet(opts) {
    if (openSheet) closeSheet();
    const host = document.getElementById("sheetHost");
    host.innerHTML = "";
    const backdrop = document.createElement("div");
    backdrop.className = "sheet-backdrop";
    const sheetEl = document.createElement("div");
    sheetEl.className = "sheet";
    sheetEl.innerHTML = `
      <div class="sheet-grip"></div>
      ${opts.title ? `<div class="sheet-title">${opts.title}</div>` : ""}
      <button class="sheet-close" data-close aria-label="Закрыть">${I.close}</button>
      <div class="sheet-body" style="margin-top:10px"></div>
      ${opts.footer ? `<div class="sheet-footer" style="margin-top:16px"></div>` : ""}
    `;
    host.appendChild(backdrop);
    host.appendChild(sheetEl);
    host.classList.add("open");
    host.setAttribute("aria-hidden", "false");

    const bodyEl = sheetEl.querySelector(".sheet-body");
    if (typeof opts.body === "string") bodyEl.innerHTML = opts.body;
    else if (opts.body) bodyEl.appendChild(opts.body);

    if (opts.footer) {
      const f = sheetEl.querySelector(".sheet-footer");
      if (typeof opts.footer === "string") f.innerHTML = opts.footer;
      else f.appendChild(opts.footer);
    }

    // Закрытие
    backdrop.addEventListener("click", closeSheet);
    sheetEl.addEventListener("click", (e) => {
      const t = e.target.closest("[data-close]");
      if (t) closeSheet();
    });
    // Esc
    const onKey = (e) => { if (e.key === "Escape") { closeSheet(); document.removeEventListener("keydown", onKey); } };
    document.addEventListener("keydown", onKey);

    openSheet = sheetEl;
    if (opts.onMount) opts.onMount(sheetEl, closeSheet);
    return { el: sheetEl, close: closeSheet };
  }

  /* ---------------- PUSH (full-screen навигация справа, iOS-style) ---------------- */
  let openPush = null;
  let pushStack = [];

  function closePush() {
    if (!openPush) return;
    const view = openPush;
    // Спрятать нативную кнопку «Назад» Telegram
    if (view._useTgBack) {
      const tg = window.Telegram && window.Telegram.WebApp;
      if (tg && tg.BackButton) {
        try { tg.BackButton.offClick(view._backHandler); } catch (e) {}
        try { tg.BackButton.hide(); } catch (e) {}
      }
    }
    view.classList.add("closing");
    setTimeout(() => {
      view.remove();
      openPush = null;
      pushStack.pop();
      if (pushStack.length) {
        openPush = pushStack[pushStack.length - 1];
      } else {
        const host = document.getElementById("pushHost");
        host.classList.remove("open");
        host.innerHTML = "";
        document.dispatchEvent(new CustomEvent("nova:pushclosed"));
      }
    }, 320);
  }

  // opts: { title, render, body, right, onMount }
  function push(opts) {
    const host = document.getElementById("pushHost");
    host.classList.add("open");
    const view = document.createElement("div");
    view.className = "push-view";

    const tg = window.Telegram && window.Telegram.WebApp;
    const useTgBack = !!(tg && tg.BackButton);

    // Свою шапку показываем только когда нет нативной TG-кнопки
    const headHTML = useTgBack ? "" : `
      <div class="push-head">
        <button class="push-back" data-push-back aria-label="Назад">${I.back}</button>
        <span class="push-title">${opts.title || ""}</span>
        <span class="push-right">${opts.right || ""}</span>
      </div>`;
    view.innerHTML = headHTML;

    const bodyWrap = document.createElement("div");
    bodyWrap.className = "push-body";
    if (typeof opts.body === "string") bodyWrap.innerHTML = opts.body;
    else if (typeof opts.render === "function") bodyWrap.innerHTML = opts.render();
    else if (opts.body) bodyWrap.appendChild(opts.body);
    view.appendChild(bodyWrap);

    // Отступ сверху для TG-шапки
    if (useTgBack) {
      const sa = (tg.safeAreaInset) || { top: 0 };
      bodyWrap.style.paddingTop = (sa.top + 12) + "px";
    }

    host.appendChild(view);
    openPush = view;
    pushStack.push(view);

    let backHandler;
    if (useTgBack) {
      backHandler = () => closePush();
      try { tg.BackButton.show(); tg.BackButton.onClick(backHandler); } catch (e) {}
    } else {
      backHandler = () => closePush();
      const btn = view.querySelector("[data-push-back]");
      if (btn) btn.addEventListener("click", backHandler);
    }
    view._backHandler = backHandler;
    view._useTgBack = useTgBack;

    const onKey = (e) => { if (e.key === "Escape") { closePush(); document.removeEventListener("keydown", onKey); } };
    document.addEventListener("keydown", onKey);

    if (opts.onMount) opts.onMount(view, closePush);
    return { el: view, close: closePush };
  }

  /* ---------------- АНИМАЦИЯ ЧИСЛА (count-up) ---------------- */
  function countUp(el, to, opts = {}) {
    const { dur = 700, fmt = (v) => fmtUSD(v), start = 0 } = opts;
    const t0 = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(start + (to - start) * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------- Слушатель глобальных data-action ---------------- */
  // data-action="close" внутри шторки -> закрыть
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-close]");
    if (el) closeSheet();
  });

  return {
    fmtUSD, fmtNum, fmtTokenAmt, fmtPct, shortAddr, fmtTimeHM,
    icon, I, tokenIcon, sparkline, drawQR,
    toast, sheet, closeSheet, push, closePush, countUp
  };
})();
