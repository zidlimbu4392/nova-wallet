/* ==========================================================================
   Nova Wallet — Staking / Earn screen
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.staking = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore;

  function renderHero() {
    const staked = S.stakedFiat();
    const rewards = S.totalRewardsFiat();
    return `
      <div class="earn-hero">
        <div class="eh-label">Застейкано</div>
        <div class="eh-val t-num" id="earnStaked">${UI.fmtUSD(staked)}</div>
        <div class="eh-row">
          <div><div class="k">Награды</div><div class="v t-num">${UI.fmtUSD(rewards)}</div></div>
          <div><div class="k">Ср. APY</div><div class="v">5.1%</div></div>
          <div><div class="k">Пулов</div><div class="v">${S.state.pools.filter(p=>p.staked>0).length}/${S.state.pools.length}</div></div>
        </div>
      </div>`;
  }

  function renderPools() {
    const rows = S.state.pools.map(p => `
      <div class="list-row tap pool-row" data-pool="${p.id}">
        <span class="token-ico pool-ico" style="background:${p.color}">${p.glyph}</span>
        <div class="row-main">
          <div class="sym">${p.name}</div>
          <div class="sub">${p.asset} · TVL ${p.tvl} ${p.staked ? "· стейк: " + UI.fmtTokenAmt(p.staked) : ""}</div>
        </div>
        <div class="row-trail">
          <div class="apy t-num">${p.apy.toFixed(1)}%</div>
          <div class="apy-l">APY</div>
        </div>
      </div>`).join("");
    return `
      <div class="section-head"><span class="t-caption">Пулы стейкинга</span><a>Все</a></div>
      <div class="list stagger">${rows}</div>`;
  }

  function render() {
    return `
      <div class="screen">
        <div class="screen-head-spacer"></div>
        ${renderHero()}
        ${renderPools()}
      </div>`;
  }

  function openStake(pool) {
    const t = S.state.tokens.find(x => x.symbol === pool.asset);
    const bal = t ? t.balance : 0;
    let amount = "";

    const renderForm = () => `
      <div class="stake-wrap">
        <div class="flex items-center gap-3" style="margin-bottom:14px">
          ${UI.tokenIcon(t || {color:pool.color, glyph:pool.glyph}, "sm")}
          <div>
            <div style="font-weight:650;font-size:16px">${pool.name}</div>
            <div class="t-footnote">APY ${pool.apy.toFixed(1)}% · ${pool.asset}</div>
          </div>
          <div style="margin-left:auto;text-align:right">
            <div class="t-footnote">Доступно</div>
            <div class="t-body-em t-num">${UI.fmtTokenAmt(bal)} ${pool.asset}</div>
          </div>
        </div>
        <div class="amount-field" style="position:relative;margin-bottom:12px">
          <input class="af-input t-num" id="stakeAmt" inputmode="decimal" placeholder="0.00" />
          <button class="af-max" data-max>MAX</button>
          <div class="af-fiat t-num" id="stakeFiat">${UI.fmtUSD(0)}</div>
        </div>
        <div class="segment" style="margin-bottom:14px">
          <div class="seg" data-pct="25">25%</div>
          <div class="seg" data-pct="50">50%</div>
          <div class="seg" data-pct="75">75%</div>
          <div class="seg active" data-pct="100">100%</div>
        </div>
        <div class="list" style="margin-bottom:16px">
          <div class="list-row"><span class="muted">Годовая доходность</span><span class="row-trail t-num" id="stakeYear">${UI.fmtUSD(bal * pool.apy/100)}</span></div>
          <div class="list-row"><span class="muted">Ожидаемо в месяц</span><span class="row-trail t-num" id="stakeMonthly">${UI.fmtUSD(bal * pool.apy/100/12)}</span></div>
          <div class="list-row"><span class="muted">Разблокировка</span><span class="row-trail">7 дней</span></div>
        </div>
        <div class="stake-bottom">
          <button class="btn btn-primary btn-block btn-pill" data-confirm disabled>Стейкать</button>
        </div>
      </div>`;

    const sh = UI.push({ title: `Стейкинг ${pool.asset}`, render: renderForm });
    const view = sh.el;

    function recalc() {
      const a = parseFloat(amount) || 0;
      const price = t ? t.price : 0;
      view.querySelector("#stakeFiat").textContent = UI.fmtUSD(a * price);
      view.querySelector("#stakeMonthly").textContent = UI.fmtUSD(a * pool.apy/100/12 * price);
      const confirmBtn = view.querySelector("[data-confirm]");
      if (confirmBtn) confirmBtn.disabled = a <= 0 || a > bal;
    }

    const input = view.querySelector("#stakeAmt");
    input.addEventListener("input", (e) => {
      amount = e.target.value.replace(/[^0-9.]/g, "");
      if (amount.split(".").length > 2) amount = amount.slice(0, -1);
      e.target.value = amount;
      recalc();
      view.querySelectorAll("[data-pct]").forEach(x => x.classList.remove("active"));
    });

    view.querySelector("[data-max]").addEventListener("click", () => {
      amount = String(bal);
      input.value = amount; recalc();
      view.querySelectorAll("[data-pct]").forEach(x => x.classList.toggle("active", x.getAttribute("data-pct")==="100"));
    });

    view.querySelectorAll("[data-pct]").forEach(seg => {
      seg.addEventListener("click", () => {
        const pct = +seg.getAttribute("data-pct");
        amount = String(+(bal * pct / 100).toFixed(6));
        input.value = amount; recalc();
        view.querySelectorAll("[data-pct]").forEach(x => x.classList.toggle("active", x === seg));
      });
    });

    view.querySelector("[data-confirm]").addEventListener("click", () => {
      const a = parseFloat(amount) || 0;
      if (a <= 0 || a > bal) return;
      const body = view.querySelector(".push-body");
      body.innerHTML = `<div class="sheet-state"><div class="spinner lg" style="margin:40px auto 16px"></div><div class="ss-sub">Стейкинг…</div></div>`;
      setTimeout(() => {
        S.applyStake(pool.id, a);
        S.addTx({
          type: "stake", token: pool.asset, amount: a, fiat: a * (t?t.price:0),
          time: "Сегодня, " + UI.fmtTimeHM(), pool: pool.name
        });
        body.innerHTML = `
          <div class="stake-wrap">
            <div class="sheet-state" style="padding-top:60px">
              <div class="success-ring">${UI.icon("check")}</div>
              <div class="ss-title">Застейкано</div>
              <div class="ss-amount t-num">${UI.fmtTokenAmt(a)} <span class="cur">${pool.asset}</span></div>
              <div class="ss-sub">в пуле ${pool.name} · APY ${pool.apy.toFixed(1)}%</div>
              <div class="stake-bottom">
                <button class="btn btn-secondary btn-block btn-pill" data-done>Готово</button>
              </div>
            </div>
          </div>`;
        body.querySelector("[data-done]").addEventListener("click", sh.close);
        UI.toast("Стейкинг активен", "success");
      }, 1400);
    });
  }

  function mount(root) {
    root.querySelectorAll("[data-pool]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-pool");
        const p = S.state.pools.find(x => x.id === id);
        if (p) openStake(p);
      });
    });
  }

  return { render, mount };
})();
