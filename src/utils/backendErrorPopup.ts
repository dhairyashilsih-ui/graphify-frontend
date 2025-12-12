type ToastVariant = 'error' | 'warning' | 'info';

const TOAST_ID = 'backend-error-toast';
let hideTimer: number | null = null;

type EndpointStatus = 'ok' | 'error' | 'unknown';

function buildStatus(message: string): { browser: EndpointStatus; edge: EndpointStatus; host: EndpointStatus; label: string } {
  const lower = (message || '').toLowerCase();
  const isHost = lower.includes('host');
  const isEdge = lower.includes('cloudflare') || lower.includes('edge');
  const isBrowser = lower.includes('browser') || lower.includes('client');

  if (isHost) return { browser: 'ok', edge: 'ok', host: 'error', label: 'Origin host error' };
  if (isEdge) return { browser: 'ok', edge: 'error', host: 'ok', label: 'Edge network error' };
  if (isBrowser) return { browser: 'error', edge: 'ok', host: 'ok', label: 'Browser connectivity issue' };
  return { browser: 'ok', edge: 'error', host: 'ok', label: 'Service unavailable' };
}

function ensureContainer(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null;

  let el = document.getElementById(TOAST_ID) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = TOAST_ID;
    el.style.position = 'fixed';
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.transform = 'translate(-50%, -50%) scale(0.96)';
    el.style.zIndex = '9999';
    el.style.maxWidth = '420px';
    el.style.width = 'min(90vw, 420px)';
    el.style.padding = '18px 20px';
    el.style.borderRadius = '16px';
    el.style.display = 'flex';
    el.style.gap = '12px';
    el.style.alignItems = 'flex-start';
    el.style.justifyContent = 'center';
    el.style.boxShadow = '0 20px 50px rgba(0,0,0,0.28)';
    el.style.backdropFilter = 'blur(16px) saturate(130%)';
    el.style.fontFamily = '"Plus Jakarta Sans", "Manrope", system-ui, -apple-system, sans-serif';
    el.style.color = '#0f172a';
    el.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(248,249,255,0.94))';
    el.style.border = '1px solid rgba(226, 232, 240, 0.9)';
    el.style.transition = 'transform 0.28s ease, opacity 0.28s ease';
    el.style.opacity = '0';

    const icon = document.createElement('div');
    icon.id = `${TOAST_ID}-icon`;
    icon.textContent = '✕';
    icon.style.fontWeight = '700';
    icon.style.color = '#b91c1c';
    icon.style.marginTop = '4px';
    icon.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))';

    const textWrap = document.createElement('div');
    textWrap.id = `${TOAST_ID}-text`;

    const title = document.createElement('div');
    title.id = `${TOAST_ID}-title`;
    title.textContent = 'Server Issue';
    title.style.fontWeight = '700';
    title.style.marginBottom = '6px';
    title.style.color = '#b91c1c';
    title.style.letterSpacing = '0.01em';

    const msg = document.createElement('div');
    msg.id = `${TOAST_ID}-message`;
    msg.style.fontSize = '15px';
    msg.style.lineHeight = '1.6';
    msg.style.color = '#1f2937';
    msg.style.color = '#0f172a';

    textWrap.appendChild(title);
    textWrap.appendChild(msg);
    el.appendChild(icon);
    el.appendChild(textWrap);

    document.body.appendChild(el);
  }
  return el;
}

export function showBackendErrorToast(message: string, variant: ToastVariant = 'error') {
  const el = ensureContainer();
  if (!el) return;

  const titleEl = document.getElementById(`${TOAST_ID}-title`);
  const msgEl = document.getElementById(`${TOAST_ID}-message`);
  const iconEl = document.getElementById(`${TOAST_ID}-icon`);
  const graphicElId = `${TOAST_ID}-graphic`;
  let graphic = document.getElementById(graphicElId) as HTMLDivElement | null;
  if (!graphic) {
    graphic = document.createElement('div');
    graphic.id = graphicElId;
    graphic.style.width = '100%';
    graphic.style.marginTop = '10px';
    graphic.style.marginBottom = '2px';
    el.appendChild(graphic);
  }

  const status = buildStatus(message);

  if (titleEl && iconEl) {
    if (variant === 'warning') {
      titleEl.textContent = 'Service Warning';
      iconEl.textContent = '⚠';
      el.style.border = '1px solid rgba(251, 191, 36, 0.45)';
      el.style.background = 'linear-gradient(135deg, rgba(255, 251, 235, 0.95), rgba(255, 255, 255, 0.96))';
    } else if (variant === 'info') {
      titleEl.textContent = 'Heads Up';
      iconEl.textContent = 'ℹ';
      el.style.border = '1px solid rgba(59, 130, 246, 0.35)';
      el.style.background = 'linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 0.96))';
    } else {
      titleEl.textContent = 'Server Issue';
      iconEl.textContent = '✕';
      el.style.border = '1px solid rgba(248, 113, 113, 0.35)';
      el.style.background = 'linear-gradient(135deg, rgba(254, 242, 242, 0.92), rgba(255, 255, 255, 0.96))';
    }
  }

  if (msgEl) {
    msgEl.textContent = message || 'Something went wrong with the backend service.';
  }

  if (graphic) {
    graphic.innerHTML = createDiagram(status.browser, status.edge, status.host);
  }

  requestAnimationFrame(() => {
    el.style.transform = 'translate(-50%, -50%) scale(1)';
    el.style.opacity = '1';
  });

  if (hideTimer) {
    window.clearTimeout(hideTimer);
  }
  hideTimer = window.setTimeout(() => {
    el.style.transform = 'translate(-50%, -50%) scale(0.96)';
    el.style.opacity = '0';
  }, 1500);
}

export function hideBackendErrorToast() {
  const el = document.getElementById(TOAST_ID);
  if (!el) return;
  el.style.transform = 'translate(-50%, -50%) scale(0.96)';
  el.style.opacity = '0';
}

function createDiagram(browser: EndpointStatus, edge: EndpointStatus, host: EndpointStatus): string {
  const getNodeColor = (s: EndpointStatus) => (s === 'ok' ? '#22c55e' : s === 'error' ? '#ef4444' : '#94a3b8');
  const getNodeBg = (s: EndpointStatus) => (s === 'ok' ? 'rgba(34,197,94,0.1)' : s === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.08)');
  const getStatusIcon = (s: EndpointStatus) => (s === 'ok' ? '✓' : s === 'error' ? '✕' : '?');

  // Pipe segments show green if connection is good up to that point, red if broken
  const pipe1Active = browser === 'ok';
  const pipe2Active = browser === 'ok' && edge === 'ok';

  return `
    <svg viewBox="0 0 380 160" width="100%" height="140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="overflow: visible;">
      <defs>
        <linearGradient id="pipeGreen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(34,197,94,0.5)" />
          <stop offset="100%" stop-color="rgba(34,197,94,0.25)" />
        </linearGradient>
        <linearGradient id="pipeRed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(239,68,68,0.5)" />
          <stop offset="100%" stop-color="rgba(239,68,68,0.3)" />
        </linearGradient>
        <linearGradient id="pipeGray" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(148,163,184,0.3)" />
          <stop offset="100%" stop-color="rgba(148,163,184,0.15)" />
        </linearGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.2" />
        </filter>
      </defs>
      
      <!-- Background card -->
      <rect x="10" y="10" width="360" height="140" rx="16" fill="rgba(248,250,252,0.95)" stroke="rgba(203,213,225,0.6)" stroke-width="1.5" />
      
      <!-- Transparent rounded pipes -->
      <g opacity="0.85">
        <!-- Pipe 1: Browser to Edge -->
        <rect x="105" y="63" width="65" height="14" rx="7" fill="${pipe1Active ? 'url(#pipeGreen)' : 'url(#pipeGray)'}" stroke="${pipe1Active ? '#22c55e' : '#cbd5e1'}" stroke-width="2" opacity="0.7" />
        
        <!-- Pipe 2: Edge to Host -->
        <rect x="195" y="63" width="65" height="14" rx="7" fill="${pipe2Active ? 'url(#pipeGreen)' : edge === 'error' ? 'url(#pipeRed)' : 'url(#pipeGray)'}" stroke="${pipe2Active ? '#22c55e' : edge === 'error' ? '#ef4444' : '#cbd5e1'}" stroke-width="2" opacity="0.7" />
      </g>
      
      <!-- Node circles with icons -->
      <g filter="url(#nodeShadow)">
        <!-- Browser node -->
        <circle cx="100" cy="70" r="28" fill="${getNodeBg(browser)}" stroke="${getNodeColor(browser)}" stroke-width="3" />
        <circle cx="100" cy="70" r="22" fill="white" opacity="0.9" />
        <text x="100" y="77" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif" font-size="20" font-weight="700" fill="${getNodeColor(browser)}">${getStatusIcon(browser)}</text>
        
        <!-- Edge/Cloudflare node -->
        <circle cx="190" cy="70" r="28" fill="${getNodeBg(edge)}" stroke="${getNodeColor(edge)}" stroke-width="3" />
        <circle cx="190" cy="70" r="22" fill="white" opacity="0.9" />
        <text x="190" y="77" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif" font-size="20" font-weight="700" fill="${getNodeColor(edge)}">${getStatusIcon(edge)}</text>
        
        <!-- Host node -->
        <circle cx="280" cy="70" r="28" fill="${getNodeBg(host)}" stroke="${getNodeColor(host)}" stroke-width="3" />
        <circle cx="280" cy="70" r="22" fill="white" opacity="0.9" />
        <text x="280" y="77" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif" font-size="20" font-weight="700" fill="${getNodeColor(host)}">${getStatusIcon(host)}</text>
      </g>
      
      <!-- Labels below nodes -->
      <g font-family="'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif" font-size="13" fill="#475569" font-weight="600">
        <text x="100" y="115" text-anchor="middle">Browser</text>
        <text x="190" y="115" text-anchor="middle">${edge === 'error' ? 'Edge' : 'Cloudflare'}</text>
        <text x="280" y="115" text-anchor="middle">Host</text>
      </g>
      
      <!-- Status labels -->
      <g font-family="'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif" font-size="10" fill="#64748b" font-weight="500">
        <text x="100" y="130" text-anchor="middle">${browser === 'ok' ? 'Working' : 'Error'}</text>
        <text x="190" y="130" text-anchor="middle">${edge === 'ok' ? 'Working' : 'Error'}</text>
        <text x="280" y="130" text-anchor="middle">${host === 'ok' ? 'Working' : 'Error'}</text>
      </g>
    </svg>
  `;
}
