/**
 * KNEWTON HOMEWORK CAPTURE — BOOKMARKLET
 * =========================================
 * - Redesigned popup: cleaner, more modern UI with animated dots + check state
 * - Appear animation: smooth spring-in with blur + scale + translateY
 * - Dismiss animation: gravity fall — card drops away with a slight rotation
 * - Canvas (Desmos) → img snapshots
 * - Videos → thumbnail + title + watch link
 * - Deduplication: cleans up previous run before starting
 * - Uses native Print → Save as PDF
 *
 * PRINT SETTINGS:
 *   Destination: Save as PDF
 *   Scale: 80%
 *   Background graphics: ON
 */

(function () {

  // ── Deduplicate ────────────────────────────────────────────────────────────
  ['__kpwr', '__kpst', '__kpov', '__kpov_style'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  const CARD_SELECTOR = '.theme__card___3E6YM';
  const cards = Array.from(document.querySelectorAll(CARD_SELECTOR));

  if (!cards.length) {
    alert('No Knewton content cards found. Make sure you\'re on an assignment page.');
    return;
  }

  // ── Objective text ─────────────────────────────────────────────────────────
  const objCard = Array.from(document.querySelectorAll('.MuiCard-root'))
    .find(el => el.innerText.includes('CURRENT OBJECTIVE'));
  const objectiveText = objCard
    ? objCard.innerText.replace('CURRENT OBJECTIVE', '').replace('SWITCH', '').trim()
    : '';

  const rawName = objectiveText || document.title.replace(' | Knewton', '').trim();
  const fileName = rawName
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    .replace(/[\/\\:*?"<>|]/g, '').substring(0, 100);

  // ── Animation keyframes ────────────────────────────────────────────────────
  const animStyle = document.createElement('style');
  animStyle.id = '__kpov_style';
  animStyle.textContent = `
    @keyframes __kp-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes __kp-backdrop-out {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
    @keyframes __kp-card-in {
      0%   { opacity: 0; transform: translateY(32px) scale(0.94); filter: blur(4px); }
      55%  { opacity: 1; transform: translateY(-5px) scale(1.012); filter: blur(0); }
      75%  { transform: translateY(2px) scale(0.998); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes __kp-card-out {
      0%   { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); filter: blur(0); }
      18%  { transform: translateY(-10px) scale(1.025) rotate(-0.4deg); }
      100% { opacity: 0; transform: translateY(70px) scale(0.86) rotate(1.4deg); filter: blur(5px); }
    }
    @keyframes __kp-icon-pop {
      0%   { transform: scale(0.45) rotate(-14deg); opacity: 0; }
      65%  { transform: scale(1.2) rotate(3deg); opacity: 1; }
      82%  { transform: scale(0.97) rotate(-1deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    @keyframes __kp-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
    @keyframes __kp-bar-grow {
      0%   { width: 0%;    opacity: 0.5; }
      12%  { opacity: 1; }
      80%  { width: 94%; }
      100% { width: 100%; }
    }
    @keyframes __kp-tag-in {
      from { opacity: 0; transform: translateX(-7px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes __kp-row-in {
      from { opacity: 0; transform: translateY(5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes __kp-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes __kp-dot {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.25; }
      40%            { transform: translateY(-5px); opacity: 1; }
    }
    @keyframes __kp-glow {
      0%, 100% { opacity: 0.45; }
      50%       { opacity: 1; }
    }
    @keyframes __kp-check-draw {
      from { stroke-dashoffset: 30; }
      to   { stroke-dashoffset: 0; }
    }

    #__kpov {
      position: fixed; inset: 0; z-index: 999999;
      background: rgba(4,6,14,0.78);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system,'Segoe UI',system-ui,sans-serif;
      animation: __kp-backdrop-in 0.4s ease forwards;
    }
    #__kpov.__kp-closing {
      animation: __kp-backdrop-out 0.5s ease forwards;
      pointer-events: none;
    }
    #__kp-card {
      position: relative;
      background: linear-gradient(150deg,#0d1b35 0%,#080e1e 100%);
      border: 1px solid rgba(99,179,237,0.18);
      border-radius: 20px;
      padding: 28px 30px 24px;
      width: 370px;
      box-shadow:
        0 2px 0 rgba(99,179,237,0.1) inset,
        0 40px 100px rgba(0,0,0,0.75),
        0 0 60px rgba(37,99,235,0.08);
      overflow: hidden;
      animation: __kp-card-in 0.62s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    #__kpov.__kp-closing #__kp-card {
      animation: __kp-card-out 0.48s cubic-bezier(0.55, 0, 0.9, 0.5) forwards;
    }
  `;
  document.head.appendChild(animStyle);

  // ── Build overlay HTML ─────────────────────────────────────────────────────
  const dotRow = [0, 0.18, 0.36].map(delay =>
    `<div style="width:5px;height:5px;border-radius:50%;background:#60a5fa;` +
    `animation:__kp-dot 1.4s ease ${delay}s infinite;"></div>`
  ).join('');

  const settingsRows = [
    ['Destination', 'Save as PDF'],
    ['Scale', '80%'],
    ['Background graphics', 'ON'],
  ].map(([k, v], i) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;` +
    `opacity:0;animation:__kp-row-in 0.3s ease ${0.65 + i * 0.1}s forwards;">` +
    `<span style="font-size:11.5px;color:rgba(148,180,220,0.45);">${k}</span>` +
    `<span style="font-size:11.5px;font-weight:600;color:#60a5fa;` +
    `background:rgba(59,130,246,0.12);padding:2px 9px;border-radius:5px;letter-spacing:0.2px;">${v}</span></div>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.id = '__kpov';
  overlay.innerHTML =
    `<div id="__kp-card">` +

      // top glow line
      `<div style="position:absolute;top:0;left:10%;right:10%;height:1px;` +
        `background:linear-gradient(90deg,transparent,rgba(147,197,253,0.8),transparent);` +
        `animation:__kp-glow 2.8s ease infinite;"></div>` +

      // corner glow blob
      `<div style="position:absolute;top:-60px;right:-40px;width:160px;height:160px;border-radius:50%;` +
        `background:radial-gradient(circle,rgba(37,99,235,0.1),transparent 70%);pointer-events:none;"></div>` +

      // header
      `<div style="display:flex;align-items:center;gap:13px;margin-bottom:20px;">` +
        `<div style="width:44px;height:44px;border-radius:12px;` +
          `background:linear-gradient(135deg,#1e3a8a,#3b82f6);` +
          `display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;` +
          `box-shadow:0 4px 16px rgba(59,130,246,0.4);` +
          `animation:__kp-icon-pop 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;">📄</div>` +
        `<div>` +
          `<div style="font-size:17px;font-weight:700;color:#eef4ff;letter-spacing:-0.3px;">Knewton Capture</div>` +
          `<div style="font-size:11.5px;color:rgba(148,180,220,0.55);margin-top:1px;">${cards.length} card${cards.length !== 1 ? 's' : ''} detected</div>` +
        `</div>` +
        `<div id="__kp-dots" style="display:flex;gap:4px;align-items:center;margin-left:auto;">${dotRow}</div>` +
      `</div>` +

      // objective pill
      `<div style="background:rgba(30,64,175,0.12);border:1px solid rgba(59,130,246,0.18);` +
        `border-radius:12px;padding:10px 14px;margin-bottom:18px;` +
        `opacity:0;animation:__kp-tag-in 0.4s ease 0.35s forwards;">` +
        `<div style="font-size:9.5px;font-weight:700;letter-spacing:1.4px;color:rgba(99,179,237,0.45);` +
          `text-transform:uppercase;margin-bottom:4px;">Current objective</div>` +
        `<div style="font-size:12.5px;color:#b8d3ee;line-height:1.5;">${objectiveText || 'None detected'}</div>` +
      `</div>` +

      // status row
      `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;` +
        `opacity:0;animation:__kp-row-in 0.35s ease 0.52s forwards;">` +
        `<div id="__kp-spinner" style="width:14px;height:14px;border-radius:50%;` +
          `border:2px solid rgba(59,130,246,0.2);border-top-color:#60a5fa;` +
          `animation:__kp-spin 0.7s linear infinite;flex-shrink:0;"></div>` +
        `<div id="__kp-status" style="font-size:12.5px;color:rgba(148,180,220,0.75);">Preparing for print...</div>` +
      `</div>` +

      // progress bar
      `<div style="height:3px;background:rgba(255,255,255,0.07);border-radius:99px;overflow:hidden;margin-bottom:20px;">` +
        `<div style="height:100%;width:0%;border-radius:99px;` +
          `background:linear-gradient(90deg,#1d4ed8,#60a5fa,#1d4ed8);background-size:300% 100%;` +
          `animation:__kp-bar-grow 0.7s ease 0.15s forwards,__kp-shimmer 1.6s linear 0.85s infinite;">` +
        `</div>` +
      `</div>` +

      // settings
      `<div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:14px;">` +
        `<div style="font-size:9.5px;font-weight:700;letter-spacing:1.3px;` +
          `color:rgba(148,180,220,0.3);text-transform:uppercase;margin-bottom:8px;">When dialog opens</div>` +
        settingsRows +
      `</div>` +

    `</div>`;

  document.body.appendChild(overlay);

  // ── Snapshot canvases ──────────────────────────────────────────────────────
  const snaps = new Map();
  document.querySelectorAll(CARD_SELECTOR + ' canvas').forEach(c => {
    try { snaps.set(c, c.toDataURL('image/png')); } catch(e) { snaps.set(c, null); }
  });

  // ── Collect video iframe info ──────────────────────────────────────────────
  const origIframes = Array.from(document.querySelectorAll(CARD_SELECTOR + ' iframe'));
  const videoMeta = origIframes.map(el => {
    const src = el.getAttribute('src') || '';
    const ytMatch = src.match(/embed\/([a-zA-Z0-9_-]{11})/);
    const videoId = ytMatch ? ytMatch[1] : null;
    return {
      title: el.title || 'Video',
      videoId,
      watchUrl: videoId ? 'https://www.youtube.com/watch?v=' + videoId : null,
      thumbnailUrl: videoId ? 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg' : null,
      width: el.offsetWidth || 560,
      isYouTube: !!videoId
    };
  });

  // ── Build print wrapper ────────────────────────────────────────────────────
  const wr = document.createElement('div');
  wr.id = '__kpwr';
  wr.style.cssText = 'position:absolute;top:0;left:-9999px;width:1px;height:1px;overflow:hidden;';

  if (objectiveText) {
    const header = document.createElement('div');
    header.className = 'kpc kpc-header';
    header.innerHTML =
      `<div style="border:2px solid #1a56db;border-radius:8px;padding:16px 20px;background:#eff6ff;` +
      `display:inline-block;max-width:100%;box-sizing:border-box;` +
      `print-color-adjust:exact;-webkit-print-color-adjust:exact;">` +
      `<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#1a56db;` +
      `text-transform:uppercase;margin-bottom:4px;">Current Objective</div>` +
      `<div style="font-size:16px;font-weight:600;color:#1e3a5f;">${objectiveText}</div></div>`;
    wr.appendChild(header);
  }

  cards.forEach(card => {
    const cl = card.cloneNode(true);
    cl.className = 'kpc';
    cl.style.cssText = '';
    wr.appendChild(cl);
  });

  // ── Replace canvases with img snapshots ───────────────────────────────────
  const origCanvases = Array.from(document.querySelectorAll(CARD_SELECTOR + ' canvas'));
  Array.from(wr.querySelectorAll('canvas')).forEach((cc, i) => {
    const dataUrl = origCanvases[i] ? snaps.get(origCanvases[i]) : null;
    const img = document.createElement('img');
    img.style.cssText = 'display:block;max-width:100%;width:' + (cc.offsetWidth || 500) + 'px;height:auto;';
    img.src = dataUrl || 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300">' +
      '<rect width="500" height="300" fill="#f0f0f0" stroke="#ccc"/>' +
      '<text x="250" y="155" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#666">' +
      '[Interactive graph — view in browser]</text></svg>'
    );
    cc.parentNode.replaceChild(img, cc);
  });

  // ── Replace iframes with video placeholders ────────────────────────────────
  Array.from(wr.querySelectorAll('iframe')).forEach((cf, i) => {
    const meta = videoMeta[i];
    if (!meta) { cf.remove(); return; }
    const p = document.createElement('div');
    p.style.cssText = 'border:2px solid #1a56db;border-radius:8px;overflow:hidden;' +
      'max-width:' + meta.width + 'px;margin:8px 0;font-family:sans-serif;' +
      'print-color-adjust:exact;-webkit-print-color-adjust:exact;';
    if (meta.isYouTube && meta.thumbnailUrl) {
      p.innerHTML =
        `<div style="position:relative;background:#000;line-height:0;">` +
        `<img src="${meta.thumbnailUrl}" alt="Video thumbnail" style="width:100%;display:block;opacity:0.85;"/>` +
        `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);` +
          `width:64px;height:64px;background:rgba(255,0,0,0.9);border-radius:50%;` +
          `display:flex;align-items:center;justify-content:center;` +
          `print-color-adjust:exact;-webkit-print-color-adjust:exact;">` +
          `<div style="width:0;height:0;border-top:14px solid transparent;` +
            `border-bottom:14px solid transparent;border-left:24px solid white;margin-left:5px;"></div>` +
        `</div></div>` +
        `<div style="padding:12px 14px;background:#eff6ff;line-height:1.4;` +
          `print-color-adjust:exact;-webkit-print-color-adjust:exact;" data-kpvd="1">` +
          `<div style="font-size:13px;font-weight:600;color:#0f0f0f;margin-bottom:4px;">${meta.title}</div>` +
          `<a href="${meta.watchUrl}" style="font-size:11px;color:#065fd4;text-decoration:none;">` +
            `▶ Watch on YouTube → ${meta.watchUrl}</a></div>`;
    } else {
      p.innerHTML =
        `<div style="padding:16px;background:#eff6ff;text-align:center;` +
          `print-color-adjust:exact;-webkit-print-color-adjust:exact;" data-kpvd="1">` +
          `<div style="font-size:32px;margin-bottom:8px;">▶</div>` +
          `<div style="font-size:13px;font-weight:600;color:#333;">${meta.title}</div>` +
          `<div style="font-size:11px;color:#666;margin-top:4px;">[Video — view in browser]</div></div>`;
    }
    cf.parentNode.replaceChild(p, cf);
  });

  document.body.appendChild(wr);

  // ── Print styles ───────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.id = '__kpst';
  style.textContent = `
    @media print {
      #react-page, #MathJax_Message, #embedded-messaging,
      #claude-agent-glow-border, .back-to-top-mount,
      .embeddedMessagingSiteContextFrame, iframe, script {
        display: none !important;
      }
      #__kpwr {
        position: static !important; left: 0 !important;
        width: 100% !important; height: auto !important;
        overflow: visible !important; display: block !important;
      }
      html, body {
        margin: 0 !important; padding: 0 !important;
        background: white !important;
        height: auto !important; overflow: visible !important;
      }
      .kpc-header {
        page-break-after: avoid !important; break-after: avoid !important;
        padding: 16px 16px 8px 16px !important;
      }
      .kpc {
        page-break-after: always; break-after: page;
        width: 100% !important; height: auto !important;
        overflow: visible !important; position: relative !important;
        display: block !important; margin: 0 !important;
        padding: 16px !important; box-sizing: border-box !important;
        background: white !important;
      }
      .kpc * {
        overflow: visible !important; max-height: none !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .kpc img { max-width: 100% !important; display: block !important; height: auto !important; }
      .kpc:last-child { page-break-after: avoid; break-after: avoid; }
      .question-header__correct___12B8C {
        background-color: rgb(0,135,101) !important;
        color: rgb(255,255,255) !important;
        padding: 12px 16px !important; border-radius: 4px !important;
      }
      .lrn_responseIndex {
        background-color: rgb(105,105,105) !important;
        color: rgb(255,255,255) !important;
      }
      .lrn_correctAnswerList,
      .lrn_cloze_response,
      .lrn_textinput {
        background-color: rgb(240,240,240) !important;
        color: rgb(68,68,68) !important;
      }
      [data-kpvd] { background-color: #eff6ff !important; }
    }
  `;
  document.head.appendChild(style);

  // ── Trigger print with dismiss sequence ────────────────────────────────────
  setTimeout(() => {
    // Swap spinner → checkmark, update status text
    const spinner = document.getElementById('__kp-spinner');
    const statusEl = document.getElementById('__kp-status');
    const dotsEl = document.getElementById('__kp-dots');

    if (spinner) {
      spinner.style.animation = 'none';
      spinner.style.border = 'none';
      spinner.innerHTML =
        `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">` +
        `<polyline points="2.5,8 6.5,12 12.5,3.5" stroke="#4ade80" stroke-width="2" stroke-linecap="round" ` +
        `stroke-linejoin="round" stroke-dasharray="30" stroke-dashoffset="30" ` +
        `style="animation:__kp-check-draw 0.4s ease 0.05s forwards"/>` +
        `</svg>`;
    }
    if (statusEl) {
      statusEl.textContent = 'Ready — opening print dialog';
      statusEl.style.color = 'rgba(100,220,140,0.85)';
    }
    if (dotsEl) dotsEl.style.display = 'none';

    // Small pause so user sees the "Ready" state, then dismiss
    setTimeout(() => {
      const ov = document.getElementById('__kpov');
      if (ov) ov.classList.add('__kp-closing');
      setTimeout(() => {
        ov && ov.remove();
        document.getElementById('__kpov_style') && document.getElementById('__kpov_style').remove();

        const origTitle = document.title;
        document.title = fileName;
        window.print();

        const cleanup = () => {
          document.title = origTitle;
          style.remove();
          wr.remove();
        };
        window.addEventListener('afterprint', cleanup, { once: true });
        setTimeout(cleanup, 60000);
      }, 520);
    }, 600);
  }, 1000);

})();


/* ============================================================================
   BOOKMARKLET — minified
   Paste as bookmark URL in Edge / Chrome (prepend javascript: with no space)
   ----------------------------------------------------------------------------
javascript:(function(){['__kpwr','__kpst','__kpov','__kpov_style'].forEach(id=>{const e=document.getElementById(id);if(e)e.remove()});const CS='.theme__card___3E6YM';const cards=Array.from(document.querySelectorAll(CS));if(!cards.length){alert('No Knewton cards found.');return;}const objCard=Array.from(document.querySelectorAll('.MuiCard-root')).find(el=>el.innerText.includes('CURRENT OBJECTIVE'));const objTxt=objCard?objCard.innerText.replace('CURRENT OBJECTIVE','').replace('SWITCH','').trim():'';const rawName=objTxt||document.title.replace(' | Knewton','').trim();const fileName=rawName.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ').replace(/[\/\\:*?"<>|]/g,'').substring(0,100);const animStyle=document.createElement('style');animStyle.id='__kpov_style';animStyle.textContent=`@keyframes __kp-backdrop-in{from{opacity:0}to{opacity:1}}@keyframes __kp-backdrop-out{from{opacity:1}to{opacity:0}}@keyframes __kp-card-in{0%{opacity:0;transform:translateY(32px) scale(0.94);filter:blur(4px)}55%{opacity:1;transform:translateY(-5px) scale(1.012);filter:blur(0)}75%{transform:translateY(2px) scale(0.998)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}@keyframes __kp-card-out{0%{opacity:1;transform:translateY(0) scale(1) rotate(0deg);filter:blur(0)}18%{transform:translateY(-10px) scale(1.025) rotate(-0.4deg)}100%{opacity:0;transform:translateY(70px) scale(0.86) rotate(1.4deg);filter:blur(5px)}}@keyframes __kp-icon-pop{0%{transform:scale(0.45) rotate(-14deg);opacity:0}65%{transform:scale(1.2) rotate(3deg);opacity:1}82%{transform:scale(0.97) rotate(-1deg)}100%{transform:scale(1) rotate(0deg)}}@keyframes __kp-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}@keyframes __kp-bar-grow{0%{width:0%;opacity:.5}12%{opacity:1}80%{width:94%}100%{width:100%}}@keyframes __kp-tag-in{from{opacity:0;transform:translateX(-7px)}to{opacity:1;transform:translateX(0)}}@keyframes __kp-row-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}@keyframes __kp-spin{to{transform:rotate(360deg)}}@keyframes __kp-dot{0%,80%,100%{transform:translateY(0);opacity:.25}40%{transform:translateY(-5px);opacity:1}}@keyframes __kp-glow{0%,100%{opacity:.45}50%{opacity:1}}@keyframes __kp-check-draw{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}#__kpov{position:fixed;inset:0;z-index:999999;background:rgba(4,6,14,.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;font-family:-apple-system,'Segoe UI',system-ui,sans-serif;animation:__kp-backdrop-in .4s ease forwards}#__kpov.__kp-closing{animation:__kp-backdrop-out .5s ease forwards;pointer-events:none}#__kp-card{position:relative;background:linear-gradient(150deg,#0d1b35 0%,#080e1e 100%);border:1px solid rgba(99,179,237,.18);border-radius:20px;padding:28px 30px 24px;width:370px;box-shadow:0 2px 0 rgba(99,179,237,.1) inset,0 40px 100px rgba(0,0,0,.75),0 0 60px rgba(37,99,235,.08);overflow:hidden;animation:__kp-card-in .62s cubic-bezier(.22,1,.36,1) forwards}#__kpov.__kp-closing #__kp-card{animation:__kp-card-out .48s cubic-bezier(.55,0,.9,.5) forwards}`;document.head.appendChild(animStyle);const dotRow=[0,.18,.36].map(d=>`<div style="width:5px;height:5px;border-radius:50%;background:#60a5fa;animation:__kp-dot 1.4s ease ${d}s infinite;"></div>`).join('');const settingsRows=[['Destination','Save as PDF'],['Scale','80%'],['Background graphics','ON']].map(([k,v],i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;opacity:0;animation:__kp-row-in .3s ease ${.65+i*.1}s forwards;"><span style="font-size:11.5px;color:rgba(148,180,220,.45);">${k}</span><span style="font-size:11.5px;font-weight:600;color:#60a5fa;background:rgba(59,130,246,.12);padding:2px 9px;border-radius:5px;letter-spacing:.2px;">${v}</span></div>`).join('');const ov=document.createElement('div');ov.id='__kpov';ov.innerHTML=`<div id="__kp-card"><div style="position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(147,197,253,.8),transparent);animation:__kp-glow 2.8s ease infinite;"></div><div style="position:absolute;top:-60px;right:-40px;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.1),transparent 70%);pointer-events:none;"></div><div style="display:flex;align-items:center;gap:13px;margin-bottom:20px;"><div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#1e3a8a,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 4px 16px rgba(59,130,246,.4);animation:__kp-icon-pop .65s cubic-bezier(.34,1.56,.64,1) .1s both;">📄</div><div><div style="font-size:17px;font-weight:700;color:#eef4ff;letter-spacing:-.3px;">Knewton Capture</div><div style="font-size:11.5px;color:rgba(148,180,220,.55);margin-top:1px;">${cards.length} card${cards.length!==1?'s':''} detected</div></div><div id="__kp-dots" style="display:flex;gap:4px;align-items:center;margin-left:auto;">${dotRow}</div></div><div style="background:rgba(30,64,175,.12);border:1px solid rgba(59,130,246,.18);border-radius:12px;padding:10px 14px;margin-bottom:18px;opacity:0;animation:__kp-tag-in .4s ease .35s forwards;"><div style="font-size:9.5px;font-weight:700;letter-spacing:1.4px;color:rgba(99,179,237,.45);text-transform:uppercase;margin-bottom:4px;">Current objective</div><div style="font-size:12.5px;color:#b8d3ee;line-height:1.5;">${objTxt||'None detected'}</div></div><div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;opacity:0;animation:__kp-row-in .35s ease .52s forwards;"><div id="__kp-spinner" style="width:14px;height:14px;border-radius:50%;border:2px solid rgba(59,130,246,.2);border-top-color:#60a5fa;animation:__kp-spin .7s linear infinite;flex-shrink:0;"></div><div id="__kp-status" style="font-size:12.5px;color:rgba(148,180,220,.75);">Preparing for print...</div></div><div style="height:3px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;margin-bottom:20px;"><div style="height:100%;width:0%;border-radius:99px;background:linear-gradient(90deg,#1d4ed8,#60a5fa,#1d4ed8);background-size:300% 100%;animation:__kp-bar-grow .7s ease .15s forwards,__kp-shimmer 1.6s linear .85s infinite;"></div></div><div style="border-top:1px solid rgba(255,255,255,.07);padding-top:14px;"><div style="font-size:9.5px;font-weight:700;letter-spacing:1.3px;color:rgba(148,180,220,.3);text-transform:uppercase;margin-bottom:8px;">When dialog opens</div>${settingsRows}</div></div>`;document.body.appendChild(ov);const snaps=new Map();document.querySelectorAll(CS+' canvas').forEach(c=>{try{snaps.set(c,c.toDataURL('image/png'))}catch(e){snaps.set(c,null)}});const origIframes=Array.from(document.querySelectorAll(CS+' iframe'));const videoMeta=origIframes.map(el=>{const src=el.getAttribute('src')||'';const yt=src.match(/embed\/([a-zA-Z0-9_-]{11})/);const vid=yt?yt[1]:null;return{title:el.title||'Video',videoId:vid,watchUrl:vid?'https://www.youtube.com/watch?v='+vid:null,thumbnailUrl:vid?'https://img.youtube.com/vi/'+vid+'/hqdefault.jpg':null,width:el.offsetWidth||560,isYouTube:!!vid};});const wr=document.createElement('div');wr.id='__kpwr';wr.style.cssText='position:absolute;top:0;left:-9999px;width:1px;height:1px;overflow:hidden;';if(objTxt){const h=document.createElement('div');h.className='kpc kpc-header';h.innerHTML='<div style="border:2px solid #1a56db;border-radius:8px;padding:16px 20px;background:#eff6ff;display:inline-block;max-width:100%;box-sizing:border-box;print-color-adjust:exact;-webkit-print-color-adjust:exact;"><div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#1a56db;text-transform:uppercase;margin-bottom:4px;">Current Objective</div><div style="font-size:16px;font-weight:600;color:#1e3a5f;">'+objTxt+'</div></div>';wr.appendChild(h);}cards.forEach(card=>{const cl=card.cloneNode(true);cl.className='kpc';cl.style.cssText='';wr.appendChild(cl)});const origC=Array.from(document.querySelectorAll(CS+' canvas'));Array.from(wr.querySelectorAll('canvas')).forEach((cc,i)=>{const du=origC[i]?snaps.get(origC[i]):null;const img=document.createElement('img');img.style.cssText='display:block;max-width:100%;width:'+(cc.offsetWidth||500)+'px;height:auto;';img.src=du||'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300"><rect width="500" height="300" fill="#f0f0f0" stroke="#ccc"/><text x="250" y="155" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#666">[Interactive graph]</text></svg>');cc.parentNode.replaceChild(img,cc)});Array.from(wr.querySelectorAll('iframe')).forEach((cf,i)=>{const m=videoMeta[i];if(!m){cf.remove();return;}const p=document.createElement('div');p.style.cssText='border:2px solid #1a56db;border-radius:8px;overflow:hidden;max-width:'+m.width+'px;margin:8px 0;font-family:sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact;';if(m.isYouTube&&m.thumbnailUrl){p.innerHTML='<div style="position:relative;background:#000;line-height:0;"><img src="'+m.thumbnailUrl+'" alt="Video thumbnail" style="width:100%;display:block;opacity:0.85;"/><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;background:rgba(255,0,0,.9);border-radius:50%;display:flex;align-items:center;justify-content:center;print-color-adjust:exact;-webkit-print-color-adjust:exact;"><div style="width:0;height:0;border-top:14px solid transparent;border-bottom:14px solid transparent;border-left:24px solid white;margin-left:5px;"></div></div></div><div style="padding:12px 14px;background:#eff6ff;line-height:1.4;print-color-adjust:exact;-webkit-print-color-adjust:exact;" data-kpvd="1"><div style="font-size:13px;font-weight:600;color:#0f0f0f;margin-bottom:4px;">'+m.title+'</div><a href="'+m.watchUrl+'" style="font-size:11px;color:#065fd4;text-decoration:none;">▶ Watch on YouTube → '+m.watchUrl+'</a></div>';}else{p.innerHTML='<div style="padding:16px;background:#eff6ff;text-align:center;print-color-adjust:exact;-webkit-print-color-adjust:exact;" data-kpvd="1"><div style="font-size:32px;margin-bottom:8px;">▶</div><div style="font-size:13px;font-weight:600;color:#333;">'+m.title+'</div><div style="font-size:11px;color:#666;margin-top:4px;">[Video — view in browser]</div></div>';}cf.parentNode.replaceChild(p,cf)});document.body.appendChild(wr);const st=document.createElement('style');st.id='__kpst';st.textContent='@media print{#react-page,#MathJax_Message,#embedded-messaging,#claude-agent-glow-border,.back-to-top-mount,.embeddedMessagingSiteContextFrame,iframe,script{display:none!important;}#__kpwr{position:static!important;left:0!important;width:100%!important;height:auto!important;overflow:visible!important;display:block!important;}html,body{margin:0!important;padding:0!important;background:white!important;height:auto!important;overflow:visible!important;}.kpc-header{page-break-after:avoid!important;break-after:avoid!important;padding:16px 16px 8px 16px!important;}.kpc{page-break-after:always;break-after:page;width:100%!important;height:auto!important;overflow:visible!important;position:relative!important;display:block!important;margin:0!important;padding:16px!important;box-sizing:border-box!important;background:white!important;}.kpc *{overflow:visible!important;max-height:none!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}.kpc img{max-width:100%!important;display:block!important;height:auto!important;}.kpc:last-child{page-break-after:avoid;break-after:avoid;}.question-header__correct___12B8C{background-color:rgb(0,135,101)!important;color:rgb(255,255,255)!important;padding:12px 16px!important;border-radius:4px!important;}.lrn_responseIndex{background-color:rgb(105,105,105)!important;color:rgb(255,255,255)!important;}.lrn_correctAnswerList,.lrn_cloze_response,.lrn_textinput{background-color:rgb(240,240,240)!important;color:rgb(68,68,68)!important;}[data-kpvd]{background-color:#eff6ff!important;}}';document.head.appendChild(st);setTimeout(()=>{const sp=document.getElementById('__kp-spinner');const se=document.getElementById('__kp-status');const de=document.getElementById('__kp-dots');if(sp){sp.style.animation='none';sp.style.border='none';sp.innerHTML='<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><polyline points="2.5,8 6.5,12 12.5,3.5" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="30" stroke-dashoffset="30" style="animation:__kp-check-draw .4s ease .05s forwards"/></svg>';}if(se){se.textContent='Ready \u2014 opening print dialog';se.style.color='rgba(100,220,140,.85)';}if(de)de.style.display='none';setTimeout(()=>{const o=document.getElementById('__kpov');if(o)o.classList.add('__kp-closing');setTimeout(()=>{o&&o.remove();document.getElementById('__kpov_style')&&document.getElementById('__kpov_style').remove();const orig=document.title;document.title=fileName;window.print();const cleanup=()=>{document.title=orig;st.remove();wr.remove();};window.addEventListener('afterprint',cleanup,{once:true});setTimeout(cleanup,60000);},520);},600);},1000);})();
   ----------------------------------------------------------------------------
*/
