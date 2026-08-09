/* ==========================================================================
   Nova Wallet — Receive (full-screen push navigation)
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.receive = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore, D = window.NovaData;

  let net = "eth";

  function open() {
    const w = D.WALLET;
    const networks = D.NETWORKS;
    const sel = networks.find(n => n.id === net) || networks[0];

    UI.push({
      title: "Получить",
      render: () => `<div class="push-form">${`
        <div class="recv-net">
          ${networks.map(n => `<button class="n-pill ${n.id===net?'active':''}" data-net="${n.id}">${n.name}</button>`).join("")}
        </div>
        <div class="qr-wrap">
          <canvas id="recvQR"></canvas>
        </div>
        <div style="text-align:center;margin-bottom:12px">
          <div class="t-footnote">Адрес кошелька · ${sel.name}</div>
          <div class="t-body-em t-mono" style="word-break:break-all;font-size:12.5px;margin-top:6px" id="recvAddrFull">${w.address}</div>
        </div>
        <div class="addr-box">
          <span class="addr t-mono" id="recvAddrShort">${UI.shortAddr(w.address,10,8)}</span>
          <button class="btn btn-secondary btn-sm btn-pill" data-copy>Копировать</button>
        </div>
        <div class="list" style="margin-top:12px">
          <div class="list-row"><span class="muted">ENS</span><span class="row-trail t-mono">${w.ens}</span></div>
          <div class="list-row" data-net-row><span class="muted">Сеть</span><span class="row-trail" id="netName">${sel.name}</span></div>
          <div class="list-row" data-fee-row><span class="muted">Комиссия</span><span class="row-trail t-num" id="netFee">≈ ${UI.fmtUSD(sel.fee)}</span></div>
        </div>
        <div class="push-bottom">
          <button class="btn btn-primary btn-block btn-pill" data-share>Поделиться адресом</button>
        </div>
      `}</div>`,
      onMount: (view, close) => {
        const canvas = view.querySelector("#recvQR");
        UI.drawQR(canvas, w.address + "|" + net, 196);

        view.querySelectorAll("[data-net]").forEach(p => {
          p.addEventListener("click", () => {
            net = p.getAttribute("data-net");
            view.querySelectorAll("[data-net]").forEach(x => x.classList.toggle("active", x === p));
            const n = D.NETWORKS.find(x => x.id === net);
            view.querySelector("#netName").textContent = n.name;
            view.querySelector("#netFee").textContent = "≈ " + UI.fmtUSD(n.fee);
            UI.drawQR(canvas, w.address + "|" + net, 196);
          });
        });

        view.querySelector("[data-copy]").addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(w.address);
            UI.toast("Адрес скопирован", "success");
          } catch {
            UI.toast("Адрес: " + UI.shortAddr(w.address,6,4), "default");
          }
        });
        view.querySelector("[data-share]").addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(w.address);
            UI.toast("Ссылка скопирована", "success");
          } catch {
            UI.toast("Поделиться адресом", "default");
          }
        });
      }
    });
  }

  return { open };
})();
