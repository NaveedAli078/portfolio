/* subpage.js — shared script for all research sub-pages */
'use strict';

/* scroll progress */
(function(){
  const bar = document.getElementById('sp-progress');
  if(!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (window.scrollY/total)*100 : 0) + '%';
  }, { passive:true });
})();

/* fade in on load */
(function(){
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .4s ease';
  window.addEventListener('load', () => { document.body.style.opacity = '1'; });
  setTimeout(() => { document.body.style.opacity = '1'; }, 500);
})();

/* scroll reveal */
(function(){
  const els = document.querySelectorAll('.sp-reveal');
  if(!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.style.opacity  = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1)';
    io.observe(el);
  });
})();

/* page-leave transition for internal links */
document.querySelectorAll('a[href]').forEach(a => {
  const raw = a.getAttribute('href') || '';
  if(a.target === '_blank' || raw.startsWith('mailto') || raw.startsWith('#')) return;
  if(!a.href.includes(window.location.hostname) && !raw.startsWith('/') && !raw.includes('.html')) return;
  a.addEventListener('click', e => {
    e.preventDefault();
    const href = a.href;
    document.body.style.transition = 'opacity .28s ease';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 260);
  });
});

/* ── THEME TOGGLE (sub-pages) ── */
(function(){
  const btn  = document.getElementById('sp-theme-btn');
  const icon = document.getElementById('sp-theme-icon');
  if (!btn || !icon) return;

  /* read saved theme — syncs with main portfolio */
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    if (theme === 'light') {
      icon.className = 'fas fa-sun';
      btn.classList.add('light-active');
    } else {
      icon.className = 'fas fa-moon';
      btn.classList.remove('light-active');
    }
  }
})();
