(function() {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function buildZicoSVG() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 160 100');
    svg.setAttribute('width', '160');
    svg.setAttribute('height', '100');
    svg.setAttribute('aria-label', 'Zico trotting');
    svg.style.cssText = 'overflow:visible;display:block;';

    svg.innerHTML = `
      <style>
        .zico-wrap { transform-origin: 80px 60px; animation: zicoBody 0.42s ease-in-out infinite; }
        @keyframes zicoBody { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }

        .leg-fl { transform-origin: 52px 62px; animation: legA 0.42s ease-in-out infinite; }
        .leg-fr { transform-origin: 62px 62px; animation: legB 0.42s ease-in-out infinite; }
        .leg-bl { transform-origin: 95px 62px; animation: legB 0.42s ease-in-out infinite; }
        .leg-br { transform-origin: 105px 62px; animation: legA 0.42s ease-in-out infinite; }

        @keyframes legA { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(18deg)} }
        @keyframes legB { 0%,100%{transform:rotate(18deg)} 50%{transform:rotate(-18deg)} }

        .tail { transform-origin: 130px 52px; animation: tailWag 0.7s ease-in-out infinite; }
        @keyframes tailWag { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(20deg)} }
      </style>

      <g class="zico-wrap">

        <!-- BODY: amber-brown, lean and athletic -->
        <ellipse cx="82" cy="60" rx="34" ry="18" fill="#c47a38"/>
        <!-- Lighter belly/chest -->
        <ellipse cx="70" cy="65" rx="18" ry="10" fill="#e8c99a"/>

        <!-- NECK -->
        <ellipse cx="52" cy="52" rx="12" ry="16" fill="#c47a38" transform="rotate(-15 52 52)"/>

        <!-- HEAD: narrow, angular, Malinois-shaped -->
        <ellipse cx="36" cy="42" rx="16" ry="13" fill="#c47a38"/>
        <!-- Pale face mask - distinctive feature -->
        <ellipse cx="32" cy="44" rx="10" ry="10" fill="#e8d0a0"/>
        <!-- Darker cap on top of head -->
        <ellipse cx="38" cy="34" rx="10" ry="6" fill="#a05c20"/>

        <!-- SNOUT: long and narrow -->
        <ellipse cx="20" cy="48" rx="12" ry="6" fill="#e8d0a0"/>
        <ellipse cx="13" cy="48" rx="5" ry="4" fill="#d4b880"/>
        <!-- Nose -->
        <ellipse cx="10" cy="47" rx="4" ry="3" fill="#1a1008"/>
        <!-- Mouth line -->
        <path d="M10 50 Q13 53 16 50" fill="none" stroke="#1a1008" stroke-width="1" stroke-linecap="round"/>

        <!-- EYES: amber/golden brown - very distinctive -->
        <circle cx="28" cy="40" r="4.5" fill="#1a1008"/>
        <circle cx="28" cy="40" r="3" fill="#b87020"/>
        <circle cx="28" cy="40" r="1.5" fill="#1a1008"/>
        <circle cx="27" cy="39" r="0.8" fill="white"/>

        <!-- EARS: large, upright, pointed - very characteristic -->
        <polygon points="34,30 28,10 22,30" fill="#a05c20"/>
        <polygon points="34,30 29,13 24,30" fill="#c47a38"/>
        <polygon points="46,28 42,10 38,28" fill="#a05c20"/>
        <polygon points="46,28 43,12 40,28" fill="#c47a38"/>
        <!-- Inner ear pale -->
        <polygon points="34,29 29,16 25,29" fill="#d4906060" opacity="0.4"/>
        <polygon points="45,27 42,14 39,27" fill="#d4906060" opacity="0.4"/>

        <!-- COLLAR - dark leather -->
        <path d="M42 54 Q52 48 62 52" fill="none" stroke="#3a1f0a" stroke-width="4" stroke-linecap="round"/>
        <circle cx="52" cy="51" r="2" fill="#888" stroke="#666" stroke-width="0.5"/>

        <!-- LEGS: lean, long -->
        <g class="leg-fl">
          <rect x="49" y="62" width="7" height="22" rx="3.5" fill="#c47a38"/>
          <ellipse cx="52" cy="84" rx="5" ry="2.5" fill="#d4b070"/>
        </g>
        <g class="leg-fr">
          <rect x="59" y="62" width="7" height="22" rx="3.5" fill="#b86a28"/>
          <ellipse cx="62" cy="84" rx="5" ry="2.5" fill="#c4a060"/>
        </g>
        <g class="leg-bl">
          <rect x="92" y="62" width="7" height="22" rx="3.5" fill="#c47a38"/>
          <ellipse cx="95" cy="84" rx="5" ry="2.5" fill="#d4b070"/>
        </g>
        <g class="leg-br">
          <rect x="102" y="62" width="7" height="22" rx="3.5" fill="#b86a28"/>
          <ellipse cx="105" cy="84" rx="5" ry="2.5" fill="#c4a060"/>
        </g>

        <!-- TAIL: long, curves upward when trotting -->
        <g class="tail">
          <path d="M128 55 Q142 40 148 28 Q152 20 148 16" fill="none" stroke="#c47a38" stroke-width="6" stroke-linecap="round"/>
          <path d="M128 55 Q142 40 148 28 Q152 20 148 16" fill="none" stroke="#d49050" stroke-width="3.5" stroke-linecap="round"/>
        </g>

      </g>
    `;
    return svg;
  }

  function spawnZico() {
    const wrapper = document.createElement('div');
    wrapper.id = 'zico-walker';
wrapper.style.cssText = `
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  left: -180px;
  top: 30%;
    `;
    const svg = buildZicoSVG();
svg.style.transform = 'scaleX(-1)';
wrapper.appendChild(svg);
document.body.appendChild(wrapper);

   let x = -180;  
let y = window.innerHeight * 0.3;   // bottom-left spawn
    let vx = 2.0;
    let vy = 0;
    let facingRight = true;
    let tick = 0;
    let targetX = window.innerWidth * 0.7;
    let targetY = window.innerHeight * 0.6;

    function pickNewTarget() {
      targetX = Math.random() * (window.innerWidth - 180) + 20;
      targetY = Math.random() * (window.innerHeight - 120) + 40;
    }

    function frame() {
      tick++;
      if (tick % 300 === 0) pickNewTarget();

      const dx = targetX - x;
      const dy = targetY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 8) {
        vx = (dx / dist) * 2.2;
        vy = (dy / dist) * 1.0;
      } else {
        pickNewTarget();
      }

      x += vx;
      y += vy;
      x = Math.max(-170, Math.min(window.innerWidth + 10, x));
      y = Math.max(10, Math.min(window.innerHeight - 110, y));

      const svg = wrapper.querySelector('svg');
      if (vx < -0.3 && facingRight) {
        facingRight = false;
        svg.style.transform = 'scaleX(1)';
      } else if (vx > 0.3 && !facingRight) {
        facingRight = true;
        svg.style.transform = 'scaleX(-1)';
      }

      wrapper.style.left = x + 'px';
      wrapper.style.top = y + 'px';

      if (x > window.innerWidth + 20) {
        x = -180; y = Math.random() * (window.innerHeight - 120) + 40;
        vx = 2.2; facingRight = true;
        svg.style.transform = 'scaleX(1)';
        pickNewTarget();
      }

      requestAnimationFrame(frame);
    }

    frame();
  }

  function waitForOpen() {
    if (document.body.classList.contains('invitation-open')) {
      setTimeout(spawnZico, 1200);
      return;
    }
    const obs = new MutationObserver(() => {
      if (document.body.classList.contains('invitation-open')) {
        obs.disconnect();
        setTimeout(spawnZico, 1200);
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForOpen);
} else {
  waitForOpen();
}
})();