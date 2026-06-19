(function () {
  'use strict';

  // Config from script tag attributes
  const script = document.currentScript || document.querySelector('script[data-api]');
  const API_BASE = (script && script.getAttribute('data-api')) || 'http://localhost:3001/api';
  const EMBED_URL = API_BASE.replace('/api', '') + '/embed';

  // Inject base styles
  const style = document.createElement('style');
  style.textContent = `
    #aria-widget-container * { box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
    #aria-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #378ADD, #8b72e8);
      border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(55,138,221,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #aria-bubble:hover { transform: scale(1.05); box-shadow: 0 6px 28px rgba(55,138,221,0.5); }
    #aria-bubble svg { width: 24px; height: 24px; fill: none; stroke: white; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #aria-frame-wrap {
      position: fixed; bottom: 88px; right: 24px; z-index: 999998;
      width: 360px; height: 520px; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      overflow: hidden; display: none;
      animation: ariaSlideUp 0.2s ease;
    }
    #aria-frame-wrap.open { display: block; }
    @keyframes ariaSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    #aria-frame { width: 100%; height: 100%; border: none; }
    #aria-unread {
      position: absolute; top: -2px; right: -2px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #e05a5a; border: 2px solid #fff;
      display: none;
    }
  `;
  document.head.appendChild(style);

  // Build DOM
  const container = document.createElement('div');
  container.id = 'aria-widget-container';

  const bubble = document.createElement('button');
  bubble.id = 'aria-bubble';
  bubble.setAttribute('aria-label', 'Open chat with Aria AI Assistant');
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  `;

  const unread = document.createElement('div');
  unread.id = 'aria-unread';
  bubble.appendChild(unread);

  const frameWrap = document.createElement('div');
  frameWrap.id = 'aria-frame-wrap';

  const frame = document.createElement('iframe');
  frame.id = 'aria-frame';
  frame.title = 'Aria AI Chat';
  frame.src = EMBED_URL + '?origin=' + encodeURIComponent(window.location.href);
  frame.allow = 'clipboard-write';
  frameWrap.appendChild(frame);

  container.appendChild(frameWrap);
  container.appendChild(bubble);
  document.body.appendChild(container);

  // Toggle
  let isOpen = false;
  bubble.addEventListener('click', function () {
    isOpen = !isOpen;
    frameWrap.classList.toggle('open', isOpen);
    unread.style.display = 'none';
    bubble.innerHTML = isOpen
      ? `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  });

  // Show unread dot after 8 seconds if not opened
  setTimeout(function () {
    if (!isOpen) unread.style.display = 'block';
  }, 8000);

  // Listen for messages from iframe (e.g. meeting booked event)
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'aria-meeting-booked') {
      console.log('[Aria] Meeting booked:', e.data.payload);
    }
  });
})();
