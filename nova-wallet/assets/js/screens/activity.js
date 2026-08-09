/* ==========================================================================
   Nova Wallet — Activity (история транзакций)
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.activity = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore;

  let filter = "all";

  const FILTERS = [
    { id: "all",   label: "Все" },
    { id: "send",  label: "Отправка" },
    { id: "recv",  label: "Получено" },
    { id: "swap",  label: "Обмен" },
    { id: "stake", label: "Стейкинг" }
  ];

  const TYPE_META = {
    send:  { ico: "arrowUp",  label: "Отправлено",   sign: "−" },
    recv:  { ico: "arrowDown",label: "Получено",     sign: "+" },
    swap:  { ico: "swap",     label: "Обмен",        sign: ""  },
    stake: { ico: "flame",    label: "Стейкинг",     sign: "−" }
  };

  function filtered() {
    if (filter === "all") return S.state.txs;
    return S.state.txs.filter(t => t.type === filter);
  }

  function statusBadge(s) {
    if (s === "pending") return `<span class="badge badge-warn">${UI.icon("clock")} Ожидание</span>`;
    if (s === "failed") return `<span class="badge badge-danger">${UI.icon("alert")} Ошибка</span>`;
    return `<span class="badge badge-success">${UI.icon("check")} Успех</span>`;
  }

  function renderRow(tx) {
    const m = TYPE_META[tx.type] || TYPE_META.send;
    const isPos = tx.type === "recv";
    return `
      <div class="list-row tap tx-row" data-tx="${tx.id}" data-type="${tx.type}">
        <span class="tx-ico ${tx.type}">${UI.icon(m.ico)}</span>
        <div class="row-main">
          <div class="tt">${m.label}</div>
          <div class="ts">${tx.time} · ${tx.token}</div>
        </div>
        <div class="row-trail">
          <div class="amt ${isPos ? "success" : ""}">${m.sign}${UI.fmtTokenAmt(tx.amount)} <span class="muted" style="font-weight:500">${tx.token.split("→")[0]}</span></div>
          <div class="st">${statusBadge(tx.status)}</div>
        </div>
      </div>`;
  }

  function renderList() {
    const txs = filtered();
    if (!txs.length) {
      return `<div class="state"><div class="state-ico">${UI.icon("clock")}</div><div class="t-headline">Транзакций нет</div><div class="t-footnote" style="margin-top:6px">В этой категории пока пусто</div></div>`;
    }
    // Группировка по дню (по строке времени до запятой)
    const groups = {};
    txs.forEach(t => {
      const day = t.time.split(",")[0];
      (groups[day] = groups[day] || []).push(t);
    });
    return Object.keys(groups).map(day => `
      <div>
        <div class="tx-date">${day}</div>
        <div class="list stagger">${groups[day].map(renderRow).join("")}</div>
      </div>`).join("");
  }

  function renderFilters() {
    return FILTERS.map(f =>
      `<button class="filter-pill ${f.id === filter ? "active" : ""}" data-filter="${f.id}">${f.label}</button>`).join("");
  }

  function render() {
    return `
      <div class="screen">
        <div class="screen-head-spacer"></div>
        <div class="act-filter" id="actFilters">${renderFilters()}</div>
        <div style="padding:0 4px">
          <div id="actList">${renderList()}</div>
        </div>
      </div>`;
  }

  function openDetail(tx) {
    const m = TYPE_META[tx.type] || TYPE_META.send;
    let extra = "";
    if (tx.type === "send") extra = `<div class="d-row"><span class="k">Получатель</span><span class="v t-mono">${UI.shortAddr(tx.to || "—",8,6)}</span></div>`;
    if (tx.type === "recv") extra = `<div class="d-row"><span class="k">Отправитель</span><span class="v t-mono">${UI.shortAddr(tx.from || "—",8,6)}</span></div>`;
    if (tx.type === "swap") extra = `<div class="d-row"><span class="k">Курс</span><span class="v t-num">${tx.rate || "—"}</span></div>`;
    if (tx.type === "stake") extra = `<div class="d-row"><span class="k">Пул</span><span class="v">${tx.pool || "—"}</span></div>`;
    if (tx.fee) extra += `<div class="d-row"><span class="k">Комиссия сети</span><span class="v t-num">${UI.fmtUSD(tx.fee)}</span></div>`;

    UI.sheet({
      title: "",
      body: `
        <div style="text-align:center;margin-top:8px">
          <div class="tx-ico ${tx.type}" style="margin:0 auto 12px;width:56px;height:56px"><span style="width:26px;height:26px">${UI.icon(m.ico)}</span></div>
          <div class="t-title2">${m.label}</div>
          <div class="t-num" style="font-size:28px;font-weight:800;margin-top:6px;color:${tx.type==='recv'?'var(--success)':'var(--text)'}">${m.sign}${UI.fmtTokenAmt(tx.amount)} <span class="muted" style="font-weight:600">${tx.token.split("→")[0]}</span></div>
          <div style="margin:10px auto 0;display:inline-block">${statusBadge(tx.status)}</div>
        </div>
        <div class="list tx-detail" style="margin-top:18px">
          <div class="d-row"><span class="k">Сумма в USD</span><span class="v t-num">${UI.fmtUSD(tx.fiat)}</span></div>
          <div class="d-row"><span class="k">Время</span><span class="v">${tx.time}</span></div>
          ${extra}
          <div class="d-row"><span class="k">Tx хеш</span><span class="v tx-hash">${UI.shortAddr(tx.hash,10,8)}</span></div>
        </div>
        <button class="btn btn-secondary btn-block btn-pill" style="margin-top:14px" data-explorer>Открыть в эксплорере</button>`,
      footer: `<button class="btn btn-primary btn-block btn-pill" data-close>Закрыть</button>`,
      onMount: (el) => {
        el.querySelector("[data-explorer]")?.addEventListener("click", () => {
          UI.toast("Открытие в Etherscan…", "default");
          UI.closeSheet();
        });
      }
    });
  }

  function mount(root) {
    bindFilters(root);
    bindRows(root);
  }

  function bindFilters(root) {
    root.querySelectorAll("#actFilters [data-filter]").forEach(b => {
      b.addEventListener("click", () => {
        filter = b.getAttribute("data-filter");
        const filtersEl = root.querySelector("#actFilters");
        const listEl = root.querySelector("#actList");
        if (filtersEl) filtersEl.innerHTML = renderFilters();
        if (listEl) listEl.innerHTML = renderList();
        bindFilters(root); bindRows(root);
      });
    });
  }

  function bindRows(root) {
    root.querySelectorAll("[data-tx]").forEach(el => {
      el.addEventListener("click", () => {
        const id = +el.getAttribute("data-tx");
        const tx = S.state.txs.find(x => x.id === id);
        if (tx) openDetail(tx);
      });
    });
  }

  return { render, mount };
})();
