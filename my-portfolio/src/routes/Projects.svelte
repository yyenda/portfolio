<script>
  import projects from '../lib/projects.json';

  // Assign random layout properties per card
  let cards = $state(projects.map((p, i) => ({
    ...p,
    x: 5 + (i % 3) * 30 + (Math.random() - 0.5) * 12,
    y: 8 + Math.floor(i / 3) * 34 + (Math.random() - 0.5) * 8,
    rot: (Math.random() - 0.5) * 12,
    driftDuration: 6 + Math.random() * 6,
    driftDelay: Math.random() * -8,
    width: 26 + Math.random() * 8,
    hovered: false,
  })));

  let dragging = $state(null);
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let containerEl = $state(null);

  function startDrag(e, card) {
    e.preventDefault();
    dragging = card;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = containerEl.getBoundingClientRect();
    dragOffsetX = clientX - rect.left - (card.x / 100) * rect.width;
    dragOffsetY = clientY - rect.top  - (card.y / 100) * rect.height;
  }

  function onMove(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = containerEl.getBoundingClientRect();
    dragging.x = Math.max(0, Math.min(88, ((clientX - rect.left - dragOffsetX) / rect.width) * 100));
    dragging.y = Math.max(0, Math.min(88, ((clientY - rect.top  - dragOffsetY) / rect.height) * 100));
  }

  function stopDrag() { dragging = null; }
</script>

<svelte:window onmousemove={onMove} onmouseup={stopDrag} ontouchmove={onMove} ontouchend={stopDrag} />

<section class="works-section" id="works" bind:this={containerEl}>
  <!-- Giant ghost heading -->
  <p class="bg-heading" aria-hidden="true">SELECTED<br/>WORKS</p>

  <!-- Index panel -->
  <div class="index-strip">
    {#each cards as card, i}
      <span class="index-item">{String(i + 1).padStart(2, '0')}. {card.title}</span>
    {/each}
  </div>

  <!-- Floating draggable cards -->
  {#each cards as card (card.id)}
    <div
      class="project-card"
      class:is-dragging={dragging === card}
      style="
        left: {card.x}%;
        top: {card.y}%;
        width: {card.width}%;
        --rot: {dragging === card ? 0 : card.rot}deg;
        --drift-dur: {card.driftDuration}s;
        --drift-delay: {card.driftDelay}s;
        z-index: {dragging === card ? 100 : card.hovered ? 50 : card.id};
      "
      onmousedown={(e) => startDrag(e, card)}
      ontouchstart={(e) => startDrag(e, card)}
      onmouseenter={() => { card.hovered = true; }}
      onmouseleave={() => { card.hovered = false; }}
      role="button"
      tabindex="0"
      aria-label={card.title}
      onkeydown={(e) => e.key === 'Enter' && startDrag(e, card)}
    >
      <div class="card-num">{String(card.id).padStart(2, '0')}.</div>
      <div class="card-img-wrap">
        <img src={card.image} alt={card.title} draggable="false" />
      </div>
      <div class="card-footer">
        <span class="card-title">{card.title}</span>
        <span class="card-year">{card.year}</span>
        {#if card.link}
          <a href={card.link} target="_blank" rel="noopener" class="card-link"
             id="card-link-{card.id}"
             onmousedown={(e) => e.stopPropagation()}>↗</a>
        {/if}
      </div>
    </div>
  {/each}
</section>

<style>
  .works-section {
    position: relative;
    width: 100%;
    height: 280vw;
    min-height: 1800px;
    background: var(--bg);
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  .bg-heading {
    position: sticky;
    top: 14vh;
    font-family: var(--font-display);
    font-size: clamp(5rem, 18vw, 18rem);
    line-height: 0.85;
    letter-spacing: -0.02em;
    color: transparent;
    -webkit-text-stroke: 1px rgba(10,10,10,0.06);
    pointer-events: none;
    z-index: 1;
    padding-left: 3rem;
    margin: 0;
  }

  .index-strip {
    position: absolute;
    top: 3rem;
    right: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    z-index: 200;
    background: rgba(245, 240, 232, 0.88);
    backdrop-filter: blur(8px);
    border: 1px solid var(--neon-green);
    padding: 1rem 1.2rem;
  }

  .index-item {
    font-family: var(--font-mono);
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    color: var(--ink);
    opacity: 0.65;
    cursor: default;
    transition: opacity 0.2s, color 0.2s;
  }
  .index-item:hover { opacity: 1; color: var(--neon-green); }

  .project-card {
    position: absolute;
    background: var(--white);
    border: 1px solid rgba(10,10,10,0.12);
    padding: 0.5rem 0.5rem 0.8rem;
    cursor: grab;
    transform: rotate(var(--rot));
    animation: drift var(--drift-dur) ease-in-out var(--drift-delay) infinite alternate;
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
  }

  .project-card:hover {
    box-shadow: 0 0 0 2px var(--neon-green), 0 12px 40px rgba(0,255,127,0.15);
    border-color: var(--neon-green);
  }

  .project-card.is-dragging {
    cursor: grabbing;
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    animation: none;
    transform: rotate(0deg);
  }

  .card-num {
    font-family: var(--font-mono);
    font-size: 0.55rem;
    letter-spacing: 0.15em;
    color: var(--neon-green);
    margin-bottom: 0.4rem;
  }

  .card-img-wrap {
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--bg-2);
  }
  .card-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
    pointer-events: none;
  }
  .project-card:hover .card-img-wrap img { transform: scale(1.04); }

  .card-footer {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-top: 0.6rem;
    padding: 0 0.2rem;
  }
  .card-title {
    font-family: var(--font-display);
    font-size: clamp(0.8rem, 1.4vw, 1.15rem);
    color: var(--ink);
    flex: 1;
  }
  .card-year {
    font-family: var(--font-mono);
    font-size: 0.52rem;
    color: var(--ink);
    opacity: 0.4;
  }
  .card-link {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--neon-green);
    text-decoration: none;
    pointer-events: all;
  }
  .card-link:hover { opacity: 0.6; }

  @keyframes drift {
    from { margin-top: 0; }
    to   { margin-top: 14px; }
  }

  @media (max-width: 768px) {
    .works-section {
      height: auto;
      min-height: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 5rem 1.2rem 3rem;
    }
    .bg-heading { display: none; }
    .index-strip { display: none; }
    .project-card {
      position: relative !important;
      left: auto !important;
      top: auto !important;
      width: 100% !important;
      transform: none !important;
      animation: none !important;
    }
  }
</style>
