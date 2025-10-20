<script>
  import Navbar from './components/Navbar.svelte';
  import Router from 'svelte-spa-router';
  import Hero from './components/Hero.svelte';
  import ProjectList from './routes/ProjectList.svelte';
    import About from './routes/about.svelte';
    import Contact from './routes/contact.svelte';
    


  const routes = {
    '/': Hero,
    '/projects/:category': ProjectList,
    '/about' : About,
    '/contact' : Contact
  };

  
</script>
<Navbar />
<Router {routes} />




