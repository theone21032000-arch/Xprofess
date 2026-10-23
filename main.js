/* ============================================
   XPROFESS — MAIN.JS
   Interactive animations, navigation, canvas effects
   ============================================ */

// ============================
// CURSOR
// ============================
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// Cursor expand on interactive elements
document.addEventListener('mouseover', (e) => {
  if (e.target.matches('button, a, input, textarea, .card, .work-item, .lab-card, .domain-card, .social-link')) {
    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
    follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
    follower.style.borderColor = 'rgba(59, 130, 246, 0.6)';
  } else {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    follower.style.transform = 'translate(-50%, -50%) scale(1)';
    follower.style.borderColor = 'rgba(59, 130, 246, 0.4)';
  }
});

// ============================
// NAV SCROLL
// ============================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// ============================
// MOBILE MENU
// ============================
function toggleMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  hamburger.classList.toggle('active');
  menu.classList.toggle('open');
}

// ============================
// PAGE ROUTING
// ============================
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
  }

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Start canvas only on home page
  if (pageId === 'home') {
    startCanvas();
  } else {
    stopCanvas();
  }

  // Animate cards into view
  setTimeout(() => {
    animateIntoView();
  }, 100);
}

// ============================
// CANVAS PARTICLE/LINE SYSTEM
// ============================
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let animFrame;
let isCanvasRunning = false;

const stars = [];
const lines = [];
const NUM_STARS = 120;
const NUM_LINES = 8;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars() {
  stars.length = 0;
  for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      opacity: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.005
    });
  }
}

function initLines() {
  lines.length = 0;
  for (let i = 0; i < NUM_LINES; i++) {
    lines.push(createLine());
  }
}

function createLine() {
  const isHorizontal = Math.random() > 0.4;
  return {
    x: isHorizontal ? -200 : Math.random() * canvas.width,
    y: isHorizontal ? Math.random() * canvas.height : -100,
    length: Math.random() * 300 + 100,
    speedX: isHorizontal ? Math.random() * 1.5 + 0.5 : 0,
    speedY: isHorizontal ? 0 : Math.random() * 1 + 0.3,
    opacity: Math.random() * 0.4 + 0.05,
    width: Math.random() * 0.8 + 0.2,
    color: Math.random() > 0.6 ? 'rgba(139, 92, 246,' : 'rgba(59, 130, 246,',
    isHorizontal
  };
}

function drawCanvas(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Radial glow at center
  const grd = ctx.createRadialGradient(
    canvas.width * 0.5, canvas.height * 0.3, 0,
    canvas.width * 0.5, canvas.height * 0.3, canvas.width * 0.6
  );
  grd.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
  grd.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  stars.forEach(star => {
    star.y -= star.speed;
    star.twinkle += star.twinkleSpeed;
    const opacityMod = Math.sin(star.twinkle) * 0.3;
    const finalOpacity = Math.max(0, Math.min(1, star.opacity + opacityMod));

    if (star.y < -5) {
      star.y = canvas.height + 5;
      star.x = Math.random() * canvas.width;
    }

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${finalOpacity})`;
    ctx.fill();

    // Occasional glowing star
    if (star.r > 1) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${finalOpacity * 0.15})`;
      ctx.fill();
    }
  });

  // Light streaks
  lines.forEach((line, i) => {
    if (line.isHorizontal) {
      line.x += line.speedX;
      if (line.x > canvas.width + 200) {
        lines[i] = createLine();
        lines[i].isHorizontal = true;
        lines[i].x = -200;
      }

      const grad = ctx.createLinearGradient(line.x, 0, line.x + line.length, 0);
      grad.addColorStop(0, line.color + '0)');
      grad.addColorStop(0.4, line.color + line.opacity + ')');
      grad.addColorStop(1, line.color + '0)');

      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x + line.length, line.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = line.width;
      ctx.stroke();
    } else {
      line.y += line.speedY;
      if (line.y > canvas.height + 100) {
        lines[i] = createLine();
        lines[i].isHorizontal = false;
        lines[i].y = -100;
      }

      const grad = ctx.createLinearGradient(0, line.y, 0, line.y + line.length);
      grad.addColorStop(0, line.color + '0)');
      grad.addColorStop(0.4, line.color + line.opacity + ')');
      grad.addColorStop(1, line.color + '0)');

      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x, line.y + line.length);
      ctx.strokeStyle = grad;
      ctx.lineWidth = line.width;
      ctx.stroke();
    }
  });

  // Connecting web between nearby stars
  stars.forEach((s1, i) => {
    stars.slice(i + 1, i + 4).forEach(s2 => {
      const dx = s2.x - s1.x;
      const dy = s2.y - s1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const alpha = (1 - dist / 120) * 0.08;
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.strokeStyle = `rgba(99, 130, 246, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    });
  });

  animFrame = requestAnimationFrame(drawCanvas);
}

function startCanvas() {
  if (isCanvasRunning) return;
  isCanvasRunning = true;
  canvas.style.display = 'block';
  resizeCanvas();
  initStars();
  initLines();
  drawCanvas(0);
}

function stopCanvas() {
  cancelAnimationFrame(animFrame);
  isCanvasRunning = false;
  canvas.style.display = 'none';
}

window.addEventListener('resize', () => {
  if (isCanvasRunning) {
    resizeCanvas();
    initStars();
    initLines();
  }
});

// ============================
// INTERSECTION OBSERVER ANIMATIONS
// ============================
function animateIntoView() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .work-item, .lab-card, .domain-card, .step, .identity-col').forEach(el => {
    el.classList.add('animate-in');
    observer.observe(el);
  });
}

// ============================
// FORM SUBMISSION
// ============================
function handleSubmit(e) {
  e.preventDefault();

  const userName  = document.getElementById('contact-name').value.trim();
  const userEmail = document.getElementById('contact-email').value.trim();
  const userIdea  = document.getElementById('contact-idea').value.trim();

  emailjs.init({publicKey: "oxEiVbqKIn47S8B_L" });


  emailjs.send('service_gy3null', 'template_pza53q5', {
    from_name:    userName,
    from_email:   userEmail,
    project_idea: userIdea,
  })
  .then(() => {
    const success = document.getElementById('formSuccess');
    success.classList.add('show');
    e.target.reset();
    setTimeout(() => success.classList.remove('show'), 5000);
  })
  .catch((err) => {
    alert('Erreur envoi : ' + JSON.stringify(err));
  });
}

// ============================
// SCROLL REVEAL
// ============================
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

// ============================
// INIT
// ============================
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  // Start on home
  showPage('home');

  // Add CSS for animate-in
  const style = document.createElement('style');
  style.textContent = `
    .animate-in {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1);
    }
    .animate-in.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .card.animate-in:nth-child(1) { transition-delay: 0.05s; }
    .card.animate-in:nth-child(2) { transition-delay: 0.1s; }
    .card.animate-in:nth-child(3) { transition-delay: 0.15s; }
    .card.animate-in:nth-child(4) { transition-delay: 0.2s; }
    .step.animate-in:nth-child(1) { transition-delay: 0.05s; }
    .step.animate-in:nth-child(2) { transition-delay: 0.1s; }
    .step.animate-in:nth-child(3) { transition-delay: 0.15s; }
    .step.animate-in:nth-child(4) { transition-delay: 0.2s; }
    .work-item.animate-in:nth-child(1) { transition-delay: 0.05s; }
    .work-item.animate-in:nth-child(2) { transition-delay: 0.1s; }
    .work-item.animate-in:nth-child(3) { transition-delay: 0.15s; }
    .work-item.animate-in:nth-child(4) { transition-delay: 0.2s; }
    .lab-card.animate-in:nth-child(1) { transition-delay: 0.05s; }
    .lab-card.animate-in:nth-child(2) { transition-delay: 0.1s; }
    .lab-card.animate-in:nth-child(3) { transition-delay: 0.15s; }
    .lab-card.animate-in:nth-child(4) { transition-delay: 0.2s; }
    .domain-card.animate-in:nth-child(1) { transition-delay: 0.05s; }
    .domain-card.animate-in:nth-child(2) { transition-delay: 0.1s; }
    .domain-card.animate-in:nth-child(3) { transition-delay: 0.15s; }
    .domain-card.animate-in:nth-child(4) { transition-delay: 0.2s; }
  `;
  document.head.appendChild(style);

  // Page-level nav active tracking
  document.querySelectorAll('.nav-link, .footer-links a').forEach(link => {
    link.addEventListener('click', function() {
      document.querySelectorAll('.nav-link').forEach(l => l.style.color = '');
    });
  });
});

// ============================
// LIGHTBOX GALERIE
// ============================

// Ajoute ici les chemins de tes photos pour chaque projet
// Format : 'nom-du-dossier/photo.jpg' ou URL complète
const projectPhotos = {
  plateforme: [
    'img/lbm/molakisi1.png',
    'img/lbm/molakisi2.png',
    'img/lbm/molakisi3.png',
    'img/lbm/molakisi4.png',
    'img/lbm/molakisi5.png'
    // Remplace par tes vraies photos
  ],
  logiciel: [
    'img/lbm/Screenshotpretbank1.png',
    'img/lbm/Screenshotpretbank2.png',
    'img/lbm/Screenshotpretbank3.png',
    'img/lbm/Screenshotpretbank4.png'
  ],
  startup: [
    'img/lbm/terrafresh.png'
  ],
  application: [
    'img/lbm/sport1.png',
    'img/lbm/sport2.png'
  ]
};

function openLightbox(projectKey, title, subtitle) {
  const photos = projectPhotos[projectKey] || [];
  const slider = document.getElementById('lightbox-slider');
  const lightbox = document.getElementById('lightbox');

  document.getElementById('lightbox-title').textContent = title;
  document.getElementById('lightbox-subtitle').textContent = subtitle;

  slider.innerHTML = '';

  if (photos.length === 0) {
    slider.innerHTML = '<div class="lightbox-empty">Aucune photo disponible pour ce projet.</div>';
  } else {
    photos.forEach((src, index) => {
      const slide = document.createElement('div');
      slide.className = 'lightbox-slide';

      const img = document.createElement('img');
      img.src = src;
      img.alt = title + ' — ' + (index + 1);

      const label = document.createElement('div');
      label.className = 'lightbox-slide-label';
      label.textContent = (index + 1) + ' / ' + photos.length;

      slide.appendChild(img);
      slide.appendChild(label);
      slider.appendChild(slide);
    });
  }

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

// Fermer en cliquant sur le fond
document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});

// Fermer avec la touche Echap
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});
