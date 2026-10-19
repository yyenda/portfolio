import projects from './lib/projects.json';

// ─── Media helper ────────────────────────────────────────────────────────────
function isVideo(url) {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);
}

// ─── Pixel Reveal ────────────────────────────────────────────────────────────
class PixelReveal {
  constructor(canvas, src) {
    this.canvas    = canvas;
    this.ctx       = canvas.getContext('2d');
    this.off       = document.createElement('canvas');
    this.progress  = 0;
    this.ready     = false;

    if (isVideo(src)) {
      this.video = document.createElement('video');
      this.video.src = src;
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.preload = 'auto';
      this.sourceEl = this.video;
      this.video.onloadeddata = () => {
        this.video.currentTime = 0.5;
      };
      this.video.onseeked = () => {
        this.ready = true;
        this.sync();
        this.draw();
      };
      this.video.onerror = () => this.drawFallback();
    } else {
      this.img = new Image();
      this.sourceEl = this.img;
      this.img.onload  = () => { this.ready = true; this.sync(); this.draw(); };
      this.img.onerror = () => { this.drawFallback(); };
      this.img.src = src;
    }
  }

  sync() {
    const { canvas } = this;
    canvas.width  = (canvas.offsetWidth || 400) * (window.devicePixelRatio || 1);
    canvas.height = (canvas.offsetHeight || 300) * (window.devicePixelRatio || 1);
  }

  get ps() { return Math.max(1, Math.round(28 * (1 - this.progress))); }

  setProgress(p) {
    this.progress = Math.max(0, Math.min(1, p));
    if (this.ready) this.draw();
  }

  drawCover(source, targetCtx, targetW, targetH) {
    const sw = source.naturalWidth || source.videoWidth || source.width || targetW;
    const sh = source.naturalHeight || source.videoHeight || source.height || targetH;
    const sRatio = sw / sh;
    const tRatio = targetW / targetH;
    let sx = 0, sy = 0, sCropW = sw, sCropH = sh;
    if (sRatio > tRatio) {
      sCropW = sh * tRatio;
      sx = (sw - sCropW) / 2;
    } else {
      sCropH = sw / tRatio;
      sy = (sh - sCropH) / 2;
    }
    targetCtx.drawImage(source, sx, sy, sCropW, sCropH, 0, 0, targetW, targetH);
  }

  draw() {
    if (!this.sourceEl) return;
    const { ctx, canvas, sourceEl, off } = this;
    const w = canvas.width, h = canvas.height;
    const ps = this.ps;
    ctx.clearRect(0, 0, w, h);
    if (ps <= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      this.drawCover(sourceEl, ctx, w, h);
      return;
    }
    const sw = Math.max(1, Math.ceil(w / ps));
    const sh = Math.max(1, Math.ceil(h / ps));
    off.width = sw; off.height = sh;
    const oc = off.getContext('2d');
    oc.imageSmoothingEnabled = true;
    this.drawCover(sourceEl, oc, sw, sh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, sw, sh, 0, 0, w, h);
  }

  drawFallback() {
    const { ctx, canvas } = this;
    canvas.width  = (canvas.offsetWidth || 400) * (window.devicePixelRatio || 1);
    canvas.height = (canvas.offsetHeight || 300) * (window.devicePixelRatio || 1);
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, '#1a1a1a'); g.addColorStop(1, '#0d0d0d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ready = true;
  }
}

// ─── Build DOM ────────────────────────────────────────────────────────────────
const container = document.getElementById('projects');
const countEl   = document.getElementById('project-count');
countEl.textContent = `${projects.length} PROJECTS`;

const reveals = [];

projects.forEach((p, i) => {
  const row = document.createElement('div');
  row.className = 'project-row';
  row.dataset.id = i;
  row.setAttribute('role', 'button');
  row.setAttribute('tabindex', '0');
  row.setAttribute('aria-label', `Open ${p.title}`);

  row.innerHTML = `
    <span class="project-num">${String(i + 1).padStart(2, '0')}.</span>
    <div class="project-img-wrap">
      <canvas class="project-canvas"></canvas>
    </div>
    <div class="project-info">
      <h2 class="project-title">${p.title}</h2>
      <div class="project-meta">
        <span class="project-year">${p.year}</span>
        <span class="project-cat">${p.category}</span>
      </div>
      <p class="project-desc">${p.desc}</p>
      <span class="project-cta">VIEW PROJECT →</span>
    </div>
  `;

  container.appendChild(row);

  const canvas = row.querySelector('.project-canvas');
  const reveal = new PixelReveal(canvas, p.image);
  reveals.push(reveal);

  // Open modal on click or Enter key
  row.addEventListener('click',  () => openModal(p, i));
  row.addEventListener('keydown', e => e.key === 'Enter' && openModal(p, i));
});

// ─── Intersection Observer for pixel reveal ────────────────────────────────
const rows = [...document.querySelectorAll('.project-row')];

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const i = +entry.target.dataset.id;
    if (entry.isIntersecting) {
      animateReveal(reveals[i], 1.0);
    } else {
      reveals[i].setProgress(0);
    }
  });
}, { threshold: 0.15 });

rows.forEach(r => observer.observe(r));

function animateReveal(reveal, target) {
  const step = () => {
    reveal.setProgress(reveal.progress + (target - reveal.progress) * 0.06);
    if (Math.abs(reveal.progress - target) > 0.005) requestAnimationFrame(step);
    else reveal.setProgress(target);
  };
  requestAnimationFrame(step);
}

window.addEventListener('resize', () => {
  reveals.forEach(r => { r.sync(); r.draw(); });
});

// ─── Project Modal ────────────────────────────────────────────────────────────
const modal       = document.getElementById('modal');
const modalClose  = document.getElementById('modal-close');
const modalBg     = document.getElementById('modal-backdrop');
const modalNum    = document.getElementById('modal-num');
const modalTitle  = document.getElementById('modal-title');
const modalYear   = document.getElementById('modal-year');
const modalGal    = document.getElementById('modal-gallery');
const modalDesc   = document.getElementById('modal-desc');
const modalCat    = document.getElementById('modal-cat');
const modalLink   = document.getElementById('modal-link');

// ─── Lightbox Elements ────────────────────────────────────────────────────────
const lightbox        = document.getElementById('lightbox');
const lightboxBg      = document.getElementById('lightbox-backdrop');
const lightboxClose   = document.getElementById('lightbox-close');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxMedia   = document.getElementById('lightbox-media');
const lightboxPrev    = document.getElementById('lightbox-prev');
const lightboxNext    = document.getElementById('lightbox-next');

let activeGallery = [];
let activeIndex = 0;
let activeTitle = '';

function openLightbox(items, index, title) {
  activeGallery = items;
  activeIndex = index;
  activeTitle = title;
  renderLightbox();
  lightbox.classList.add('open');
  lightboxClose.focus();
}

function renderLightbox() {
  if (!activeGallery || activeGallery.length === 0) return;
  const total = activeGallery.length;
  const currentSrc = activeGallery[activeIndex];

  lightboxCounter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  lightboxPrev.style.display = total > 1 ? '' : 'none';
  lightboxNext.style.display = total > 1 ? '' : 'none';

  lightboxMedia.innerHTML = '';
  if (isVideo(currentSrc)) {
    const video = document.createElement('video');
    video.src = currentSrc;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.className = 'lightbox-item lightbox-video';
    lightboxMedia.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = currentSrc;
    img.alt = `${activeTitle} - ${activeIndex + 1}`;
    img.className = 'lightbox-item lightbox-img';
    lightboxMedia.appendChild(img);
  }
}

function nextLightbox() {
  if (activeGallery.length <= 1) return;
  activeIndex = (activeIndex + 1) % activeGallery.length;
  renderLightbox();
}

function prevLightbox() {
  if (activeGallery.length <= 1) return;
  activeIndex = (activeIndex - 1 + activeGallery.length) % activeGallery.length;
  renderLightbox();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxMedia.innerHTML = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBg.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', nextLightbox);
lightboxPrev.addEventListener('click', prevLightbox);

// Mobile swipe support for lightbox
let touchStartX = 0;
let touchStartY = 0;
lightboxMedia.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });
lightboxMedia.addEventListener('touchend', e => {
  const diffX = e.changedTouches[0].clientX - touchStartX;
  const diffY = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX < 0) nextLightbox();
    else prevLightbox();
  }
}, { passive: true });

// ─── Modal Open / Close ───────────────────────────────────────────────────────
function openModal(p, i) {
  modalNum.textContent   = String(i + 1).padStart(2, '0') + '.';
  modalTitle.textContent = p.title;
  modalYear.textContent  = p.year;
  modalDesc.textContent  = p.desc;
  modalCat.textContent   = p.category;

  // Gallery (supports both images and videos)
  modalGal.innerHTML = '';
  const mediaList = (p.gallery && p.gallery.length > 0) ? p.gallery : [p.image];

  mediaList.forEach((src, idx) => {
    const wrap = document.createElement('div');
    const isVid = isVideo(src);
    wrap.className = `modal-media-wrap ${isVid ? 'video-wrap' : 'img-wrap'}`;

    if (isVid) {
      const vid = document.createElement('video');
      vid.src = src;
      vid.controls = true;
      vid.playsInline = true;
      vid.preload = 'metadata';
      vid.className = 'modal-media-el';
      wrap.appendChild(vid);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${p.title} - ${idx + 1}`;
      img.loading = 'lazy';
      img.className = 'modal-media-el';
      wrap.appendChild(img);
    }

    const zoomBtn = document.createElement('button');
    zoomBtn.className = 'media-zoom-btn';
    zoomBtn.type = 'button';
    zoomBtn.textContent = '[ ZOOM ↗ ]';
    zoomBtn.setAttribute('aria-label', `Enlarge item ${idx + 1}`);
    wrap.appendChild(zoomBtn);

    if (!isVid) {
      wrap.addEventListener('click', () => openLightbox(mediaList, idx, p.title));
    } else {
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(mediaList, idx, p.title);
      });
    }

    modalGal.appendChild(wrap);
  });

  // Link
  if (p.link) {
    modalLink.href = p.link;
    modalLink.style.display = '';
  } else {
    modalLink.style.display = 'none';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove('open');
  closeLightbox();
  // Pause any video playing inside modal gallery
  modalGal.querySelectorAll('video').forEach(v => v.pause());
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBg.addEventListener('click', closeModal);

window.addEventListener('keydown', e => {
  if (lightbox.classList.contains('open')) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') nextLightbox();
    else if (e.key === 'ArrowLeft') prevLightbox();
  } else if (modal.classList.contains('open')) {
    if (e.key === 'Escape') closeModal();
  }
});
