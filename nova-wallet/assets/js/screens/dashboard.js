/* ==========================================================================
   Nova Wallet — Dashboard screen
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.dashboard = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore, D = window.NovaData;
  const Screens = window.NovaScreens;

  function greet() {
    const h = new Date().getHours();
    if (h < 6) return "Доброй ночи";
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
  }

  // Средневзвешенное изменение портфеля за 24ч
  function portfolioDelta() {
    let weighted = 0, total = 0;
    S.state.tokens.forEach(t => {
      const f = t.balance * t.price;
      weighted += f * t.change24;
      total += f;
    });
    return total ? weighted / total : 0;
  }

  function renderHero() {
    const total = S.totalFiat();
    const delta = portfolioDelta();
    const deltaFiat = total * delta / 100;
    const up = delta >= 0;
    return `
      <div class="dash-hero">
        <div class="dash-greet">Total Balance</div>
        <div class="dash-balance t-num" id="dashBalance">$0</div>
        <div class="dash-delta">
          <span class="badge ${up ? "badge-success" : "badge-danger"}">
            ${UI.icon(up ? "arrowUp" : "arrowDown")} <span style="display:inline-block;transform:translateY(-1px)">${UI.fmtPct(delta)}</span>
          </span>
          <span class="t-footnote t-num">${up ? "+" : "−"}${UI.fmtUSD(Math.abs(deltaFiat))}</span>
          <span class="t-footnote">today</span>
        </div>
        ${UI.sparkline(D.SPARK, 320, 56)}
      </div>`;
  }

  function renderActions() {
    return `
      <div class="dash-actions">
        <button class="act-btn" data-act="send">
          <span class="act-ico"><img src="assets/icons/paper-plane.svg" alt="" class="act-ico-img" /></span>
          <span class="act-label">Send</span>
        </button>
        <button class="act-btn alt" data-act="receive">
          <span class="act-ico"><img src="assets/icons/down-right.svg" alt="" class="act-ico-img" /></span>
          <span class="act-label">Receive</span>
        </button>
        <button class="act-btn alt2" data-act="swap">
          <span class="act-ico">${UI.icon("swap")}</span>
          <span class="act-label">Swap</span>
        </button>
      </div>`;
  }

  function renderTokens() {
    const rows = S.state.tokens.map(t => {
      const f = S.tokenFiat(t);
      const up = t.change24 >= 0;
      return `
        <div class="list-row tap" data-token="${t.id}">
          ${UI.tokenIcon(t)}
          <div class="row-main">
            <div class="sym">${t.symbol}</div>
            <div class="sub">${t.name}</div>
          </div>
          <div class="row-trail">
            <div class="amt t-num">${UI.fmtUSD(f)}</div>
            <div class="flex gap-2" style="justify-content:flex-end;margin-top:2px">
              <span class="t-footnote t-num">${UI.fmtTokenAmt(t.balance)} ${t.symbol}</span>
              <span class="delta ${up ? "delta-up" : "delta-down"}">${UI.fmtPct(t.change24)}</span>
            </div>
          </div>
        </div>`;
    }).join("");
    return `
      <div class="section-head">
        <span class="t-caption">Токены</span>
      </div>
      <div class="list stagger">${rows}</div>`;
  }

  function render() {
    return `
      <div class="screen stagger">
        ${renderHero()}
        ${renderActions()}
        ${renderTokens()}
      </div>`;
  }

  function mount(root) {
    // Анимация счётчика баланса
    const balEl = root.querySelector("#dashBalance");
    if (balEl) UI.countUp(balEl, S.totalFiat(), { dur: 900, fmt: v => UI.fmtUSD(v, { max: 2 }) });

    // Тап по hero-карточке → История (push)
    root.querySelector(".dash-hero")?.addEventListener("click", () => {
      UI.push({
        title: "",
        render: () => Screens.activity.render(),
        onMount: (view) => Screens.activity.mount(view)
      });
    });

    // Действия
    root.querySelectorAll("[data-act]").forEach(el => {
      el.addEventListener("click", () => {
        const a = el.getAttribute("data-act");
        if (a === "send") window.NovaScreens.send.open();
        else if (a === "receive") window.NovaScreens.receive.open();
        else if (a === "swap") window.NovaScreens.swap.open();
      });
    });

    // Тап по токену → детали токена (push)
    root.querySelectorAll("[data-token]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-token");
        Screens.token.open(id);
      });
    });
  }

  return { render, mount };
})();
