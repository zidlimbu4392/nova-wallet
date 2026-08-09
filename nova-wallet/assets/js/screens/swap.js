/* ==========================================================================
   Nova Wallet — Swap screen
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.swap = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore, D = window.NovaData;

  // Локальное состояние экрана
  let pay = "eth", recv = "usdt", payAmt = "";
  let slippage = 0.5;

  function tk(id) { return S.findToken(id); }
  function price(id) { const t = tk(id); return t ? t.price : 0; }
  function rate() { return price(pay) / (price(recv) || 1); }
  function recvAmt() {
    const a = parseFloat(payAmt) || 0;
    if (!a) return 0;
    return a * rate() * (1 - slippage / 100);
  }

  function tokenPicker(onPick, excludeId) {
    const items = S.state.tokens
      .filter(t => t.id !== excludeId)
      .map(t => `
        <div class="tp-row" data-pick="${t.id}">
          ${UI.tokenIcon(t, "sm")}
          <div>
            <div style="font-weight:650;font-size:15px">${t.symbol}</div>
            <div class="t-footnote">${t.name}</div>
          </div>
          <div class="tp-amt t-num">${UI.fmtTokenAmt(t.balance)}</div>
        </div>`).join("");
    return `<div class="token-picker">${items}</div>`;
  }

  function openPicker(which) {
    const exclude = which === "pay" ? recv : pay;
    UI.sheet({
      title: "Выбрать токен",
      body: tokenPicker(null, exclude),
      onMount: (el) => {
        el.querySelectorAll("[data-pick]").forEach(r => {
          r.addEventListener("click", () => {
            const id = r.getAttribute("data-pick");
            if (which === "pay") pay = id; else recv = id;
            if (pay === recv) {
              if (which === "pay") recv = (S.state.tokens.find(t=>t.id!==pay)||{}).id;
              else pay = (S.state.tokens.find(t=>t.id!==recv)||{}).id;
            }
            UI.closeSheet();
            if (rerenderFn) setTimeout(rerenderFn, 340);
          });
        });
      }
    });
  }

  function renderCard(which) {
    const tid = which === "pay" ? pay : recv;
    const t = tk(tid);
    if (!t) return "";
    const bal = t.balance;
    const isPay = which === "pay";
    const amtVal = isPay ? (payAmt || "") : UI.fmtTokenAmt(recvAmt());
    const fiat = (isPay ? (parseFloat(payAmt)||0) : recvAmt()) * t.price;
    return `
      <div class="swap-section">
        <div class="ss-top">
          <span class="ss-label">${isPay ? "Вы отправляете" : "Вы получаете"}</span>
          ${isPay ? `<span class="ss-bal t-num">${UI.fmtTokenAmt(bal)} <b data-max>МАКС</b></span>` : ""}
        </div>
        <div class="ss-main">
          <button class="ss-token" data-pick-btn="${which}">
            ${UI.tokenIcon(t, "sm")}
            <span class="ss-token-name">${t.symbol}</span>
            ${UI.icon("chevronDown")}
          </button>
          <input class="ss-amt t-num" id="swapAmt-${which}"
                 inputmode="decimal" placeholder="0" value="${amtVal}"
                 ${isPay ? "" : "readonly"} />
        </div>
        <div class="ss-fiat t-num">≈ ${UI.fmtUSD(fiat)}</div>
      </div>`;
  }

  function render() {
    const t = tk(pay);
    const r = tk(recv);
    const r1 = rate();
    // Последние обмены
    const recentSwaps = S.state.txs.filter(tx => tx.type === "swap").slice(0, 4);
    return `
      <div class="screen">
        <div class="screen-head-spacer"></div>
        <div class="swap-wrap">
          ${renderCard("pay")}
          <div class="swap-divider-line">
            <div class="sdl-line"></div>
            <button class="swap-switch" data-switch aria-label="Поменять местами">${UI.icon("switch")}</button>
            <div class="sdl-line"></div>
          </div>
          ${renderCard("recv")}
          <div class="swap-meta">
            <div class="m-row"><span class="muted">Курс</span><span class="m-val t-num">1 ${t?t.symbol:""} ≈ ${UI.fmtNum(r1, 4)} ${r?r.symbol:""}</span></div>
            <div class="m-row"><span class="muted">Slippage</span>
              <span class="swap-slip">
                ${[0.1,0.5,1].map(p=>`<button class="slip-pill ${p===slippage?'active':''}" data-slip="${p}">${p}%</button>`).join("")}
              </span>
            </div>
            <div class="m-row"><span class="muted">Комиссия сети</span><span class="m-val t-num">≈ ${UI.fmtUSD(0.42)}</span></div>
          </div>
          <div class="push-bottom">
            <button class="btn btn-primary btn-block btn-pill" data-swap-go ${(!payAmt || recvAmt()<=0) ? "disabled" : ""}>
              Продолжить
            </button>
          </div>
          <div class="swap-quick">
            <div class="quick-route" data-route="eth-usdt">
              <div class="qr-pair">
                <span class="qr-i" style="background:#627EEA">Ξ</span>
                <span class="qr-arrow">⇄</span>
                <span class="qr-i" style="background:#26A17B">₮</span>
              </div>
              <div class="qr-label">ETH / USDT</div>
            </div>
            <div class="quick-route" data-route="usdt-eth">
              <div class="qr-pair">
                <span class="qr-i" style="background:#26A17B">₮</span>
                <span class="qr-arrow">⇄</span>
                <span class="qr-i" style="background:#627EEA">Ξ</span>
              </div>
              <div class="qr-label">USDT / ETH</div>
            </div>
          </div>
          <div class="section-head" style="padding:0 0 8px">
            <span class="t-caption">Последние обмены</span>
          </div>
          ${recentSwaps.length
            ? `<div class="list">${recentSwaps.map(tx => {
                const [fromSym, toSym] = tx.token.split("→").map(s => s && s.trim());
                const fromT = S.state.tokens.find(t => t.symbol === fromSym);
                const toT = S.state.tokens.find(t => t.symbol === toSym);
                return `
                <div class="list-row" data-type="swap">
                  <div class="rs-icons">
                    ${fromT ? UI.tokenIcon(fromT, "sm") : `<span class="token-ico sm">?</span>`}
                    ${toT ? UI.tokenIcon(toT, "sm") : ""}
                  </div>
                  <div class="row-main">
                    <div class="tt">${tx.token}</div>
                    <div class="ts">${tx.time}</div>
                  </div>
                  <div class="row-trail">
                    <div class="amt">${UI.fmtUSD(tx.fiat)}</div>
                    <div class="ts t-num">${tx.rate || ""}</div>
                  </div>
                </div>`;
              }).join("")}</div>`
            : `<div class="state" style="padding:16px"><div class="t-footnote">Обменов ещё нет</div></div>`
          }
        </div>
      </div>`;
  }

  function mount(root) {
    let formEl = root.querySelector(".push-form");

    function rerender() {
      if (formEl) {
        formEl.innerHTML = render();
        bindAll();
      }
    }

    function bindAll() {
      const el = formEl || root;

      el.querySelector("[data-switch]")?.addEventListener("click", () => {
        const tmp = pay; pay = recv; recv = tmp;
        payAmt = "";
        rerender();
      });

      el.querySelectorAll("[data-pick-btn]").forEach(b => {
        b.addEventListener("click", () => openPicker(b.getAttribute("data-pick-btn")));
      });

      const amtInput = el.querySelector("#swapAmt-pay");
      if (amtInput) {
        amtInput.addEventListener("input", (e) => {
          payAmt = e.target.value.replace(/[^0-9.]/g, "");
          if (payAmt.split(".").length > 2) payAmt = payAmt.slice(0, -1);
          e.target.value = payAmt;
          const recvInput = el.querySelector("#swapAmt-recv");
          if (recvInput) recvInput.value = UI.fmtTokenAmt(recvAmt());
          updateFiat(el); updateBtn(el);
        });
      }

      el.querySelector("[data-max]")?.addEventListener("click", () => {
        const t = tk(pay);
        if (!t) return;
        payAmt = String(t.balance);
        if (amtInput) amtInput.value = payAmt;
        const recvInput = el.querySelector("#swapAmt-recv");
        if (recvInput) recvInput.value = UI.fmtTokenAmt(recvAmt());
        updateFiat(el); updateBtn(el);
      });

      el.querySelectorAll("[data-slip]").forEach(b => {
        b.addEventListener("click", () => {
          slippage = parseFloat(b.getAttribute("data-slip"));
          const recvInput = el.querySelector("#swapAmt-recv");
          if (recvInput) recvInput.value = UI.fmtTokenAmt(recvAmt());
          updateFiat(el);
          el.querySelectorAll("[data-slip]").forEach(x => x.classList.toggle("active", x === b));
        });
      });

      el.querySelector("[data-swap-go]")?.addEventListener("click", doSwap);

      el.querySelectorAll("[data-route]").forEach(rEl => {
        rEl.addEventListener("click", () => {
          const r = rEl.getAttribute("data-route");
          if (r === "eth-usdt") { pay = "eth"; recv = "usdt"; }
          else if (r === "usdt-eth") { pay = "usdt"; recv = "eth"; }
          payAmt = "";
          rerender();
        });
      });
    }

    // Локальный rerender для openPicker
    rerenderFn = rerender;

    bindAll();
  }

  let rerenderFn = null;

  function updateFiat(root) {
    const t = tk(pay), r = tk(recv);
    const fiats = root.querySelectorAll(".ss-fiat");
    if (fiats[0] && t) fiats[0].textContent = "≈ " + UI.fmtUSD((parseFloat(payAmt)||0) * t.price);
    if (fiats[1] && r) fiats[1].textContent = "≈ " + UI.fmtUSD(recvAmt() * r.price);
  }

  function updateBtn(root) {
    const btn = root.querySelector("[data-swap-go]");
    if (btn) btn.disabled = (!payAmt || recvAmt() <= 0);
  }

  function doSwap() {
    const a = parseFloat(payAmt) || 0;
    if (a <= 0) return;
    const t = tk(pay), r = tk(recv);
    const recvA = recvAmt();

    // Проверка баланса
    if (t && a > t.balance) {
      UI.toast("Недостаточно " + t.symbol, "error");
      return;
    }

    // Шторка с подтверждением -> загрузка -> успех
    const body = document.createElement("div");
    body.innerHTML = `
      <div class="send-review">
        <div class="r-row"><span class="k">Отдаёте</span><span class="v t-num">${UI.fmtTokenAmt(a)} ${t?t.symbol:""}</span></div>
        <div class="r-row"><span class="k">Получаете</span><span class="v t-num">${UI.fmtTokenAmt(recvA)} ${r?r.symbol:""}</span></div>
        <div class="r-row"><span class="k">Курс</span><span class="v t-num">1 ${t?t.symbol:""} ≈ ${UI.fmtNum(rate(),4)} ${r?r.symbol:""}</span></div>
        <div class="r-row"><span class="k">Slippage</span><span class="v">${slippage}%</span></div>
        <div class="r-row"><span class="k">Комиссия сети</span><span class="v t-num">${UI.fmtUSD(0.42)}</span></div>
      </div>`;

    const footer = document.createElement("div");
    footer.innerHTML = `<button class="btn btn-primary btn-block btn-pill" data-confirm>Подтвердить обмен</button>`;

    const sh = UI.sheet({ title: "Проверка обмена", body, footer });
    sh.el.querySelector("[data-confirm]").addEventListener("click", () => {
      // состояние загрузки
      footer.innerHTML = `<button class="btn btn-primary btn-block" disabled><span class="spinner on-accent"></span> Обработка…</button>`;
      setTimeout(() => {
        // применяем
        S.applySwap(pay, a, recv, recvA);
        S.addTx({
          type: "swap", token: `${t?t.symbol:""}→${r?r.symbol:""}`,
          amount: a, fiat: a * (t?t.price:0),
          time: "Сегодня, " + UI.fmtTimeHM(),
          rate: `1 ${t?t.symbol:""} = ${UI.fmtNum(rate(),4)} ${r?r.symbol:""}`
        });
        showSwapSuccess(sh.el, a, t, recvA, r);
      }, 1400);
    });
  }

  function showSwapSuccess(sheetEl, a, t, recvA, r) {
    sheetEl.querySelector(".sheet-body").innerHTML = `
      <div class="sheet-state">
        <div class="success-ring">${UI.icon("check")}</div>
        <div class="ss-title">Обмен выполнен</div>
        <div class="ss-sub">${UI.fmtTokenAmt(a)} ${t?t.symbol:""} → ${UI.fmtTokenAmt(recvA)} ${r?r.symbol:""}</div>
      </div>`;
    sheetEl.querySelector(".sheet-footer").innerHTML = `<button class="btn btn-secondary btn-block" data-close>Готово</button>`;
    UI.toast("Свап выполнен", "success");
    // сбросим сумму на экране
    payAmt = "";
  }

  /* Push-открытие (как Send/Receive) */
  function open() {
    UI.push({
      title: "",
      render: () => `<div class="push-form">${render()}</div>`,
      onMount: (view) => mount(view)
    });
  }

  function setPay(id) { pay = id; }
  function setRecv(id) { recv = id; }

  return { render, mount, open, setPay, setRecv };
})();
