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

    import AOS from 'aos';
  import 'aos/dist/aos.css';

  

  onMount(() => {
    AOS.init({
      duration: 800,       // animation duration
      once: true,          // only animate once
      offset: 10,         // trigger offset
      easing: 'ease-in-out'
    });
  });

</script>

<section class="project-list">
<h1 class="category-title">{category.toUpperCase()} PROJECTS</h1>

  {#each projects as project, index}
    <div
      class="project-section"
       style="--i: {index}"
       data-aos="zoom-in"
       data-aos-duration="500"
    data-aos-delay={index * 100}
    data-aos-once="false"
      
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
    margin-top: 2rem;
    
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
  height: 80vh;
  margin: 3rem auto;
  width: 90%;
  overflow: hidden;
  border-radius: 16px; /* rounded corners */

}



.project-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  box-shadow: 0 0 30px rgba(140, 70, 157, 0.2);
  border-radius: 16px; /* inherit rounded corners */
}

.project-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 40%;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  z-index: 1;
  pointer-events: none;
  border-radius: 0 0 16px 16px;
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


  .project-section:hover {
  transform: scale(1.0);
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
