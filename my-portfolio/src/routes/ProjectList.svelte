<script>
  import { location } from 'svelte-spa-router';
  import projectData from '../lib/projects.json';
  import { onMount } from 'svelte';
  import AOS from 'aos';
  import 'aos/dist/aos.css';

  let category;
  let projects = [];

  $: {
    const path = $location.split('/');
    category = path[path.length - 1];
    projects = projectData[category] || [];
  }

  onMount(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 10,
      easing: 'ease-in-out',
    });
  });
</script>

<section class="project-list">
  <h1 class="category-title">{category.toUpperCase()} PROJECTS</h1>

  <div class="projects-grid">
    {#each projects as project, index}
      <div
        class="project-card"
        data-aos="zoom-in"
        data-aos-delay={index * 100}
      >
        <a
          href={project.link}
          target="_blank"
          class="project-link"
          aria-label={"Open project " + project.title}
        >
          {#if project.video}
            <video
              class="project-media"
              src={project.video}
              autoplay
              loop
              muted
              playsinline
            />
          {:else if project.image}
            <img
              class="project-media"
              src={project.image}
              alt={project.title}
              loading="lazy"
            />
          {/if}
          <div class="project-title-overlay">
            <h2>{project.title}</h2>
            <!-- Desktop only button -->
            <span class="view-btn desktop-only">View Project</span>
          </div>
        </a>
      </div>
    {/each}
  </div>
</section>

<style>
/* General layout */
.project-list {
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.category-title {
  text-align: center;
  color: #8C469D;
  font-size: 3rem;
  margin-bottom: 3rem;
  font-weight: 700;
}

/* Responsive grid */
.projects-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Project card */
.project-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(140, 70, 157, 0.15);
  transition: transform 0.3s ease;
}
.project-card:hover {
  transform: scale(1.02);
}

.project-link {
  display: block;
  position: relative;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.project-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  aspect-ratio: 16/9;
}

/* Overlay title */
.project-title-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  color: white;
  text-align: center;
}

.project-title-overlay h2 {
  font-size: 1.5rem;
  margin: 0;
}

.view-btn {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.4rem 1rem;
  border: 2px solid white;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  transition: background 0.3s, color 0.3s;
  pointer-events: none;
}

.project-card:hover .view-btn {
  background: white;
  color: black;
}

/* Responsive tweaks */
@media (max-width: 768px) {
  .category-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .view-btn {
    display: none; /* Hide on mobile */
  }

  .project-title-overlay h2 {
    font-size: 1.2rem;
  }

  .project-media {
    aspect-ratio: 16/10;
  }
}
</style>
