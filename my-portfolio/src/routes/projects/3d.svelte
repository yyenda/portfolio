<script context="module">
  export async function load({ params }) {
    return { category: params.category };
  }
</script>

<script>
  export let category;

import projectData from '/lib/projects.json';
const projects = projectData[category] || [];

</script>

<svelte:head>
  <title>{category.toUpperCase()} Projects</title>
</svelte:head>

<div class="project-page">
  <h1>{category.toUpperCase()} Projects</h1>

  {#if projects.length > 0}
    {#each projects as project}
      <div class="project-card">
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <a href={project.link} class="view-link">View Project →</a>
      </div>
    {/each}
  {:else}
    <p>No projects yet. Stay tuned!</p>
  {/if}
</div>

<style>
  .project-page {
    max-width: 800px;
    margin: 5rem auto;
    padding: 2rem;
    color: white;
  }

  .project-card {
    border-bottom: 1px solid #444;
    padding: 1.5rem 0;
  }

  .project-card h2 {
    font-size: 2rem;
    margin-bottom: 0.3rem;
  }

  .view-link {
    color: #bb86fc;
    font-weight: bold;
    text-decoration: none;
  }

  .view-link:hover {
    text-decoration: underline;
  }
</style>
