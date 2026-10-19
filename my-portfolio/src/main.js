import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ─── Simplex Noise 3D ────────────────────────────────────────────────────────
const NOISE_GLSL = /* glsl */`
  vec3 _m3(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 _m4(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 _p(vec4 x){return _m4(((x*34.)+1.)*x);}
  vec4 _t(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=_m3(i);
    vec4 p=_p(_p(_p(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=_t(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

// ─── Shaders ─────────────────────────────────────────────────────────────────
const vertexShader = /* glsl */`
  ${NOISE_GLSL}
  #define PI 3.14159265

  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uAmp;
  uniform float uMouseDeform; // Mouse deformation intensity
  uniform float uSphericalUV; // 1 = compute spherical (sphere fallback), 0 = model's native UV

  varying vec3  vNormal;
  varying float vDisp;
  varying vec2  vTexUV;

  void main() {
    // UV source: native from model geometry OR computed spherical (sphere fallback)
    if (uSphericalUV > 0.5) {
      vec3 n0 = normalize(position);
      float phi   = atan(n0.z, n0.x);
      float u     = mod(phi / (2.0 * PI) + 0.25, 1.0);
      float theta = acos(clamp(n0.y, -1.0, 1.0));
      vTexUV = vec2(u, 1.0 - theta / PI);
    } else {
      vTexUV = uv; // model's own UV map — correct and undistorted
    }

    // Noise displacement along vertex normals
    vec3 pos = position;
    float n1 = snoise(pos * 0.42 + vec3(uTime * 0.13, 0., uTime * 0.09));
    float n2 = snoise(pos * 1.1  + vec3(0., uTime * 0.28, uTime * 0.18)) * 0.35;
    float n3 = snoise(pos * 2.6  + vec3(uTime * 0.45)) * 0.12;
    float mLen = length(uMouse);
    float n4 = snoise(pos * 0.9  + vec3(uMouse * 2., uTime * 0.3)) * mLen * uMouseDeform;

    float disp = (n1 + n2 + n3 + n4) * uAmp;
    vDisp = disp;
    vec3 displacementDirection = normalize(position);
    pos += displacementDirection * disp;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform sampler2D uTexture;
  uniform float uHasTexture;

  varying vec3  vNormal;
  varying float vDisp;
  varying vec2  vTexUV;

  void main() {
    vec3 keyDir = normalize(vec3(1.2, 1.8, 2.5));
    float diff  = clamp(dot(vNormal, keyDir) * 0.7 + 0.35, 0.0, 1.0);
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.,0.,1.))), 2.8);

    vec3 baseColor;
    float alpha;

    if (uHasTexture > 0.5) {
      vec4 tex = texture2D(uTexture, vTexUV);
      baseColor = tex.rgb * diff;
      float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
      alpha = max(smoothstep(0.92, 0.35, luma), fresnel * 0.55);
    } else {
      baseColor = vec3(0.97, 0.93, 0.86) * diff;
      alpha = 1.0;
    }

    baseColor += vec3(0.0, 1.0, 0.498) * fresnel * 0.8;
    baseColor += vec3(0.0, 1.0, 0.498) * clamp(vDisp * 0.3, 0.0, 0.35);

    gl_FragColor = vec4(baseColor, alpha);
  }
`;

// ─── Renderer / Scene / Camera ───────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const W = () => window.innerWidth;
const H = () => window.innerHeight;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.setClearColor(0, 0);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, W() / H(), 0.1, 100);
camera.position.z = 5.5;

// ─── Shared uniforms (all materials reference these same objects) ─────────────
const uniforms = {
  uTime:        { value: 0 },
  uMouse:       { value: new THREE.Vector2() },
  uAmp:         { value: 0.12 },
  uMouseDeform: { value: 1.0 },
  uTexture:     { value: null },
  uHasTexture:  { value: 0.0 },
};

// Load face texture (optional — applied if exists)
new THREE.TextureLoader().load('/images/face-placeholder.png', tex => {
  tex.colorSpace = THREE.SRGBColorSpace;
  uniforms.uTexture.value    = tex;
  uniforms.uHasTexture.value = 1.0;
});

// Material factory — shares the uniforms references so one update hits all meshes
function makeMaterial(sphericalUV = false, idleAmp = 0.12) {
  uniforms.uAmp.value = idleAmp;
  return new THREE.ShaderMaterial({
    uniforms: {
      ...uniforms,                               // shallow copy: inner {value} refs are shared ✓
      uSphericalUV: { value: sphericalUV ? 1.0 : 0.0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.FrontSide,
  });
}

const wireMat = new THREE.MeshBasicMaterial({
  color: 0x0a0a0a, wireframe: true, transparent: true, opacity: 0.06,
});

// ─── Model group (we rotate this, not individual meshes) ─────────────────────
const modelGroup = new THREE.Group();
scene.add(modelGroup);

// ─── GLTF Loader ─────────────────────────────────────────────────────────────
const gltfLoader = new GLTFLoader();

let modelLoaded = false;

gltfLoader.load(
  '/models/head.glb',

  // ── Success: real 3D model ──────────────────────────────────────────────
  (gltf) => {
    const model = gltf.scene;

    // Auto-scale: fit largest dimension to ~3.8 units
    const box     = new THREE.Box3().setFromObject(model);
    const size    = box.getSize(new THREE.Vector3());
    const maxDim  = Math.max(size.x, size.y, size.z);
    const fitScale = 3.8 / maxDim;
    model.scale.setScalar(fitScale);

    // Center vertically and horizontally
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    // Collect meshes first — modifying the tree during traverse causes infinite recursion
    const meshes = [];
    model.traverse(child => { if (child.isMesh) meshes.push(child); });

    // Apply displacement shader + wireframe overlay after collection
    meshes.forEach(child => {
      child.geometry.computeVertexNormals();
      child.material = makeMaterial(false, 0.06);
      const wire = new THREE.Mesh(child.geometry, wireMat);
      child.add(wire);
    });

    modelGroup.add(model);
    modelLoaded = true;
    applyMobileScale();
    console.log('✓ Loaded /models/head.glb');
  },

  // ── Progress ───────────────────────────────────────────────────────────
  undefined,

  // ── Error: sphere fallback ──────────────────────────────────────────────
  (err) => {
    console.error('GLTFLoader error:', err);
    console.log('Using sphere fallback.');
    const geo  = new THREE.IcosahedronGeometry(2.0, 5);
    const mat  = makeMaterial(true, 0.18);          // spherical UV + higher amp for interest
    const wire = new THREE.Mesh(geo, wireMat);
    modelGroup.add(new THREE.Mesh(geo, mat), wire);
    modelLoaded = true;
    applyMobileScale();
  }
);

// ─── Mouse / Touch ────────────────────────────────────────────────────────────
let mx = 0, my = 0;
let targetAmp = 0.12, currentAmp = 0.12, idleAmp = 0.12;
let targetRotX = 0, currentRotX = 0;
let targetRotY = 0, currentRotY = 0;

function onPointer(cx, cy) {
  mx = (cx / W() - 0.5) * 2;
  my = -(cy / H() - 0.5) * 2;
  targetAmp  = idleAmp * 4;
  targetRotY = mx * 0.6;
  targetRotX = my * 0.35;
}
window.addEventListener('mousemove', e => onPointer(e.clientX, e.clientY));
window.addEventListener('touchmove', e => {
  onPointer(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

// ─── SVG connecting lines ─────────────────────────────────────────────────────
const svgEl  = document.getElementById('lines');
const labels = [...document.querySelectorAll('.label')];
const NS     = 'http://www.w3.org/2000/svg';

const lineEls = labels.map(() => {
  const el = document.createElementNS(NS, 'line');
  el.setAttribute('stroke', '#00ff7f');
  el.setAttribute('stroke-width', '0.7');
  el.setAttribute('opacity', '0.5');
  svgEl.appendChild(el); return el;
});
const dotEls = labels.map(() => {
  const el = document.createElementNS(NS, 'circle');
  el.setAttribute('r', '2.5');
  el.setAttribute('fill', '#00ff7f');
  svgEl.appendChild(el); return el;
});

function updateLines() {
  const v = new THREE.Vector3();
  modelGroup.getWorldPosition(v);
  v.project(camera);
  const cx = (v.x * 0.5 + 0.5) * W();
  const cy = (-v.y * 0.5 + 0.5) * H();

  labels.forEach((label, i) => {
    const r  = label.getBoundingClientRect();
    const lx = r.left + r.width / 2;
    const ly = r.top  + r.height / 2;
    const dx = lx - cx, dy = ly - cy;
    const len = Math.sqrt(dx*dx + dy*dy);
    const margin = Math.max(r.width / 2 + 6, 22);
    const ex = len > 1 ? lx - (dx/len) * margin : lx;
    const ey = len > 1 ? ly - (dy/len) * margin : ly;
    lineEls[i].setAttribute('x1', cx); lineEls[i].setAttribute('y1', cy);
    lineEls[i].setAttribute('x2', ex); lineEls[i].setAttribute('y2', ey);
    dotEls[i].setAttribute('cx', ex);  dotEls[i].setAttribute('cy', ey);
  });
}

// ─── Mobile scale ─────────────────────────────────────────────────────────────
function applyMobileScale() {
  const mob = W() < 768;
  modelGroup.scale.setScalar(mob ? 0.58 : 1.0);
  camera.position.z = mob ? 6.5 : 5.5;
  camera.updateProjectionMatrix();
  idleAmp = modelLoaded && !mob ? 0.12 : 0.09;
}
applyMobileScale();

// ─── Animation loop ───────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
let spinSpeed = 1.0;

function animate(t) {
  requestAnimationFrame(animate);
  const time = t * 0.001;

  currentRotX = lerp(currentRotX, targetRotX, 0.04);
  currentRotY = lerp(currentRotY, targetRotY, 0.04);
  modelGroup.rotation.x = currentRotX;
  modelGroup.rotation.y = currentRotY + time * 0.04 * spinSpeed; // controlled idle spin

  currentAmp = lerp(currentAmp, targetAmp, 0.03);
  targetAmp  = lerp(targetAmp,  idleAmp,   0.02);    // decay back to idle

  uniforms.uTime.value  = time;
  uniforms.uMouse.value.set(mx, my);
  uniforms.uAmp.value   = currentAmp;

  if (svgEl.children.length) updateLines();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = W() / H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
  applyMobileScale();
});

// ─── Controls UI Binding ──────────────────────────────────────────────────────
const headControls   = document.getElementById('head-controls');
const controlsHeader = document.getElementById('controls-header');
const toggleBtn      = document.getElementById('controls-toggle-btn');
const ctrlDeform     = document.getElementById('ctrl-deform');
const valDeform      = document.getElementById('val-deform');
const ctrlNoise      = document.getElementById('ctrl-noise');
const valNoise       = document.getElementById('val-noise');
const ctrlSpin       = document.getElementById('ctrl-spin');
const valSpin        = document.getElementById('val-spin');
const ctrlWireframe  = document.getElementById('ctrl-wireframe');
const ctrlReset      = document.getElementById('ctrl-reset');

if (headControls) {
  // Prevent clicks or drags on controls from moving the 3D head pointer
  const stopProp = e => e.stopPropagation();
  headControls.addEventListener('mousemove', stopProp);
  headControls.addEventListener('touchmove', stopProp, { passive: true });
  headControls.addEventListener('pointerdown', stopProp);

  // Collapse / Expand toggle
  function toggleControls() {
    const isCollapsed = headControls.classList.toggle('collapsed');
    if (toggleBtn) toggleBtn.textContent = isCollapsed ? '+' : '−';
    if (controlsHeader) controlsHeader.setAttribute('aria-expanded', !isCollapsed);
  }
  if (controlsHeader) {
    controlsHeader.addEventListener('click', toggleControls);
    controlsHeader.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleControls();
      }
    });
  }

  // 1. Mouse deformation strength
  if (ctrlDeform && valDeform) {
    ctrlDeform.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      uniforms.uMouseDeform.value = val;
      valDeform.textContent = `${val.toFixed(1)}x`;
    });
  }

  // 2. Base noise amplitude
  if (ctrlNoise && valNoise) {
    ctrlNoise.addEventListener('input', e => {
      const val = parseFloat(e.target.value);
      idleAmp = val;
      targetAmp = idleAmp;
      uniforms.uAmp.value = idleAmp;
      valNoise.textContent = val.toFixed(2);
    });
  }

  // 3. Spin / Auto-rotation speed
  if (ctrlSpin && valSpin) {
    ctrlSpin.addEventListener('input', e => {
      spinSpeed = parseFloat(e.target.value);
      valSpin.textContent = `${spinSpeed.toFixed(1)}x`;
    });
  }

  // 4. Wireframe toggle
  if (ctrlWireframe) {
    ctrlWireframe.addEventListener('click', () => {
      wireMat.visible = !wireMat.visible;
      ctrlWireframe.textContent = wireMat.visible ? 'ON' : 'OFF';
      ctrlWireframe.classList.toggle('active', wireMat.visible);
    });
  }

  // 5. Reset to defaults
  if (ctrlReset) {
    ctrlReset.addEventListener('click', () => {
      uniforms.uMouseDeform.value = 1.0;
      if (ctrlDeform) ctrlDeform.value = '1.0';
      if (valDeform) valDeform.textContent = '1.0x';

      const defaultAmp = 0.06;
      idleAmp = defaultAmp;
      targetAmp = defaultAmp;
      uniforms.uAmp.value = defaultAmp;
      if (ctrlNoise) ctrlNoise.value = String(defaultAmp);
      if (valNoise) valNoise.textContent = defaultAmp.toFixed(2);

      spinSpeed = 1.0;
      if (ctrlSpin) ctrlSpin.value = '1.0';
      if (valSpin) valSpin.textContent = '1.0x';

      wireMat.visible = true;
      if (ctrlWireframe) {
        ctrlWireframe.textContent = 'ON';
        ctrlWireframe.classList.add('active');
      }
    });
  }
}
