// ─── Text scramble effect ─────────────────────────────────────────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%&*?';

function scramble(el, duration = 550) {
  const original = el.textContent;
  const totalFrames = Math.ceil(duration / 28);
  let frame = 0;
  // Cancel any in-progress scramble
  if (el._scrambleId) cancelAnimationFrame(el._scrambleId);

  const tick = () => {
    const progress = frame / totalFrames;
    el.textContent = original.split('').map((char, i) => {
      if (char === ' ') return ' ';
      // Reveal from left to right
      if (i / original.length < progress) return char;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }).join('');
    frame++;
    if (frame <= totalFrames) {
      el._scrambleId = requestAnimationFrame(tick);
    } else {
      el.textContent = original;
    }
  };
  el._scrambleId = requestAnimationFrame(tick);
}

function shake(el) {
  el.animate([
    { transform: 'translate(0)' },
    { transform: 'translate(-4px, 2px)' },
    { transform: 'translate(5px, -3px)' },
    { transform: 'translate(-3px, 4px)' },
    { transform: 'translate(4px, -2px)' },
    { transform: 'translate(0)' },
  ], { duration: 300, easing: 'ease-in-out' });
}

// ─── Attach effects to .word elements ────────────────────────────────────────
document.querySelectorAll('.word').forEach(el => {
  const effect = el.dataset.effect;
  if (!effect) return;

  el.addEventListener('mouseenter', () => {
    if (effect === 'scramble') scramble(el);
    if (effect === 'shake')    shake(el);
    if (effect === 'pop') {
      el.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.12)' },
        { transform: 'scale(1)' },
      ], { duration: 220, easing: 'ease-out' });
    }
    if (effect === 'glow') {
      el.style.textShadow = '0 0 18px rgba(0,255,127,0.9)';
    }
  });

  if (effect === 'glow') {
    el.addEventListener('mouseleave', () => { el.style.textShadow = ''; });
  }
});

// ─── Scramble on skill hover ──────────────────────────────────────────────────
document.querySelectorAll('.skill').forEach(el => {
  el.addEventListener('mouseenter', () => scramble(el, 350));
});

// ─── Editable name ───────────────────────────────────────────────────────────
const nameEl  = document.getElementById('name-editable');
const caretEl = document.getElementById('caret');

if (nameEl) {
  // Hide custom caret while browser is handling focus
  nameEl.addEventListener('focus', () => {
    caretEl.style.display = 'none';
  });

  nameEl.addEventListener('blur', () => {
    caretEl.style.display = '';
    // Restore default if left blank
    if (!nameEl.textContent.trim()) {
      nameEl.textContent = 'JAN MRÁZEK';
    }
    // Scramble-reveal whatever they typed
    scramble(nameEl, 700);
  });

  // Keep text uppercase, block Enter/newlines
  nameEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
  });

  nameEl.addEventListener('input', () => {
    // Force uppercase without resetting caret
    const sel   = window.getSelection();
    const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
    const offset = range?.startOffset ?? 0;

    const upper = nameEl.textContent.toUpperCase();
    if (nameEl.textContent !== upper) {
      nameEl.textContent = upper;
      // Restore cursor position after text replacement
      if (range && nameEl.firstChild) {
        const newRange = document.createRange();
        newRange.setStart(nameEl.firstChild, Math.min(offset, upper.length));
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
  });
}

// ─── Email copy ───────────────────────────────────────────────────────────────
const emailEl = document.getElementById('email-copy');
if (emailEl) {
  emailEl.addEventListener('click', () => {
    navigator.clipboard?.writeText('jan@example.com').catch(() => {});
    emailEl.classList.add('copied');
    setTimeout(() => emailEl.classList.remove('copied'), 1800);
  });
}
