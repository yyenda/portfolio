<script>
  import { onMount } from 'svelte';

  let faceEl = $state(null);
  let svgEl = $state(null);
  let glitching = $state(false);
  let tiltX = $state(0);
  let tiltY = $state(0);
  let lineTargets = $state({});
  let svgSize = $state({ w: 0, h: 0 });

  // Feature points on the face image (0-1 normalized)
  const featurePoints = [
    { id: 'eye-l',   rx: 0.32, ry: 0.38 },
    { id: 'eye-r',   rx: 0.68, ry: 0.38 },
    { id: 'nose',    rx: 0.50, ry: 0.58 },
    { id: 'mouth-l', rx: 0.36, ry: 0.72 },
    { id: 'mouth-r', rx: 0.64, ry: 0.72 },
  ];

  // Scattered labels and which feature they connect to
  const labelAnchors = [
    { label: 'CREATIVE',    ax: 0.08, ay: 0.20, fp: 'eye-l' },
    { label: 'DEVELOPER',   ax: 0.82, ay: 0.22, fp: 'eye-r' },
    { label: '3D',          ax: 0.10, ay: 0.68, fp: 'mouth-l' },
    { label: 'INTERACTIVE', ax: 0.74, ay: 0.76, fp: 'mouth-r' },
    { label: 'DESIGN',      ax: 0.50, ay: 0.92, fp: 'nose' },
  ];

  function onMouseMove(e) {
    if (faceEl) {
      const rect = faceEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tiltX = ((e.clientY - cy) / (rect.height / 2)) * 12;
      tiltY = -((e.clientX - cx) / (rect.width / 2)) * 12;

      // Update line targets from face feature positions
      if (svgEl) {
        const svgRect = svgEl.getBoundingClientRect();
        const newTargets = {};
        featurePoints.forEach(fp => {
          newTargets[fp.id] = {
            x: (rect.left + fp.rx * rect.width) - svgRect.left,
            y: (rect.top  + fp.ry * rect.height) - svgRect.top,
          };
        });
        lineTargets = newTargets;
        svgSize = { w: svgRect.width, h: svgRect.height };
      }
    }
  }

  function triggerGlitch() {
    if (glitching) return;
    glitching = true;
    setTimeout(() => { glitching = false; }, 600);
  }

  onMount(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  });
</script>

<section class="hero" id="hero">
  <!-- Full-bleed SVG neon lines -->
  <svg class="neon-lines" bind:this={svgEl} aria-hidden="true">
    {#each labelAnchors as anchor}
      {#if lineTargets[anchor.fp]}
        <line
          x1={lineTargets[anchor.fp].x}
          y1={lineTargets[anchor.fp].y}
          x2={anchor.ax * svgSize.w}
          y2={anchor.ay * svgSize.h}
        />
        <circle cx={lineTargets[anchor.fp].x} cy={lineTargets[anchor.fp].y} r="3" class="dot" />
        <circle cx={anchor.ax * svgSize.w} cy={anchor.ay * svgSize.h} r="3" class="dot" />
      {/if}
    {/each}
  </svg>

  <!-- Scatter labels -->
  <div class="label-layer" aria-hidden="true">
    {#each labelAnchors as anchor}
      <span class="scatter-label" style="left:{anchor.ax*100}%;top:{anchor.ay*100}%">
        {anchor.label}
      </span>
    {/each}
  </div>

  <!-- Interactive Face -->
  <div class="face-zone">
    <div
      class="face-wrapper"
      class:glitching
      bind:this={faceEl}
      onclick={triggerGlitch}
      onkeydown={(e) => e.key === 'Enter' && triggerGlitch()}
      style="transform: perspective(800px) rotateX({tiltX}deg) rotateY({tiltY}deg);"
      role="button"
      tabindex="0"
      aria-label="Interactive face — click for effect"
    >
      <img class="face-img" src="/images/face-placeholder.png" alt="Jan Mrázek" draggable="false" />
      <div class="frag frag-eyes"  style="transform:translate({tiltY*0.4}px,{tiltX*0.3}px)"></div>
      <div class="frag frag-nose"  style="transform:translate({-tiltY*0.2}px,{tiltX*0.15}px)"></div>
      <div class="frag frag-mouth" style="transform:translate({tiltY*0.6}px,{-tiltX*0.2}px)"></div>
      <div class="face-hint">CLICK ME</div>
    </div>
  </div>

  <!-- Title -->
  <div class="title-zone">
    <div class="title-stack">
      <h1 class="hero-name">
        <span class="name-line">JAN</span>
        <span class="name-line outline">MRÁZEK</span>
      </h1>
      <p class="hero-tagline"><span class="bracket">[</span> CREATIVE DEVELOPER <span class="bracket">]</span></p>
      <a href="#/projects" class="hero-cta" id="hero-cta">
        <span>SEE WORK</span>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    </div>
    <div class="scroll-hint" aria-hidden="true">
      <span class="scroll-arrow">↓</span>
      <span class="scroll-text">SCROLL</span>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 6rem 4rem 4rem;
    overflow: hidden;
    background: var(--bg);
  }

  /* SVG overlay */
  .neon-lines {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    overflow: visible;
  }
  .neon-lines line {
    stroke: var(--neon-green);
    stroke-width: 1;
    opacity: 0.65;
  }
  .neon-lines .dot {
    fill: var(--neon-green);
    opacity: 0.9;
  }

  /* Labels */
  .label-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 11;
  }
  .scatter-label {
    position: absolute;
    transform: translate(-50%, -50%);
    font-family: var(--font-mono);
    font-size: 0.58rem;
    letter-spacing: 0.2em;
    color: var(--neon-green);
    white-space: nowrap;
    text-shadow: 0 0 8px var(--neon-green);
  }

  /* Face */
  .face-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }
  .face-wrapper {
    position: relative;
    width: min(380px, 42vw);
    cursor: pointer;
    will-change: transform;
    filter: contrast(1.05);
    transition: filter 0.1s;
  }
  .face-wrapper:hover { filter: contrast(1.15); }

  .face-img {
    width: 100%;
    height: auto;
    display: block;
    mix-blend-mode: multiply;
    position: relative;
    z-index: 1;
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
    z-index: 2;
  }
  .frag-eyes  { top: 28%; height: 18%; background-position: 0 -28%; opacity: 0.55; }
  .frag-nose  { top: 50%; height: 14%; background-position: 0 -50%; opacity: 0.45; }
  .frag-mouth { top: 65%; height: 15%; background-position: 0 -65%; opacity: 0.55; }

  /* Glitch */
  :global(.face-wrapper.glitching .face-img) {
    animation: glitchBurst 0.55s steps(1) forwards;
  }
  :global(.face-wrapper.glitching .frag-eyes) {
    animation: glitchFrag1 0.55s steps(1) forwards;
  }
  :global(.face-wrapper.glitching .frag-mouth) {
    animation: glitchFrag2 0.55s steps(1) forwards;
  }

  @keyframes glitchBurst {
    0%  { clip-path: inset(0); filter: none; }
    10% { clip-path: inset(10% 0 40% 0); filter: hue-rotate(90deg) saturate(5); }
    25% { clip-path: inset(60% 0 0 0); filter: hue-rotate(180deg); }
    40% { clip-path: inset(0 30% 0 0); }
    55% { clip-path: inset(0); filter: none; }
  }
  @keyframes glitchFrag1 {
    0%  { transform: translate(0,0); opacity: 0.55; }
    15% { transform: translate(-22px,9px); opacity:1; filter:hue-rotate(120deg); }
    35% { transform: translate(16px,-6px); opacity:.8; }
    55% { transform: translate(0,0); opacity: 0.55; }
  }
  @keyframes glitchFrag2 {
    0%  { transform: translate(0,0); opacity: 0.55; }
    20% { transform: translate(26px,13px); opacity:1; }
    40% { transform: translate(-11px,-9px); opacity:.7; }
    55% { transform: translate(0,0); opacity: 0.55; }
  }

  .face-hint {
    position: absolute;
    bottom: -1.8rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 0.52rem;
    letter-spacing: 0.25em;
    color: var(--neon-green);
    opacity: 0;
    transition: opacity 0.3s;
    white-space: nowrap;
  }
  .face-wrapper:hover .face-hint { opacity: 1; }

  /* Title */
  .title-zone {
    z-index: 5;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 2rem 0;
    min-height: 60vh;
  }
  .title-stack { display: flex; flex-direction: column; gap: 1.5rem; }

  .hero-name {
    font-family: var(--font-display);
    font-size: clamp(5rem, 11vw, 11rem);
    line-height: 0.88;
    letter-spacing: -0.01em;
    color: var(--ink);
    display: flex;
    flex-direction: column;
  }
  .name-line { display: block; }
  .name-line.outline {
    -webkit-text-stroke: 2px var(--ink);
    color: transparent;
  }

  .hero-tagline {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.25em;
    color: var(--neon-green);
    text-shadow: 0 0 10px rgba(0,255,127,0.4);
  }
  .bracket { opacity: 0.45; }

  .hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    color: var(--ink);
    border: 1px solid var(--ink);
    padding: 0.75rem 1.5rem;
    width: fit-content;
    position: relative;
    overflow: hidden;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .hero-cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--neon-green);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
    z-index: 0;
  }
  .hero-cta:hover::before { transform: scaleX(1); }
  .hero-cta:hover { border-color: var(--neon-green); box-shadow: 0 0 20px rgba(0,255,127,0.25); }
  .hero-cta span, .hero-cta svg { position: relative; z-index: 1; }

  /* Scroll hint */
  .scroll-hint {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-top: auto;
    padding-top: 3rem;
  }
  .scroll-arrow {
    font-size: 1.2rem;
    color: var(--neon-green);
    animation: bounce 2s ease-in-out infinite;
  }
  .scroll-text {
    font-family: var(--font-mono);
    font-size: 0.52rem;
    letter-spacing: 0.3em;
    color: var(--ink);
    opacity: 0.4;
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(6px); }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero {
      grid-template-columns: 1fr;
      padding: 6rem 2rem 3rem;
      gap: 3rem;
    }
    .title-zone { min-height: auto; }
    .face-wrapper { width: min(260px, 68vw); }
    .scatter-label { font-size: 0.48rem; }
  }
</style>
