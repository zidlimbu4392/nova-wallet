/* ==========================================================================
   Nova Wallet — Token Detail (Купить / Продать / История)
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.token = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore;

  function renderTxRow(tx) {
    const TYPE_META = {
      send:  { ico: "arrowUp",  label: "Отправлено",   sign: "−" },
      recv:  { ico: "arrowDown",label: "Получено",     sign: "+" },
      swap:  { ico: "switch",   label: "Обмен",        sign: ""  },
      stake: { ico: "flame",    label: "Стейкинг",     sign: "−" }
    };
    const m = TYPE_META[tx.type] || TYPE_META.send;
    const isPos = tx.type === "recv";
    return `
      <div class="list-row" data-type="${tx.type}">
        <span class="tx-ico ${tx.type}">${UI.icon(m.ico)}</span>
        <div class="row-main">
          <div class="tt">${m.label}</div>
          <div class="ts">${tx.time}</div>
        </div>
        <div class="row-trail">
          <div class="amt ${isPos ? "success" : ""}">${m.sign}${UI.fmtTokenAmt(tx.amount)}</div>
          <div class="ts t-num">${UI.fmtUSD(tx.fiat)}</div>
        </div>
      </div>`;
  }

  function open(tokenId) {
    const t = S.findToken(tokenId);
    if (!t) return;

    // Транзакции по этому токену
    const txs = S.state.txs.filter(tx => {
      return tx.token.split("→").some(p => p.trim() === t.symbol);
    });

    UI.push({
      title: t.symbol,
      render: () => `
        <div class="push-form td-wrap">
          <div class="td-header">
            ${UI.tokenIcon(t, "lg")}
            <div class="td-name">${t.name}</div>
            <div class="td-balance t-num">${UI.fmtTokenAmt(t.balance)} ${t.symbol}</div>
            <div class="td-fiat t-num">${UI.fmtUSD(t.balance * t.price)}</div>
            <div class="td-change ${t.change24 >= 0 ? "success" : "danger"}">
              ${t.change24 >= 0 ? "▲" : "▼"} ${UI.fmtPct(t.change24)} сегодня
            </div>
          </div>
          <div class="td-actions">
            <button class="btn btn-primary grow btn-pill" data-buy>Купить</button>
            <button class="btn btn-secondary grow btn-pill" data-sell>Продать</button>
          </div>
          <div>
            <div class="section-head" style="padding:0 0 8px">
              <span class="t-caption">История</span>
            </div>
            ${txs.length
              ? `<div class="list">${txs.map(renderTxRow).join("")}</div>`
              : `<div class="state" style="padding:24px"><div class="t-headline">Нет транзакций</div><div class="t-footnote" style="margin-top:4px">Купите или продайте ${t.symbol}</div></div>`
            }
          </div>
          <div class="push-bottom"></div>
        </div>`,
      onMount: (view, close) => {
        view.querySelector("[data-buy]")?.addEventListener("click", () => {
          close();
          setTimeout(() => {
            if (Screens.swap.setRecv) Screens.swap.setRecv(t.id);
            Screens.swap.open();
          }, 340);
        });
        view.querySelector("[data-sell]")?.addEventListener("click", () => {
          close();
          setTimeout(() => {
            if (Screens.swap.setPay) Screens.swap.setPay(t.id);
            Screens.swap.open();
          }, 340);
        });
      }
    });
  }

  const Screens = window.NovaScreens;
  return { open };
})();
