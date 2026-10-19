<script>
  import Navbar from './components/Navbar.svelte';
  import Hero from './components/Hero.svelte';
  import Projects from './routes/Projects.svelte';
  import About from './routes/about.svelte';

  // Simple hash router - no library needed
  let currentRoute = $state(window.location.hash || '#/');

  $effect(() => {
    const handler = () => {
      currentRoute = window.location.hash || '#/';
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  });

  // Scroll to top on route change
  $effect(() => {
    currentRoute;
    window.scrollTo(0, 0);
  });
</script>

<Navbar />

{#if currentRoute === '#/' || currentRoute === ''}
  <Hero />
{:else if currentRoute === '#/projects'}
  <Projects />
{:else if currentRoute === '#/about'}
  <About />
{:else}
  <Hero />
{/if}
