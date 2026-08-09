/* ==========================================================================
   Nova Wallet — Send (full-screen push navigation)
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.send = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore, D = window.NovaData;

  let tokenId = "eth";
  let amount = "";
  let to = "";

  function open(id) {
    if (id) tokenId = id;
    const t = S.findToken(tokenId) || S.state.tokens[0];
    tokenId = t.id;
    amount = ""; to = "";

    UI.push({
      title: "Отправить",
      render: () => `<div class="push-form">${renderForm(t)}<div class="push-bottom"></div></div>`,
      onMount: (view, close) => bindForm(view, t, close)
    });
  }

  function renderForm(t) {
    const bal = t.balance;
    return `
      <div class="send-asset-pick" data-asset>
        ${UI.tokenIcon(t, "")}
        <div style="flex:1">
          <div class="nm">${t.symbol}</div>
          <div class="bal t-num">Баланс: ${UI.fmtTokenAmt(bal)} ${t.symbol}</div>
        </div>
        ${UI.icon("chevronDown")}
      </div>
      <div class="amount-field" style="position:relative">
        <input class="af-input t-num" id="sendAmt" inputmode="decimal" placeholder="0.00" />
        <button class="af-max" data-max>MAX</button>
        <div class="af-fiat t-num" id="sendFiat">${UI.fmtUSD(0)}</div>
      </div>
      <label class="field-label" style="margin-top:18px">Адрес получателя</label>
      <div class="field">
        <span class="field-ico">${UI.icon("wallet")}</span>
        <input id="sendTo" placeholder="0x… или ENS" autocomplete="off" spellcheck="false" />
        <span class="field-action" data-paste>Вставить</span>
      </div>
      <div class="list" style="margin-top:16px">
        <div class="list-row"><span class="muted">Комиссия сети</span><span class="row-trail t-num">≈ ${UI.fmtUSD(0.42)}</span></div>
        <div class="list-row"><span class="muted">Время подтверждения</span><span class="row-trail">~ 15 сек</span></div>
      </div>
      <div style="margin-top:20px">
        <button class="btn btn-primary btn-block btn-pill" data-continue disabled>Продолжить</button>
      </div>`;
  }

  function bindForm(view, t, close) {
    const input = view.querySelector("#sendAmt");
    const toInput = view.querySelector("#sendTo");
    const btn = view.querySelector("[data-continue]");
    const fiatEl = view.querySelector("#sendFiat");
    const bal = t.balance;

    function valid() {
      const a = parseFloat(amount) || 0;
      const okAddr = /^0x[a-fA-F0-9]{6,}$/i.test(to.trim()) || /\.eth$/i.test(to.trim());
      btn.disabled = !(a > 0 && a <= bal && okAddr);
    }
    function recalc() {
      const a = parseFloat(amount) || 0;
      fiatEl.textContent = UI.fmtUSD(a * t.price);
      valid();
    }

    input.addEventListener("input", (e) => {
      amount = e.target.value.replace(/[^0-9.]/g, "");
      if (amount.split(".").length > 2) amount = amount.slice(0, -1);
      e.target.value = amount; recalc();
    });
    toInput.addEventListener("input", (e) => { to = e.target.value.trim(); valid(); });

    view.querySelector("[data-max]").addEventListener("click", () => {
      amount = String(t.symbol === "ETH" ? Math.max(0, bal - 0.01) : bal);
      input.value = amount; recalc();
    });
    view.querySelector("[data-paste]").addEventListener("click", async () => {
      let text = "";
      // Пробуем нативный API буфера
      try {
        if (navigator.clipboard && window.isSecureContext) {
          text = await navigator.clipboard.readText();
        }
      } catch (e) { /* fallthrough */ }
      // Фолбек: ручной ввод через prompt (работает в Telegram WebApp)
      if (!text) {
        try {
          text = window.prompt("Вставьте адрес получателя (0x… или .eth):", "") || "";
        } catch (e) { text = ""; }
      }
      text = (text || "").trim().slice(0, 64);
      if (text) {
        to = text;
        toInput.value = to;
        valid();
        UI.toast("Адрес вставлен", "success");
      } else {
        UI.toast("Буфер пуст — введите вручную", "default");
      }
    });
    view.querySelector("[data-asset]").addEventListener("click", openAssetPicker);

    btn.addEventListener("click", () => review(view, t, close));
  }

  function openAssetPicker() {
    const items = S.state.tokens.map(t => `
      <div class="tp-row" data-pick="${t.id}">
        ${UI.tokenIcon(t, "sm")}
        <div><div style="font-weight:650">${t.symbol}</div><div class="t-footnote">${t.name}</div></div>
        <div class="tp-amt t-num">${UI.fmtTokenAmt(t.balance)}</div>
      </div>`).join("");
    UI.sheet({
      title: "Выбрать актив",
      body: `<div class="token-picker">${items}</div>`,
      onMount: (el) => {
        el.querySelectorAll("[data-pick]").forEach(r => r.addEventListener("click", () => {
          tokenId = r.getAttribute("data-pick");
          UI.closeSheet();
          UI.closePush();
          setTimeout(open, 340);
        }));
      }
    });
  }

  function review(view, t, close) {
    const a = parseFloat(amount) || 0;
    if (a <= 0 || a > t.balance) { UI.toast("Недостаточно средств", "error"); return; }
    const dest = to.trim();
    const body = view.querySelector(".push-body");
    body.innerHTML = `
      <div class="push-form">
        <div style="text-align:center;padding:20px 0">
          ${UI.tokenIcon(t, "lg")}
          <div class="t-num" style="font-size:34px;font-weight:800;margin-top:12px">${UI.fmtTokenAmt(a)} <span class="muted" style="font-weight:700">${t.symbol}</span></div>
          <div class="t-subhead t-num" style="margin-top:4px">${UI.fmtUSD(a * t.price)}</div>
        </div>
        <div class="send-review">
          <div class="r-row"><span class="k">От</span><span class="v">${D.WALLET.ens}</span></div>
          <div class="r-row"><span class="k">Кому</span><span class="v t-mono">${UI.shortAddr(dest,8,6)}</span></div>
          <div class="r-row"><span class="k">Комиссия сети</span><span class="v t-num">${UI.fmtUSD(0.42)}</span></div>
          <div class="r-row"><span class="k">Итого</span><span class="v t-num">${UI.fmtUSD(a*t.price + 0.42)}</span></div>
        </div>
        <div class="push-bottom">
          <div class="flex gap-3">
            <button class="btn btn-secondary grow btn-pill" data-back-form>Назад</button>
            <button class="btn btn-primary grow btn-pill" data-confirm>Отправить</button>
          </div>
        </div>
      </div>`;

    body.querySelector("[data-back-form]").addEventListener("click", () => {
      const t2 = S.findToken(tokenId);
      body.innerHTML = `<div class="push-form">${renderForm(t2)}<div class="push-bottom"></div></div>`;
      bindForm(view, t2, close);
    });
    body.querySelector("[data-confirm]").addEventListener("click", () => {
      // состояние загрузки
      body.innerHTML = `<div class="sheet-state"><div class="spinner lg" style="margin:40px auto 16px"></div><div class="ss-sub">Отправка транзакции…</div></div>`;
      setTimeout(() => {
        S.applySend(tokenId, a, 0.42);
        S.addTx({
          type: "send", token: t.symbol, amount: a, fiat: a * t.price,
          time: "Сегодня, " + UI.fmtTimeHM(), to: dest
        });
        showSuccess(view, a, t, dest, close);
      }, 1500);
    });
  }

  function showSuccess(view, a, t, dest, close) {
    const body = view.querySelector(".push-body");
    body.innerHTML = `
      <div class="push-form">
        <div class="sheet-state" style="padding-top:60px">
          <div class="success-ring">${UI.icon("check")}</div>
          <div class="ss-title">Отправлено</div>
          <div class="ss-amount t-num">${UI.fmtTokenAmt(a)} <span class="cur">${t.symbol}</span></div>
          <div class="ss-sub">→ ${UI.shortAddr(dest,8,6)}</div>
          <div class="push-bottom">
            <button class="btn btn-secondary btn-block btn-pill" data-done>Готово</button>
          </div>
        </div>
      </div>`;
    body.querySelector("[data-done]").addEventListener("click", close);
    UI.toast("Перевод отправлен", "success");
  }

  return { open };
})();
