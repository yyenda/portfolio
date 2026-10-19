<script>
  import { location } from 'svelte-spa-router';
  import projectData from '../lib/projects.json';
  import { onMount } from 'svelte';

  let category;
  let projects = [];

  $: {
    const path = $location.split('/');
    category = path[path.length - 1];
    projects = projectData[category] || [];
  }

</script>

<section class="project-list">
<h1 class="category-title">{category.toUpperCase()} PROJECTS</h1>

  {#each projects as project, index}
    <div
      class="project-section"
       style="--i: {index}"
      
    >
      {#if project.video}
        <video class="project-media" src={project.video} autoplay loop muted playsinline />
      {:else if project.image}
        <img class="project-media" src={project.image} alt={project.title} />
      {/if}

      <div class="project-overlay">
        <h2>{project.title}</h2>
        {#if project.link}
          <a href={project.link} target="_blank" class="view-btn">View Project</a>
        {/if}
      </div>
    </div>
  {/each}
</section>

<style>
  .project-nav {
    position: fixed;
    top: 0;
    width: 100%;
    background: black;
    text-align: center;
    padding: 1rem 0;
    z-index: 100;
    border-bottom: 1px solid #8C469D;
  }

  .nav-link {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.5rem;
    color: #8C469D;
    text-decoration: none;
  }

  .project-list {
    margin-top: 80px;
  }

  .category-title {
  text-align: center;
  font-size: 4rem;
  color: #8C469D;
  font-family: 'Bebas Neue', sans-serif;
  margin: 1rem 1rem;
  letter-spacing: 2px;
 
}


  .project-section {
    position: relative;
    height: 80vh; /* Shorter so you can scroll to next */
    margin: 3rem auto;
    width: 90%;
    overflow: hidden;
    opacity: 0;
    transform: translateY(40px);
    animation: fadeInUp 0.8s ease-out forwards;
    animation-delay: calc(0.1s * var(--i));
    }

    @keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
    }

  .project-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    box-shadow: 0 0 30px rgba(140, 70, 157, 0.2);
  }

  .project-overlay {
    position: absolute;
    bottom: 5%;
    left: 50%;
    transform: translate(-50%, -5%);
    text-align: center;
    z-index: 10;
    pointer-events: none;
  }


  

  .project-overlay h2 {
    font-size: 3rem;
    margin: 1rem;
    color: #fff;
  }

  .view-btn {
    font-size: 1rem;
    font-weight: bold;
    color: white;
    border: 2px solid white;
    padding: 0.6rem 1.5rem;
    text-decoration: none;
    background: transparent;
    border-radius: 0;
    pointer-events: all;
    transition: background 0.3s, color 0.3s;
  }

  .view-btn:hover {
    background: white;
    color: black;
  }

  body {
    background: black;
    color: white;
    margin: 0;
  }

   @media (max-width: 768px) {
    .project-overlay h2 {
      font-size: 2rem;
    }

    .view-btn {
      font-size: 0.9rem;
      padding: 0.4rem 1.2rem;
    }
  }
</style>
