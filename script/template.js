const appTemplate = `
  <div class="hud-app">
    <header class="hud-header">
      <div class="hud-header-inner">
        <div class="header-left">
          <div class="indicator-eye">
            <div class="eye-inner"></div>
            <div class="eye-glare"></div>
          </div>
          <div class="indicator-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
        </div>
        <span class="hud-title">POKEDEX</span>
        <span class="hud-status">&#x25CF; ONLINE</span>
      </div>
    </header>

    <main class="hud-display">
      <div class="hud-display-inner">
        <div class="crt-overlay"></div>

        <div class="display-header">
          <div class="corner-bracket tl"></div>
          <div class="corner-bracket tr"></div>
          <span class="display-label">SYSTEM</span>
          <div class="scan-bar"></div>
          <span class="display-label right">BEREIT</span>
        </div>

        <div class="display-content" id="display-content">
          <div class="loading-screen hidden" id="loading-screen">
            <div class="loading-screen-box">
              <img class="loading-gif" src="asstes/img/pokemon-pokeball.gif" alt="Loading">
              <span class="loading-text">POKEDEX WIRD GELADEN</span>
            </div>
          </div>
          <div class="pokemon-grid" id="pokemon-grid"></div>

          <div class="pokemon-dialog hidden" id="pokemon-dialog">
            <div class="pokemon-dialog-card" id="pokemon-dialog-card">
              <button class="dialog-nav dialog-nav-left" id="dialog-prev-btn" aria-label="previous pokemon">&#x2039;</button>
              <button class="dialog-nav dialog-nav-right" id="dialog-next-btn" aria-label="next pokemon">&#x203A;</button>

              <div class="dialog-head" id="dialog-head">
                <div class="dialog-head-top">
                  <span class="dialog-id" id="dialog-pokemon-id">#0</span>
                  <span class="dialog-name" id="dialog-pokemon-name">Pokemon</span>
                  <button class="dialog-close" id="dialog-close-btn" aria-label="close">x</button>
                </div>
                <div class="dialog-image-wrap">
                  <img class="dialog-image" id="dialog-pokemon-image" src="" alt="pokemon">
                </div>
                <div class="dialog-types" id="dialog-pokemon-types"></div>
              </div>

              <div class="dialog-tabs">
                <button class="dialog-tab active" data-tab="main">main</button>
                <button class="dialog-tab" data-tab="stats">stats</button>
                <button class="dialog-tab" data-tab="evo">evo chain</button>
              </div>

              <div class="dialog-body">
                <div class="dialog-panel active" id="dialog-panel-main">
                  <div class="info-line"><span>Height</span><span id="dialog-height">-</span></div>
                  <div class="info-line"><span>Weight</span><span id="dialog-weight">-</span></div>
                  <div class="info-line"><span>Base experience</span><span id="dialog-base-exp">-</span></div>
                  <div class="info-line"><span>Abilities</span><span id="dialog-abilities">-</span></div>
                </div>

                <div class="dialog-panel" id="dialog-panel-stats">
                  <div id="dialog-stats-list"></div>
                </div>

                <div class="dialog-panel" id="dialog-panel-evo">
                  <div class="evo-chain" id="dialog-evo-chain"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="display-footer">
          <div class="corner-bracket bl"></div>
          <div class="corner-bracket br"></div>
          <span class="status-text">NR. --&nbsp;&nbsp;&nbsp;NAME: --------&nbsp;&nbsp;&nbsp;TYP: ------</span>
        </div>
      </div>
    </main>

    <div class="hud-controls">
      <div class="hud-controls-inner">
        <div class="controls-inner">
          <div class="dpad">
            <div class="dpad-h"></div>
            <div class="dpad-v"></div>
            <div class="dpad-center"></div>
          </div>

          <div class="search-area">
            <div class="search-row">
              <input type="text" class="search-input" id="search-input" placeholder="Pokemon suchen ..." />
              <button class="search-btn" id="search-btn">&#x1F50D;</button>
            </div>
            <button class="show-more-btn" id="show-more-btn">&#x25BC; MEHR ANZEIGEN</button>
          </div>

          <div class="ab-buttons">
            <button class="ab-btn b">B</button>
            <button class="ab-btn a">A</button>
          </div>
        </div>

        <div class="speaker-row">
          <span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
    </div>
  </div>
`;
