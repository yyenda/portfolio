<script>
    import { Raycaster, Vector2, Vector3 } from 'three';
    const raycaster = new Raycaster();
    const mouse = new Vector2(0, 0);
    const mouseWorld = new Vector3();
    import { onMount, onDestroy } from 'svelte';
    import * as THREE from 'three';
    import Stats from 'three/addons/libs/stats.module.js';
    import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
    import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
    import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
    import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
    import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
    import { FocusShader } from 'three/addons/shaders/FocusShader.js';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
    
    let container; // Svelte element reference
    let camera, scene, renderer, mesh;
    let parent;
    const meshes = [], clonemeshes = [];
    let composer, effectFocus;
    const clock = new THREE.Clock();
    
    function combineBuffer(model, bufferName) {
        let count = 0;
        model.traverse(function (child) {
            if (child.isMesh) {
                const buffer = child.geometry.attributes[bufferName];
                count += buffer.array.length;
            }
        });
        const combined = new Float32Array(count);
        let offset = 0;
        model.traverse(function (child) {
            if (child.isMesh) {
                const buffer = child.geometry.attributes[bufferName];
                combined.set(buffer.array, offset);
                offset += buffer.array.length;
            }
        });
        return new THREE.BufferAttribute(combined, 3);
    }
    
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.3),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    
    function createMesh(positions, scene, scale, x, y, z, color) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', positions.clone());
        geometry.setAttribute('initialPosition', positions.clone());
        geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        const clones = [
            [0, 0, 0]
        ];
        for (let i = 0; i < clones.length; i++) {
            const c = (i < clones.length - 1) ? 0x252525 : color;
            mesh = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 30, color: c }));
            mesh.scale.x = mesh.scale.y = mesh.scale.z = scale * 20;
            mesh.position.x = x + clones[i][0];
            mesh.position.y = y + clones[i][1];
            mesh.position.z = z + clones[i][2];
            mesh.rotation.x = Math.PI / 2 * -1;
            const isMobile = window.innerWidth < 768;

            mesh.position.x = isMobile ? 700 : 1500;
            mesh.position.y = -700;
            mesh.position.z = 0;

            parent.add(mesh);
            clonemeshes.push({ mesh: mesh, speed: 0.5 + Math.random() });
        }
        // Add exploded flags for each vertex
        meshes.push({
            mesh: mesh,
            verticesDown: 0,
            verticesUp: 0,
            direction: 0,
            speed: 15,
            delay: Math.floor(200 + 200 * Math.random()),
            start: Math.floor(100 + 200 * Math.random()),
            exploded: new Array(positions.count).fill(false)
        });
    }
    
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        camera.lookAt(scene.position);
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        effectFocus.uniforms['screenWidth'].value = window.innerWidth * window.devicePixelRatio;
        effectFocus.uniforms['screenHeight'].value = window.innerHeight * window.devicePixelRatio;
    }
    
    function animate() {
        render();
    }
    
    function render() {
        let delta = 10 * clock.getDelta();
        delta = delta < 2 ? delta : 2;
        // Update raycaster for mouse position
        raycaster.setFromCamera(mouse, camera);
        // Project mouse position to a plane at the mesh's z-position
        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Plane at z=0
        raycaster.ray.intersectPlane(planeZ, mouseWorld);
        if (mouseWorld) {
            mouseWorld.x -= 1500; // Offset to align with mesh's local coordinates
            mouseWorld.y += 700;
        }
        
        for (let j = 0; j < clonemeshes.length; j++) {
            const cm = clonemeshes[j];
            cm.mesh.rotation.z += -0.1 * delta * cm.speed;
        }
        
        for (let j = 0; j < meshes.length; j++) {
            const data = meshes[j];
            const positions = data.mesh.geometry.attributes.position;
            const initialPositions = data.mesh.geometry.attributes.initialPosition;
            const count = positions.count;
            
            if (data.start > 0) {
                data.start -= 1;
            } else {
                if (data.direction === 0) {
                    data.direction = -1;
                }
            }
            
            for (let i = 0; i < count; i++) {
                const px = positions.getX(i);
                const py = positions.getY(i);
                const pz = positions.getZ(i);
                
                // falling down (explosion)
                if (data.direction < 0) {
                    if (!data.exploded[i]) { // Only move if not exploded
                        const ix = initialPositions.getX(i);
                        const iy = initialPositions.getY(i);
                        const iz = initialPositions.getZ(i);
                        let dx = px - ix;
                        let dy = py - iy;
                        let dz = pz - iz;
                        if (dx === 0 && dy === 0 && dz === 0) {
                            const theta = Math.random() * 2 * Math.PI;
                            const phi = Math.acos(2 * Math.random() - 1);
                            dx = Math.sin(phi) * Math.cos(theta);
                            dy = Math.sin(phi) * Math.sin(theta);
                            dz = Math.cos(phi);
                        }
                        const length = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
                        dx /= length;
                        dy /= length;
                        dz /= length;
                        positions.setXYZ(
                            i,
                            px + dx * data.speed * delta * (0.5 + Math.random()),
                            py + dy * data.speed * delta * (0.5 + Math.random()),
                            pz + dz * data.speed * delta * (0.5 + Math.random())
                        );
                        const dist = Math.sqrt(
                            Math.pow(px - ix, 2) +
                            Math.pow(py - iy, 2) +
                            Math.pow(pz - iz, 2)
                        );
                        if (dist > 100) { // Only count once!
                            data.exploded[i] = true;
                            data.verticesDown += 1;
                        }
                    }
                }
                
                // rising up
                if (data.direction > 0) {
                    const ix = initialPositions.getX(i);
                    const iy = initialPositions.getY(i);
                    const iz = initialPositions.getZ(i);
                    const dx = px - ix;
                    const dy = py - iy;
                    const dz = pz - iz;
                    const dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
                    if (dist > 1) {
                        positions.setXYZ(
                            i,
                            px - dx * data.speed * delta * 0.02,
                            py - dy * data.speed * delta * 0.02,
                            pz - dz * data.speed * delta * 0.02
                        );
                    } else {
                        positions.setXYZ(i, ix, iy, iz);
                        data.verticesUp += 1;
                    }
                }
                
                // Apply mouse repulsion
                const dx = px - mouseWorld.x;
                const dy = py - mouseWorld.y;
                const dz = pz - mouseWorld.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist < 300 && dist > 0) { // Ensure non-zero distance to avoid division by zero
                    const force = (10 - dist) * 0.001;
                    positions.setXYZ(
                        i,
                        px + (dx / dist) * force,
                        py + (dy / dist) * force,
                        pz + (dz / dist) * force
                    );
                }
            }
            
            // all vertices down
            if (data.verticesDown >= count) {
                if (data.delay <= 0) {
                    data.direction = 1;
                    data.speed = 5;
                    data.verticesDown = 0;
                    data.delay = 320;
                    data.exploded.fill(false); // Reset for next explosion
                } else {
                    data.delay -= 1;
                }
            }
            
            // all vertices up
            if (data.verticesUp >= count) {
                if (data.delay <= 0) {
                    data.direction = -1;
                    data.speed = 15;
                    data.verticesUp = 0;
                    data.delay = 120;
                } else {
                    data.delay -= 1;
                }
            }
            
            positions.needsUpdate = true;
        }
        
        composer.render(0.01);
    }
    
    onMount(() => {
        // Initialize Three.js scene
        camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 50000);
        camera.position.set(0, 700, 7000);
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.FogExp2(0xffffff, 0.0000675);
        camera.lookAt(scene.position);
        const loader = new OBJLoader();
        loader.load('static/models/face.obj', function (object) {
            const positions = combineBuffer(object, 'position');
            createMesh(positions, scene, 4.05, -500, -350, 600, 0xbb86fc);
        });
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setAnimationLoop(animate);
        renderer.autoClear = false;
        container.appendChild(renderer.domElement);
        parent = new THREE.Object3D();
        scene.add(parent);
        scene.add(sphere);
        // postprocessing
        const renderModel = new RenderPass(scene, camera);
        const effectBloom = new BloomPass(0.4);
        const effectFilm = new FilmPass();
        effectFocus = new ShaderPass(FocusShader);
        effectFocus.uniforms['screenWidth'].value = window.innerWidth * window.devicePixelRatio;
        effectFocus.uniforms['screenHeight'].value = window.innerHeight * window.devicePixelRatio;
        const outputPass = new OutputPass();
        composer = new EffectComposer(renderer);
        composer.addPass(renderModel);
        composer.addPass(effectBloom);
        composer.addPass(effectFilm);
        composer.addPass(effectFocus);
        composer.addPass(outputPass);
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        return () => {
            // Clean up
            renderer.dispose();
            window.removeEventListener('resize', onWindowResize);
            // Optionally dispose meshes, composer, etc.
        };
    });
</script>
<!-- Svelte markup -->
<div class="hero-container">
    <div class="hero-background" bind:this={container}></div> <!-- canvas attaches here -->
<div class="about-section">
  <div class="about-text animate-fade-in">
    <h1>HELLO, <br> I’M  <span class="highlight">JAN MRÁZEK</span></h1>
    <p>
      A creative artist combining <strong>3D</strong>, <strong>code</strong>,
      <strong>motion</strong> and <strong>hardware</strong> into interactive art.
    </p>
    <p>
      I design bold experiences both in virtual spaces and real-world installations,
      (or somewhere in between). Powered by curiosity and pixels.
    </p>

    <div class="social-links">
  <a href="https://www.instagram.com/mrazek_studio/" target="_blank" aria-label="Instagram">
    <i class="fab fa-instagram"></i>
  </a>
  <a href="https://www.youtube.com/@mrazek_studios" target="_blank" aria-label="YouTube">
    <i class="fab fa-youtube"></i>
  </a>
</div>

  </div>
</div>



</div>