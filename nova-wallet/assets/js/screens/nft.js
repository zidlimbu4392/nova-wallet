/* ==========================================================================
   Nova Wallet — NFT gallery
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.nft = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore, D = window.NovaData;

  // Процедурная генерация «арт-обложки» NFT через SVG
  function art(a, size = 200) {
    const { from, to, shape } = a;
    let inner = "";
    if (shape === "rings") {
      inner = [120, 95, 70, 45].map((r, i) =>
        `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,${0.25 - i*0.04})" stroke-width="${8 - i}"/>`
      ).join("") + `<circle cx="${size/2}" cy="${size/2}" r="22" fill="rgba(255,255,255,.85)"/>`;
    } else if (shape === "tri") {
      inner = `<polygon points="${size/2},${size*0.22} ${size*0.82},${size*0.74} ${size*0.18},${size*0.74}" fill="rgba(255,255,255,.22)"/>
               <polygon points="${size/2},${size*0.34} ${size*0.72},${size*0.66} ${size*0.28},${size*0.66}" fill="rgba(255,255,255,.4)"/>`;
    } else if (shape === "circ") {
      inner = `<circle cx="${size*0.4}" cy="${size*0.42}" r="${size*0.18}" fill="rgba(255,255,255,.55)"/>
               <circle cx="${size*0.62}" cy="${size*0.6}" r="${size*0.12}" fill="rgba(255,255,255,.3)"/>`;
    } else if (shape === "sun") {
      const cx = size/2, cy = size/2;
      let rays = "";
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const x1 = cx + Math.cos(ang) * 38, y1 = cy + Math.sin(ang) * 38;
        const x2 = cx + Math.cos(ang) * 64, y2 = cy + Math.sin(ang) * 64;
        rays += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,.55)" stroke-width="5" stroke-linecap="round"/>`;
      }
      inner = rays + `<circle cx="${cx}" cy="${cy}" r="30" fill="rgba(255,255,255,.9)"/>`;
    } else if (shape === "wave") {
      let path = `M0 ${size*0.55} `;
      for (let x = 0; x <= size; x += 12) {
        const y = size*0.55 + Math.sin(x / 22) * 18;
        path += `L${x} ${y} `;
      }
      inner = `<path d="${path} L${size} ${size} L0 ${size} Z" fill="rgba(255,255,255,.22)"/>
               <path d="${path}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="4" stroke-linecap="round"/>`;
    }
    const id = "g" + Math.random().toString(36).slice(2, 7);
    return `
      <svg class="nft-art" viewBox="0 0 ${size} ${size}" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${from}"/>
            <stop offset="100%" stop-color="${to}"/>
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#${id})"/>
        ${inner}
      </svg>`;
  }

  function renderGrid() {
    const cards = S.state.nfts.map(n => `
      <div class="nft-card" data-nft="${n.id}">
        <div class="nft-img">${art(n.art, 200)}</div>
        <div class="nft-body">
          <div class="nm truncate">${n.name}</div>
          <div class="col truncate">${n.collection}</div>
          <div class="floor"><span style="color:var(--text-secondary)">Floor</span> ${UI.fmtNum(n.floor,2)} Ξ</div>
        </div>
      </div>`).join("");
    return `<div class="nft-grid stagger">${cards}</div>`;
  }

  function render() {
    return `
      <div class="screen">
        <div class="screen-head-spacer"></div>
        <div class="section-head" style="padding-top:8px">
          <span class="t-caption">${S.state.nfts.length} предмета · 3 коллекции</span>
        </div>
        ${renderGrid()}
      </div>`;
  }

  function openDetail(n) {
    UI.sheet({
      title: "",
      body: `
        <div class="nft-detail-img">${art(n.art, 360)}</div>
        <div class="t-title3">${n.name}</div>
        <div class="t-subhead">${n.collection}</div>
        <div class="list" style="margin-top:16px">
          <div class="list-row"><span class="muted">Floor price</span><span class="row-trail t-num"><b>${UI.fmtNum(n.floor,2)}</b> Ξ</span></div>
          <div class="list-row"><span class="muted">Сеть</span><span class="row-trail">Ethereum</span></div>
          <div class="list-row"><span class="muted">Token ID</span><span class="row-trail t-mono">#${String(n.id).padStart(4,"0")}</span></div>
          <div class="list-row"><span class="muted">Контракт</span><span class="row-trail t-mono">${UI.shortAddr("0xa7b39f2c1d4e8b6a0c5d9e1f3b7a2c4d6e8f0a2b",6,4)}</span></div>
        </div>
      `,
      footer: `
        <div class="flex gap-3">
          <button class="btn btn-secondary btn-sm grow btn-pill" data-act="share">Поделиться</button>
          <button class="btn btn-primary btn-sm grow btn-pill" data-act="sell">Продать</button>
        </div>`,
      onMount: (el) => {
        el.querySelectorAll("[data-act]").forEach(b => {
          b.addEventListener("click", () => {
            const a = b.getAttribute("data-act");
            if (a === "sell") { UI.toast("Лот выставлен на маркетплейс", "success"); UI.closeSheet(); }
            else if (a === "share") { UI.toast("Ссылка скопирована", "success"); }
          });
        });
      }
    });
  }

  function mount(root) {
    root.querySelectorAll("[data-nft]").forEach(el => {
      el.addEventListener("click", () => {
        const id = +el.getAttribute("data-nft");
        const n = S.state.nfts.find(x => x.id === id);
        if (n) openDetail(n);
      });
    });
  }

  return { render, mount, art };
})();
