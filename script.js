/* ============================================================
   COSMOHENTORQ INNOVATIONS — Main Script
   ============================================================ */

(function () {
  'use strict';

  /* ---- CUSTOM CURSOR ---- */
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (cursor) { cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; }
  });

  function animateFollower() {
    if (follower) {
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
    }
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .faq-question, .intern-chip, .social-btn, .back-to-top').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor?.classList.add('hover'); follower?.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor?.classList.remove('hover'); follower?.classList.remove('hover'); });
  });

  /* ---- PARTICLE CANVAS ---- */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency <= 4 || isMobile;
    const COUNT = isLowEnd ? 30 : 55;
    let w, h, particles = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function createParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        dx: (Math.random() - 0.5) * 0.18,
        dy: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.55 + 0.1,
        color: Math.random() < 0.94 ? '255,255,255' : '0,212,255'
      };
    }

    for (let i = 0; i < COUNT; i++) particles.push(createParticle());

    let raf;
    function drawParticles() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < -2) p.x = w + 2;
        else if (p.x > w + 2) p.x = -2;
        if (p.y < -2) p.y = h + 2;
        else if (p.y > h + 2) p.y = -2;
      }
      raf = requestAnimationFrame(drawParticles);
    }
    drawParticles();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else drawParticles();
    });
  }

  /* ---- NAVBAR SCROLL ---- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar?.classList.toggle('scrolled', y > 60);
    backToTop?.classList.toggle('visible', y > 400);
    updateActiveNav();
  });

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- MOBILE NAV ---- */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });
  navLinks?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle?.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* ---- ACTIVE NAV ---- */
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    });
  }

  /* ---- SCROLL REVEAL ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('visible'), parseInt(delay));
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---- COUNTER ANIMATION ---- */
  function animateCounter(el, target, duration, suffix) {
    const start = performance.now();
    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(el => {
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, 1800, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) statsObserver.observe(statsGrid);

  /* ---- FAQ ACCORDION ---- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    question?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---- CONTACT FORM ---- */
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const success = document.querySelector('.form-success');
    btn.textContent = 'Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      form.reset();
      if (success) { success.style.display = 'block'; setTimeout(() => success.style.display = 'none', 5000); }
    }, 1400);
  });

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- HERO MOUSE-FOLLOWING GLOW ---- */
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      heroSection.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
      heroSection.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
    });
  }

  /* ---- 3D TILT ON PRODUCT CARDS ---- */
  document.querySelectorAll('.product-card, .team-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---- HERO TEXT ANIMATION LINES ---- */
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.style.backgroundSize = '200% 200%';
  }

  /* ---- LOGO MOUSE FOLLOW + GLOW ---- */
  const logo = document.querySelector('.about-logo-float');
  if (logo) {
    let lx = 0, ly = 0, ltx = 0, lty = 0, logoRaf;

    logo.addEventListener('mouseenter', () => {
      logo.classList.add('logo-hovered');
      function track() {
        ltx += (lx - ltx) * 0.12;
        lty += (ly - lty) * 0.12;
        logo.style.transform = `translate(${ltx}px, ${lty}px)`;
        logoRaf = requestAnimationFrame(track);
      }
      track();
    });

    logo.addEventListener('mousemove', e => {
      const rect = logo.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      lx = (e.clientX - cx) * 0.22;
      ly = (e.clientY - cy) * 0.22;
    });

    logo.addEventListener('mouseleave', () => {
      logo.classList.remove('logo-hovered');
      cancelAnimationFrame(logoRaf);
      lx = 0; ly = 0;
      function ease() {
        ltx += (0 - ltx) * 0.1;
        lty += (0 - lty) * 0.1;
        logo.style.transform = `translate(${ltx.toFixed(2)}px, ${lty.toFixed(2)}px)`;
        if (Math.abs(ltx) > 0.1 || Math.abs(lty) > 0.1) requestAnimationFrame(ease);
        else logo.style.transform = '';
      }
      ease();
    });
  }

})();
