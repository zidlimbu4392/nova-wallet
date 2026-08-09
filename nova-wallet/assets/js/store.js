/* ==========================================================================
   Nova Wallet — Store (простое управление состоянием)
   ========================================================================== */

window.NovaStore = (function () {
  "use strict";

  const data = window.NovaData;

  // Глубокая копия токенов, чтобы можно было "менять" балансы при свапе/переводе
  const state = {
    screen: "dashboard",
    tokens: data.TOKENS.map(t => ({ ...t })),
    nfts: data.NFTS.map(n => ({ ...n })),
    pools: data.POOLS.map(p => ({ ...p })),
    txs: data.TXS.map(t => ({ ...t })),
    toast: null
  };

  const subs = [];
  function subscribe(fn) { subs.push(fn); }
  function notify() { subs.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }

  function setScreen(name) {
    state.screen = name;
    notify();
  }

  // Применить перевод: уменьшить баланс токена
  function applySend(tokenId, amount, fee) {
    const t = state.tokens.find(x => x.id === tokenId);
    if (!t) return;
    t.balance = Math.max(0, +(t.balance - amount).toFixed(6));
    notify();
  }

  // Применить свап: забираем pay, добавляем receive
  function applySwap(payId, payAmt, recvId, recvAmt) {
    const pay = state.tokens.find(x => x.id === payId);
    const recv = state.tokens.find(x => x.id === recvId);
    if (pay) pay.balance = Math.max(0, +(pay.balance - payAmt).toFixed(6));
    if (recv) recv.balance = +(recv.balance + recvAmt).toFixed(6);
    notify();
  }

  // Застейкать
  function applyStake(poolId, amount) {
    const p = state.pools.find(x => x.id === poolId);
    const t = state.tokens.find(x => x.symbol === p.asset);
    if (t) t.balance = Math.max(0, +(t.balance - amount).toFixed(6));
    p.staked = +(p.staked + amount).toFixed(6);
    p.rewards = +(p.staked * p.apy / 100 / 12).toFixed(4);
    notify();
  }

  // Добавить транзакцию в начало истории
  function addTx(tx) {
    state.txs.unshift({ id: Date.now(), status: "success", ...tx });
    notify();
  }

  // Производные
  function totalFiat() { return state.tokens.reduce((s, t) => s + t.balance * t.price, 0); }
  function tokenFiat(t) { return t.balance * t.price; }
  function findToken(id) { return state.tokens.find(t => t.id === id); }
  function stakedFiat() {
    return state.pools.reduce((s, p) => {
      const t = state.tokens.find(x => x.symbol === p.asset);
      const price = t ? t.price : 0;
      return s + p.staked * price;
    }, 0);
  }
  function totalRewardsFiat() {
    return state.pools.reduce((s, p) => {
      const t = state.tokens.find(x => x.symbol === p.asset);
      const price = t ? t.price : 0;
      return s + p.rewards * price;
    }, 0);
  }

  return {
    state, subscribe, setScreen, notify,
    applySend, applySwap, applyStake, addTx,
    totalFiat, tokenFiat, findToken, stakedFiat, totalRewardsFiat
  };
})();
