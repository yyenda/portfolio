<script>
  import { onMount } from 'svelte';

  let tiltX = $state(0);
  let tiltY = $state(0);
  let glitching = $state(false);
  let faceEl = $state(null);

  function onMouseMove(e) {
    if (!faceEl) return;
    const rect = faceEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    tiltX = ((e.clientY - cy) / (rect.height / 2)) * 10;
    tiltY = -((e.clientX - cx) / (rect.width / 2)) * 10;
  }

  function triggerGlitch() {
    if (glitching) return;
    glitching = true;
    setTimeout(() => glitching = false, 600);
  }

  onMount(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  });
</script>

<div class="about-page">

  <!-- Fixed social corner -->
  <div class="social-corner" aria-label="Social links">
    <a href="https://instagram.com" target="_blank" rel="noopener" class="social-btn" id="social-instagram" aria-label="Instagram">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    </a>
    <a href="https://youtube.com" target="_blank" rel="noopener" class="social-btn" id="social-youtube" aria-label="YouTube">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="5" width="20" height="14" rx="4"/>
        <polygon points="10,9 16,12 10,15" fill="currentColor" stroke="none"/>
      </svg>
    </a>
  </div>

  <!-- ABOUT SPLIT -->
  <section class="section about-split">
    <div class="face-col">
      <div
        class="face-wrap"
        class:glitching
        bind:this={faceEl}
        onclick={triggerGlitch}
        onkeydown={(e) => e.key === 'Enter' && triggerGlitch()}
        role="button"
        tabindex="0"
        aria-label="Interactive face"
        style="transform: perspective(700px) rotateX({tiltX}deg) rotateY({tiltY}deg);"
      >
        <img src="/images/face-placeholder.png" alt="Jan Mrázek" draggable="false" class="face-img" />
        <div class="frag frag-eyes"  style="transform:translate({tiltY*0.35}px,{tiltX*0.25}px)"></div>
        <div class="frag frag-mouth" style="transform:translate({-tiltY*0.4}px,{tiltX*0.2}px)"></div>
        <div class="face-hint">CLICK</div>
      </div>
      <p class="face-sub">JAN MRÁZEK<br/><span class="neon">CREATIVE DEVELOPER</span></p>
    </div>

    <div class="info-col">
      <div class="info-block">
        <h2 class="info-label">EXPERIENCE</h2>
        <ul class="info-list">
          <li><span class="item-name">Freelance</span><span class="item-yr">2022–NOW</span></li>
          <li><span class="item-name">3D & Motion Projects</span><span class="item-yr">2022–2024</span></li>
          <li><span class="item-name">Game Development</span><span class="item-yr">2021–2023</span></li>
        </ul>
      </div>
      <div class="info-block">
        <h2 class="info-label">EDUCATION</h2>
        <ul class="info-list">
          <li><span class="item-name">Self-taught Developer</span><span class="item-yr">2019–</span></li>
        </ul>
      </div>
      <div class="info-block">
        <h2 class="info-label">TOOLS</h2>
        <ul class="info-list">
          <li><span class="item-name">Three.js / WebGL</span><span class="item-yr">Advanced</span></li>
          <li><span class="item-name">Blender</span><span class="item-yr">Advanced</span></li>
          <li><span class="item-name">Godot / Unity</span><span class="item-yr">Intermediate</span></li>
          <li><span class="item-name">Svelte / JavaScript</span><span class="item-yr">Advanced</span></li>
        </ul>
      </div>
      <div class="info-block">
        <h2 class="info-label">LANGUAGES</h2>
        <ul class="info-list">
          <li><span class="item-name">Czech</span><span class="item-yr">Native</span></li>
          <li><span class="item-name">English</span><span class="item-yr">Advanced</span></li>
        </ul>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section class="section contact-section" id="contact">
    <div class="contact-inner">
      <p class="contact-eyebrow">[ GET IN TOUCH ]</p>
      <h2 class="contact-heading">LET'S<br/>WORK<br/>TOGETHER</h2>
      <a href="mailto:jan@example.com" class="contact-email" id="contact-email">
        jan@example.com
        <span class="email-arrow">↗</span>
      </a>
      <div class="contact-socials">
        <a href="https://instagram.com" target="_blank" rel="noopener" class="contact-social-link" id="contact-ig">Instagram</a>
        <span class="sep">/</span>
        <a href="https://youtube.com" target="_blank" rel="noopener" class="contact-social-link" id="contact-yt">YouTube</a>
      </div>
    </div>
    <div class="contact-deco" aria-hidden="true">✦</div>
  </section>

</div>

<style>
  .about-page {
    width: 100%;
    background: var(--bg);
    padding-top: 5rem;
  }

  /* Social corner */
  .social-corner {
    position: fixed;
    bottom: 2.5rem;
    right: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    z-index: 400;
  }
  .social-btn {
    width: 2.6rem;
    height: 2.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ink);
    color: var(--ink);
    background: var(--bg);
    transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
  }
  .social-btn svg { width: 1.1rem; height: 1.1rem; }
  .social-btn:hover {
    background: var(--neon-green);
    border-color: var(--neon-green);
    box-shadow: 0 0 16px rgba(0,255,127,0.4);
  }

  /* Sections */
  .section { width: 100%; padding: 5rem 4rem; }

  /* About split */
  .about-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: start;
  }

  /* Face column */
  .face-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    position: sticky;
    top: 6rem;
  }
  .face-wrap {
    position: relative;
    width: min(300px, 38vw);
    cursor: pointer;
    will-change: transform;
    filter: contrast(1.05);
    transition: filter 0.1s;
  }
  .face-wrap:hover { filter: contrast(1.15); }

  .face-img {
    width: 100%;
    height: auto;
    display: block;
    mix-blend-mode: multiply;
    pointer-events: none;
  }
  .frag {
    position: absolute;
    left: 0; right: 0;
    pointer-events: none;
    background-image: url('/images/face-placeholder.png');
    background-size: 100% auto;
    mix-blend-mode: multiply;
    transition: transform 0.08s linear;
  }
  .frag-eyes  { top: 28%; height: 18%; background-position: 0 -28%; opacity: 0.5; }
  .frag-mouth { top: 65%; height: 15%; background-position: 0 -65%; opacity: 0.5; }

  :global(.face-wrap.glitching .face-img) {
    animation: glitchBurst 0.55s steps(1) forwards;
  }
  @keyframes glitchBurst {
    0%  { clip-path: inset(0); filter: none; }
    10% { clip-path: inset(10% 0 40% 0); filter: hue-rotate(90deg) saturate(5); }
    25% { clip-path: inset(60% 0 0 0); filter: hue-rotate(180deg); }
    40% { clip-path: inset(0 30% 0 0); }
    55% { clip-path: inset(0); filter: none; }
  }

  .face-hint {
    position: absolute;
    bottom: -1.6rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 0.5rem;
    letter-spacing: 0.25em;
    color: var(--neon-green);
    opacity: 0;
    transition: opacity 0.3s;
    white-space: nowrap;
  }
  .face-wrap:hover .face-hint { opacity: 1; }

  .face-sub {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-align: center;
    color: var(--ink);
    line-height: 1.9;
  }
  .neon { color: var(--neon-green); text-shadow: 0 0 8px rgba(0,255,127,0.4); }

  /* Info column */
  .info-col { display: flex; flex-direction: column; gap: 2.5rem; padding-top: 1rem; }

  .info-label {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 4.5vw, 4rem);
    letter-spacing: 0.02em;
    color: var(--ink);
    line-height: 1;
    margin-bottom: 0.8rem;
  }

  .info-list { list-style: none; border-top: 1px solid rgba(10,10,10,0.12); }
  .info-list li {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(10,10,10,0.07);
  }
  .item-name { font-family: var(--font-mono); font-size: 0.72rem; color: var(--ink); }
  .item-yr   { font-family: var(--font-mono); font-size: 0.58rem; color: var(--ink); opacity: 0.42; letter-spacing: 0.1em; }

  /* Contact */
  .contact-section {
    min-height: 75vh;
    display: flex;
    align-items: center;
    gap: 4rem;
    border-top: 1px solid rgba(10,10,10,0.1);
    overflow: hidden;
  }
  .contact-inner { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }

  .contact-eyebrow {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.25em;
    color: var(--neon-green);
    text-shadow: 0 0 8px rgba(0,255,127,0.3);
  }
  .contact-heading {
    font-family: var(--font-display);
    font-size: clamp(5rem, 11vw, 10rem);
    line-height: 0.88;
    letter-spacing: -0.01em;
    color: var(--ink);
  }
  .contact-email {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: clamp(0.75rem, 1.4vw, 0.95rem);
    color: var(--ink);
    border-bottom: 1px solid var(--neon-green);
    padding-bottom: 0.3rem;
    width: fit-content;
    transition: color 0.2s, letter-spacing 0.3s;
  }
  .contact-email:hover { color: var(--neon-green); letter-spacing: 0.05em; }
  .email-arrow { font-size: 1rem; color: var(--neon-green); }

  .contact-socials {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.15em;
  }
  .contact-social-link { color: var(--ink); transition: color 0.2s; }
  .contact-social-link:hover { color: var(--neon-green); }
  .sep { opacity: 0.3; }

  .contact-deco {
    font-size: clamp(6rem, 14vw, 13rem);
    color: transparent;
    -webkit-text-stroke: 1px rgba(10,10,10,0.07);
    user-select: none;
    line-height: 1;
    flex-shrink: 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .section { padding: 3rem 1.5rem; }
    .about-split { grid-template-columns: 1fr; gap: 3rem; }
    .face-col { position: static; }
    .face-wrap { width: min(240px, 68vw); }
    .contact-section { flex-direction: column; min-height: auto; }
    .social-corner { bottom: 1.5rem; right: 1.5rem; }
  }
</style>