<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  let showGyroButton = false;


  let container;

  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // --- POINT CLOUD SETUP ---
    const count = 5000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xbb86fc,
      size: 0.05
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- MOUSE TRACKING ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);
    const mouseWorld = new THREE.Vector3();

   if (!isMobile()) {
  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });
}

    const originalPositions = positions.slice();

    function animate() {
      requestAnimationFrame(animate);

      // update cursor world position at depth 5
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.at(5, mouseWorld);

      const pos = geometry.attributes.position.array;
      const time = Date.now() * 0.001;

      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        // restore to original
        pos[ix] += (originalPositions[ix] - pos[ix]) * 0.02;
        pos[iy] += (originalPositions[iy] - pos[iy]) * 0.02;
        pos[iz] += (originalPositions[iz] - pos[iz]) * 0.02;

        // distance to mouse world position
        const dx = pos[ix] - mouseWorld.x;
        const dy = pos[iy] - mouseWorld.y;
        const dz = pos[iz] - mouseWorld.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 10) {
          const force = (4 - dist) * 0.2;
          pos[ix] += (dx / dist) * force;
          pos[iy] += (dy / dist) * force;
          pos[iz] += (dz / dist) * force;
        }

        // optional idle drift
        pos[ix] += Math.sin(time + i) * 0.0002;
        pos[iy] += Math.cos(time + i) * 0.0002;
      }

      geometry.attributes.position.needsUpdate = true;

      // keep scene rotation
      scene.rotation.x += 0.0005;
      scene.rotation.y += 0.001;

      renderer.render(scene, camera);
    }

    function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

if (isMobile()) {
  window.addEventListener('deviceorientation', (event) => {
    // gamma: left/right, beta: front/back tilt
    let gamma = event.gamma || 0; // range -90 to 90
    let beta = event.beta || 0;   // range -180 to 180

    // Normalize and clamp to range -1 to 1
    mouse.x = THREE.MathUtils.clamp(gamma / 30, -1, 1);
    mouse.y = THREE.MathUtils.clamp(-beta / 30, -1, 1); // invert to match screen
  }, true);
}

function requestGyroPermission() {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === 'granted') {
          startGyro();
          showGyroButton = false;
        }
      })
      .catch(console.error);
  } else {
    startGyro(); // Android doesn't need permission
    showGyroButton = false;
  }
}

function startGyro() {
  window.addEventListener('deviceorientation', (event) => {
    let gamma = event.gamma || 0;
    let beta = event.beta || 0;
    mouse.x = THREE.MathUtils.clamp(gamma / 30, -1, 1);
    mouse.y = THREE.MathUtils.clamp(-beta / 30, -1, 1);
  }, true);
}

if (isMobile()) {
  showGyroButton = true;
}


    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  });
</script>



<!-- Hero -->
<div class="hero-container">
  <div class="hero-background" bind:this={container}></div> <!-- canvas attaches here -->
  <div class="hero-content">
    <h1 class="hero-title">JAN MRÁZEK</h1>

    <div class="categories-wrapper">
      <div class="categories text-white-800">
        <a href="#/projects/3d" class="category-link">3D</a>
        <a href="#/projects/gamedev" class="category-link">GAMEDEV</a>
        <a href="#/projects/video" class="category-link">VIDEO</a>
        <a href="#/projects/hardware" class="category-link">HARDWARE</a>
      </div>
    </div>
  </div>
</div>

{#if showGyroButton}
  <button on:click={requestGyroPermission} class="gyro-btn">
    Enable Motion
  </button>
{/if}

