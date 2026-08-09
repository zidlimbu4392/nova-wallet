/* ==========================================================================
   Nova Wallet — Welcome / Onboarding Screen (Non-Custodial)
   ========================================================================== */

window.NovaScreens = window.NovaScreens || {};

window.NovaScreens.welcome = (function () {
  "use strict";
  const UI = window.NovaUI, S = window.NovaStore;

  function render() {
    return `
      <style>
        .luma-bg {
          background: linear-gradient(180deg, #E6D0FC 0%, #F5E8FF 30%, #FFFFFF 65%, #FFFFFF 100%);
          height: 100vh;
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .orbit-container {
          position: relative;
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -140px; /* Shift up to balance text */
        }
        
        /* Concentric circles */
        .orbit-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.5) inset;
        }
        .orbit-1 { width: 170px; height: 170px; }
        .orbit-2 { width: 300px; height: 300px; }
        
        /* Center Logo */
        .center-logo {
          position: absolute;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          animation: pulse-logo 4s infinite alternate;
        }

        @keyframes pulse-logo {
          0% { transform: scale(1); filter: drop-shadow(0 10px 20px rgba(119, 91, 242, 0.15)); }
          100% { transform: scale(1.06); filter: drop-shadow(0 15px 30px rgba(119, 91, 242, 0.3)); }
        }



        /* Floating Bubbles */
        @keyframes subtle-float {
          0% { margin-top: 0px; }
          50% { margin-top: -8px; }
          100% { margin-top: 0px; }
        }

        .bubble-wrapper {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          animation: subtle-float 3.5s ease-in-out infinite;
        }
        .bubble-wrapper:nth-child(even) {
          animation-delay: 1.2s;
          animation-duration: 4.5s;
        }
        .bubble-wrapper:nth-child(3n) {
          animation-delay: 0.5s;
          animation-duration: 3s;
        }

        /* Bottom Content */
        .bottom-content {
          padding: 0 24px 40px 24px;
          text-align: center;
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          box-sizing: border-box;
          z-index: 20;
          background: linear-gradient(0deg, rgba(255,255,255,1) 75%, rgba(255,255,255,0) 100%);
        }

        .title-small {
          font-size: 20px;
          font-weight: 600;
          color: #1c1c1e;
          margin-bottom: 6px;
          opacity: 0.9;
          letter-spacing: -0.02em;
        }

        .title-large {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 36px;
          color: #1c1c1e;
        }
        .title-large .highlight {
          color: #000000;
        }
      </style>
      
      <div class="screen luma-bg" id="welcomeScreen">
        
        <div class="orbit-container">
          <!-- Circles -->
          <div class="orbit-circle orbit-1"></div>
          <div class="orbit-circle orbit-2"></div>
          
          <!-- Center Card -->
          <!-- Center Logo -->
          <div class="center-logo">
            <img src="/assets/icons/nova-logo.svg" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>

          <!-- Bubbles -->
          <!-- Inner Orbit (Radius 85px) -->
          <div class="bubble-wrapper" style="left: calc(50% + 0px); top: calc(50% - 85px); transform: translate(-50%, -50%);">
            <img src="/assets/icons/3d-star.png" style="width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>
          <div class="bubble-wrapper" style="left: calc(50% + 74px); top: calc(50% + 42px); transform: translate(-50%, -50%) scale(0.9);">
            <img src="/assets/icons/3d-lightning.png" style="width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>
          <div class="bubble-wrapper" style="left: calc(50% - 74px); top: calc(50% + 42px); transform: translate(-50%, -50%) scale(0.85);">
            <img src="/assets/icons/3d-rocket.png" style="width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>

          <!-- Outer Orbit (Radius 150px) -->
          <!-- 30 deg -->
          <div class="bubble-wrapper" style="left: calc(50% + 75px); top: calc(50% - 130px); transform: translate(-50%, -50%) scale(1.05);">
            <img src="/assets/icons/3d-coin.png" style="width: 64px; height: 64px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>
          <!-- 90 deg -->
          <div class="bubble-wrapper" style="left: calc(50% + 150px); top: calc(50% + 0px); transform: translate(-50%, -50%) scale(0.9);">
            <img src="/assets/icons/3d-shield.png" style="width: 52px; height: 52px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>
          <!-- 150 deg -->
          <div class="bubble-wrapper" style="left: calc(50% + 75px); top: calc(50% + 130px); transform: translate(-50%, -50%);">
            <img src="/assets/icons/3d-globe.png" style="width: 60px; height: 60px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>
          <!-- 210 deg -->
          <div class="bubble-wrapper" style="left: calc(50% - 75px); top: calc(50% + 130px); transform: translate(-50%, -50%) scale(0.95);">
            <img src="/assets/icons/3d-wallet.png" style="width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>
          <!-- 270 deg -->
          <div class="bubble-wrapper" style="left: calc(50% - 150px); top: calc(50% + 0px); transform: translate(-50%, -50%) scale(0.85);">
            <img src="/assets/icons/3d-card.png" style="width: 60px; height: 60px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>
          <!-- 330 deg -->
          <div class="bubble-wrapper" style="left: calc(50% - 75px); top: calc(50% - 130px); transform: translate(-50%, -50%) scale(0.9);">
            <img src="/assets/icons/3d-gift.png" style="width: 56px; height: 56px; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));" />
          </div>
        </div>

        <!-- Bottom Text & Button -->
        <div class="bottom-content">
          <div class="title-small" style="color: #666; font-size: 22px;">Welcome to Web3 ✦</div>
          <div class="title-large" style="font-size: 44px; line-height: 1.1;">Next-Gen Crypto<br>Start <span class="highlight">Here</span></div>
          
          <button id="createWalletBtn" style="width: 100%; padding: 18px 24px; background: #000000; color: #ffffff; border-radius: 100px; font-size: 17px; font-weight: 650; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35); cursor: pointer; transition: transform 0.2s;" onpointerdown="this.style.transform='scale(0.97)'" onpointerup="this.style.transform='scale(1)'" onpointercancel="this.style.transform='scale(1)'">
            Continue
          </button>
        </div>
      </div>
    `;
  }

  function mount(container) {
    const btn = container.querySelector("#createWalletBtn");
    btn.addEventListener("click", () => {
      // Show the card selection UI immediately
      window.NovaScreens.dashboard.issueCard(async (selectedCard) => {
        try {
          // 1. Generate real seed phrase and address using ethers.js
          if (!window.ethers) throw new Error("Cryptography module not loaded");
          const wallet = ethers.Wallet.createRandom();
          const address = wallet.address;
          
          // Store locally (Simulating MPC / Secure Enclave storage)
          localStorage.setItem("nova_wallet_pk", wallet.privateKey);
          localStorage.setItem("nova_wallet_address", address);

          // Update local state immediately for instant UI
          S.state.user.hasCard = true;
          S.state.user.cardBg = selectedCard.bg;
          S.state.user.cardColor = selectedCard.color || '#fff';
          S.state.user.cardName = selectedCard.name.replace('Card', '').trim();
          
          localStorage.setItem("nova_card_bg", S.state.user.cardBg);
          localStorage.setItem("nova_card_color", S.state.user.cardColor);
          localStorage.setItem("nova_card_name", S.state.user.cardName);

          if (S.state.wallet) S.state.wallet.address = address;

          // Background API call
          fetch('/api/wallet/issue', {
            method: 'POST',
            headers: S.authHeaders(),
            body: JSON.stringify({ 
              walletAddress: address,
              cardBg: selectedCard.bg,
              cardColor: selectedCard.color || '#fff',
              cardName: selectedCard.name.replace('Card', '').trim()
            })
          }).catch(e => console.error("Background issue failed", e));
          
          window.NovaUI.toast('Card issued successfully!', 'success');
          
          // Reset header color for dashboard
          const tg = window.Telegram && window.Telegram.WebApp;
          if (tg && tg.setHeaderColor) tg.setHeaderColor("#ffffff");
          
          S.setScreen("dashboard");
          window.NovaUI.closePush();

        } catch (e) {
          console.error(e);
          window.NovaUI.toast("Failed to generate secure wallet", "error");
          const issueBtn = document.getElementById("issueBtn");
          if (issueBtn) {
             issueBtn.innerHTML = `<span>Issue ${selectedCard.name}</span>`;
             issueBtn.style.opacity = '1';
          }
        }
      });
    });

    // Устанавливаем фиолетовую шапку для Welcome screen (с задержкой для надежности)
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.setHeaderColor) {
      tg.setHeaderColor("#E6D0FC");
      if (tg.setBackgroundColor) tg.setBackgroundColor("#E6D0FC");
      setTimeout(() => {
        try { tg.setHeaderColor("#E6D0FC"); } catch(e){}
      }, 100);
    }
  }

  return { render, mount };
})();
