
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ==========================================
// DREAM PORTAL — 3D ASOSIY TIZIM
// ==========================================

const container = document.getElementById('scene');
const loader = document.getElementById('loader');
const homeScreen = document.getElementById('homeScreen');
const worldScreen = document.getElementById('worldScreen');
const transition = document.getElementById('transition');

const statusText = document.getElementById('statusText');
const worldTitle = document.getElementById('worldTitle');
const worldIndex = document.getElementById('worldIndex');
const worldDescription = document.getElementById('worldDescription');
const worldCaption = document.getElementById('worldCaption');
const transitionText = document.getElementById('transitionText');

const GOLD = 0xffd21f;
const GOLD_LIGHT = 0xfff3a3;
const WHITE = 0xffffff;

const worldData = [
  {
    title: 'KOINOT',
    description: 'Yulduzlar orasidagi cheksiz sayohat.',
    caption: 'GALAKTIKA FAOL',
    color: 0xffd21f
  },
  {
    title: '2099',
    description: 'Kelajak shahri. Yangi texnologiyalar olami.',
    caption: 'KELAJAK SHAHRI FAOL',
    color: 0xffa62b
  },
  {
    title: 'PARALLEL',
    description: 'Boshqa o‘lchamga qadam qo‘y.',
    caption: 'PARALLEL O‘LCHAM FAOL',
    color: 0xc084fc
  },
  {
    title: 'SEHRLI OLAM',
    description: 'Suzuvchi kristallar va sirli energiya.',
    caption: 'KRISTALLAR OLAMI FAOL',
    color: 0xffd21f
  }
];

let currentWorld = -1;
let transitioning = false;
let paused = false;
let mouseX = 0;
let mouseY = 0;
let elapsed = 0;
let activeWorldGroup = null;
let portalGroup = null;
let starField = null;
let cityGroup = null;
let crystalGroup = null;
let galaxyGroup = null;
let vortexGroup = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.012);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 1.2, 12);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
container.appendChild(renderer.domElement);

// Yorug‘lik
scene.add(new THREE.AmbientLight(0xffffff, 1.0));

const mainLight = new THREE.PointLight(GOLD, 65, 45);
mainLight.position.set(0, 2, 3);
scene.add(mainLight);

const rimLight = new THREE.PointLight(0xff9f1c, 35, 35);
rimLight.position.set(-5, 2, -4);
scene.add(rimLight);

// Umumiy guruhlar
portalGroup = new THREE.Group();
scene.add(portalGroup);

activeWorldGroup = new THREE.Group();
scene.add(activeWorldGroup);

// ==========================================
// YORDAMCHI FUNKSIYALAR
// ==========================================

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.35,
    metalness: 0.65,
    ...options
  });
}

function addGlowRing(parent, radius, tube, color, x = 0, y = 0, z = 0) {
  const geometry = new THREE.TorusGeometry(radius, tube, 12, 120);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.92
    })
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function addOrb(parent, x, y, z, size, color, glow = true) {
  const geometry = new THREE.SphereGeometry(size, 20, 20);
  const mesh = new THREE.Mesh(
    geometry,
    material(color, {
      emissive: color,
      emissiveIntensity: glow ? 1.2 : 0.15,
      roughness: 0.25,
      metalness: 0.3
    })
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function clearGroup(group) {
  while (group.children.length) {
    const object = group.children[0];
    group.remove(object);

    object.traverse(child => {
      if (child.geometry) child.geometry.dispose();

      if (child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach(m => m.dispose());
      }
    });
  }
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

// ==========================================
// YULDUZLAR VA ZARRACHALAR
// ==========================================

function createStars(count = 2200, spread = 100) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = random(-spread, spread);
    positions[i * 3 + 1] = random(-spread, spread);
    positions[i * 3 + 2] = random(-spread, spread);

    const gold = Math.random() > 0.65;

    colors[i * 3] = gold ? 1 : 0.65 + Math.random() * 0.35;
    colors[i * 3 + 1] = gold ? 0.78 : 0.7 + Math.random() * 0.3;
    colors[i * 3 + 2] = gold ? 0.15 : 1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  );

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      depthWrite: false
    })
  );

  scene.add(points);
  return points;
}

starField = createStars();

// ==========================================
// BOSHLANG‘ICH OLTIN PORTAL
// ==========================================

const portalCore = new THREE.Mesh(
  new THREE.CircleGeometry(1.45, 96),
  new THREE.MeshBasicMaterial({
    color: 0x3b2600,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  })
);
portalCore.position.z = -0.2;
portalGroup.add(portalCore);

const portalRings = [];

for (let i = 0; i < 5; i++) {
  const ring = addGlowRing(
    portalGroup,
    1.65 + i * 0.16,
    0.018 + (i % 2) * 0.014,
    i % 2 === 0 ? GOLD : GOLD_LIGHT,
    0,
    0,
    -i * 0.08
  );

  ring.rotation.z = i * 0.23;
  portalRings.push(ring);
}

// Portal markazidagi yorug‘lik
const portalLight = new THREE.PointLight(GOLD, 55, 18);
portalLight.position.set(0, 0, 1);
portalGroup.add(portalLight);

// Portal atrofidagi uchuvchi zarralar
const particleCount = 650;
const particlePositions = new Float32Array(particleCount * 3);
const particleSpeeds = [];

for (let i = 0; i < particleCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = random(1.9, 5.5);

  particlePositions[i * 3] = Math.cos(angle) * radius;
  particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
  particlePositions[i * 3 + 2] = random(-3, 2);

  particleSpeeds.push({
    angle,
    radius,
    speed: random(0.08, 0.42),
    offset: Math.random() * Math.PI * 2
  });
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(particlePositions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  color: GOLD,
  size: 0.045,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(
  particleGeometry,
  particleMaterial
);

portalGroup.add(particles);

// Portal markaziga yengil girdob chiziqlari
const spiralGroup = new THREE.Group();
portalGroup.add(spiralGroup);

for (let i = 0; i < 3; i++) {
  const ring = addGlowRing(
    spiralGroup,
    0.55 + i * 0.35,
    0.012,
    i === 1 ? GOLD_LIGHT : GOLD,
    0,
    0,
    0.15 + i * 0.05
  );
  ring.rotation.x = Math.PI * (0.15 + i * 0.18);
}

// ==========================================
// 1-OLAM: KOINOT
// ==========================================

function createGalaxy() {
  galaxyGroup = new THREE.Group();
  activeWorldGroup.add(galaxyGroup);

  const galaxyColors = [
    0xffd21f,
    0xff8c42,
    0xc084fc,
    0x8bc5ff
  ];

  // Spiral galaktika
  const count = 4000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const arm = i % 4;
    const radius = Math.pow(Math.random(), 0.65) * 8;
    const angle = radius * 0.65 + arm * Math.PI / 2
      + random(-0.22, 0.22);

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = random(-0.45, 0.45)
      * (1 - radius / 10);
    positions[i * 3 + 2] = Math.sin(angle) * radius - 4;

    const c = new THREE.Color(
      galaxyColors[Math.floor(Math.random() * galaxyColors.length)]
    );

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const galaxy = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  galaxy.rotation.x = 0.45;
  galaxyGroup.add(galaxy);

  addOrb(galaxyGroup, 0, 0, -4, 0.65, GOLD_LIGHT);
  addGlowRing(galaxyGroup, 0.9, 0.025, GOLD, 0, 0, -4);

  const planet = addOrb(
    galaxyGroup, 3.8, 1.2, -2, 0.75, 0x6741a5, false
  );

  addGlowRing(
    galaxyGroup, 1.05, 0.025, 0xc084fc,
    3.8, 1.2, -2
  ).rotation.x = 0.6;

  const planet2 = addOrb(
    galaxyGroup, -3, -1.5, -5, 0.45, 0x237cba, false
  );

  galaxyGroup.userData.planets = [planet, planet2, galaxy];
}

// ==========================================
// 2-OLAM: KELAJAK SHAHRI
// ==========================================

function createCity() {
  cityGroup = new THREE.Group();
  activeWorldGroup.add(cityGroup);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    material(0x090b10, { metalness: 0.8, roughness: 0.4 })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.1;
  ground.position.z = -5;
  cityGroup.add(ground);

  // Yo‘l chiziqlari
  const roadMaterial = new THREE.MeshBasicMaterial({
    color: GOLD,
    transparent: true,
    opacity: 0.7
  });

  for (let i = -8; i <= 8; i++) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.015, 50),
      roadMaterial
    );
    line.position.set(i * 1.2, -2.02, -8);
    cityGroup.add(line);
  }

  // Baland binolar
  for (let i = 0; i < 100; i++) {
    const x = random(-20, 20);
    const z = random(-27, 4);

    if (Math.abs(x) < 2.5 && z > -12) continue;

    const height = random(1.5, 8);
    const width = random(0.45, 1.4);
    const depth = random(0.5, 1.5);

    const building = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material(
        Math.random() > 0.65 ? 0x33260a : 0x10151e,
        {
          emissive: Math.random() > 0.5 ? GOLD : 0x18304a,
          emissiveIntensity: 0.12,
          metalness: 0.85
        }
      )
    );

    building.position.set(x, -2 + height / 2, z);
    cityGroup.add(building);

    // Binoning tepasidagi neon
    if (Math.random() > 0.35) {
      const beacon = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.75, 0.035, 0.035),
        new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? GOLD : 0x65c8ff
        })
      );

      beacon.position.set(
        x,
        -2 + height + 0.04,
        z
      );

      cityGroup.add(beacon);
    }

    // Derazalar
    if (height > 3) {
      const windowGeo = new THREE.BoxGeometry(0.055, 0.13, 0.025);

      for (let wy = 0.5; wy < height - 0.3; wy += 0.55) {
        for (let wx = -width / 2 + 0.15; wx < width / 2; wx += 0.3) {
          if (Math.random() > 0.4) continue;

          const win = new THREE.Mesh(
            windowGeo,
            new THREE.MeshBasicMaterial({
              color: Math.random() > 0.3 ? GOLD : 0x6ab7ff
            })
          );

          win.position.set(x + wx, -2 + wy, z + depth / 2 + 0.016);
          cityGroup.add(win);
        }
      }
    }
  }

  // Markaziy kelajak minorasi
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.8, 6.5, 8),
    material(0x42320a, {
      emissive: GOLD,
      emissiveIntensity: 0.6,
      metalness: 0.9
    })
  );

  tower.position.set(0, 1.1, -8);
  cityGroup.add(tower);

  addGlowRing(cityGroup, 1.2, 0.035, GOLD, 0, 1.8, -8)
    .rotation.x = Math.PI / 2;

  const cityLight = new THREE.PointLight(GOLD, 25, 25);
  cityLight.position.set(0, 3, -6);
  cityGroup.add(cityLight);
}

// ==========================================
// 3-OLAM: PARALLEL O‘LCHAM
// ==========================================

function createVortex() {
  vortexGroup = new THREE.Group();
  activeWorldGroup.add(vortexGroup);

  const colors = [0xc084fc, 0x6d28d9, 0xffd21f, 0x38bdf8];

  // Katta aylanuvchi o‘lcham halqalari
  for (let i = 0; i < 12; i++) {
    const ring = addGlowRing(
      vortexGroup,
      0.7 + i * 0.29,
      0.014 + (i % 3) * 0.006,
      colors[i % colors.length],
      0,
      0,
      -i * 0.17
    );

    ring.rotation.x = random(-0.8, 0.8);
    ring.rotation.y = random(-0.8, 0.8);
    ring.userData.spin = random(-0.55, 0.55);
  }

  // Fazoda uchuvchi geometrik shakllar
  const geometries = [
    new THREE.IcosahedronGeometry(0.35, 0),
    new THREE.OctahedronGeometry(0.4, 0),
    new THREE.TetrahedronGeometry(0.4, 0)
  ];

  for (let i = 0; i < 65; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];

    const mesh = new THREE.Mesh(
      geometries[i % geometries.length],
      material(color, {
        emissive: color,
        emissiveIntensity: 0.7,
        metalness: 0.6,
        roughness: 0.22,
        wireframe: Math.random() > 0.55
      })
    );

    mesh.position.set(
      random(-7, 7),
      random(-5, 5),
      random(-12, 2)
    );

    mesh.userData.baseY = mesh.position.y;
    mesh.userData.phase = Math.random() * Math.PI * 2;
    mesh.userData.speed = random(0.3, 1.1);

    vortexGroup.add(mesh);
  }

  const vortexLight = new THREE.PointLight(0xc084fc, 65, 30);
  vortexLight.position.set(0, 0, -3);
  vortexGroup.add(vortexLight);
}

// ==========================================
// 4-OLAM: SEHRLI KRISTALLAR
// ==========================================

function createCrystals() {
  crystalGroup = new THREE.Group();
  activeWorldGroup.add(crystalGroup);

  const crystalColors = [
    0xffd21f,
    0xfff3a3,
    0xffa62b,
    0xe9c6ff
  ];

  for (let i = 0; i < 55; i++) {
    const size = random(0.18, 0.65);
    const sides = Math.random() > 0.5 ? 5 : 6;

    const geo = new THREE.OctahedronGeometry(size, 0);
    const color = crystalColors[
      Math.floor(Math.random() * crystalColors.length)
    ];

    const crystal = new THREE.Mesh(
      geo,
      new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.55,
        metalness: 0.35,
        roughness: 0.16,
        transparent: true,
        opacity: 0.9,
        flatShading: true
      })
    );

    crystal.position.set(
      random(-7, 7),
      random(-4.5, 4.5),
      random(-12, 2)
    );

    crystal.rotation.set(
      random(0, Math.PI),
      random(0, Math.PI),
      random(0, Math.PI)
    );

    crystal.userData.baseY = crystal.position.y;
    crystal.userData.phase = Math.random() * Math.PI * 2;
    crystal.userData.speed = random(0.3, 0.9);

    crystalGroup.add(crystal);

    // Har bir kristal atrofidagi mayda nur
    if (i < 12) {
      const light = new THREE.PointLight(color, 2, 4);
      light.position.copy(crystal.position);
      crystalGroup.add(light);
    }
  }

  // Markaziy sehrli kristal
  const central = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.MeshPhysicalMaterial({
      color: GOLD_LIGHT,
      emissive: GOLD,
      emissiveIntensity: 1.8,
      metalness: 0.4,
      roughness: 0.08,
      transparent: true,
      opacity: 0.95
    })
  );

  central.position.set(0, 0, -3);
  central.userData.central = true;
  crystalGroup.add(central);

  addGlowRing(crystalGroup, 1.8, 0.025, GOLD, 0, 0, -3)
    .rotation.x = 0.7;

  const crystalLight = new THREE.PointLight(GOLD, 45, 22);
  crystalLight.position.set(0, 0, -3);
  crystalGroup.add(crystalLight);
}

// ==========================================
// OLAMLARNI ALMASHTIRISH
// ==========================================

function buildWorld(index) {
  clearGroup(activeWorldGroup);

  galaxyGroup = null;
  cityGroup = null;
  vortexGroup = null;
  crystalGroup = null;

  portalGroup.visible = false;

  mainLight.color.setHex(worldData[index].color);
  mainLight.intensity = 55;

  if (index === 0) createGalaxy();
  if (index === 1) createCity();
  if (index === 2) createVortex();
  if (index === 3) createCrystals();

  currentWorld = index;

  worldTitle.textContent = worldData[index].title;
  worldDescription.textContent = worldData[index].description;
  worldIndex.textContent = `OLAM ${String(index + 1).padStart(2, '0')} / 04`;
  worldCaption.textContent = worldData[index].caption;

  statusText.textContent = 'OLAM ' + String(index + 1).padStart(2, '0') + ' FAOL';
}

function returnToPortal() {
  currentWorld = -1;
  clearGroup(activeWorldGroup);
  portalGroup.visible = true;

  mainLight.color.setHex(GOLD);
  mainLight.intensity = 65;

  homeScreen.classList.add('active');
  worldScreen.classList.remove('active');

  statusText.textContent = 'PORTAL KUTILMOQDA';

  camera.position.set(0, 1.2, 12);
}

// Animatsiyali o‘tish
function changeWorld(index) {
  if (transitioning) return;

  index = (index + worldData.length) % worldData.length;
  transitioning = true;

  transitionText.textContent = 'PORTAL OCHILMOQDA...';
  transition.classList.remove('active');

  // CSS animatsiyasini qayta ishga tushirish
  void transition.offsetWidth;
  transition.classList.add('active');

  setTimeout(() => {
    buildWorld(index);

    homeScreen.classList.remove('active');
    worldScreen.classList.add('active');

    camera.position.set(0, 1, 12);
    camera.lookAt(0, 0, -4);

    transitionText.textContent = 'OLAM YUKLANDI';

    setTimeout(() => {
      transition.classList.remove('active');
      transitioning = false;
    }, 500);
  }, 550);
}

function goHome() {
  if (transitioning) return;

  transitioning = true;

  transitionText.textContent = 'PORTALGA QAYTILMOQDA...';
  transition.classList.remove('active');
  void transition.offsetWidth;
  transition.classList.add('active');

  setTimeout(() => {
    returnToPortal();

    setTimeout(() => {
      transition.classList.remove('active');
      transitioning = false;
    }, 450);
  }, 550);
}

// ==========================================
// TUGMALAR
// ==========================================

document.querySelectorAll('.world-card').forEach(card => {
  card.addEventListener('click', () => {
    changeWorld(Number(card.dataset.world));
  });
});

document.getElementById('prevWorld').addEventListener('click', () => {
  changeWorld(currentWorld - 1);
});

document.getElementById('nextWorld').addEventListener('click', () => {
  changeWorld(currentWorld + 1);
});

document.getElementById('returnBtn').addEventListener('click', goHome);

document.getElementById('homeLogo').addEventListener('click', event => {
  event.preventDefault();
  if (currentWorld !== -1) goHome();
});

// Animatsiyalarni to‘xtatish yoki davom ettirish
document.getElementById('soundBtn').addEventListener('click', event => {
  paused = !paused;
  event.currentTarget.textContent = paused ? '▶' : 'Ⅱ';
  event.currentTarget.title = paused
    ? 'Animatsiyani davom ettirish'
    : 'Animatsiyani to‘xtatish';
});

// Klaviatura
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (currentWorld !== -1) goHome();
    return;
  }

  if (transitioning) return;

  if (event.key >= '1' && event.key <= '4') {
    changeWorld(Number(event.key) - 1);
  }

  if (currentWorld !== -1 && event.key === 'ArrowRight') {
    changeWorld(currentWorld + 1);
  }

  if (currentWorld !== -1 && event.key === 'ArrowLeft') {
    changeWorld(currentWorld - 1);
  }
});

// ==========================================
// SICHQONCHA BILAN BOSHQARISH
// ==========================================

window.addEventListener('pointermove', event => {
  mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

// Portalga bosib ham kirish mumkin
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener('click', event => {
  if (currentWorld !== -1 || transitioning) return;

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(
    portalGroup.children,
    true
  );

  if (hits.length > 0) {
    // Portalning markaziga bosilganda birinchi olam ochiladi
    changeWorld(0);
  }
});

// ==========================================
// O‘LCHAM O‘ZGARISHI
// ==========================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
});

// ==========================================
// ASOSIY ANIMATSIYA SIKLI
// ==========================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (!paused) elapsed += delta;

  // Portal halqalari
  portalRings.forEach((ring, index) => {
    ring.rotation.z += delta * (index % 2 === 0 ? 0.25 : -0.19);
    ring.rotation.x = Math.sin(elapsed * 0.35 + index) * 0.08;
  });

  spiralGroup.rotation.z += delta * 0.22;
  spiralGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.13;

  portalCore.material.opacity = 0.35 + Math.sin(elapsed * 1.7) * 0.12;
  portalLight.intensity = 50 + Math.sin(elapsed * 2.1) * 12;

  // Zarrachalarning aylanishi
  const positions = particleGeometry.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    const p = particleSpeeds[i];
    const angle = p.angle + elapsed * p.speed;

    positions[i * 3] = Math.cos(angle) * p.radius;
    positions[i * 3 + 1] = Math.sin(angle) * p.radius;
    positions[i * 3 + 2] =
      Math.sin(elapsed + p.offset) * 0.65;
  }

  particleGeometry.attributes.position.needsUpdate = true;

  // Yulduzlar sekin aylanadi
  starField.rotation.y = elapsed * 0.006;
  starField.rotation.x = Math.sin(elapsed * 0.06) * 0.04;

  // Koinot animatsiyasi
  if (galaxyGroup) {
    galaxyGroup.rotation.y += delta * 0.06;

    const planets = galaxyGroup.userData.planets;

    if (planets) {
      planets[0].position.y = 1.2 + Math.sin(elapsed) * 0.2;
      planets[1].position.x = -3 + Math.sin(elapsed * 0.45) * 0.5;
    }
  }

  // Kelajak shahri
  if (cityGroup) {
    cityGroup.rotation.y = Math.sin(elapsed * 0.12) * 0.035;
  }

  // Parallel olam
  if (vortexGroup) {
    vortexGroup.children.forEach(object => {
      if (object.userData.spin !== undefined) {
        object.rotation.z += delta * object.userData.spin;
        object.rotation.y += delta * 0.12;
      }

      if (object.userData.phase !== undefined) {
        object.position.y = object.userData.baseY
          + Math.sin(elapsed * object.userData.speed
          + object.userData.phase) * 0.35;

        object.rotation.x += delta * 0.15;
        object.rotation.y += delta * 0.25;
      }
    });
  }

  // Sehrli kristallar
  if (crystalGroup) {
    crystalGroup.children.forEach(object => {
      if (object.userData.phase !== undefined) {
        object.position.y = object.userData.baseY
          + Math.sin(elapsed * object.userData.speed
          + object.userData.phase) * 0.28;

        object.rotation.y += delta * 0.3;
        object.rotation.x += delta * 0.12;
      }

      if (object.userData.central) {
        object.rotation.y += delta * 0.4;
        object.rotation.x += delta * 0.2;
        const scale = 1 + Math.sin(elapsed * 1.5) * 0.08;
        object.scale.setScalar(scale);
      }
    });

    crystalGroup.rotation.y = Math.sin(elapsed * 0.16) * 0.12;
  }

  // Sichqoncha harakatiga mos kamera
  const cameraTargetX = mouseX * 0.65;
  const cameraTargetY = 1.2 - mouseY * 0.35;

  if (currentWorld === -1) {
    camera.position.x += (cameraTargetX - camera.position.x) * 0.025;
    camera.position.y += (cameraTargetY - camera.position.y) * 0.025;
    camera.lookAt(0, 0, -1);
  } else {
    camera.position.x += (cameraTargetX - camera.position.x) * 0.018;
    camera.position.y += (cameraTargetY - camera.position.y) * 0.018;
    camera.lookAt(0, 0, -4);
  }

  renderer.render(scene, camera);
}

animate();

// Yuklanish tugadi
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('done');

    setTimeout(() => {
      loader.style.display = 'none';
    }, 700);
  }, 500);
});

// Agar Three.js yoki boshqa resurs yuklanmasa, xatoni ko‘rsatish
window.addEventListener('error', event => {
  console.error('DREAM PORTAL xatosi:', event.message);
});
