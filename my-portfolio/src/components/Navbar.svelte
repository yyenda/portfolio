<script>
  import { onMount } from 'svelte';

  let scrolled = $state(false);

  onMount(() => {
    const handler = () => { scrolled = window.scrollY > 20; };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  });
</script>

<nav class:scrolled>
  <a href="#/" class="logo" id="nav-home">JAN MRÁZEK</a>
  <div class="nav-links">
    <a href="#/projects" class="nav-link" id="nav-work">WORK</a>
    <a href="#/about" class="nav-link" id="nav-about">ABOUT</a>
  </div>
</nav>

<style>
  nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 3rem;
    transition: background 0.3s ease, border-color 0.3s ease;
    border-bottom: 1px solid transparent;
  }

  nav.scrolled {
    background: rgba(245, 240, 232, 0.92);
    backdrop-filter: blur(12px);
    border-bottom-color: var(--neon-green);
  }

  .logo {
    font-family: var(--font-display);
    font-size: 1.4rem;
    letter-spacing: 0.08em;
    color: var(--ink);
    transition: color 0.2s;
  }

  .logo:hover {
    color: var(--neon-green);
  }

  .nav-links {
    display: flex;
    gap: 2.5rem;
    align-items: center;
  }

  .nav-link {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    color: var(--ink);
    position: relative;
    padding-bottom: 2px;
    transition: color 0.2s;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0%;
    height: 1.5px;
    background: var(--neon-green);
    transition: width 0.25s ease;
  }

  .nav-link:hover::after {
    width: 100%;
  }

  @media (max-width: 600px) {
    nav { padding: 1.2rem 1.5rem; }
    .nav-links { gap: 1.5rem; }
  }
</style>