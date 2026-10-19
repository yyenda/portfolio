<script>
  import { onMount } from 'svelte';

  onMount(() => {
    const canvas = document.getElementById('shader-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('resize', resizeCanvas);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const radius = 100;
      const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, radius
      );

      gradient.addColorStop(0, 'rgba(255,255,255,0.6)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      requestAnimationFrame(draw);
    }

    draw();
  });
</script>

<canvas id="shader-canvas"></canvas>

<style>
  #shader-canvas {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    mix-blend-mode: lighten;
  }

  @media (max-width: 600px) {
#shader-canvas {
    display: none;
  }
}
</style>
