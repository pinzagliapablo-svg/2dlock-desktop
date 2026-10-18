/* Small in-game notification panel for desktop updates. It does nothing in a normal browser. */
(() => {
  'use strict';
  if (!window.desktopUpdater || typeof window.desktopUpdater.onStatus !== 'function') return;

  const styles = `
    #twoDlockDesktopUpdate { position:fixed; right:20px; bottom:20px; z-index:2147483000; width:min(380px,calc(100vw - 32px));
      padding:18px; display:none; color:#f8fbff; font:700 15px 'Rajdhani',sans-serif;
      background:linear-gradient(145deg,rgba(12,18,35,.98),rgba(28,5,29,.98));
      border:1px solid rgba(255,55,110,.8); border-radius:16px; box-shadow:0 16px 48px rgba(0,0,0,.65),0 0 24px rgba(255,20,100,.17); }
    #twoDlockDesktopUpdate.show { display:block; animation:twoDlockUpdateEnter .22s ease-out both; }
    #twoDlockDesktopUpdate .kicker { font-size:10px; letter-spacing:2px; color:#ff5c9b; font-weight:900; }
    #twoDlockDesktopUpdate .heading { margin:5px 0 7px; font-size:24px; line-height:1; font-weight:900; }
    #twoDlockDesktopUpdate .message { margin:0 0 12px; color:#c8d4e7; line-height:1.35; white-space:pre-wrap; overflow-wrap:anywhere; }
    #twoDlockDesktopUpdate .actions { display:flex; gap:8px; flex-wrap:wrap; }
    #twoDlockDesktopUpdate button { cursor:pointer; border:1px solid rgba(255,255,255,.18); border-radius:8px; padding:9px 12px;
      color:white; font:900 13px 'Rajdhani',sans-serif; background:#22243a; }
    #twoDlockDesktopUpdate button.primary { background:linear-gradient(110deg,#ff245c,#9d165d); border-color:#ff739e; }
    #twoDlockDesktopUpdate .bar { height:5px; width:100%; margin:10px 0 13px; overflow:hidden; background:#27253c; border-radius:6px; }
    #twoDlockDesktopUpdate .bar > span { display:block; height:100%; width:0; background:linear-gradient(90deg,#35f6ff,#ff3c91); transition:width .18s linear; }
    @keyframes twoDlockUpdateEnter { from {opacity:0;transform:translateY(9px) scale(.98)} to {opacity:1;transform:translateY(0) scale(1)} }
    @media (prefers-reduced-motion:reduce) { #twoDlockDesktopUpdate.show { animation:none } }
  `;
  const style = document.createElement('style');
  style.textContent = styles;
  (document.head || document.documentElement).appendChild(style);

  const panel = document.createElement('section');
  panel.id = 'twoDlockDesktopUpdate';
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-live', 'polite');
  panel.innerHTML = `
    <div class="kicker">2DLOCK • DESKTOP UPDATE</div>
    <div class="heading" id="twoDlockUpdateHeading">AGGIORNAMENTO</div>
    <p class="message" id="twoDlockUpdateMessage"></p>
    <div class="bar" id="twoDlockUpdateBar" hidden><span id="twoDlockUpdateProgress"></span></div>
    <div class="actions" id="twoDlockUpdateActions"></div>`;
  (document.body || document.documentElement).appendChild(panel);

  const heading = panel.querySelector('#twoDlockUpdateHeading');
  const message = panel.querySelector('#twoDlockUpdateMessage');
  const actions = panel.querySelector('#twoDlockUpdateActions');
  const bar = panel.querySelector('#twoDlockUpdateBar');
  const progress = panel.querySelector('#twoDlockUpdateProgress');
  let currentVersion = '';
  let downloading = false;

  function button(label, action, primary = false) {
    const el = document.createElement('button');
    el.type = 'button';
    el.textContent = label;
    if (primary) el.className = 'primary';
    el.addEventListener('click', action);
    actions.appendChild(el);
  }
  function show(title, detail) {
    heading.textContent = title;
    message.textContent = detail || '';
    panel.classList.add('show');
  }
  function hide() { panel.classList.remove('show'); }
  function resetActions() { actions.replaceChildren(); }

  window.desktopUpdater.onStatus((status) => {
    if (!status || !status.type) return;
    switch (status.type) {
      case 'available':
        currentVersion = status.version || '';
        downloading = false;
        bar.hidden = true;
        progress.style.width = '0%';
        resetActions();
        show('NUOVA VERSIONE', currentVersion ? `È disponibile la versione ${currentVersion}. Scaricarla ora?` : 'È disponibile una nuova versione di 2Dlock.');
        button('SCARICA', () => { resetActions(); downloading = true; window.desktopUpdater.downloadUpdate(); }, true);
        button('PIÙ TARDI', hide);
        break;
      case 'downloading-started':
        downloading = true;
        bar.hidden = false;
        resetActions();
        show('DOWNLOAD IN CORSO', 'Preparazione del download dell’aggiornamento…');
        break;
      case 'progress':
        bar.hidden = false;
        progress.style.width = `${Math.max(0, Math.min(100, Number(status.percent) || 0))}%`;
        show('DOWNLOAD IN CORSO', `Download aggiornamento: ${Math.max(0, Math.min(100, Number(status.percent) || 0))}%`);
        break;
      case 'downloaded':
        downloading = false;
        bar.hidden = true;
        resetActions();
        show('PRONTO PER INSTALLARE', `La versione ${status.version || currentVersion || 'nuova'} è stata scaricata. Riavvia 2Dlock per applicarla.`);
        button('INSTALLA E RIAVVIA', () => window.desktopUpdater.installUpdate(), true);
        button('DOPO', hide);
        break;
      case 'error':
        if (downloading) {
          downloading = false;
          resetActions();
          show('AGGIORNAMENTO NON RIUSCITO', 'Il gioco continua normalmente. Riprova quando la connessione è disponibile.');
          button('RIPROVA', () => window.desktopUpdater.checkForUpdates(), true);
          button('CHIUDI', hide);
        }
        break;
      case 'disabled':
        // A build without a release feed is still fully playable; keep this informational state quiet.
        break;
      default:
        break;
    }
  });
})();
