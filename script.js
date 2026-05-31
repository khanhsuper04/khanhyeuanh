/* ═══════════════════════════════════════════════════════════
   CẤU HÌNH — chỉnh sửa tại đây
═══════════════════════════════════════════════════════════ */
const IMAGES = [
  { src: 'images/1.jpg',  caption: '' },
  { src: 'images/2.jpg',  caption: '' },
  { src: 'images/3.jpg',  caption: '' },
  { src: 'images/4.jpg',  caption: '' },
  { src: 'images/5.jpg',  caption: '' },
  { src: 'images/6.jpg',  caption: '' },
  { src: 'images/7.jpg',  caption: '' },
  { src: 'images/8.jpg',  caption: '' },
  { src: 'images/9.jpg',  caption: '' },
  { src: 'images/10.jpg', caption: '' },
  { src: 'images/11.jpg', caption: '' },
  { src: 'images/12.jpg', caption: '' },
  { src: 'images/13.jpg', caption: '' },
  { src: 'images/14.jpg', caption: '' },
  { src: 'images/15.jpg', caption: '' },
  { src: 'images/16.jpg', caption: '' },
  { src: 'images/17.jpg', caption: '' },
  { src: 'images/18.jpg', caption: '' },
  { src: 'images/19.jpg', caption: '' },
  { src: 'images/20.jpg', caption: '' },
  { src: 'images/21.jpg', caption: '' },
  { src: 'images/22.jpg', caption: '' },
  { src: 'images/23.jpg', caption: '' },
  { src: 'images/24.jpg', caption: '' },
  { src: 'images/25.jpg', caption: '' },
  { src: 'images/26.jpg', caption: '' },
  { src: 'images/27.jpg', caption: '' },
];

const WISHES = [
  { text: 'Chúc em bé của anh có một ngày Quốc tế Thiếu nhi thật vui vẻ ❤️', style: 'big' },
  { text: '', style: 'spacer' },
  { text: 'Cảm ơn em đã xuất hiện trong cuộc đời anh', style: '' },
  { text: 'và mang đến thật nhiều niềm vui, tiếng cười.', style: '' },
  { text: '', style: 'spacer' },
  { text: 'Mong rằng em sẽ luôn hạnh phúc,', style: '' },
  { text: 'luôn giữ được sự hồn nhiên đáng yêu', style: '' },
  { text: 'và đạt được mọi điều em mong muốn.', style: '' },
  { text: '', style: 'spacer' },
  { text: 'Anh sẽ luôn ở bên cạnh,', style: '' },
  { text: 'yêu thương và che chở cho em.', style: '' },
  { text: '', style: 'spacer' },
  { text: 'Yêu em rất nhiều ❤️', style: 'big' },
];

// Kích thước ảnh — nhỏ gọn, chuyên nghiệp
const SPHERE_RADIUS    = 2.8;
const PHOTO_W          = 0.58;   // nhỏ, tỉ lệ 4:3
const PHOTO_H          = 0.435;
const AUTO_ROTATE_SPEED = 0.0014;

/* ═══════════════════════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════════════════════ */
const canvas3d      = document.getElementById('threeCanvas');
const introScreen   = document.getElementById('intro-screen');
const sphereUI      = document.getElementById('sphere-ui');
const lightbox      = document.getElementById('lightbox');
const endingScreen  = document.getElementById('ending-screen');
const lbImg         = document.getElementById('lbImg');
const lbCaption     = document.getElementById('lbCaption');
const lbCounter     = document.getElementById('lbCounter');
const endingHeart   = document.getElementById('endingHeart');
const endingMessage = document.getElementById('endingMessage');
const replayBtn     = document.getElementById('replayBtn');
const musicBtn      = document.getElementById('musicBtn');
const iconMusic     = document.getElementById('iconMusic');
const iconMute      = document.getElementById('iconMute');
const bgMusic       = document.getElementById('bgMusic');
const endingCanvas  = document.getElementById('endingCanvas');

/* ═══════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════ */
let isMuted         = false;
let lbIndex         = 0;
let viewedPhotos    = new Set();
let photoMeshes     = [];
let glowRingMeshes  = [];   // vòng sáng quanh ảnh đã xem
let borderMeshes    = [];   // viền kính mờ
let isExploding     = false;
let hoveredMesh     = null;
let explodeParticles= null;

// Xoay
let sphereGroup;
let isDragging      = false;
let prevMouse       = { x: 0, y: 0 };
let rotVelocity     = { x: 0, y: 0 };
let currentRotation = { x: 0.3, y: 0 };

// Camera
let targetCamZ      = 7.5;
let currentCamZ     = 13;
// Camera drift — lơ lửng nhẹ
let cameraDrift     = { x: 0, y: 0 };

// Raycaster
let raycaster, mouse2d;

// Ending
let endingRaf       = null;
let endingParts2d   = [];

/* ═══════════════════════════════════════════════════════════
   THREE.JS SETUP
═══════════════════════════════════════════════════════════ */
const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3)); // tăng lên 3 cho mobile retina
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = window.innerWidth < 768 ? 2.2 : 1.7;

const scene  = new THREE.Scene();
// Sương mù nhẹ — tạo chiều sâu không gian
scene.fog = new THREE.FogExp2(0x08030e, 0.008); // giảm fog để ảnh rõ hơn

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = currentCamZ;

raycaster = new THREE.Raycaster();
mouse2d   = new THREE.Vector2(-9999, -9999);

/* ── Ánh sáng ── */
scene.add(new THREE.AmbientLight(0xffeef5, 0.9)); // tăng ambient sáng hơn

const pLight1 = new THREE.PointLight(0xf0a0b8, 1.4, 22);
pLight1.position.set(4, 3, 5);
scene.add(pLight1);

const pLight2 = new THREE.PointLight(0xc8a0d8, 0.8, 18);
pLight2.position.set(-4, -2, 3);
scene.add(pLight2);

const pLight3 = new THREE.PointLight(0xe8c99a, 0.55, 16);
pLight3.position.set(0, 5, -3);
scene.add(pLight3);

// Ánh sáng hồng từ phía trước — làm ảnh ấm hơn
const frontLight = new THREE.PointLight(0xffb0c8, 1.2, 18); // mạnh hơn, xa hơn
frontLight.position.set(0, 0, 6);
scene.add(frontLight);

sphereGroup = new THREE.Group();
scene.add(sphereGroup);

/* ═══════════════════════════════════════════════════════════
   NỀN SAO — nhiều hơn, có bokeh
═══════════════════════════════════════════════════════════ */
let starField1, starField2, bokehField;

function createStarField() {
  // Lớp 1: sao nhỏ xa — nhiều
  const count1 = 2400;
  const geo1   = new THREE.BufferGeometry();
  const pos1   = new Float32Array(count1 * 3);
  const col1   = new Float32Array(count1 * 3);
  const palette = [[1,.75,.85],[.95,.85,1],[1,.95,.78],[1,1,1],[.8,.9,1]];
  for (let i = 0; i < count1; i++) {
    const r = 20 + Math.random() * 25;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos1[i*3]   = r * Math.sin(p) * Math.cos(t);
    pos1[i*3+1] = r * Math.sin(p) * Math.sin(t);
    pos1[i*3+2] = r * Math.cos(p);
    const c = palette[Math.floor(Math.random() * palette.length)];
    col1[i*3]=c[0]; col1[i*3+1]=c[1]; col1[i*3+2]=c[2];
  }
  geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
  geo1.setAttribute('color',    new THREE.BufferAttribute(col1, 3));
  starField1 = new THREE.Points(geo1, new THREE.PointsMaterial({
    size: 0.055, vertexColors: true, transparent: true, opacity: 0.8,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(starField1);

  // Lớp 2: sao lớn hơn, ít hơn — nhấp nháy
  const count2 = 300;
  const geo2   = new THREE.BufferGeometry();
  const pos2   = new Float32Array(count2 * 3);
  const col2   = new Float32Array(count2 * 3);
  const phase2 = new Float32Array(count2); // phase nhấp nháy
  for (let i = 0; i < count2; i++) {
    const r = 15 + Math.random() * 20;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos2[i*3]   = r * Math.sin(p) * Math.cos(t);
    pos2[i*3+1] = r * Math.sin(p) * Math.sin(t);
    pos2[i*3+2] = r * Math.cos(p);
    const c = palette[Math.floor(Math.random() * palette.length)];
    col2[i*3]=c[0]; col2[i*3+1]=c[1]; col2[i*3+2]=c[2];
    phase2[i] = Math.random() * Math.PI * 2;
  }
  geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
  geo2.setAttribute('color',    new THREE.BufferAttribute(col2, 3));
  geo2.setAttribute('phase',    new THREE.BufferAttribute(phase2, 1));
  starField2 = new THREE.Points(geo2, new THREE.PointsMaterial({
    size: 0.12, vertexColors: true, transparent: true, opacity: 0.6,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(starField2);

  // Bokeh — orbs sáng mờ lớn
  const countB = 80;
  const geoB   = new THREE.BufferGeometry();
  const posB   = new Float32Array(countB * 3);
  const colB   = new Float32Array(countB * 3);
  const bokehPalette = [[.85,.38,.47],[.94,.63,.72],[.78,.63,.86],[.57,.78,.98],[.91,.79,.47]];
  for (let i = 0; i < countB; i++) {
    const r = 10 + Math.random() * 14;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    posB[i*3]   = r * Math.sin(p) * Math.cos(t);
    posB[i*3+1] = r * Math.sin(p) * Math.sin(t);
    posB[i*3+2] = r * Math.cos(p);
    const c = bokehPalette[Math.floor(Math.random() * bokehPalette.length)];
    colB[i*3]=c[0]; colB[i*3+1]=c[1]; colB[i*3+2]=c[2];
  }
  geoB.setAttribute('position', new THREE.BufferAttribute(posB, 3));
  geoB.setAttribute('color',    new THREE.BufferAttribute(colB, 3));
  bokehField = new THREE.Points(geoB, new THREE.PointsMaterial({
    size: 0.55, vertexColors: true, transparent: true, opacity: 0.07,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(bokehField);
}

/* ── Trái tim nhỏ bay ── */
let heartParticles, heartPositions, heartVelocities;

function createHeartParticles() {
  const count = 80;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);
  const vel   = [];

  for (let i = 0; i < count; i++) {
    const r = 7 + Math.random() * 12;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(p) * Math.cos(t);
    pos[i*3+1] = r * Math.sin(p) * Math.sin(t);
    pos[i*3+2] = r * Math.cos(p);
    vel.push({
      x: (Math.random()-.5)*.004,
      y: (Math.random()-.5)*.004 + .002,
      z: (Math.random()-.5)*.003,
    });
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  // Texture trái tim
  const hc = document.createElement('canvas'); hc.width = hc.height = 64;
  const hx = hc.getContext('2d');
  const grad = hx.createRadialGradient(32,32,0,32,32,32);
  grad.addColorStop(0,'rgba(240,160,184,1)');
  grad.addColorStop(1,'rgba(240,160,184,0)');
  hx.fillStyle = grad;
  hx.beginPath();
  hx.moveTo(32,52); hx.bezierCurveTo(32,52,4,36,4,20);
  hx.bezierCurveTo(4,10,12,4,20,4); hx.bezierCurveTo(26,4,30,8,32,12);
  hx.bezierCurveTo(34,8,38,4,44,4); hx.bezierCurveTo(52,4,60,10,60,20);
  hx.bezierCurveTo(60,36,32,52,32,52); hx.fill();

  heartParticles  = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.22, map: new THREE.CanvasTexture(hc),
    transparent: true, opacity: 0.4,
    sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  heartPositions  = pos;
  heartVelocities = vel;
  scene.add(heartParticles);
}

/* ═══════════════════════════════════════════════════════════
   XÂY DỰNG QUẢ CẦU ẢNH
═══════════════════════════════════════════════════════════ */
function buildPhotoSphere() {
  photoMeshes    = [];
  glowRingMeshes = [];
  borderMeshes   = [];

  const n = IMAGES.length;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  // Texture trắng cho glass border
  const glassTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    // Gradient kính mờ
    const g = x.createLinearGradient(0,0,128,128);
    g.addColorStop(0,'rgba(255,255,255,0.18)');
    g.addColorStop(0.5,'rgba(255,255,255,0.06)');
    g.addColorStop(1,'rgba(255,255,255,0.14)');
    x.fillStyle = g; x.fillRect(0,0,128,128);
    // Highlight góc trên trái
    const h = x.createRadialGradient(20,20,0,20,20,60);
    h.addColorStop(0,'rgba(255,255,255,0.25)');
    h.addColorStop(1,'rgba(255,255,255,0)');
    x.fillStyle = h; x.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);
  })();

  IMAGES.forEach((item, i) => {
    const y     = 1 - (i / (n - 1)) * 2;
    const r     = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x     = Math.cos(theta) * r;
    const z     = Math.sin(theta) * r;
    const pos   = new THREE.Vector3(x * SPHERE_RADIUS, y * SPHERE_RADIUS, z * SPHERE_RADIUS);
    const norm  = pos.clone().normalize();

    /* ── Ảnh chính — load rồi composite vào canvas để hòa màu ── */
    const loader = new THREE.TextureLoader();
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 1,
      color: 0xffffff,
      side: THREE.DoubleSide,   // hiện cả mặt sau khi xoay cầu
      depthWrite: false,        // tránh z-fighting giữa các ảnh
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Tạo canvas composite
      const W = 512, H = Math.round(512 * (PHOTO_H / PHOTO_W));
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const cx = cv.getContext('2d');

      // 1. Vẽ ảnh gốc
      cx.drawImage(img, 0, 0, W, H);

      // 2. Overlay tông màu vũ trụ — rất nhẹ
      cx.globalCompositeOperation = 'multiply';
      cx.fillStyle = 'rgba(210, 175, 220, 0.10)';
      cx.fillRect(0, 0, W, H);

      // 3. Tăng sáng nhẹ
      cx.globalCompositeOperation = 'screen';
      cx.fillStyle = 'rgba(255, 220, 240, 0.06)';
      cx.fillRect(0, 0, W, H);

      // 4. Vignette bo góc — nhẹ hơn để ảnh không bị tối
      cx.globalCompositeOperation = 'source-over';
      const vg = cx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.35, W/2, H/2, Math.max(W,H)*0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.75, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(8,3,14,0.45)');  // nhẹ hơn 0.72 cũ
      cx.fillStyle = vg;
      cx.fillRect(0, 0, W, H);

      // 5. Bo góc
      cx.globalCompositeOperation = 'destination-in';
      const radius = W * 0.06;
      cx.beginPath();
      cx.moveTo(radius, 0);
      cx.lineTo(W - radius, 0);
      cx.quadraticCurveTo(W, 0, W, radius);
      cx.lineTo(W, H - radius);
      cx.quadraticCurveTo(W, H, W - radius, H);
      cx.lineTo(radius, H);
      cx.quadraticCurveTo(0, H, 0, H - radius);
      cx.lineTo(0, radius);
      cx.quadraticCurveTo(0, 0, radius, 0);
      cx.closePath();
      cx.fillStyle = '#fff';
      cx.fill();

      const tex = new THREE.CanvasTexture(cv);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      mat.map = tex;
      mat.needsUpdate = true;
    };
    img.src = item.src;

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PHOTO_W, PHOTO_H), mat);
    mesh.position.copy(pos);
    mesh.lookAt(pos.clone().multiplyScalar(2));
    mesh.userData = { index: i, src: item.src, caption: item.caption,
                      viewed: false, baseScale: 1, hoverScale: 1 };
    sphereGroup.add(mesh);
    photoMeshes.push(mesh);

    /* ── Bóng đổ mềm (plane tối phía sau) ── */
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.35,
      blending: THREE.NormalBlending, depthWrite: false,
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(PHOTO_W + 0.10, PHOTO_H + 0.10), shadowMat);
    shadow.position.copy(pos).addScaledVector(norm, -0.04);
    shadow.lookAt(pos.clone().multiplyScalar(2));
    sphereGroup.add(shadow);

    /* ── Viền kính mờ (glass border) ── */
    const glassMat = new THREE.MeshBasicMaterial({
      map: glassTex, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(PHOTO_W + 0.035, PHOTO_H + 0.035), glassMat);
    glass.position.copy(pos).addScaledVector(norm, 0.003);
    glass.lookAt(pos.clone().multiplyScalar(2));
    sphereGroup.add(glass);
    borderMeshes.push(glass);

    /* ── Vòng sáng "đã xem" ── */
    const ringGeo = new THREE.RingGeometry(
      Math.max(PHOTO_W, PHOTO_H) * 0.62,
      Math.max(PHOTO_W, PHOTO_H) * 0.72,
      48
    );
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf0a0b8, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos).addScaledVector(norm, 0.005);
    ring.lookAt(pos.clone().multiplyScalar(2));
    sphereGroup.add(ring);
    glowRingMeshes.push(ring);
  });

  /* ── Wireframe cầu — lớp 1: lưới mịn hồng ── */
  const coreGeo = new THREE.SphereGeometry(SPHERE_RADIUS * 0.97, 28, 18);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xf0a0b8, wireframe: true,
    transparent: true, opacity: 0.18,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  sphereGroup.add(new THREE.Mesh(coreGeo, coreMat));

  /* ── Wireframe cầu — lớp 2: lưới thưa trắng, nổi hơn ── */
  const coreGeo2 = new THREE.SphereGeometry(SPHERE_RADIUS * 0.975, 10, 7);
  const coreMat2 = new THREE.MeshBasicMaterial({
    color: 0xffd0e8, wireframe: true,
    transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  sphereGroup.add(new THREE.Mesh(coreGeo2, coreMat2));

  /* ── Orbit ring — đường xích đạo phát sáng ── */
  const orbitGeo = new THREE.TorusGeometry(SPHERE_RADIUS * 1.02, 0.004, 4, 120);
  const orbitMat = new THREE.MeshBasicMaterial({
    color: 0xf0a0b8, transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
  orbitRing.rotation.x = Math.PI / 2;
  sphereGroup.add(orbitRing);

  // Ánh sáng chạy dọc orbit — dùng sprite nhỏ
  const orbitDotGeo = new THREE.SphereGeometry(0.04, 6, 6);
  const orbitDotMat = new THREE.MeshBasicMaterial({
    color: 0xffcce0, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const orbitDot = new THREE.Mesh(orbitDotGeo, orbitDotMat);
  orbitDot.userData.isOrbitDot = true;
  sphereGroup.add(orbitDot);
}

/* ═══════════════════════════════════════════════════════════
   HOVER DETECTION
═══════════════════════════════════════════════════════════ */
canvas3d.addEventListener('mousemove', (e) => {
  if (!sphereUI.classList.contains('active') || isExploding) return;
  const rect = canvas3d.getBoundingClientRect();
  mouse2d.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse2d.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
});

/* ═══════════════════════════════════════════════════════════
   LIGHTBOX
═══════════════════════════════════════════════════════════ */
function openLightbox(index) {
  lbIndex = index;
  updateLightbox();
  lightbox.classList.add('active');
  markViewed(index);
}

function updateLightbox() {
  const item = IMAGES[lbIndex];
  lbImg.src  = item.src;
  lbCaption.textContent = item.caption || '';
  lbCounter.textContent = `${lbIndex + 1} / ${IMAGES.length}`;
  const frame = document.querySelector('.lb-frame');
  frame.style.animation = 'none'; void frame.offsetWidth; frame.style.animation = '';
}

function closeLightbox() { lightbox.classList.remove('active'); }

function markViewed(index) {
  viewedPhotos.add(index);
  const ring = glowRingMeshes[index];
  if (ring && ring.material.opacity < 0.01) {
    let t = 0;
    const iv = setInterval(() => {
      t += 0.05;
      ring.material.opacity = Math.min(t * 0.55, 0.55);
      if (t >= 1) clearInterval(iv);
    }, 20);
  }
  if (viewedPhotos.size === IMAGES.length) setTimeout(connectConstellation, 800);
}

function connectConstellation() {
  const points = photoMeshes.map(m => m.position.clone());
  const curve  = new THREE.CatmullRomCurve3(points, true);
  const tubeGeo = new THREE.TubeGeometry(curve, 140, 0.006, 4, true);
  const tubeMat = new THREE.MeshBasicMaterial({
    color: 0xf0a0b8, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  sphereGroup.add(tube);
  let t = 0;
  const iv = setInterval(() => {
    t += 0.02; tubeMat.opacity = Math.min(t * 0.16, 0.16);
    if (t >= 1) clearInterval(iv);
  }, 30);
}

/* ═══════════════════════════════════════════════════════════
   ENDING — EXPLODE → HEART
═══════════════════════════════════════════════════════════ */
function triggerEnding() {
  if (isExploding) return;
  isExploding = true;

  // 1. Quả cầu dừng xoay, tất cả ảnh sáng lên
  AUTO_ROTATE_SPEED_CURRENT = 0;
  photoMeshes.forEach(m => {
    let t = 0;
    const iv = setInterval(() => {
      t += 0.06;
      const v = Math.min(t, 1);
      m.material.color.setRGB(1.0, 0.7 + v * 0.3, 0.8 + v * 0.2);
      if (t >= 1) clearInterval(iv);
    }, 20);
  });
  glowRingMeshes.forEach(r => {
    let t = 0;
    const iv = setInterval(() => {
      t += 0.04; r.material.opacity = Math.min(t * 0.8, 0.8);
      if (t >= 1) clearInterval(iv);
    }, 20);
  });

  // 2. Camera lùi ra
  targetCamZ = 11;
  sphereUI.classList.remove('active');

  // 3. Sau 1.2s: nổ
  setTimeout(() => {
    sphereGroup.visible = false;

    const origins = photoMeshes.map(m => {
      const wp = new THREE.Vector3(); m.getWorldPosition(wp); return wp;
    });

    const N = 1400;
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const tgt = new Float32Array(N * 3);

    function heartPt(t) {
      return {
        x: 16 * Math.pow(Math.sin(t), 3) * 0.13,
        y: (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)) * 0.13,
        z: 0,
      };
    }

    const palette = [[1,.63,.72],[.94,.75,.88],[1,.85,.9],[.91,.78,1],[1,.92,.76]];

    for (let i = 0; i < N; i++) {
      const src = origins[i % origins.length];
      pos[i*3]   = src.x + (Math.random()-.5)*.6;
      pos[i*3+1] = src.y + (Math.random()-.5)*.6;
      pos[i*3+2] = src.z + (Math.random()-.5)*.6;

      const spd = Math.random()*3.5+1;
      const ang = Math.random()*Math.PI*2;
      const elv = (Math.random()-.5)*Math.PI;
      vel[i*3]   = Math.cos(ang)*Math.cos(elv)*spd;
      vel[i*3+1] = Math.sin(elv)*spd;
      vel[i*3+2] = Math.sin(ang)*Math.cos(elv)*spd;

      const hp = heartPt((i/N)*Math.PI*2);
      tgt[i*3]=hp.x; tgt[i*3+1]=hp.y; tgt[i*3+2]=hp.z;

      const c = palette[Math.floor(Math.random()*palette.length)];
      col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos.slice(), 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.065, vertexColors: true, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });

    explodeParticles = new THREE.Points(geo, mat);
    scene.add(explodeParticles);

    const startPos = pos.slice();
    const P1 = 1.6, P2 = 2.4;
    let t1 = 0, t2 = 0, phase2 = false;

    function animExplode() {
      if (!phase2) {
        t1 += 0.016;
        const t = Math.min(t1/P1, 1);
        const e = t<.5 ? 2*t*t : -1+(4-2*t)*t;
        const pa = explodeParticles.geometry.attributes.position;
        for (let i=0;i<N;i++) {
          pa.array[i*3]   = startPos[i*3]   + vel[i*3]   * e * P1;
          pa.array[i*3+1] = startPos[i*3+1] + vel[i*3+1] * e * P1;
          pa.array[i*3+2] = startPos[i*3+2] + vel[i*3+2] * e * P1;
        }
        pa.needsUpdate = true;
        if (t1 >= P1) phase2 = true;
      } else {
        t2 += 0.016;
        const t = Math.min(t2/P2, 1);
        const e = t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
        const pa = explodeParticles.geometry.attributes.position;
        const ep = new Float32Array(N*3);
        for (let i=0;i<N;i++) {
          ep[i*3]   = startPos[i*3]   + vel[i*3]   * P1;
          ep[i*3+1] = startPos[i*3+1] + vel[i*3+1] * P1;
          ep[i*3+2] = startPos[i*3+2] + vel[i*3+2] * P1;
        }
        for (let i=0;i<N;i++) {
          pa.array[i*3]   = ep[i*3]   + (tgt[i*3]   - ep[i*3])   * e;
          pa.array[i*3+1] = ep[i*3+1] + (tgt[i*3+1] - ep[i*3+1]) * e;
          pa.array[i*3+2] = ep[i*3+2] + (tgt[i*3+2] - ep[i*3+2]) * e;
        }
        pa.needsUpdate = true;
        if (t2 >= P2) { setTimeout(showEndingScreen, 700); return; }
      }
      requestAnimationFrame(animExplode);
    }
    animExplode();
  }, 1200);
}

let AUTO_ROTATE_SPEED_CURRENT = AUTO_ROTATE_SPEED;

/* ═══════════════════════════════════════════════════════════
   ENDING SCREEN
═══════════════════════════════════════════════════════════ */
function resizeEndingCanvas() {
  endingCanvas.width  = window.innerWidth;
  endingCanvas.height = window.innerHeight;
}

function showEndingScreen() {
  endingScreen.classList.add('active');
  resizeEndingCanvas();
  startEndingParticles2d();
  setTimeout(() => endingHeart.classList.add('visible'), 400);
  startWishTyping();
}

function startEndingParticles2d() {
  const ctx = endingCanvas.getContext('2d');
  endingParts2d = [];

  function spawnFirework(x, y) {
    const pal = ['#f0a0b8','#fbc8d8','#d4607a','#e8c99a','#d4b0d0','#fff5f8'];
    for (let i=0;i<34;i++) {
      const a=(Math.PI*2*i)/34+Math.random()*.2, s=Math.random()*5+2;
      endingParts2d.push({ type:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,
        alpha:1,size:Math.random()*3+1.2,color:pal[Math.floor(Math.random()*pal.length)],trail:[] });
    }
  }
  function spawnHeart2d() {
    const c=['#f0a0b8','#fbc8d8','#d4607a','#ffcce0'];
    endingParts2d.push({ type:'heart',x:Math.random()*endingCanvas.width,y:endingCanvas.height+20,
      r:Math.random()*11+5,vx:(Math.random()-.5)*.7,vy:-(Math.random()*1.1+.5),
      alpha:Math.random()*.5+.25,wobble:Math.random()*Math.PI*2,wobbleSpeed:Math.random()*.04+.02,
      color:c[Math.floor(Math.random()*c.length)] });
  }
  function drawHeart2d(ctx,x,y,r,color,alpha) {
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();
    ctx.moveTo(x,y+r*.35);ctx.bezierCurveTo(x,y,x-r,y,x-r,y+r*.45);
    ctx.bezierCurveTo(x-r,y+r,x,y+r*1.3,x,y+r*1.35);
    ctx.bezierCurveTo(x,y+r*1.3,x+r,y+r,x+r,y+r*.45);
    ctx.bezierCurveTo(x+r,y,x,y,x,y+r*.35);ctx.fill();ctx.restore();
  }

  const shots=[[.2,.25],[.5,.15],[.8,.25],[.35,.4],[.65,.4]];
  shots.forEach(([rx,ry],i)=>setTimeout(()=>spawnFirework(endingCanvas.width*rx,endingCanvas.height*ry),i*280));
  setTimeout(()=>shots.forEach(([rx,ry],i)=>setTimeout(()=>spawnFirework(
    endingCanvas.width*rx+(Math.random()-.5)*80,endingCanvas.height*ry+(Math.random()-.5)*50),i*200)),2000);

  function loop() {
    ctx.clearRect(0,0,endingCanvas.width,endingCanvas.height);
    if (endingParts2d.filter(p=>p.type==='heart').length<28&&Math.random()<.22) spawnHeart2d();
    endingParts2d=endingParts2d.filter(p=>p.alpha>.005&&p.y>-80&&p.y<endingCanvas.height+80);
    endingParts2d.forEach(p=>{
      if(p.type==='spark'){
        p.trail.push({x:p.x,y:p.y}); if(p.trail.length>5)p.trail.shift();
        p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.vx*=.988;p.alpha-=.013;
        p.trail.forEach((pt,ti)=>{ctx.save();ctx.globalAlpha=(ti/p.trail.length)*p.alpha*.3;
          ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(pt.x,pt.y,p.size*.4,0,Math.PI*2);ctx.fill();ctx.restore();});
        ctx.save();ctx.globalAlpha=Math.max(0,p.alpha);ctx.fillStyle=p.color;
        ctx.shadowColor=p.color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.restore();
      } else {
        p.wobble+=p.wobbleSpeed;p.x+=p.vx+Math.sin(p.wobble)*.35;p.y+=p.vy;p.alpha-=.0022;
        drawHeart2d(ctx,p.x,p.y,p.r,p.color,p.alpha);
      }
    });
    endingRaf=requestAnimationFrame(loop);
  }
  loop();
}

function startWishTyping() {
  endingMessage.innerHTML=''; replayBtn.classList.remove('visible');
  let delay=900;
  WISHES.forEach(wish=>{
    const span=document.createElement('span');
    span.className='wish-line'+(wish.style?' '+wish.style:'');
    if(wish.style==='spacer'){span.textContent='\u00A0';endingMessage.appendChild(span);setTimeout(()=>span.classList.add('show'),delay);delay+=120;return;}
    endingMessage.appendChild(span);
    const d=delay;
    setTimeout(()=>{span.classList.add('show');typeInto(span,wish.text,wish.style==='big'?44:36);},d);
    delay+=wish.text.length*(wish.style==='big'?44:36)+460;
  });
  setTimeout(()=>replayBtn.classList.add('visible'),delay+400);
}

function typeInto(el,text,speed){
  el.textContent='';
  const cur=document.createElement('span');cur.className='type-cursor';el.appendChild(cur);
  let i=0;
  const iv=setInterval(()=>{
    if(i<text.length)el.insertBefore(document.createTextNode(text[i++]),cur);
    else{clearInterval(iv);setTimeout(()=>cur.remove(),1400);}
  },speed);
}

/* ═══════════════════════════════════════════════════════════
   CONTROLS
═══════════════════════════════════════════════════════════ */
let pinchStartDist=0, pinchStartZ=7.5, touchStartPos=null;

canvas3d.addEventListener('mousedown', e=>{
  isDragging=true;
  prevMouse={x:e.clientX,y:e.clientY};
  rotVelocity={x:0,y:0};
});
canvas3d.addEventListener('mousemove', e=>{
  if(!isDragging)return;
  const dx=e.clientX-prevMouse.x, dy=e.clientY-prevMouse.y;
  rotVelocity.y=dx*.008; rotVelocity.x=dy*.008;
  currentRotation.y+=rotVelocity.y; currentRotation.x+=rotVelocity.x;
  prevMouse={x:e.clientX,y:e.clientY};
});
canvas3d.addEventListener('mouseup',   ()=>isDragging=false);
canvas3d.addEventListener('mouseleave',()=>isDragging=false);
canvas3d.addEventListener('wheel', e=>{
  targetCamZ=Math.max(4,Math.min(14,targetCamZ+e.deltaY*.01));
},{passive:true});

canvas3d.addEventListener('click', e=>{
  if(!sphereUI.classList.contains('active')||isExploding)return;
  if(Math.abs(rotVelocity.x)>.012||Math.abs(rotVelocity.y)>.012)return;
  const rect=canvas3d.getBoundingClientRect();
  mouse2d.x=((e.clientX-rect.left)/rect.width)*2-1;
  mouse2d.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(mouse2d,camera);
  const hits=raycaster.intersectObjects(photoMeshes);
  if(hits.length>0) openLightbox(hits[0].object.userData.index);
});

canvas3d.addEventListener('touchstart', e=>{
  e.preventDefault(); // chặn scroll/bounce ngay từ đầu
  if(e.touches.length===2){
    pinchStartDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    pinchStartZ=targetCamZ; return;
  }
  isDragging=true;
  touchStartPos={x:e.touches[0].clientX,y:e.touches[0].clientY};
  prevMouse={x:e.touches[0].clientX,y:e.touches[0].clientY};
  rotVelocity={x:0,y:0};
},{passive:false}); // passive:false để preventDefault hoạt động

canvas3d.addEventListener('touchmove', e=>{
  e.preventDefault(); // chặn scroll page và khoảng trắng
  if(e.touches.length===2){
    const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    targetCamZ=Math.max(4,Math.min(14,pinchStartZ*(pinchStartDist/d))); return;
  }
  if(!isDragging)return;
  const dx=e.touches[0].clientX-prevMouse.x, dy=e.touches[0].clientY-prevMouse.y;
  rotVelocity.y=dx*.008; rotVelocity.x=dy*.008;
  currentRotation.y+=rotVelocity.y; currentRotation.x+=rotVelocity.x;
  prevMouse={x:e.touches[0].clientX,y:e.touches[0].clientY};
},{passive:false});

canvas3d.addEventListener('touchend', e=>{
  isDragging=false;
  if(touchStartPos&&e.changedTouches.length>0){
    const dx=e.changedTouches[0].clientX-touchStartPos.x;
    const dy=e.changedTouches[0].clientY-touchStartPos.y;
    if(Math.hypot(dx,dy)<10) onCanvasClick({clientX:e.changedTouches[0].clientX,clientY:e.changedTouches[0].clientY});
  }
  touchStartPos=null;
},{passive:true});

function onCanvasClick(e){
  if(!sphereUI.classList.contains('active')||isExploding)return;
  const rect=canvas3d.getBoundingClientRect();
  mouse2d.x=((e.clientX-rect.left)/rect.width)*2-1;
  mouse2d.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(mouse2d,camera);
  const hits=raycaster.intersectObjects(photoMeshes);
  if(hits.length>0) openLightbox(hits[0].object.userData.index);
}

/* ── Lightbox controls ── */
document.getElementById('lbClose').addEventListener('click',closeLightbox);
document.getElementById('lbPrev').addEventListener('click',()=>{lbIndex=(lbIndex-1+IMAGES.length)%IMAGES.length;updateLightbox();markViewed(lbIndex);});
document.getElementById('lbNext').addEventListener('click',()=>{lbIndex=(lbIndex+1)%IMAGES.length;updateLightbox();markViewed(lbIndex);});

let lbTouchX=0;
lightbox.addEventListener('touchstart',e=>{lbTouchX=e.touches[0].clientX;},{passive:true});
lightbox.addEventListener('touchend',e=>{
  const diff=lbTouchX-e.changedTouches[0].clientX;
  if(Math.abs(diff)>50){lbIndex=diff>0?(lbIndex+1)%IMAGES.length:(lbIndex-1+IMAGES.length)%IMAGES.length;updateLightbox();markViewed(lbIndex);}
},{passive:true});

document.addEventListener('keydown',e=>{
  if(!lightbox.classList.contains('active'))return;
  if(e.key==='ArrowRight'){lbIndex=(lbIndex+1)%IMAGES.length;updateLightbox();markViewed(lbIndex);}
  if(e.key==='ArrowLeft'){lbIndex=(lbIndex-1+IMAGES.length)%IMAGES.length;updateLightbox();markViewed(lbIndex);}
  if(e.key==='Escape')closeLightbox();
});

/* ═══════════════════════════════════════════════════════════
   RENDER LOOP
═══════════════════════════════════════════════════════════ */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  /* ── Camera zoom mượt ── */
  currentCamZ += (targetCamZ - currentCamZ) * 0.055;

  /* ── Camera drift — lơ lửng nhẹ ── */
  cameraDrift.x = Math.sin(elapsed * 0.18) * 0.12;
  cameraDrift.y = Math.cos(elapsed * 0.13) * 0.08;
  camera.position.x += (cameraDrift.x - camera.position.x) * 0.02;
  camera.position.y += (cameraDrift.y - camera.position.y) * 0.02;
  camera.position.z  = currentCamZ;
  camera.lookAt(0, 0, 0);

  /* ── Xoay quả cầu ── */
  if (!isDragging) {
    rotVelocity.x *= 0.91;
    rotVelocity.y *= 0.91;
    currentRotation.x += rotVelocity.x;
    currentRotation.y += rotVelocity.y;
    if (!isExploding) currentRotation.y += AUTO_ROTATE_SPEED_CURRENT;
  }
  if (sphereGroup.visible) {
    sphereGroup.rotation.x = currentRotation.x;
    sphereGroup.rotation.y = currentRotation.y;
  }

  /* ── Orbit dot chạy vòng quanh ── */
  const orbitDot = sphereGroup.children.find(c => c.userData.isOrbitDot);
  if (orbitDot) {
    const angle = elapsed * 0.6;
    orbitDot.position.set(
      Math.cos(angle) * SPHERE_RADIUS * 1.02,
      0,
      Math.sin(angle) * SPHERE_RADIUS * 1.02
    );
  }

  /* ── Ngôi sao xoay chậm + nhấp nháy ── */
  if (starField1) { starField1.rotation.y = elapsed * 0.01; starField1.rotation.x = elapsed * 0.004; }
  if (starField2) {
    starField2.rotation.y = elapsed * 0.015;
    // Nhấp nháy opacity
    starField2.material.opacity = 0.5 + Math.sin(elapsed * 1.2) * 0.12;
  }
  if (bokehField) { bokehField.rotation.y = elapsed * 0.008; bokehField.material.opacity = 0.06 + Math.sin(elapsed * 0.5) * 0.02; }

  /* ── Trái tim bay ── */
  if (heartParticles) {
    heartParticles.rotation.y = elapsed * 0.018;
    const pa = heartParticles.geometry.attributes.position;
    for (let i = 0; i < heartVelocities.length; i++) {
      pa.array[i*3]   += heartVelocities[i].x;
      pa.array[i*3+1] += heartVelocities[i].y;
      pa.array[i*3+2] += heartVelocities[i].z;
      // Wrap
      if (pa.array[i*3+1] > 18) pa.array[i*3+1] = -18;
    }
    pa.needsUpdate = true;
  }

  /* ── Ánh sáng nhấp nháy ── */
  pLight1.intensity = 1.4 + Math.sin(elapsed * 0.75) * 0.18;
  pLight2.intensity = 0.8 + Math.sin(elapsed * 1.05 + 1) * 0.12;
  frontLight.intensity = 0.6 + Math.sin(elapsed * 0.4) * 0.08;

  /* ── Hover detection + scale ảnh ── */
  if (sphereGroup.visible && !isExploding) {
    raycaster.setFromCamera(mouse2d, camera);
    const hits = raycaster.intersectObjects(photoMeshes);
    const newHovered = hits.length > 0 ? hits[0].object : null;

    photoMeshes.forEach((mesh) => {
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const dist = camera.position.distanceTo(worldPos);

      // Scale theo khoảng cách (perspective depth)
      const depthScale = THREE.MathUtils.clamp(1 + (6 - dist) * 0.04, 0.82, 1.2);

      // Hover scale
      const isHovered = mesh === newHovered;
      const targetHover = isHovered ? 1.18 : 1.0;
      mesh.userData.hoverScale = THREE.MathUtils.lerp(mesh.userData.hoverScale || 1, targetHover, 0.1);

      mesh.scale.setScalar(depthScale * mesh.userData.hoverScale);

      // Glow khi hover — dùng color thay vì emissive (MeshBasicMaterial)
      if (isHovered) {
        mesh.material.color.setRGB(1.0, 0.88, 0.93);
        canvas3d.style.cursor = 'pointer';
      } else {
        mesh.material.color.setRGB(1, 1, 1);
      }
    });

    if (!newHovered) canvas3d.style.cursor = isDragging ? 'grabbing' : 'grab';
    hoveredMesh = newHovered;
  }

  /* ── Vòng sáng đã xem pulse ── */
  glowRingMeshes.forEach((ring, i) => {
    if (ring.material.opacity > 0.01) {
      ring.material.opacity = 0.45 + Math.sin(elapsed * 1.8 + i) * 0.1;
    }
  });

  renderer.render(scene, camera);
}

/* ═══════════════════════════════════════════════════════════
   MUSIC
═══════════════════════════════════════════════════════════ */
function setMusicState(muted) {
  isMuted = muted;
  if (muted) {
    bgMusic.pause();
    iconMusic.style.display='none'; iconMute.style.display='block';
    musicBtn.classList.add('muted');
  } else {
    bgMusic.play().catch(()=>{});
    iconMusic.style.display='block'; iconMute.style.display='none';
    musicBtn.classList.remove('muted');
  }
}
function tryAutoPlay() {
  bgMusic.volume=0;
  bgMusic.play().then(()=>{
    let v=0;const iv=setInterval(()=>{v=Math.min(v+.04,.75);bgMusic.volume=v;if(v>=.75)clearInterval(iv);},100);
  }).catch(()=>{
    document.addEventListener('click',()=>{if(!isMuted){bgMusic.volume=.75;bgMusic.play().catch(()=>{});}},{once:true});
  });
}
musicBtn.addEventListener('click',()=>setMusicState(!isMuted));

/* ═══════════════════════════════════════════════════════════
   REPLAY
═══════════════════════════════════════════════════════════ */
replayBtn.addEventListener('click', () => {
  if(endingRaf){cancelAnimationFrame(endingRaf);endingRaf=null;}
  endingScreen.classList.remove('active');
  endingHeart.classList.remove('visible');
  replayBtn.classList.remove('visible');
  endingMessage.innerHTML='';
  if(explodeParticles){scene.remove(explodeParticles);explodeParticles=null;}

  isExploding=false;
  AUTO_ROTATE_SPEED_CURRENT=AUTO_ROTATE_SPEED;
  viewedPhotos.clear();
  currentRotation={x:.3,y:0};
  rotVelocity={x:0,y:0};
  targetCamZ=7.5; currentCamZ=13;

  glowRingMeshes.forEach(r=>{r.material.opacity=0;});
  photoMeshes.forEach(m=>{m.userData.viewed=false;m.userData.hoverScale=1;m.material.color.setRGB(1,1,1);});

  sphereGroup.visible=true;
  sphereUI.classList.add('active');
  // Đảm bảo nền sao vẫn hiện khi replay
  starField1.material.opacity = 0.8;
  starField2.material.opacity = 0.6;
  bokehField.material.opacity = 0.07;
  heartParticles.material.opacity = 0.4;
});

/* ═══════════════════════════════════════════════════════════
   RESIZE
═══════════════════════════════════════════════════════════ */
window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.toneMappingExposure = window.innerWidth < 768 ? 2.2 : 1.7;
  resizeEndingCanvas();
});

/* ═══════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════ */
createStarField();
createHeartParticles();
buildPhotoSphere();
animate();
resizeEndingCanvas();

// Ẩn toàn bộ scene lúc đầu — chỉ hiện nền sao mờ
sphereGroup.visible = false;
starField1.material.opacity = 0;
starField2.material.opacity = 0;
bokehField.material.opacity = 0;
heartParticles.material.opacity = 0;

document.getElementById('introBtn').addEventListener('click', () => {
  // 1. Intro fade out
  introScreen.classList.remove('active');

  // 2. Nền sao fade in từ từ
  let starT = 0;
  const starIv = setInterval(() => {
    starT += 0.018;
    const p = Math.min(starT, 1);
    starField1.material.opacity  = p * 0.8;
    starField2.material.opacity  = p * 0.6;
    bokehField.material.opacity  = p * 0.07;
    heartParticles.material.opacity = p * 0.4;
    if (starT >= 1) clearInterval(starIv);
  }, 16);

  // 3. Sau 0.6s: quả cầu xuất hiện từ xa zoom vào
  setTimeout(() => {
    sphereGroup.visible = true;

    // Bắt đầu rất xa, mờ hoàn toàn
    currentCamZ = 22;
    targetCamZ  = 7.5;

    // Fade in từng ảnh lần lượt — staggered
    photoMeshes.forEach((mesh, i) => {
      mesh.material.opacity = 0;
      mesh.material.transparent = true;
      setTimeout(() => {
        let t = 0;
        const iv = setInterval(() => {
          t += 0.04;
          mesh.material.opacity = Math.min(t, 1);
          if (t >= 1) { mesh.material.opacity = 1; clearInterval(iv); }
        }, 16);
      }, i * 120 + 200);
    });

    // Hiện sphere UI sau khi ảnh đã xuất hiện đủ
    setTimeout(() => {
      sphereUI.classList.add('active');
      tryAutoPlay();
    }, photoMeshes.length * 120 + 600);

  }, 600);
});

document.getElementById('specialBtn').addEventListener('click', triggerEnding);
