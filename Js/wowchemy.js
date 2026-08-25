/* ============================================================
   NAVEED GEO â€” Portfolio JavaScript Engine
   WebGL Terrain Â· Cursor Â· Typewriter Â· Scroll Reveal
   Navbar Â· Filter Â· Counter Â· Active Nav Â· Back to Top
   ============================================================ */

'use strict';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   1.  CUSTOM CURSOR
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;   // dot  â€” instant
  let rx = -100, ry = -100;   // ring â€” lagged

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function animateRing() {
    // dot snaps instantly
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';

    // ring follows with slight lag
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    requestAnimationFrame(animateRing);
  })();

  // Scale on interactive elements
  const targets = 'a, button, .filter-btn, .project-card, .viz-card, .skill-card, .contact-link-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(targets)) {
      dot.style.width    = '20px';
      dot.style.height   = '20px';
      ring.style.width   = '52px';
      ring.style.height  = '52px';
      ring.style.opacity = '0.3';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(targets)) {
      dot.style.width    = '10px';
      dot.style.height   = '10px';
      ring.style.width   = '36px';
      ring.style.height  = '36px';
      ring.style.opacity = '0.6';
    }
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '0.6';
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   2.  WEBGL TERRAIN CANVAS
   Procedural ridged-fractal noise terrain,
   rendered as a glowing wireframe elevation field.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initTerrain() {
  const canvas = document.getElementById('terrain-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { initCanvasFallback(canvas); return; }

  /* ---- resize ---- */
  function resize() {
    canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- shaders ---- */
  const vsSource = `
    attribute vec2 a_pos;
    uniform float u_time;
    uniform vec2  u_res;
    varying float v_height;
    varying float v_dist;

    float hash(vec2 p){
      return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
    }
    float noise(vec2 p){
      vec2 i=floor(p); vec2 f=fract(p);
      vec2 u=f*f*(3.0-2.0*f);
      return mix(mix(hash(i+vec2(0,0)),hash(i+vec2(1,0)),u.x),
                 mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
    }
    float fbm(vec2 p){
      float v=0.0,a=0.5;
      for(int i=0;i<6;i++){
        v+=a*noise(p); p*=2.1; a*=0.5;
      }
      return v;
    }
    float ridged(vec2 p){
      float v=0.0,a=0.5;
      for(int i=0;i<5;i++){
        float n=noise(p)*2.0-1.0;
        v+=a*(1.0-abs(n)); p*=2.1; a*=0.48;
      }
      return v;
    }

    void main(){
      vec2 uv = a_pos;
      float t = u_time * 0.18;

      /* combine fbm + ridged for dramatic terrain */
      float h = ridged(uv * 2.2 + vec2(t * 0.4, t * 0.25)) * 0.6
              + fbm(uv * 1.6 + vec2(-t * 0.3, t * 0.2))     * 0.4;
      h = h * 0.55;   /* amplitude */

      v_height = h;

      /* perspective-like tilt: map grid to screen */
      vec2 screen = uv;
      screen.x = screen.x * 2.0 - 1.0;
      screen.y = screen.y * 2.0 - 1.0;

      /* tilt the plane */
      float tilt  = 0.55;
      float yOff  = screen.y * tilt;
      float zDepth= 1.0 + (screen.y * 0.5 + 0.5) * 0.6;

      vec2 aspect = vec2(1.0, u_res.x / u_res.y);
      vec2 pos    = vec2(screen.x / zDepth, (yOff + h * 1.3) / zDepth);
      pos.y -= 0.22;   /* shift down slightly */

      v_dist = length(screen);
      gl_Position = vec4(pos, 0.0, 1.0);
      gl_PointSize = 1.5;
    }
  `;

  const fsSource = `
    precision mediump float;
    varying float v_height;
    varying float v_dist;
    void main(){
      /* height-based colour: teal â†’ blue â†’ dark */
      vec3 low  = vec3(0.05, 0.12, 0.22);
      vec3 mid  = vec3(0.10, 0.65, 0.55);
      vec3 high = vec3(0.70, 1.00, 0.85);
      vec3 col  = mix(low, mid,  smoothstep(0.15, 0.50, v_height));
          col   = mix(col, high, smoothstep(0.50, 0.80, v_height));

      /* fade edges */
      float edge = 1.0 - smoothstep(0.6, 1.2, v_dist);
      gl_FragColor = vec4(col, edge * 0.75);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER,   vsSource));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  /* ---- geometry: grid of lines ---- */
  const GRID = 96;                         // resolution
  const verts = [];
  const STEP  = 1 / GRID;

  // horizontal lines (rows)
  for (let row = 0; row <= GRID; row++) {
    const v = row * STEP;
    for (let col = 0; col < GRID; col++) {
      verts.push(col * STEP, v, (col + 1) * STEP, v);
    }
  }
  // vertical lines (columns)  â€” sparser
  for (let col = 0; col <= GRID; col += 2) {
    const u = col * STEP;
    for (let row = 0; row < GRID; row++) {
      verts.push(u, row * STEP, u, (row + 1) * STEP);
    }
  }

  const buf  = gl.createBuffer();
  const data = new Float32Array(verts);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const aPos   = gl.getAttribLocation(prog,  'a_pos');
  const uTime  = gl.getUniformLocation(prog, 'u_time');
  const uRes   = gl.getUniformLocation(prog, 'u_res');

  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 8, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  /* ---- render loop ---- */
  let t0 = null;
  function render(ts) {
    if (!t0) t0 = ts;
    const t = (ts - t0) * 0.001;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes,  canvas.width, canvas.height);

    gl.drawArrays(gl.LINES, 0, data.length / 2);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();

/* Canvas fallback: CSS gradient animation */
function initCanvasFallback(canvas) {
  canvas.style.cssText = `
    background: radial-gradient(ellipse 120% 80% at 60% 60%,
      rgba(74,240,196,.08) 0%, transparent 65%);
    animation: terrainFade 6s ease-in-out infinite alternate;
  `;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes terrainFade {
      from { opacity:.4 } to { opacity:.8 }
    }`;
  document.head.appendChild(style);
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   3.  TYPEWRITER EFFECT
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initTypewriter() {
  const el = document.getElementById('typed');
  if (!el) return;

  const phrases = [
    'GIS & Remote Sensing Expert',
    'Geospatial Data Scientist',
    'Google Earth Engine Developer',
    'GeoAI Researcher',
    'Satellite Image Analyst',
    'Cartographer & Mapper',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  function tick() {
    const current = phrases[phraseIdx];

    if (paused) { paused = false; setTimeout(tick, 1600); return; }

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) { deleting = true; paused = true; }
      setTimeout(tick, 70 + Math.random() * 40);
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35);
    }
  }
  setTimeout(tick, 1000);
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   4.  NAVBAR  â€”  scroll + active section
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links  = document.querySelectorAll('.nav-link');
  if (!navbar) return;

  /* scroll class */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else                      navbar.classList.remove('scrolled');
  }, { passive: true });

  /* active link highlighting via IntersectionObserver */
  const sections = document.querySelectorAll('section[id]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   5.  MOBILE MENU
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow =
      mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
}

function closeMobile() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   6.  SCROLL REVEAL
   Finds .reveal / .reveal-left / .reveal-right
   and adds .visible when the element enters the viewport.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initScrollReveal() {
  const classes   = ['.reveal', '.reveal-left', '.reveal-right'];
  const all       = document.querySelectorAll(classes.join(','));
  if (!all.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  all.forEach(el => io.observe(el));
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   7.  PROJECT FILTER
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.project-card');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      /* active state */
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const tags = (card.dataset.tags || '').split(' ');
        const show = filter === '*' || tags.includes(filter);

        if (show) {
          card.classList.remove('hidden');
          /* re-trigger reveal animation */
          card.classList.remove('visible');
          requestAnimationFrame(() => card.classList.add('visible'));
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* Make all cards visible on load */
  cards.forEach(c => c.classList.add('visible'));
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   8.  ANIMATED STAT COUNTERS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initCounters() {
  const nums = document.querySelectorAll('.hero-stat-num');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.replace(/[^0-9]/g, '');
      if (!raw) return;

      const target = parseInt(raw, 10);
      /* Preserve the suffix <span> element so its accent colour is kept */
      const suffixEl   = el.querySelector('span');
      const suffixText = suffixEl ? suffixEl.textContent : '';
      const start  = performance.now();
      const dur    = 1400;

      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);    // ease-out cubic
        const num  = Math.floor(ease * target);
        /* Rebuild with span so accent styling survives */
        if (suffixEl) {
          el.textContent = num;
          el.appendChild(suffixEl);
        } else {
          el.textContent = num + suffixText;
        }
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   9.  BACK TO TOP BUTTON
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initBackTop() {
  const btn = document.getElementById('back-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) btn.classList.add('show');
    else                       btn.classList.remove('show');
  }, { passive: true });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   10.  SMOOTH SCROLL FOR ALL ANCHOR LINKS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   11.  SKILL CARDS  â€”  staggered entrance
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initSkillCards() {
  const cards = document.querySelectorAll('.skill-card');
  cards.forEach((card, i) => {
    card.style.transitionDelay = (i * 0.08) + 's';
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   12.  VIZ CARDS  â€”  tilt on mouse move
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initTilt() {
  const cards = document.querySelectorAll('.viz-card, .project-card');
  if (window.innerWidth < 768) return;   // skip on mobile

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) / (r.width  / 2);
      const dy  = (e.clientY - cy) / (r.height / 2);
      const rot = 5;    // max degrees

      card.style.transform =
        `perspective(800px) rotateY(${dx * rot}deg) rotateX(${-dy * rot}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform .1s';
    });
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   13.  THEME  â€”  respect OS preference
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initTheme() {
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   14.  PAGE LOAD FADE-IN
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .5s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
  /* fallback */
  setTimeout(() => { document.body.style.opacity = '1'; }, 600);
})();


/* ============================================================
   CONTINUED â€” Loader Â· Progress Bar Â· Particles Â· Sections
   ============================================================ */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   15.  LOADING SCREEN
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initLoader() {
  const loader = document.getElementById('loader');
  const pct    = document.getElementById('loader-pct');
  if (!loader) return;

  let count = 0;
  const tick = setInterval(() => {
    count += Math.floor(Math.random() * 18) + 8;
    if (count >= 100) { count = 100; clearInterval(tick); }
    if (pct) pct.textContent = count + '%';
  }, 80);

  const hide = () => {
    clearInterval(tick);
    if (pct) pct.textContent = '100%';
    setTimeout(() => loader.classList.add('hidden'), 200);
  };

  if (document.readyState === 'complete') { hide(); }
  else { window.addEventListener('load', hide); }
  /* safety net â€” never block for more than 2.5s */
  setTimeout(hide, 2500);
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   16.  SCROLL PROGRESS BAR
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;

  const update = () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   17.  FLOATING PARTICLES
   Lightweight canvas â€” dots connected by lines,
   drifting slowly across the page.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COUNT  = 55;
  const MAX_D  = 130;   /* max connection distance */
  const SPEED  = 0.28;
  const ACCENT = [74, 240, 196];
  const BLUE   = [74, 143, 255];

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); build(); }, { passive: true });

  function rand(min, max) { return min + Math.random() * (max - min); }

  function build() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x:  rand(0, W),
        y:  rand(0, H),
        vx: rand(-SPEED, SPEED),
        vy: rand(-SPEED, SPEED),
        r:  rand(1, 2.2),
        col: Math.random() > .5 ? ACCENT : BLUE,
      });
    }
  }
  build();

  let mx = -9999, my = -9999;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* update positions */
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      /* subtle mouse repulsion */
      const dx = p.x - mx, dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const force = (80 - dist) / 80 * 0.6;
        p.vx += (dx / dist) * force * 0.06;
        p.vy += (dy / dist) * force * 0.06;
        /* dampen to avoid runaway speed */
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (spd > SPEED * 3) { p.vx *= 0.92; p.vy *= 0.92; }
      }
    });

    /* draw connections */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_D) {
          const alpha = (1 - d / MAX_D) * 0.18;
          const col   = a.col;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    /* draw dots */
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},0.55)`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   18.  SECTION IN-VIEW CLASS
   Adds .in-view to sections when they enter
   the viewport â€” triggers CSS border animation.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initSectionInView() {
  const sections = document.querySelectorAll('.section');
  if (!sections.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in-view');
    });
  }, { threshold: 0.08 });

  sections.forEach(s => io.observe(s));
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   19.  SKILL PROGRESS BARS
   Animates .skill-bar-fill width when visible.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-bar-fill');
  if (!fills.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = e.target.dataset.width || '80%';
        e.target.style.width = target;
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  fills.forEach(f => io.observe(f));
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   20.  IMAGE LIGHTBOX
   Click any .viz-card img to expand full-screen.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initLightbox() {
  /* create overlay once */
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9000;
    background:rgba(0,0,0,.92);backdrop-filter:blur(12px);
    display:none;align-items:center;justify-content:center;
    padding:24px;cursor:zoom-out;
  `;
  const img = document.createElement('img');
  img.style.cssText = `
    max-width:92vw;max-height:88vh;border-radius:8px;
    box-shadow:0 20px 80px rgba(0,0,0,.8);
    transform:scale(.9);opacity:0;
    transition:transform .3s cubic-bezier(.16,1,.3,1), opacity .3s ease;
  `;
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    position:absolute;top:20px;right:28px;
    color:#fff;font-size:2rem;background:none;border:none;
    cursor:pointer;opacity:.7;line-height:1;
  `;
  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  const open = src => {
    img.src = src;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      img.style.transform = 'scale(1)';
      img.style.opacity   = '1';
    }));
  };

  const close = () => {
    img.style.transform = 'scale(.9)';
    img.style.opacity   = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }, 280);
  };

  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  /* attach to viz-card images */
  document.querySelectorAll('.viz-card img, .project-img img').forEach(el => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', e => { e.stopPropagation(); open(el.src); });
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   21.  SMOOTH PAGE TRANSITIONS
   Fades out before navigating to sub-pages.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initPageTransitions() {
  /* only intercept links that go to .html pages (sub-pages) */
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    /* skip target="_blank" links */
    if (link.target === '_blank') return;

    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.href;
      document.body.style.transition = 'opacity .3s ease';
      document.body.style.opacity    = '0';
      setTimeout(() => { window.location.href = href; }, 280);
    });
  });
})();

/* =========================================================
   CREDENTIALS INTERACTIONS â€” section 21
   NOTE: The hardened V2 toggle handlers are in sections 43
   and 44 below.  This section only wires the awardsButton
   scroll behaviour; courses and certs are handled by 43/44.
========================================================= */
(function initCredentialsToggles(){
  // Awards button â€” scroll the awards card into view
  const awardsBtn = document.getElementById('awardsButton');
  if (awardsBtn) {
    awardsBtn.addEventListener('click', () => {
      const awardsCard = awardsBtn.closest('.credential-card');
      if (awardsCard) {
        awardsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   22.  KEYBOARD NAVIGATION
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    /* close mobile menu */
    closeMobile && closeMobile();
  }
});

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   23.  SECTION ACTIVE WATERMARK FADE
   Increases watermark opacity for active section.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initWatermarkFade() {
  const marks = document.querySelectorAll('.section-watermark');
  if (!marks.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.target.style.transition = 'opacity .8s ease';
      e.target.style.opacity    = e.isIntersecting ? '1' : '0';
    });
  }, { threshold: 0.3 });

  marks.forEach(m => { m.style.opacity = '0'; io.observe(m); });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   24.  CONTACT LINKS â€” copy email on click
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initCopyEmail() {
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(link => {
    link.addEventListener('click', () => {
      const addr = link.href.replace('mailto:', '');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(addr).catch(() => {});
      }
    });
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   25.  FOOTER PORTFOLIO EVOLUTION TOOLTIP
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initEvoItems() {
  const items = document.querySelectorAll('.evo-item');
  const tips  = ['GIS Student Â· 2024', 'GIS Engineer Â· Now', 'GeoAI Researcher Â· Soon'];
  items.forEach((item, i) => {
    item.setAttribute('data-tip', tips[i] || '');
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   26.  HERO SCROLL INDICATOR â€” hide after scroll
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initHeroScroll() {
  const el = document.querySelector('.hero-scroll');
  if (!el) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) el.classList.add('hidden');
    else                      el.classList.remove('hidden');
  }, { passive: true });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   27.  FLOATING BADGES â€” pause on hover
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.querySelectorAll('.float-badge').forEach(b => {
  b.addEventListener('mouseenter', () => b.style.animationPlayState = 'paused');
  b.addEventListener('mouseleave', () => b.style.animationPlayState = 'running');
});

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   28.  MOBILE MENU â€” close on resize to desktop
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMobile && closeMobile();
}, { passive: true });

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   29.  SECTION WATERMARKS â€” number sequencing fix
   Ensures watermarks are absolutely positioned
   and won't affect layout flow.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.querySelectorAll('.section-watermark').forEach(w => {
  w.style.position    = 'absolute';
  w.style.right       = '-10px';
  w.style.top         = '50%';
  w.style.transform   = 'translateY(-50%)';
  w.style.pointerEvents = 'none';
  w.style.userSelect  = 'none';
  w.style.zIndex      = '0';
});

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   30.  OPEN-TO ITEMS â€” stagger entrance
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initOpenTo() {
  const items = document.querySelectorAll('.open-to-item');
  items.forEach((item, i) => {
    item.style.transitionDelay = (i * 0.07) + 's';
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   31.  PUB CARDS â€” staggered entrance
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initPubCards() {
  const cards = document.querySelectorAll('.pub-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateX(0)';
        }, i * 120);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateX(-20px)';
    c.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1)';
    io.observe(c);
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   32.  EXPERIENCE CARDS â€” staggered from left
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initExpCards() {
  const cards = document.querySelectorAll('.timeline-item');
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateX(0)';
        }, i * 100);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateX(-30px)';
    c.style.transition = 'opacity .65s ease, transform .65s cubic-bezier(.16,1,.3,1)';
    io.observe(c);
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   33.  RESEARCH CARDS â€” stagger from bottom
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initResearchCards() {
  const cards = document.querySelectorAll('.research-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateY(0)';
        }, i * 90);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateY(24px)';
    c.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1)';
    io.observe(c);
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   34.  VIZ CARDS â€” stagger
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initVizCards() {
  const cards = document.querySelectorAll('.viz-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'scale(1)';
        }, i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'scale(.95)';
    c.style.transition = 'opacity .55s ease, transform .55s cubic-bezier(.16,1,.3,1)';
    io.observe(c);
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   35.  CONTACT LINKS â€” stagger entrance
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initContactLinks() {
  const items = document.querySelectorAll('.contact-link-item');
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateX(0)';
        }, i * 100);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(-16px)';
    item.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.16,1,.3,1), border-color .3s, background .3s, box-shadow .3s';
    io.observe(item);
  });
})();

/* ============================================================
   SEARCH SYSTEM + DARK/LIGHT THEME TOGGLE
   ============================================================ */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   36.  SEARCH DATA
   Single source of truth â€” every searchable item.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SEARCH_DATA = [
  /* â”€â”€ About â”€â”€ */
  { title:'About Me',            desc:'GIS & Remote Sensing Expert Â· Geospatial Data Scientist',  icon:'fas fa-user',          tag:'Section',  href:'#about'         },
  /* â”€â”€ Experience â”€â”€ */
  { title:'Teaching Assistant â€” IGEO',  desc:'GIS Programming Â· Arid Agriculture University',    icon:'fas fa-chalkboard-teacher', tag:'Experience', href:'#experience' },
  { title:'GIS Assistant â€” Tech-GIS',   desc:'Land Record Systems Â· Sargodha & DK-Khan',         icon:'fas fa-briefcase',     tag:'Experience', href:'#experience'   },
  { title:'GIS Technician â€” Greenage',  desc:'GPS/DGPS Surveys Â· Drone Imagery Â· ArcMap',        icon:'fas fa-briefcase',     tag:'Experience', href:'#experience'   },
  { title:'GIS Digitizer â€” Mindgenix',  desc:'FTTH Fiber Network Planning Â· Sialkot',            icon:'fas fa-briefcase',     tag:'Experience', href:'#experience'   },
  { title:'WebGIS â€” Regional Plan9',    desc:'Population Decline Countries Â· Spatial Analysis',  icon:'fas fa-briefcase',     tag:'Experience', href:'#experience'   },
  /* â”€â”€ Projects â”€â”€ */
  { title:'30 Day Map Challenge 2024',  desc:'GEE Â· Cartography Â· Open Source',                  icon:'fas fa-map',           tag:'Project',    href:'https://github.com/naveedali786/30Day-Map-Challenge-2024-', external:true },
  { title:'30 Day Python DataViz',      desc:'Python Â· Visualization Â· Open Source',             icon:'fas fa-chart-bar',     tag:'Project',    href:'https://github.com/naveedali786/30Day-Mapping-and-visualization-Challenge-with-Python', external:true },
  { title:'Google Earth Engine Projects', desc:'GEE Â· Cloud Computing Â· Remote Sensing',         icon:'fab fa-google',        tag:'Project',    href:'https://github.com/naveedali786/GEE_Projects', external:true },
  { title:'ML & AI for GIS',            desc:'Machine Learning Â· LULC Â· GeoAI',                  icon:'fas fa-brain',         tag:'Project',    href:'https://github.com/naveedali786/ML-AI-Projects', external:true },
  { title:'GIS & Spatial Analysis',     desc:'Spatial Analysis Â· Python Â· GEE',                  icon:'fas fa-globe',         tag:'Project',    href:'https://github.com/naveedali786/GIS-and-Remote-Sensing-Analysis', external:true },
  /* â”€â”€ Research â”€â”€ */
  { title:'Disaster Management',        desc:'Flood Risk Â· SAR Â· Machine Learning Â· GEE',        icon:'fas fa-water',         tag:'Research',   href:'Pages/Disastral_Management.html' },
  { title:'Urbanization',               desc:'LULC Change Â· Urban Heat Island Â· Landsat',        icon:'fas fa-city',          tag:'Research',   href:'Pages/urbanization.html'         },
  { title:'Climate Change',             desc:'Temperature Trends Â· Hydrology Â· ERA5 Â· GEE',      icon:'fas fa-thermometer-half', tag:'Research', href:'Pages/Climate_change.html'       },
  { title:'Natural Resources',          desc:'Wetlands Â· NDVI Â· Surface Water Â· Sentinel',       icon:'fas fa-leaf',          tag:'Research',   href:'Pages/Nature_resoure.html'       },
  { title:'Open Source GIS',            desc:'Python Â· QGIS Â· Leafmap Â· Geemap Â· GEE',           icon:'fas fa-code-branch',   tag:'Research',   href:'Pages/Open_sourec.html'          },
  { title:'GeoAI & Machine Learning',   desc:'Deep Learning Â· RF Â· XGBoost Â· Flood Mapping Â· LULC',icon:'fas fa-brain',         tag:'Research',   href:'Pages/GeoAI.html'                },
  /* â”€â”€ Publications â”€â”€ */
  { title:'Rawal Dam Hydrological Study', desc:'Climate & LULC Impacts Â· In Progress',           icon:'fas fa-book',          tag:'Publication',href:'#publication'    },
  /* â”€â”€ Skills â”€â”€ */
  { title:'Google Earth Engine',        desc:'Cloud GIS Â· Petabyte-scale Analysis',              icon:'fas fa-cloud',         tag:'Skill',      href:'#about'          },
  { title:'Python Geospatial',          desc:'GeoPandas Â· Rasterio Â· Leafmap Â· Geemap',          icon:'fab fa-python',        tag:'Skill',      href:'#about'          },
  { title:'QGIS & ArcGIS Pro',          desc:'Desktop GIS Â· Cartography Â· Spatial Analysis',    icon:'fas fa-map-marked-alt',tag:'Skill',      href:'#about'          },
  { title:'Machine Learning for GIS',   desc:'Random Forest Â· SVM Â· XGBoost Â· CNN',             icon:'fas fa-brain',         tag:'Skill',      href:'#about'          },
  /* â”€â”€ Visualizations â”€â”€ */
  { title:'Data Visualizations',        desc:'Maps Â· Charts Â· Animations Â· Cartography',        icon:'fas fa-chart-area',    tag:'Gallery',    href:'#visualization'  },
  /* â”€â”€ Contact â”€â”€ */
  { title:'Contact',                    desc:'naveedali786aziz@gmail.com',                       icon:'fas fa-envelope',      tag:'Contact',    href:'#contact'        },
  { title:'LinkedIn',                   desc:'linkedin.com/in/muhammadnaveed-gis',                        icon:'fab fa-linkedin',      tag:'Social',     href:'https://www.linkedin.com/in/muhammadnaveed-gis', external:true },
  { title:'GitHub',                     desc:'github.com/naveedali786',                          icon:'fab fa-github',        tag:'Social',     href:'https://github.com/naveedali786', external:true },
  { title:'Medium Articles',            desc:'GIS tutorials and research notes',                 icon:'fab fa-medium',        tag:'Social',     href:'https://medium.com/@naveedali786aziz', external:true },
];

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   37.  SEARCH ENGINE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initSearch() {
  const overlay    = document.getElementById('search-overlay');
  const input      = document.getElementById('search-input');
  const results    = document.getElementById('search-results');
  const toggleBtn  = document.getElementById('search-toggle');
  if (!overlay || !input || !results) return;

  let activeIdx = -1;
  let currentResults = [];

  /* â”€â”€ open / close â”€â”€ */
  function openSearch() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 80);
    activeIdx = -1;
    renderResults('');
  }

  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    input.value = '';
    results.innerHTML = '';
    activeIdx = -1;
  }

  /* â”€â”€ highlight matched text â”€â”€ */
  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  /* â”€â”€ render â”€â”€ */
  function renderResults(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      /* show all grouped by tag when empty */
      currentResults = SEARCH_DATA.slice(0, 8);
    } else {
      currentResults = SEARCH_DATA.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
      ).slice(0, 10);
    }

    if (!currentResults.length) {
      results.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search-minus"></i>
          No results for "<strong>${query}</strong>"
        </div>`;
      return;
    }

    results.innerHTML = currentResults.map((item, i) => `
      <div class="search-result-item${i === activeIdx ? ' active' : ''}"
           data-idx="${i}" role="option">
        <div class="search-result-icon"><i class="${item.icon}"></i></div>
        <div class="search-result-body">
          <div class="search-result-title">${highlight(item.title, q)}</div>
          <div class="search-result-desc">${item.desc}</div>
        </div>
        <div class="search-result-tag">${item.tag}</div>
      </div>
    `).join('');

    /* click handlers */
    results.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => navigate(+el.dataset.idx));
      el.addEventListener('mouseenter', () => {
        activeIdx = +el.dataset.idx;
        updateActive();
      });
    });
  }

  function navigate(idx) {
    const item = currentResults[idx];
    if (!item) return;
    closeSearch();
    if (item.external) {
      window.open(item.href, '_blank', 'noopener');
    } else if (item.href.startsWith('#')) {
      const target = document.querySelector(item.href);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      /* sub-page fade out */
      document.body.style.transition = 'opacity .28s ease';
      document.body.style.opacity    = '0';
      setTimeout(() => { window.location.href = item.href; }, 260);
    }
  }

  function updateActive() {
    results.querySelectorAll('.search-result-item').forEach((el, i) => {
      el.classList.toggle('active', i === activeIdx);
      if (i === activeIdx) el.scrollIntoView({ block: 'nearest' });
    });
  }

  /* â”€â”€ input â”€â”€ */
  input.addEventListener('input', () => {
    activeIdx = -1;
    renderResults(input.value);
  });

  /* â”€â”€ keyboard navigation â”€â”€ */
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, currentResults.length - 1);
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
      updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      navigate(activeIdx >= 0 ? activeIdx : 0);
    }
  });

  /* â”€â”€ triggers â”€â”€ */
  toggleBtn && toggleBtn.addEventListener('click', openSearch);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeSearch();
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   38.  DARK / LIGHT THEME TOGGLE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initThemeToggle() {
  const btn  = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!btn || !icon) return;

  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);

    if (theme === 'light') {
      icon.className = 'fas fa-sun';
      btn.classList.add('light-active');
      btn.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      icon.className = 'fas fa-moon';
      btn.classList.remove('light-active');
      btn.setAttribute('aria-label', 'Switch to light mode');
    }
  }
})();

/* ============================================================
   TASKS 3 Â· 4 Â· 8 â€” Skill Bars Â· Contact Form Â· Award Stagger
   ============================================================ */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   36.  AWARD ITEMS â€” stagger entrance
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initAwardItems() {
  const items = document.querySelectorAll('.award-item');
  if (!items.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateX(0)';
        }, i * 100);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(item => {
    item.style.opacity   = '0';
    item.style.transform = 'translateX(20px)';
    item.style.transition = 'opacity .55s ease, transform .55s cubic-bezier(.16,1,.3,1), border-color .3s, background .3s, box-shadow .3s';
    io.observe(item);
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   37.  CONTACT FORM â€” client-side validation
        + mailto fallback (no server required)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const status  = document.getElementById('cf-status');
  const submit  = document.getElementById('cf-submit');
  const btnText = document.getElementById('cf-btn-text');
  const btnIcon = document.getElementById('cf-btn-icon');
  if (!form) return;

  function showStatus(type, msg) {
    status.className = 'cf-status ' + type;
    status.textContent = msg;
  }
  function clearErrors() {
    form.querySelectorAll('.cf-error').forEach(el => el.classList.remove('cf-error'));
    status.className = 'cf-status';
    status.textContent = '';
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearErrors();

    const name    = form.querySelector('#cf-name');
    const email   = form.querySelector('#cf-email');
    const message = form.querySelector('#cf-message');
    let valid = true;

    if (!name.value.trim()) {
      name.classList.add('cf-error'); valid = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('cf-error'); valid = false;
    }
    if (!message.value.trim()) {
      message.classList.add('cf-error'); valid = false;
    }
    if (!valid) {
      showStatus('error', 'Please fill in all required fields correctly.');
      return;
    }

    /* Loading state */
    submit.classList.add('loading');
    btnText.textContent = 'Sendingâ€¦';
    btnIcon.className   = 'fas fa-spinner fa-spin';

    /* Build mailto link as fallback â€” opens default email client */
    const subject  = form.querySelector('#cf-subject').value || 'Portfolio Contact';
    const body     = `Name: ${name.value}\nEmail: ${email.value}\n\n${message.value}`;
    const mailto   = `mailto:naveedali786aziz@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      window.location.href = mailto;
      submit.classList.remove('loading');
      btnText.textContent = 'Send Message';
      btnIcon.className   = 'fas fa-paper-plane';
      showStatus('success', 'âœ“ Opening your email clientâ€¦ If nothing happens, email naveedali786aziz@gmail.com directly.');
      form.reset();
    }, 800);
  });

  /* Remove error class on input */
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('cf-error'));
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   38.  MOBILE THEME ICON SYNC
   Keeps the mobile menu moon/sun in sync with
   the main theme toggle.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function syncMobileTheme() {
  const mIcon  = document.getElementById('mobile-theme-icon');
  const mLabel = document.getElementById('mobile-theme-label');
  if (!mIcon || !mLabel) return;

  function update() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    mIcon.className  = isDark ? 'fas fa-moon' : 'fas fa-sun';
    mLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
  }

  update();
  /* Watch for theme changes via MutationObserver */
  new MutationObserver(update).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   39. CGPA BAR â€” animate width on scroll into view
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initCgpaBar() {
  /* Support both the .cred-progress-fill class (new) and the
     inline <span> inside .progress (legacy HTML structure) */
  const bar = document.querySelector('.cred-progress-fill') ||
              document.querySelector('.progress span');
  if (!bar) return;
  const target = bar.dataset.width || bar.style.width || '77.75%';
  bar.style.width = '0%';
  /* Observe the closest progress wrapper, or the bar itself */
  const observed = bar.closest('.cred-progress') || bar.closest('.progress') || bar;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => { bar.style.width = target; }, 300);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  io.observe(observed);
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   40-41. COURSES + CERTS TOGGLE (superseded by 43-44)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   42. CREDENTIALS SECTION â€” stagger entrance
   Award rows + Cert rows slide in from left
   when the section scrolls into view.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initCredEntrance() {
  const rows = document.querySelectorAll('.cred-award-item, .cred-cert-item');
  if (!rows.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  rows.forEach(row => io.observe(row));
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   43. COURSES TOGGLE â€” hardened version
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initCoursesToggleV2() {
  /* Support both id="coursesToggle" and id="coursesButton" */
  const btn    = document.getElementById('coursesToggle') || document.getElementById('coursesButton');
  const extras = document.querySelectorAll('.extra-course');
  if (!btn || !extras.length) return;

  let open = false;

  btn.addEventListener('click', () => {
    open = !open;
    extras.forEach(c => {
      c.style.display = open ? 'inline-flex' : 'none';
    });
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = open
      ? 'Show less â†‘'
      : `+ ${extras.length} more`;
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   44. CERTS TOGGLE â€” hardened version
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initCertsToggleV2() {
  /* Support both id="certsToggle" and id="certificatesButton" */
  const btn    = document.getElementById('certsToggle') || document.getElementById('certificatesButton');
  /* Support both .cred-cert-extra and .extra-certificate */
  const extras = document.querySelectorAll('.cred-cert-extra, .extra-certificate');
  if (!btn || !extras.length) return;

  let open = false;

  btn.addEventListener('click', () => {
    open = !open;
    extras.forEach(cert => {
      cert.style.display = open ? 'flex' : 'none';
      /* trigger entrance animation for revealed certs */
      if (open) {
        requestAnimationFrame(() => cert.classList.add('visible'));
      } else {
        cert.classList.remove('visible');
      }
    });
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = open
      ? 'Show less <i class="fas fa-arrow-up"></i>'
      : 'View all certifications <i class="fas fa-arrow-right"></i>';
  });
})();

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   45. CREDENTIAL CARDS â€” hover glow intensity
   Dims all other cards slightly when one is hovered.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
(function initCredCardFocus() {
  const cards = document.querySelectorAll('.cred-card');
  if (cards.length < 2) return;

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      cards.forEach(c => {
        if (c !== card) c.style.opacity = '.65';
      });
    });
    card.addEventListener('mouseleave', () => {
      cards.forEach(c => { c.style.opacity = ''; });
    });
  });
})();

/* ──────────────────────────────────────────────
   END OF WOWCHEMY.JS
────────────────────────────────────────────── */
