import * as THREE from "three";
import { buildHuman, animateHuman, preloadCharacterArt, ACOLYTE_ROSTER } from "./characters.js";

const PLAYER_R = 0.42;
const ENEMY_R = 0.5;
const PLAYER_HIT = 0.48;
const PLAYER_SPEED = 5.6;
const LOOK_SENS = 0.0022;
const PITCH_LIMIT = Math.PI / 2 - 0.12;
const COMBO_WINDOW = 2.25;

const WEAPON_TIERS = [
  {
    level: 1,
    name: "USP-S",
    minScore: 0,
    damage: 25,
    cooldown: 0.28,
    bulletSpeed: 64,
    bulletColor: 0xffd18a,
    bulletHex: "#d8b57c",
    matColor: 0x3c444c,
    shotPitch: 220,
  },
  {
    level: 2,
    name: "UMP-45",
    minScore: 800,
    damage: 32,
    cooldown: 0.23,
    bulletSpeed: 74,
    bulletColor: 0xffd18a,
    bulletHex: "#d8b57c",
    matColor: 0x1f3448,
    shotPitch: 280,
  },
  {
    level: 3,
    name: "M4A1-S",
    minScore: 2000,
    damage: 38,
    cooldown: 0.17,
    bulletSpeed: 86,
    bulletColor: 0xffd18a,
    bulletHex: "#d8b57c",
    matColor: 0x3e1f44,
    shotPitch: 350,
  },
  {
    level: 4,
    name: "AK-47",
    minScore: 4000,
    damage: 48,
    cooldown: 0.13,
    bulletSpeed: 100,
    bulletColor: 0xffd18a,
    bulletHex: "#d8b57c",
    matColor: 0x483a12,
    shotPitch: 430,
  },
  {
    level: 5,
    name: "SCAR-20",
    minScore: 7000,
    damage: 60,
    cooldown: 0.09,
    bulletSpeed: 120,
    bulletColor: 0xffd18a,
    bulletHex: "#d8b57c",
    matColor: 0x0e4428,
    shotPitch: 520,
  },
];

let score = 0;
let highScore = loadHighScore();
let combo = 0;
let maxCombo = 0;
let comboTimer = 0;
let weaponTierIndex = 0;
let ammo = 12;
let reserve = 96;
let reloadTime = 0;
let roundTime = 165;
let recoil = 0;
let crouch = 0;
let soundEnabled = true;
const MAGAZINES = [12, 25, 30, 30, 20];
const MAP_NAMES = ["DUST COMPOUND", "BLUE QUARTER", "OLD MARKET", "CHECKPOINT", "LAST STAND"];
const radar = document.getElementById("radar");
const radarCtx = radar.getContext("2d");

const LEVELS = [
  {
    name: "Dust Compound",
    short: "Gilmar Mendes",
    arena: 27,
    layout: ["..#####..", "..#####..", "###.#.###", "#########", "###.#.###", "..#####..", "..#####.."],
    acolytes: 3,
    duration: 165,
    playerZ: 18,
    enemyZ: -18,
    hp: 75,
    speed: 2.9,
    damage: 6,
    fireRate: 1.7,
    spread: 1.7,
    bulletSpeed: 12,
    prefer: 10,
    turn: 5,
    accent: 0xd6c07a,
    covers: [[-7, -12, 3, 2, 2.4], [7, 12, 3, 2, 2.4], [-17, 0, 2, 3, 1.5], [17, 0, 2, 3, 2], [0, 0, 3, 2, 1.2]],
    look: { face: "gilmar", skin: 0xe4cbb0, hair: 0xb9b9b9, hairStyle: "receding", beard: "none", glasses: true, suit: 0x141414, robe: true, collar: true, bulk: 1, head: 0.94 },
  },
  {
    name: "Blue Quarter",
    short: "Dias Toffoli",
    arena: 27,
    layout: [".#######.", ".##...##.", "###...###", "#########", "###...###", ".##...##.", ".#######."],
    acolytes: 4,
    duration: 180,
    playerZ: 18,
    enemyZ: -18,
    hp: 100,
    speed: 3.1,
    damage: 8,
    fireRate: 1.45,
    spread: 1.25,
    bulletSpeed: 13,
    prefer: 9.5,
    turn: 6,
    accent: 0x4c7dff,
    covers: [[-12, -12, 2, 3, 2.5], [12, 12, 2, 3, 2.5], [-20, 0, 2, 3, 1.4], [20, 0, 2, 3, 1.4], [0, 0, 4, 2, 2.2]],
    look: { face: "toffoli", skin: 0xd7b59a, hair: 0x2a2118, hairStyle: "short", beard: "short", glasses: false, suit: 0x243044, tie: 0x2f6fed, bulk: 1.16, head: 1.2 },
  },
  {
    name: "Old Market",
    short: "Jair Bolsonaro",
    arena: 27,
    layout: ["..#####..", "####.####", "##.#.#.##", "#########", "##.#.#.##", "####.####", "..#####.."],
    acolytes: 5,
    duration: 195,
    playerZ: 18,
    enemyZ: -18,
    hp: 100,
    speed: 3.3,
    damage: 10,
    fireRate: 1.2,
    spread: 0.95,
    bulletSpeed: 15,
    prefer: 8.5,
    turn: 7,
    accent: 0x1f9d4a,
    covers: [[-18, -6, 2, 2, 2.4], [18, 6, 2, 2, 2.4], [-6, 0, 2, 3, 1.3], [6, 0, 2, 3, 1.3], [0, -12, 2, 2, 2.6]],
    look: { face: "bolsonaro", skin: 0xc9956a, hair: 0x3a342c, hairStyle: "short", beard: "none", glasses: false, suit: 0x283c32, stripe: 0xf2d23a, bulk: 0.96, head: 0.9 },
  },
  {
    name: "Checkpoint",
    short: "Alexandre de Moraes",
    arena: 27,
    layout: [".#######.", ".##.#.##.", "###.#.###", "#########", "###.#.###", ".##.#.##.", ".#######."],
    acolytes: 6,
    duration: 210,
    playerZ: 18,
    enemyZ: -18,
    hp: 125,
    speed: 3.5,
    damage: 12,
    fireRate: 1,
    spread: 0.7,
    bulletSpeed: 17,
    prefer: 8,
    turn: 8,
    accent: 0xc4552a,
    covers: [[-12, 0, 2, 4, 2.6], [12, 0, 2, 4, 2.6], [-18, -12, 2, 3, 2], [18, 12, 2, 3, 2], [0, 6, 3, 2, 1.3], [0, -6, 3, 2, 1.3]],
    look: { face: "moraes", skin: 0xd2ae90, hair: 0x1a140f, hairStyle: "bald", beard: "none", glasses: false, suit: 0x14161c, tie: 0x2c2c2c, bulk: 1.05, head: 1.02 },
  },
  {
    name: "Last Stand",
    short: "Lula",
    arena: 27,
    layout: [".#######.", "#########", "##..#..##", "#########", "##..#..##", "#########", ".#######."],
    acolytes: 7,
    duration: 225,
    playerZ: 18,
    enemyZ: -18,
    hp: 150,
    speed: 3.7,
    damage: 14,
    fireRate: 0.82,
    spread: 0.5,
    bulletSpeed: 19,
    prefer: 7,
    turn: 9,
    accent: 0xe23b3b,
    covers: [[-18, 0, 2, 3, 2.5], [18, 0, 2, 3, 2.5], [-6, -12, 3, 2, 1.4], [6, 12, 3, 2, 1.4], [0, 0, 3, 3, 2.6], [-18, 12, 2, 2, 2], [18, -12, 2, 2, 2]],
    look: { face: "lula", skin: 0xdcb896, hair: 0xf4f4f4, hairStyle: "short", beard: "full", glasses: false, suit: 0x2a2428, tie: 0xd21f1f, bulk: 1.1, head: 1.14 },
  },
];

const keys = new Set();
const boxes = [];
const blockers = [];
const bullets = [];
const sparks = [];
const coins = [];
const banknotes = [];

const player = {
  x: 0, z: 10, yaw: 0, pitch: 0, speed: 0, bob: 0, hp: 100, cool: 0, vx: 0, vz: 0, view: null,
};
const enemy = {
  x: 0, z: -8, yaw: Math.PI, hp: 75, maxHp: 75, cool: 1.2, phase: 0,
  speed: 4, damage: 6, fireRate: 1.7, spread: 1.7, bulletSpeed: 12, prefer: 10, turn: 5,
  strafeSign: 1, strafeTimer: 1.2, fall: 0, hitFlash: 0, flash: 0, view: null,
};

const enemies = [enemy];
const TILE = 6;
const NAV_STEP = 1.5;
let walkTiles = [];
let navNodes = new Map();
let navigationTimer = 0;
let arenaHalf = 27;
let mapHalfZ = 21;
let levelIndex = 0;
let bossIndex = 0;
let gameMode = "campaign";
let cleared = false;
let firing = false;
let state = "menu";
let time = 0;
let fightDelay = 0;
let kick = 0;
let shake = 0;
let pain = 0;
let flashTime = 0;
let bannerT = 0;
let landed = 0;
let taken = 0;

const raycaster = new THREE.Raycaster();
const losOrigin = new THREE.Vector3();
const losDir = new THREE.Vector3();
const aimOrigin = new THREE.Vector3();
const aimDir = new THREE.Vector3();
const shotDir = new THREE.Vector3();
const forward = new THREE.Vector3();
const strafe = new THREE.Vector3();

const ui = {
  menu: document.getElementById("menu"),
  end: document.getElementById("end"),
  endTitle: document.getElementById("end-title"),
  endDetail: document.getElementById("end-detail"),
  error: document.getElementById("error"),
  youHp: document.getElementById("you-hp"),
  foeHp: document.getElementById("foe-hp"),
  youBar: document.getElementById("you-bar"),
  foeBar: document.getElementById("foe-bar"),
  crosshair: document.getElementById("crosshair"),
  hitmark: document.getElementById("hitmark"),
  coolBar: document.getElementById("cool-bar"),
  banner: document.getElementById("banner"),
  vignette: document.getElementById("vignette"),
  aimLock: document.getElementById("aim-lock"),
  hint: document.getElementById("hint"),
  mapLabel: document.getElementById("map-label"),
  foeName: document.getElementById("foe-name"),
  again: document.getElementById("again"),
  score: document.getElementById("score-val"),
  weaponLevel: document.getElementById("weapon-lvl-tag"),
  weaponName: document.getElementById("weapon-name"),
  weaponProgress: document.getElementById("weapon-prog-bar"),
  combo: document.getElementById("combo-tag"),
  scorePopups: document.getElementById("score-popups"),
  endScore: document.getElementById("end-score"),
  endHighScore: document.getElementById("end-high-score"),
  endWeaponTier: document.getElementById("end-weapon-tier"),
  endMaxCombo: document.getElementById("end-max-combo"),
};

let audioCtx = null;
let renderer;
let scene;
let camera;
let clock;
let weapon;
let weaponFlash;
let bulletGeo;
let sparkGeo;
let playerBulletMat;
let enemyBulletMat;
let sparkWallMat;
let sparkHitMat;
let sparkHurtMat;
let coinGeo;
let coinMat;
let noteGeo;
let noteMat;
let mapRoot;
let centerLight;
let trimMat;
let ringMat;
let floorMat;
let wallMat;
let crateMat;
let metalMat;
let ceilingMat;
let moneyPile = null;

init().catch(error => {
  console.error(error);
  showError("The arena could not load. Reload the page to try again.");
});

async function init() {
  document.getElementById("start").disabled = true;
  document.getElementById("start-label").textContent = "LOADING CHARACTERS…";
  const canvas = document.getElementById("view");
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    showError("WebGL is not available in this browser.");
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xadc5ce);
  scene.fog = new THREE.Fog(0xc5c5b5, 28, 85);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.08, 120);
  scene.add(camera);
  raycaster.camera = camera;

  clock = new THREE.Clock();
  buildLights();
  setupArena();
  loadMap(LEVELS[0]);
  await preloadCharacterArt();
  buildCombatants();
  buildWeapon();
  scene.updateMatrixWorld(true);

  document.getElementById("start").addEventListener("click", startGame);
  document.getElementById("roster-open").addEventListener("click", () => document.getElementById("roster").showModal());
  document.getElementById("roster-close").addEventListener("click", () => document.getElementById("roster").close());
  document.getElementById("mode-campaign").addEventListener("change", () => selectMode("campaign"));
  document.getElementById("mode-single").addEventListener("change", () => selectMode("single"));
  document.getElementById("boss-select").addEventListener("change", previewSelection);
  document.getElementById("change-match").addEventListener("click", returnToMenu);
  document.getElementById("pause-menu").addEventListener("click", returnToMenu);
  document.getElementById("sound-toggle").addEventListener("click", (event) => {
    soundEnabled = !soundEnabled;
    event.currentTarget.textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
    event.currentTarget.setAttribute("aria-pressed", String(soundEnabled));
    if (audioCtx) soundEnabled ? audioCtx.resume() : audioCtx.suspend();
  });
  document.getElementById("map-select").addEventListener("change", previewSelection);
  document.getElementById("again").addEventListener("click", startGame);
  canvas.addEventListener("click", () => {
    if (state === "menu") startGame();
    else if (state === "playing" || state === "loot") lockPointer();
  });
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("pointerlockchange", syncAimHint);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);

  window.addEventListener("keydown", onKeyDown, { capture: true });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  window.addEventListener("blur", () => {
    keys.clear();
    firing = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) keys.clear();
  });
  window.addEventListener("resize", resize);

  selectMode("campaign");
  document.getElementById("start").disabled = false;
  weapon.visible = false;
  player.view.group.visible = true;
  requestAnimationFrame(frame);
}

function showError(message) {
  ui.error.hidden = false;
  ui.error.textContent = message;
}

function buildLights() {
  scene.add(new THREE.HemisphereLight(0xc9d4dc, 0x3a2a20, 1.45));

  const sun = new THREE.DirectionalLight(0xfff1dc, 3.25);
  sun.position.set(12, 20, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 64;
  sun.shadow.camera.left = -26;
  sun.shadow.camera.right = 26;
  sun.shadow.camera.top = 26;
  sun.shadow.camera.bottom = -26;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  scene.add(sun.target);

  const fill = new THREE.DirectionalLight(0x93a8ba, 0.85);
  fill.position.set(-14, 9, -8);
  scene.add(fill);
}

function setupArena() {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const floorTex = makeConcreteTexture("#ac9d80", false);
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(8, 8);
  floorTex.anisotropy = maxAniso;
  floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.94, metalness: 0.02 });

  const outer = new THREE.Mesh(
    new THREE.CircleGeometry(90, 48),
    new THREE.MeshStandardMaterial({ color: 0x141210, roughness: 1 })
  );
  outer.rotation.x = -Math.PI / 2;
  outer.position.y = -0.03;
  outer.receiveShadow = true;
  scene.add(outer);

  const wallTex = makeConcreteTexture("#c3aa80", true);
  wallTex.anisotropy = maxAniso;
  wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, metalness: 0.05 });
  trimMat = new THREE.MeshBasicMaterial({ color: 0xd6c07a });
  ringMat = new THREE.MeshBasicMaterial({ color: 0xd6c07a, side: THREE.DoubleSide });

  const crateTex = makeCrateTexture();
  crateTex.anisotropy = maxAniso;
  crateMat = new THREE.MeshStandardMaterial({ map: crateTex, roughness: 0.78, metalness: 0.08 });
  metalMat = new THREE.MeshStandardMaterial({ color: 0x2c3034, roughness: 0.4, metalness: 0.62 });
  ceilingMat = new THREE.MeshStandardMaterial({
    color: 0x6a635a,
    emissive: 0x2a241c,
    emissiveIntensity: 0.55,
    roughness: 0.94,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  mapRoot = new THREE.Group();
  scene.add(mapRoot);
  centerLight = new THREE.PointLight(0xfff0d4, 14, 28, 2);
  centerLight.position.set(0, 6.3, 0);
  scene.add(centerLight);

  bulletGeo = new THREE.BoxGeometry(0.07, 0.07, 0.52);
  sparkGeo = new THREE.BoxGeometry(0.07, 0.07, 0.07);
  coinGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.028, 10);
  const note = document.createElement("canvas"); note.width = 256; note.height = 112;
  const nctx = note.getContext("2d"); nctx.fillStyle = "#6c9e6b"; nctx.fillRect(0, 0, 256, 112);
  nctx.strokeStyle = "#d2dcaa"; nctx.lineWidth = 5; nctx.strokeRect(7, 7, 242, 98);
  nctx.fillStyle = "#e6e9be"; nctx.font = "bold 35px Georgia"; nctx.textAlign = "center";
  nctx.fillText("R$ 100", 128, 69); nctx.font = "12px sans-serif"; nctx.fillText("PIT RESERVE", 128, 27);
  const noteTexture = new THREE.CanvasTexture(note); noteTexture.colorSpace = THREE.SRGBColorSpace;
  noteGeo = new THREE.PlaneGeometry(.33, .145);
  noteMat = new THREE.MeshStandardMaterial({ map: noteTexture, side: THREE.DoubleSide, roughness: .95 });
  coinMat = new THREE.MeshStandardMaterial({ color: 0xf0c14a, metalness: 0.72, roughness: 0.28 });
  playerBulletMat = new THREE.MeshBasicMaterial({ color: 0xd6ff3f });
  enemyBulletMat = new THREE.MeshBasicMaterial({ color: 0xff5a1f });
  sparkWallMat = new THREE.MeshBasicMaterial({ color: 0xffe2b0 });
  sparkHitMat = new THREE.MeshBasicMaterial({ color: 0xfff6d2 });
  sparkHurtMat = new THREE.MeshBasicMaterial({ color: 0xff5a1f });
}

function loadMap(level) {
  clearMap();
  arenaHalf = level.arena;
  wallMat.color.setHex([0xffffff, 0xbad6e9, 0xffdbc0, 0xccd1be, 0xdac0b5][levelIndex]);
  trimMat.color.setHex(level.accent);
  ringMat.color.setHex(level.accent);
  scene.fog.near = level.arena + 8;
  scene.fog.far = level.arena * 3.4;
  centerLight.distance = level.arena * 2.2;

  mapHalfZ = level.layout.length * TILE / 2;
  walkTiles = [];
  const rows = level.layout;
  const open = (col, row) => rows[row]?.[col] === "#";
  // Each occupied tile joins its neighbors; only exposed edges get solid walls.
  rows.forEach((row, r) => [...row].forEach((tile, c) => {
    if (tile !== "#") return;
    const x = (c - 4) * TILE, z = (r - (rows.length - 1) / 2) * TILE;
    walkTiles.push({ x, z });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(TILE, TILE), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(x, 0, z);
    floor.receiveShadow = true; mapRoot.add(floor);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (open(c + dc, r + dr)) continue;
      const wx = x + dc * TILE / 2, wz = z + dr * TILE / 2;
      const w = dc ? 0.4 : TILE + 0.4, d = dr ? 0.4 : TILE + 0.4;
      addCover(wallMat, wx, wz, w, d, 5.5);
      addTrim(wx, 5.55, wz, w + 0.08, 0.14, d + 0.08, trimMat);
      // A window and lintel on each facade give lanes a readable human scale.
      addTrim(wx - dc * 0.23, 3.4, wz - dr * 0.23,
        dc ? 0.04 : 1.2, 1.3, dr ? 0.04 : 1.2, metalMat);
    }
  }));
  for (const [x, z, w, d, h] of level.covers) addCover(crateMat, x, z, w, d, h);
  for (const [x, z] of [[-8, -16], [8, 16], [-22, 2], [22, -2]]) {
    if (insideWalkable(x, z)) addLamp(metalMat, x, z);
  }
  // Roof the enclosed building blocks; the playable space remains open sky.
  rows.forEach((row, r) => [...row].forEach((tile, c) => {
    if (tile === "#" || r === 0 || r === rows.length - 1 || c === 0 || c === row.length - 1) return;
    const x = (c - 4) * TILE, z = (r - (rows.length - 1) / 2) * TILE;
    addTrim(x, 5.65, z, TILE, .3, TILE, wallMat);
  }));
  buildNavigation();
  decorateCompound(level);
  mapRoot.updateMatrixWorld(true);

}

function disposeSceneObject(root, retained = new Set(), retainedGeometries = new Set()) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  root.traverse(node => {
    if (node.geometry && !retainedGeometries.has(node.geometry)) geometries.add(node.geometry);
    for (const mat of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!mat || retained.has(mat)) continue;
      materials.add(mat);
      if (mat.map) textures.add(mat.map);
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
  textures.forEach(texture => texture.dispose());
}

function clearMap() {
  boxes.length = 0;
  blockers.length = 0;
  if (!mapRoot) return;
  disposeSceneObject(mapRoot, new Set([floorMat, wallMat, trimMat, ringMat, crateMat, metalMat, ceilingMat]));
  mapRoot.clear();
}

function addWall(x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mapRoot.add(mesh);
  blockers.push(mesh);
}

function addTrim(x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mapRoot.add(mesh);
}

function addCover(material, x, z, w, d, h) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mapRoot.add(mesh);
  blockers.push(mesh);
  boxes.push({
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2,
    minY: 0,
    maxY: h,
  });
}

function addLamp(metal, x, z) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 4.1, 8), metal);
  pole.position.set(x, 2.05, z);
  pole.castShadow = true;
  mapRoot.add(pole);
  blockers.push(pole);
  boxes.push({
    minX: x - 0.28,
    maxX: x + 0.28,
    minZ: z - 0.28,
    maxZ: z + 0.28,
    minY: 0,
    maxY: 4.2,
  });

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.16, 0.42),
    new THREE.MeshBasicMaterial({ color: 0xffc56b })
  );
  head.position.set(x, 4.18, z);
  mapRoot.add(head);

  const light = new THREE.PointLight(0xffb15e, 42, 22, 2);
  light.position.set(x, 4.05, z);
  mapRoot.add(light);
}

function buildCombatants() {
  player.view = buildHuman({ look: { suit: 0x424d4d, skin: 0xc4a389 }, tactical: true });
  scene.add(player.view.group);
  dressEnemy(currentLevel());
}

function dressEnemy(level) {
  for (const foe of enemies) {
    if (!foe.view) continue;
    scene.remove(foe.view.group); disposeSceneObject(foe.view.group);
  }
  enemies.length = 1;
  enemy.isBoss = true; enemy.name = level.short;
  enemy.view = buildHuman({ look: level.look });
  scene.add(enemy.view.group); addEnemyBar(enemy);
  for (let i = 0; i < level.acolytes; i++) {
    const politician = ACOLYTE_ROSTER[(levelIndex + i) % ACOLYTE_ROSTER.length];
    const acolyte = { ...enemy, isBoss: false, name: politician.name, view: null };
    acolyte.view = buildHuman({ look: politician });
    scene.add(acolyte.view.group); enemies.push(acolyte); addEnemyBar(acolyte);
  }
  ui.foeName.textContent = level.short;
}

function addEnemyBar(enemy) {
  enemy.view.face.userData.combatant = enemy;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 16;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true })
  );
  sprite.position.set(0, 1.99, 0);
  sprite.scale.set(.72, .055, 1);
  sprite.raycast = () => {};
  sprite.visible = false;
  enemy.view.group.add(sprite);
  enemy.view.barSprite = sprite;
  enemy.view.barCanvas = canvas;
  enemy.view.barTex = tex;
  enemy.view.barCtx = canvas.getContext("2d");
  const label = document.createElement("canvas"); label.width = 384; label.height = 48;
  const ctx = label.getContext("2d");
  ctx.fillStyle = "rgba(12, 16, 20, .85)"; ctx.fillRect(0, 0, 384, 48);
  ctx.fillStyle = enemy.isBoss ? "#f4d58b" : "#d7dfe0";
  ctx.font = "bold 25px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(enemy.name.toUpperCase(), 192, 33);
  const labelTex = new THREE.CanvasTexture(label); labelTex.colorSpace = THREE.SRGBColorSpace;
  const nameplate = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, depthTest: true }));
  nameplate.position.set(0, 2.13, 0); nameplate.scale.set(1.8, .225, 1);
  nameplate.raycast = () => {}; enemy.view.group.add(nameplate);
  enemy.view.nameplate = nameplate;
}

function buildWeapon() {
  weapon = new THREE.Group();
  weapon.position.set(0.26, -0.22, -0.42);
  camera.add(weapon);
  rebuildWeapon();
}

function rebuildWeapon() {
  if (!weapon) return;
  const materials = new Set();
  weapon.traverse(node => { if (node.geometry) node.geometry.dispose(); if (node.material) materials.add(node.material); });
  materials.forEach(material => material.dispose());
  weapon.clear();
  const rifle = weaponTierIndex > 0;
  const steel = new THREE.MeshStandardMaterial({ color: 0x30383a, roughness: 0.46, metalness: 0.72 });
  const polymer = new THREE.MeshStandardMaterial({ color: 0x181d20, roughness: 0.84 });
  const glove = new THREE.MeshStandardMaterial({ color: 0x625c46, roughness: 1 });
  const part = (w, h, d, x, y, z, mat = steel) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z); weapon.add(mesh); return mesh;
  };
  part(0.11, 0.12, rifle ? 0.48 : 0.25, 0, 0, -0.1);
  part(0.065, 0.065, rifle ? 0.44 : 0.28, 0, 0.02, rifle ? -0.54 : -0.35, polymer);
  part(0.075, 0.2, 0.09, 0, -0.12, 0.01, polymer).rotation.x = -0.28;
  part(0.1, 0.09, 0.13, 0, -0.15, 0.08, glove);
  part(0.12, 0.11, 0.3, 0.015, -0.22, 0.22, glove).rotation.x = -0.3;
  part(0.014, 0.035, 0.025, 0, 0.085, rifle ? -0.6 : -0.27, polymer);
  part(0.06, 0.025, 0.035, 0, 0.075, 0.015, polymer);
  if (rifle) {
    part(0.09, 0.26, 0.14, 0, -0.15, -0.15, polymer).rotation.x = 0.22;
    part(0.13, 0.13, 0.29, 0, 0.01, 0.24, polymer);
    part(0.13, 0.1, 0.25, 0, -0.01, -0.4, polymer);
    part(0.12, 0.1, 0.14, -0.06, -0.1, -0.36, glove);
    for (let i = 0; i < 7; i++) part(0.13, 0.012, 0.018, 0, 0.075, -0.12 - i * 0.045, polymer);
  }
  weaponFlash = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.2, 5), new THREE.MeshBasicMaterial({color: 0xffdc91}));
  weaponFlash.rotation.x = -Math.PI / 2;
  weaponFlash.position.set(0, 0.02, rifle ? -0.82 : -0.55);
  weaponFlash.visible = false;
  weapon.add(weaponFlash);
  playerBulletMat.color.setHex(0xffd18a);
}

function makeConcreteTexture(hex, seams) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 512, 512);
  const image = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 26;
    image.data[i] = clampByte(image.data[i] + n);
    image.data[i + 1] = clampByte(image.data[i + 1] + n);
    image.data[i + 2] = clampByte(image.data[i + 2] + n);
  }
  ctx.putImageData(image, 0, 0);
  if (seams) {
    ctx.strokeStyle = "rgba(20, 16, 12, 0.45)";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 492, 492);
    ctx.strokeStyle = "rgba(255, 244, 220, 0.06)";
    ctx.strokeRect(22, 22, 468, 468);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCrateTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#4a433a";
  ctx.fillRect(0, 0, 256, 256);
  const image = ctx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 20;
    image.data[i] = clampByte(image.data[i] + n);
    image.data[i + 1] = clampByte(image.data[i + 1] + n);
    image.data[i + 2] = clampByte(image.data[i + 2] + n);
  }
  ctx.putImageData(image, 0, 0);
  ctx.fillStyle = "#d8b57c";
  ctx.fillRect(0, 112, 256, 16);
  ctx.fillStyle = "#16140f";
  ctx.fillRect(0, 128, 256, 5);
  ctx.strokeStyle = "rgba(20, 16, 12, 0.55)";
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 244, 244);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function clampByte(value) {
  return Math.max(0, Math.min(255, value));
}

function onKeyDown(event) {
  const inMatch = state === "playing" || state === "loot";
  const modified = event.ctrlKey || event.metaKey || event.altKey;
  if (inMatch && (modified || ["F5", "BrowserBack", "BrowserForward", "Backspace"].includes(event.code))) {
    event.preventDefault();
    // Modified keys are reserved for browser commands, never gameplay actions.
    // In particular, Ctrl+R must not reload the weapon after cancelling refresh.
    return;
  } else if (modified) {
    return;
  }
  const control = event.code === "KeyW"
    || event.code === "KeyA"
    || event.code === "KeyS"
    || event.code === "KeyD" || event.code === "ShiftLeft" || event.code === "ShiftRight"
    || event.code === "KeyC" || event.code === "ControlLeft" || event.code === "ControlRight";
  if (control) {
    event.preventDefault();
    keys.add(event.code);
  }
  if (event.code === "KeyR" && !event.repeat) startReload();
  if (event.key === "Enter" && !event.repeat) {
    if (state === "loot") advanceLevel();
    else if (state === "ended") startGame();
    else if (state === "menu" && !["SELECT", "BUTTON", "INPUT"].includes(event.target?.tagName)) startGame();
  }
}

function onMouseDown(event) {
  if (event.button !== 0) return;
  if (document.pointerLockElement === renderer.domElement) firing = true;
}

function onMouseUp(event) {
  if (event.button === 0) firing = false;
}

function onMouseMove(event) {
  if ((state !== "playing" && state !== "loot") || document.pointerLockElement !== renderer.domElement) return;
  const sensitivity = Number(document.getElementById("sensitivity").value);
  player.yaw -= event.movementX * LOOK_SENS * sensitivity;
  player.pitch -= event.movementY * LOOK_SENS * sensitivity;
  player.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, player.pitch));
}

function syncAimHint() {
  const locked = document.pointerLockElement === renderer.domElement;
  const live = state === "playing" || state === "loot";
  ui.aimLock.hidden = !live || locked;
  document.getElementById("pause-menu").hidden = !live || locked;
  if (!locked) firing = false;
}

function selectionIndex(id) {
  const index = Number(document.getElementById(id).value);
  return Number.isInteger(index) && index >= 0 && index < LEVELS.length ? index : 0;
}

function selectMode(mode) {
  if (state !== "menu") return;
  gameMode = mode === "single" ? "single" : "campaign";
  document.getElementById("mode-campaign").checked = gameMode === "campaign";
  document.getElementById("mode-single").checked = gameMode === "single";
  document.getElementById("single-options").hidden = gameMode !== "single";
  document.getElementById("campaign-route").hidden = gameMode !== "campaign";
  document.getElementById("mode-description").textContent = gameMode === "campaign"
    ? "Five stages in order. Begin with Mendes and finish with Lula. Weapon upgrades carry between stages."
    : "One match. Choose any map and any boss independently. Replay or change your matchup after the result.";
  document.getElementById("start-label").textContent = gameMode === "campaign" ? "START CAMPAIGN" : "START SINGLE MATCH";
  previewSelection();
}

function previewSelection() {
  if (state !== "menu") return;
  levelIndex = gameMode === "campaign" ? 0 : selectionIndex("map-select");
  bossIndex = gameMode === "campaign" ? 0 : selectionIndex("boss-select");
  loadMap(currentLevel()); dressEnemy(currentLevel()); resetRound();
  document.querySelector(".scene-caption h2").textContent = MAP_NAMES[levelIndex];
  document.getElementById("deployment-enemies").textContent = `${currentLevel().short.toUpperCase()} + ${currentLevel().acolytes} ACOLYTES`;
}

function returnToMenu() {
  state = "menu"; cleared = false; firing = false; keys.clear();
  if (document.pointerLockElement) document.exitPointerLock();
  document.body.dataset.state = "menu";
  ui.end.hidden = true; ui.menu.hidden = false; ui.banner.hidden = true; bannerT = 0;
  weapon.visible = false; player.view.group.visible = true;
  selectMode(gameMode); syncAimHint();
  document.getElementById(gameMode === "campaign" ? "mode-campaign" : "map-select").focus();
}

function startGame() {
  if (document.documentElement.classList.contains("file")) return;
  if (state === "playing" || state === "loot" || !weapon || document.getElementById("start").disabled) return;
  audio();
  if (state === "menu") {
    levelIndex = gameMode === "campaign" ? 0 : selectionIndex("map-select");
    bossIndex = gameMode === "campaign" ? 0 : selectionIndex("boss-select");
  } else if (cleared && gameMode === "campaign") {
    levelIndex = 0; bossIndex = 0;
  }
  cleared = false; resetRunProgress(); beginLevel();
}

function beginLevel() {
  const level = currentLevel();
  resetCombo();
  loadMap(level);
  dressEnemy(level);
  resetRound();
  state = "playing";
  document.body.dataset.state = "playing";
  ui.menu.hidden = true;
  ui.end.hidden = true;
  fightDelay = 0.75;
  weapon.visible = true;
  player.view.group.visible = false;
  showBanner(level.name.toUpperCase(), 1.2);
  renderer.domElement.focus();
  lockPointer();
  syncAimHint();
  updateBars();
}

function showResults(won) {
  cleared = won; state = "ended"; firing = false; keys.clear();
  document.body.dataset.state = "ended";
  const single = gameMode === "single";
  ui.endTitle.textContent = won ? (single ? "Match secured" : "Campaign complete") : "You are down";
  ui.endDetail.textContent = won
    ? (single ? `${currentLevel().short} and all acolytes defeated at ${currentLevel().name}.` : "All five bosses and their squads defeated, from Mendes to Lula.")
    : `${currentLevel().short} holds ${currentLevel().name}.`;
  ui.again.textContent = single ? "Replay this match" : won ? "Restart campaign" : "Retry this stage";
  document.getElementById("change-match").textContent = single ? "Change map / boss" : "Choose game mode";
  finishScore(); ui.end.hidden = false; ui.banner.hidden = true; bannerT = 0;
  if (document.pointerLockElement) document.exitPointerLock();
  syncAimHint();
}

function advanceLevel() {
  if (state !== "loot") return;
  if (gameMode === "single" || levelIndex >= LEVELS.length - 1) {
    showResults(true);
    tone(330, .12, "square", .05);
    return;
  }
  levelIndex += 1; bossIndex = levelIndex; beginLevel();
}

function currentLevel() {
  const map = LEVELS[levelIndex];
  const boss = LEVELS[gameMode === "single" ? bossIndex : levelIndex];
  return { ...map, short: boss.short, look: boss.look,
    hp: boss.hp, speed: boss.speed, damage: boss.damage, fireRate: boss.fireRate,
    spread: boss.spread, bulletSpeed: boss.bulletSpeed, prefer: boss.prefer, turn: boss.turn };
}

function resetRound() {
  const level = currentLevel();
  player.x = 0;
  player.z = level.playerZ;
  player.yaw = 0;
  player.pitch = 0;
  player.speed = 0;
  player.bob = 0;
  player.hp = 100;
  player.cool = 0;
  ammo = MAGAZINES[weaponTierIndex];
  reserve = Math.max(96, ammo * 6);
  reloadTime = 0;
  roundTime = level.duration;
  recoil = 0;
  crouch = 0;
  document.getElementById("kill-feed").hidden = true;
  player.vx = 0;
  player.vz = 0;
  const spawnPoints = [[0, level.enemyZ], [-12, -12], [12, -12], [-18, 0], [18, 0], [-12, 12], [12, 12], [0, -6]];
  enemies.forEach((foe, i) => {
    const desired = spawnPoints[i];
    const spawn = nearestNavPoint(desired[0], desired[1]);
    Object.assign(foe, {
      x: spawn.x, z: spawn.z, yaw: Math.PI, hp: foe.isBoss ? level.hp : 40 + levelIndex * 8,
      maxHp: foe.isBoss ? level.hp : 40 + levelIndex * 8,
      speed: foe.isBoss ? level.speed : 2.6 + levelIndex * .18,
      damage: foe.isBoss ? level.damage : 3 + levelIndex,
      fireRate: foe.isBoss ? level.fireRate : 2.5 - levelIndex * .12,
      spread: foe.isBoss ? level.spread : 2.8, bulletSpeed: level.bulletSpeed,
      prefer: foe.isBoss ? level.prefer : 12 + i % 3, turn: level.turn,
      waypoint: null, detour: null, detourCooldown: 0, cool: 1.5 + i * .4, phase: 0, fall: 0, hitFlash: 0, flash: 0,
      strafeSign: i % 2 ? -1 : 1, strafeTimer: 1.1 + i * .2,
    });
    foe.view.group.visible = true; foe.view.muzzle.visible = false;
    foe.view.death = 0; animateHuman(foe.view, 0, 0, false, 0);
    foe.view.armor.emissiveIntensity = 0; placeFighter(foe.view, foe);
  });
  navigationTimer = 0;
  landed = 0;
  taken = 0;
  kick = 0;
  shake = 0;
  pain = 0;
  flashTime = 0;
  firing = false;
  clearGroup(bullets);
  clearGroup(sparks);
  clearGroup(coins);
  clearGroup(banknotes);
  clearPile();
  ui.mapLabel.textContent = `SECTOR ${String(levelIndex + 1).padStart(2, "0")}`;
  document.getElementById("location-name").textContent = MAP_NAMES[levelIndex];
  document.getElementById("round-number").textContent = gameMode === "single" ? "SINGLE MATCH / 01" : `CAMPAIGN ${String(levelIndex + 1).padStart(2, "0")} / 05`;
  ui.foeName.textContent = level.short;
  if (player.view) placeFighter(player.view, player);
  if (enemy.view) {
    enemy.view.group.visible = true;
    placeFighter(enemy.view, enemy);
    enemy.view.armor.emissiveIntensity = 0;
    enemy.view.muzzle.visible = false;
    if (enemy.view.glow) enemy.view.glow.intensity = 0;
  }
  updateBars();
}

function finishLose() {
  if (state !== "playing") return;
  tone(180, .28, "sawtooth", .05, 55); showResults(false);
}

function beginLoot() {
  if (state !== "playing" || enemies.some(foe => foe.hp > 0)) return;
  state = "loot";
  if (enemy.view.glow) enemy.view.glow.intensity = 0;
  if (gameMode === "single") { showResults(true); return; }
  showBanner("SECTOR SECURED · ENTER TO CONTINUE", 30);
  const feed = document.getElementById("kill-feed");
  feed.textContent = `YOU  ▸  ${currentWeapon().name}  ▸  ${currentLevel().short}`;
  feed.hidden = false;
  tone(330, 0.12, "square", 0.05);
  window.setTimeout(() => tone(520, 0.16, "square", 0.045), 110);
}

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  time += dt;

  const active = document.pointerLockElement === renderer.domElement;
  if (state === "menu") {
    updateMenu(time);
  } else {
    if ((state === "playing" || state === "loot") && active) {
      if (state === "playing") fightDelay = Math.max(0, fightDelay - dt);
      updatePlayer(dt);
    }
    if (state === "playing" && active) {
      roundTime = Math.max(0, roundTime - dt);
      if (roundTime === 0) { finishLose(); ui.endTitle.textContent = "Time expired"; }
      else {
        navigationTimer -= dt;
        if (navigationTimer <= 0) { updateNavigation(); navigationTimer = .45; }
        for (const foe of enemies) updateEnemy(dt, foe);
      }
    }
    updateFpsCamera(dt);
    for (const foe of enemies) foe.view.faceCamera(camera, foe.yaw, foe.fall || 0);
    if (active && state === "loot") for (const foe of enemies) updateEnemy(dt, foe);
    refreshCrosshair();
  }

  if (active) updateBullets(dt);
  updateSparks(dt);
  updateCoins(dt);
  updateBanknotes(dt);
  updateHud(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

function updateMenu(t) {
  animateHuman(player.view, 0, 0, false, t);
  player.yaw = 0; placeFighter(player.view, player);
  enemy.yaw = 0; animateHuman(enemy.view, 0, 0, false, t); placeFighter(enemy.view, enemy);

  const angle = t * 0.12;
  camera.position.set(2.1 + Math.sin(angle) * .45, 2.0, -20);
  camera.lookAt(-.3, 1.1, -17.25);
  for (const foe of enemies.slice(1)) { animateHuman(foe.view, 0, 0, false, t); placeFighter(foe.view, foe); }
}

function updatePlayer(dt) {
  forwardFromYaw(player.yaw, forward);
  rightFromYaw(player.yaw, strafe);
  let wishX = 0;
  let wishZ = 0;
  if (keys.has("KeyW")) {
    wishX += forward.x;
    wishZ += forward.z;
  }
  if (keys.has("KeyS")) {
    wishX -= forward.x;
    wishZ -= forward.z;
  }
  if (keys.has("KeyD")) {
    wishX += strafe.x;
    wishZ += strafe.z;
  }
  if (keys.has("KeyA")) {
    wishX -= strafe.x;
    wishZ -= strafe.z;
  }
  const wish = Math.hypot(wishX, wishZ);
  if (wish > 0) {
    wishX /= wish;
    wishZ /= wish;
  }
  const crouching = keys.has("KeyC") || keys.has("ControlLeft") || keys.has("ControlRight");
  const walking = keys.has("ShiftLeft") || keys.has("ShiftRight");
  crouch += ((crouching ? 1 : 0) - crouch) * Math.min(1, dt * 14);
  const target = wish > 0 ? PLAYER_SPEED * (crouching ? 0.42 : walking ? 0.52 : 1) : 0;
  recoil = Math.max(0, recoil - dt * 4);
  if (reloadTime > 0) {
    reloadTime = Math.max(0, reloadTime - dt);
    if (reloadTime === 0) {
      const amount = Math.min(MAGAZINES[weaponTierIndex] - ammo, reserve);
      ammo += amount; reserve -= amount;
      tone(420, 0.06, "square", 0.025);
    }
  }
  player.speed += (target - player.speed) * (1 - Math.exp(-12 * dt));

  const beforeX = player.x;
  const beforeZ = player.z;
  tryMove(player, wishX * player.speed * dt, wishZ * player.speed * dt, PLAYER_R, "player");
  player.vx = (player.x - beforeX) / dt;
  player.vz = (player.z - beforeZ) / dt;
  if (Math.hypot(player.vx, player.vz) > 0.4) player.bob += dt * 11;

  player.cool = Math.max(0, player.cool - dt);
  const aimed = document.pointerLockElement === renderer.domElement;
  if (aimed && firing && player.hp > 0 && player.cool <= 0 && (state === "loot" || fightDelay <= 0)) {
    playerShoot();
  }
}

function updateEnemy(dt, enemy) {
  enemy.flash -= dt;
  if (enemy.view.muzzle) enemy.view.muzzle.visible = enemy.flash > 0;

  if (state !== "playing" || enemy.hp <= 0) {
    if (enemy.hp <= 0) {
      enemy.fall = Math.min(1.25, enemy.fall + dt * 2.4);
      if (enemy.view.glow) enemy.view.glow.intensity = 0;
      enemy.view.muzzle.visible = false;
    }
    enemy.view.armor.emissiveIntensity = enemy.hitFlash * 0.85;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - dt * 3.2);
    placeFighter(enemy.view, enemy);
    return;
  }

  enemy.cool = Math.max(0, enemy.cool - dt);
  enemy.detourCooldown = Math.max(0, enemy.detourCooldown - dt);
  const dx = player.x - enemy.x;
  const dz = player.z - enemy.z;
  const dist = Math.hypot(dx, dz) || 0.0001;
  const dirX = dx / dist;
  const dirZ = dz / dist;
  const targetYaw = yawFromDirection(dirX, dirZ);
  enemy.yaw += angleDelta(enemy.yaw, targetYaw) * (1 - Math.exp(-(enemy.turn || 6) * dt));

  enemy.strafeTimer -= dt;
  if (enemy.strafeTimer <= 0) {
    enemy.strafeSign *= -1;
    enemy.strafeTimer = 1.05 + Math.random() * 1.35;
  }

  let fwd = 0;
  if (dist > enemy.prefer + 1.6) fwd = 1;
  else if (dist < enemy.prefer - 1.8) fwd = -1;

  const sideX = -dirZ * enemy.strafeSign;
  const sideZ = dirX * enemy.strafeSign;
  let wishX = dirX * fwd + sideX * 0.95;
  let wishZ = dirZ * fwd + sideZ * 0.95;
  const los = hasLineOfSight(enemy);
  if (los && enemy.detour?.length) { enemy.detour = null; enemy.waypoint = null; }
  if (!los) {
    const waypoint = navigationWaypoint(enemy);
    wishX = waypoint.x - enemy.x;
    wishZ = waypoint.z - enemy.z;
  }

  const threat = los && dist < 26 && dist > 1.4 && Math.abs(angleDelta(enemy.yaw, targetYaw)) < 0.42;
  const holdAim = threat && enemy.cool < .32 && fightDelay <= 0;

  // Normalize pursuit before separation, so an actor approaching a waypoint is
  // not pushed away from it forever by a nearby ally.
  const desiredLength = Math.hypot(wishX, wishZ);
  if (desiredLength > .001) { wishX /= desiredLength; wishZ /= desiredLength; }
  // Keep the squad from bunching into one body at narrow entrances.
  for (const other of enemies) {
    if (other === enemy || other.hp <= 0) continue;
    const sx = enemy.x - other.x, sz = enemy.z - other.z;
    const separation = Math.hypot(sx, sz);
    if (separation > .01 && separation < 1.6) {
      wishX += sx / separation * .55; wishZ += sz / separation * .55;
    }
  }
  const mag = Math.hypot(wishX, wishZ);
  if (mag > 0.001) {
    wishX /= mag;
    wishZ /= mag;
  }

  const prevX = enemy.x;
  const prevZ = enemy.z;
  if (!holdAim) tryMove(enemy, wishX * enemy.speed * dt, wishZ * enemy.speed * dt, ENEMY_R, enemy);
  let moved = Math.hypot(enemy.x - prevX, enemy.z - prevZ);
  if (!holdAim && mag > 0.25 && moved < 0.0008) {
    enemy.strafeSign *= -1;
    enemy.strafeTimer = 0.4;
    if (enemy.detourCooldown <= 0) { routeAroundAllies(enemy); enemy.detourCooldown = .7; }
    const waypoint = navigationWaypoint(enemy);
    const wx = waypoint.x - enemy.x, wz = waypoint.z - enemy.z, wd = Math.hypot(wx, wz) || 1;
    tryMove(enemy, wx / wd * enemy.speed * dt, wz / wd * enemy.speed * dt, ENEMY_R, enemy);
  }

  moved = Math.hypot(enemy.x - prevX, enemy.z - prevZ);
  // One footfall cycle per 1.35 meters, so speed changes do not cause skating.
  if (moved > .0001) enemy.phase += moved / 1.35 * Math.PI * 2;
  const backward = (enemy.x - prevX) * dirX + (enemy.z - prevZ) * dirZ < -.0001;
  animateHuman(enemy.view, enemy.phase, moved > .0001 ? 1 : 0, enemy.flash > 0, time, backward);
  enemy.view.armor.emissiveIntensity = enemy.hitFlash * 0.85;
  enemy.hitFlash = Math.max(0, enemy.hitFlash - dt * 3.2);

  if (threat && fightDelay <= 0 && enemy.cool <= 0) {
    enemyShoot(enemy);
    enemy.cool = enemy.fireRate + Math.random() * 0.25;
  }

  placeFighter(enemy.view, enemy);
}

function updateFpsCamera(dt) {
  const moving = state === "playing" && Math.abs(player.speed) > 0.5;
  const bob = moving ? Math.sin(player.bob) * 0.04 : 0;
  camera.position.set(player.x, 1.62 - crouch * 0.56 + bob, player.z);
  if (shake > 0.001) {
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake * 0.55;
    shake *= Math.exp(-8 * dt);
  }
  camera.rotation.order = "YXZ";
  camera.rotation.set(player.pitch, player.yaw, 0);
  weapon.position.set(
    0.26,
    -0.22 - (reloadTime > 0 ? Math.sin((1 - reloadTime / 2.1) * Math.PI) * 0.25 : 0) + (moving ? Math.sin(player.bob * 2) * 0.01 : 0),
    -0.42 + kick
  );
  weapon.rotation.x = -kick * 1.5;
  weapon.rotation.z = reloadTime > 0 ? -0.45 : 0;
  kick *= Math.exp(-12 * dt);
  flashTime -= dt;
  weaponFlash.visible = flashTime > 0;
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    const distance = bullet.speed * dt;
    const steps = Math.max(1, Math.ceil(distance / 0.12));
    const step = distance / steps;
    let dead = false;
    for (let s = 0; s < steps; s += 1) {
      bullet.x += bullet.dx * step;
      bullet.y += bullet.dy * step;
      bullet.z += bullet.dz * step;
      if (bullet.y < 0.18 || bullet.y > 6.2 || outsideArena(bullet) || hitsBox(bullet)) {
        burst(bullet.x, Math.max(0.25, bullet.y), bullet.z, sparkWallMat);
        dead = true;
        break;
      }
      if (hitsPile(bullet)) {
        if (bullet.owner === "player") spawnCoins(bullet.x, bullet.y, bullet.z, 8);
        burst(bullet.x, bullet.y, bullet.z, sparkHitMat);
        dead = true;
        break;
      }
      if (bullet.owner === "player") {
        const target = enemies.find(foe => foe.hp > 0 && hitsHuman(bullet, foe));
        if (target) {
          damageEnemy(bullet.y, target);
          burst(bullet.x, bullet.y, bullet.z, sparkHitMat);
          dead = true;
          break;
        }
      } else if (player.hp > 0 && bullet.y > 0.3 && bullet.y < 1.9 - crouch * 0.56
        && Math.hypot(bullet.x - player.x, bullet.z - player.z) < PLAYER_HIT) {
        damagePlayer(bullet.damage);
        burst(bullet.x, bullet.y, bullet.z, sparkHurtMat);
        dead = true;
        break;
      }
    }
    bullet.life -= dt;
    if (dead || bullet.life <= 0) {
      scene.remove(bullet.mesh);
      bullets.splice(i, 1);
    } else {
      bullet.mesh.position.set(bullet.x, bullet.y, bullet.z);
    }
  }
}

function updateSparks(dt) {
  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const spark = sparks[i];
    spark.life -= dt;
    spark.vy -= 14 * dt;
    spark.mesh.position.x += spark.vx * dt;
    spark.mesh.position.y += spark.vy * dt;
    spark.mesh.position.z += spark.vz * dt;
    const scale = Math.max(spark.life, 0) / 0.32;
    spark.mesh.scale.setScalar(scale);
    if (spark.life <= 0) {
      scene.remove(spark.mesh);
      sparks.splice(i, 1);
    }
  }
}

function updateHud(dt) {
  if (bannerT > 0) {
    bannerT -= dt;
    if (bannerT <= 0) ui.banner.hidden = true;
  }
  if (state === "menu") return;
  if (comboTimer > 0) {
    comboTimer = Math.max(0, comboTimer - dt);
    if (comboTimer === 0) resetCombo();
  }
  const last = levelIndex === LEVELS.length - 1;
  ui.hint.textContent = state === "loot"
    ? (last ? "Operation complete  ·  Enter for results" : "Sector secured  ·  Enter to deploy to the next zone")
    : "WASD MOVE  ·  SHIFT WALK  ·  C CROUCH  ·  R RELOAD  ·  ESC PAUSE";
  updateTacticalHud();
  syncAimHint();
  pain = Math.max(0, pain - dt * 1.35);
  const low = player.hp < 35 ? (35 - player.hp) / 80 : 0;
  ui.vignette.style.opacity = String(Math.min(0.82, pain * 0.72 + low));
  const charge = 1 - player.cool / currentWeapon().cooldown;
  ui.coolBar.style.transform = `scaleX(${Math.max(0, Math.min(1, charge))})`;
}

function refreshCrosshair() {
  if (state !== "playing") { ui.crosshair.classList.remove("on-target"); return; }
  const groups = enemies.filter(foe => foe.hp > 0).map(foe => {
    foe.view.group.updateMatrixWorld(true); return foe.view.group;
  });
  aimOrigin.copy(camera.position); lookDirection(aimDir);
  raycaster.set(aimOrigin, aimDir); raycaster.far = 64;
  const foeHits = raycaster.intersectObjects(groups, true).filter(hit => {
    const foe = hit.object.userData.combatant;
    return foe && hitsHuman(hit.point, foe);
  });
  const wallHits = raycaster.intersectObjects(blockers, false);
  ui.crosshair.classList.toggle("on-target", (foeHits[0]?.distance ?? Infinity) < (wallHits[0]?.distance ?? Infinity));
}

function playerShoot() {
  if (reloadTime > 0) return;
  if (ammo <= 0) { startReload(); player.cool = 0.2; return; }
  ammo -= 1;
  const tier = currentWeapon();
  player.cool = tier.cooldown;
  kick = 0.14;
  flashTime = 0.045;
  lookDirection(shotDir);
  const spread = 0.0015 + player.speed * 0.002 + recoil * 0.003;
  shotDir.x += (Math.random() - 0.5) * spread;
  shotDir.y += (Math.random() - 0.5) * spread;
  shotDir.normalize();
  recoil = Math.min(5, recoil + 0.65);
  const muzzleHeight = 1.62 - crouch * 0.56;
  const x = player.x + shotDir.x * 0.1;
  const y = muzzleHeight + shotDir.y * 0.1;
  const z = player.z + shotDir.z * 0.1;
  spawnBullet(x, y, z, shotDir, tier.bulletSpeed, "player");
  player.pitch = Math.min(PITCH_LIMIT, player.pitch + 0.006 + recoil * 0.002);
  playShot(true);
}

function hitsHuman(bullet, foe) {
  const dx = bullet.x - foe.x, dz = bullet.z - foe.z;
  if (Math.hypot(dx, dz) > .75 || bullet.y < .08 || bullet.y > 1.85) return false;
  const x = Math.cos(foe.yaw) * dx - Math.sin(foe.yaw) * dz;
  const z = Math.sin(foe.yaw) * dx + Math.cos(foe.yaw) * dz;
  const y = bullet.y;
  if (y >= 1.51 && y <= 1.85) return (x / .14) ** 2 + ((y - 1.68) / .18) ** 2 + (z / .15) ** 2 <= 1;
  if (y >= .87 && y < 1.51) {
    if ((x / .29) ** 2 + (z / .19) ** 2 <= 1) return true;
    const bulk = foe.view.bulk;
    for (const side of [-1, 1]) {
      const shoulder = [side * .238 * bulk, 1.425, 0], elbow = [side * .286 * bulk, 1.185, -.105];
      const hand = side === 1 ? [.135, 1.245, -.31] : [.095, 1.245, -.56];
      if (pointNearLimb(x, y, z, shoulder, elbow, .08) || pointNearLimb(x, y, z, elbow, hand, .06)) return true;
    }
    return false;
  }
  if (y >= .08 && y < .87) return (Math.min(Math.abs(x - .10), Math.abs(x + .10)) / .105) ** 2 + (z / .14) ** 2 <= 1;
  return false;
}

function pointNearLimb(x, y, z, start, end, radius) {
  const dx = end[0] - start[0], dy = end[1] - start[1], dz = end[2] - start[2];
  const t = Math.max(0, Math.min(1, ((x - start[0]) * dx + (y - start[1]) * dy + (z - start[2]) * dz) / (dx * dx + dy * dy + dz * dz)));
  return (x - start[0] - t * dx) ** 2 + (y - start[1] - t * dy) ** 2 + (z - start[2] - t * dz) ** 2 <= radius * radius;
}

function enemyShoot(enemy) {
  enemy.view.group.updateMatrixWorld(true);
  const muzzle = enemy.view.muzzle.getWorldPosition(new THREE.Vector3());
  const spread = enemy.spread || .9;
  shotDir.set(player.x - muzzle.x + (Math.random() - .5) * spread,
    1.35 - crouch * .56 - muzzle.y, player.z - muzzle.z + (Math.random() - .5) * spread).normalize();
  spawnBullet(muzzle.x, muzzle.y, muzzle.z, shotDir, enemy.bulletSpeed || 15, "enemy", enemy.damage);
  enemy.flash = .05; playShot(false);
}

function spawnBullet(x, y, z, dir, speed, owner, damage = 0) {
  const mesh = new THREE.Mesh(bulletGeo, owner === "player" ? playerBulletMat : enemyBulletMat);
  mesh.position.set(x, y, z);
  mesh.lookAt(x + dir.x, y + dir.y, z + dir.z);
  if (owner === "enemy") mesh.scale.set(1.7, 1.7, 1.15);
  scene.add(mesh);
  bullets.push({
    mesh, x, y, z, dx: dir.x, dy: dir.y, dz: dir.z, speed, owner, damage, life: 2.5,
  });
}

function damageEnemy(hitY, enemy = enemies[0]) {
  if (state !== "playing" || enemy.hp <= 0) return;
  const headshot = hitY >= 1.51;
  const damage = currentWeapon().damage * (headshot ? 2.5 : 1);
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.hitFlash = 1;
  if (enemy.isBoss) { spawnCoins(enemy.x, Math.max(.8, hitY), enemy.z, 7); spawnBanknotes(enemy.x, 1.1, enemy.z, 4); }
  landed += 1;
  registerHit(headshot);

  ui.hitmark.classList.remove("on");
  void ui.hitmark.offsetWidth;
  ui.hitmark.classList.add("on");
  tone(150, 0.07, "square", 0.045, 70);
  updateBars();
  if (enemy.hp <= 0) {
    if (enemy.isBoss) {
      spawnCoins(enemy.x, 1.2, enemy.z, 32); spawnBanknotes(enemy.x, 1.2, enemy.z, 20); showMoneyPile(enemy.x, enemy.z);
    }
    addScore(enemy.isBoss ? 200 + (levelIndex + 1) * 100 : 150, enemy.isBoss ? "BOSS DEFEATED" : "ACOLYTE DEFEATED");
    const feed = document.getElementById("kill-feed");
    feed.textContent = `YOU  ▸  ${currentWeapon().name}  ▸  ${enemy.name}`; feed.hidden = false;
    // Small field resupply keeps larger encounters viable with every weapon tier.
    reserve += enemy.isBoss ? 24 : 12;
    player.hp = Math.min(100, player.hp + (enemy.isBoss ? 12 : 6));
    if (enemies.every(foe => foe.hp <= 0)) beginLoot();
    else if (enemy.isBoss) showBanner("BOSS DOWN · CLEAR THE ACOLYTES", 2);
    updateBars();
  }
}

function damagePlayer(damage = enemy.damage) {
  if (state !== "playing" || player.hp <= 0) return;
  player.hp = Math.max(0, player.hp - damage);
  taken += 1;
  resetCombo();
  shake = 0.28;
  pain = 0.7;
  tone(78, 0.14, "sawtooth", 0.05, 40);
  updateBars();
  if (player.hp <= 0) finishLose();
}

function spawnCoins(x, y, z, count) {
  tone(780, 0.045, "square", 0.03, 360);
  for (let i = 0; i < count; i += 1) {
    if (coins.length > 70) {
      const old = coins.shift();
      scene.remove(old.mesh);
    }
    const mesh = new THREE.Mesh(coinGeo, coinMat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(mesh);
    coins.push({
      mesh,
      vx: (Math.random() - 0.5) * 6.5,
      vy: 2.4 + Math.random() * 4,
      vz: (Math.random() - 0.5) * 6.5,
      spin: (Math.random() - 0.5) * 12,
      life: 1.15 + Math.random() * 0.45,
    });
  }
}

function updateCoins(dt) {
  for (let i = coins.length - 1; i >= 0; i -= 1) {
    const coin = coins[i];
    coin.life -= dt;
    coin.vy -= 9 * dt;
    coin.mesh.position.x += coin.vx * dt;
    coin.mesh.position.y += coin.vy * dt;
    coin.mesh.position.z += coin.vz * dt;
    if (coin.mesh.position.y < 0.1) {
      coin.mesh.position.y = 0.1;
      coin.vy = Math.abs(coin.vy) * 0.28;
      coin.vx *= 0.65;
      coin.vz *= 0.65;
    }
    coin.mesh.rotation.z += coin.spin * dt;
    if (coin.life <= 0) {
      scene.remove(coin.mesh);
      coins.splice(i, 1);
    }
  }
}

function spawnBanknotes(x, y, z, count) {
  for (let i = 0; i < count; i++) {
    if (banknotes.length >= 80) { scene.remove(banknotes.shift().mesh); }
    const mesh = new THREE.Mesh(noteGeo, noteMat); mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    scene.add(mesh);
    banknotes.push({ mesh, vx: (Math.random() - .5) * 5, vy: 2.5 + Math.random() * 3,
      vz: (Math.random() - .5) * 5, spin: (Math.random() - .5) * 8, life: 4 + Math.random() * 2 });
  }
}

function updateBanknotes(dt) {
  for (let i = banknotes.length - 1; i >= 0; i--) {
    const note = banknotes[i]; note.life -= dt; note.vy -= 3 * dt;
    note.mesh.position.x += (note.vx + Math.sin(note.life * 8) * .4) * dt;
    note.mesh.position.y += note.vy * dt; note.mesh.position.z += note.vz * dt;
    note.mesh.rotation.x += note.spin * dt; note.mesh.rotation.z += Math.sin(note.life * 6) * dt;
    if (note.mesh.position.y < .035) { note.mesh.position.y = .035; note.vy = 0; note.vx *= .8; note.vz *= .8; note.mesh.rotation.x = -Math.PI / 2; }
    if (note.life <= 0) { scene.remove(note.mesh); banknotes.splice(i, 1); }
  }
}

function showMoneyPile(x, z) {
  clearPile();
  const group = new THREE.Group();
  const bill = new THREE.MeshStandardMaterial({ color: 0x1e8a42, roughness: 0.55 });
  const band = new THREE.MeshStandardMaterial({ color: 0xf3e2a2, roughness: 0.4 });
  const spots = [[-0.42, -0.18], [0.02, -0.2], [0.44, -0.12], [-0.22, 0.24], [0.26, 0.22], [0.04, 0.02]];
  for (let i = 0; i < spots.length; i += 1) {
    const h = 0.24 + (i % 3) * 0.1;
    const stack = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, 0.3), bill);
    stack.position.set(spots[i][0], h / 2, spots[i][1]);
    stack.rotation.y = (i - 2) * 0.18;
    const wrap = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.055, 0.32), band);
    wrap.position.set(spots[i][0], h * 0.62, spots[i][1]);
    wrap.rotation.y = stack.rotation.y;
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.position.set(spots[i][0], h + 0.03, spots[i][1]);
    group.add(stack, wrap, coin);
  }
  group.position.set(x, 0, z);
  scene.add(group);
  moneyPile = { group, x, z };
}

function clearPile() {
  if (!moneyPile) return;
  scene.remove(moneyPile.group);
  disposeSceneObject(moneyPile.group, new Set([coinMat]), new Set([coinGeo]));
  moneyPile = null;
}

function burst(x, y, z, material) {
  for (let i = 0; i < 7; i += 1) {
    if (sparks.length > 90) {
      const old = sparks.shift();
      scene.remove(old.mesh);
    }
    const mesh = new THREE.Mesh(sparkGeo, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(mesh);
    sparks.push({
      mesh,
      vx: (Math.random() - 0.5) * 7,
      vy: 1.5 + Math.random() * 4,
      vz: (Math.random() - 0.5) * 7,
      life: 0.28 + Math.random() * 0.12,
    });
  }
}

function updateBars() {
  ui.youHp.textContent = String(Math.max(0, Math.ceil(player.hp)));
  ui.foeHp.textContent = String(Math.max(0, Math.ceil(enemy.hp)));
  ui.youBar.style.width = `${Math.max(0, player.hp)}%`;
  ui.foeBar.style.width = `${Math.max(0, (enemy.hp / (enemy.maxHp || 100)) * 100)}%`;
  ui.youBar.style.background = player.hp < 35 ? "#ff5a1f" : "#d8b57c";
  for (const enemy of enemies) {
    if (!enemy.view || !enemy.view.barCtx) continue;
    const ctx = enemy.view.barCtx;
    const pct = Math.max(0, enemy.hp) / (enemy.maxHp || 100);
    ctx.clearRect(0, 0, 128, 16);
    ctx.fillStyle = "rgba(10, 8, 6, 0.72)";
    ctx.fillRect(0, 2, 128, 12);
    ctx.fillStyle = "#ff5a1f";
    ctx.fillRect(2, 4, 124 * pct, 8);
    enemy.view.barTex.needsUpdate = true;
    enemy.view.barSprite.visible = state === "playing" && enemy.hp > 0;
    enemy.view.nameplate.visible = enemy.hp > 0;
  }
}

function showBanner(text, seconds) {
  ui.banner.textContent = text;
  ui.banner.hidden = false;
  bannerT = seconds;
}

function placeFighter(view, ent) {
  view.group.position.set(ent.x, 0, ent.z);
  view.group.rotation.order = "YXZ";
  view.group.rotation.set(0, ent.yaw, 0);
  view.faceCamera(camera, ent.yaw, ent.fall || 0);
}

function tryMove(ent, dx, dz, radius, who) {
  ent.x += dx;
  if (blocked(ent.x, ent.z, radius, who)) ent.x -= dx;
  ent.z += dz;
  if (blocked(ent.x, ent.z, radius, who)) ent.z -= dz;
}

function insideWalkable(x, z) {
  return walkTiles.some(tile => Math.abs(x - tile.x) <= TILE / 2 && Math.abs(z - tile.z) <= TILE / 2);
}

function staticBlocked(x, z, radius) {
  return !insideWalkable(x, z) || boxes.some(box => circleHitsBox(x, z, radius, box));
}

function blocked(x, z, radius, who) {
  if (staticBlocked(x, z, radius)) return true;
  if (who !== "player" && Math.hypot(x - player.x, z - player.z) < radius + PLAYER_R) return true;
  return enemies.some(foe => foe !== who && foe.hp > 0 && Math.hypot(x - foe.x, z - foe.z) < radius + ENEMY_R);
}

// A shared distance field routes the squad around buildings instead of into walls.
function navKey(x, z) { return `${x},${z}`; }
function buildNavigation() {
  navNodes = new Map();
  for (let z = -mapHalfZ + NAV_STEP / 2; z < mapHalfZ; z += NAV_STEP) {
    for (let x = -arenaHalf + NAV_STEP / 2; x < arenaHalf; x += NAV_STEP) {
      if (!staticBlocked(x, z, ENEMY_R + .02)) navNodes.set(navKey(x, z), { x, z, distance: Infinity, neighbors: [] });
    }
  }
  for (const node of navNodes.values()) {
    for (const [dx, dz] of [[NAV_STEP, 0], [-NAV_STEP, 0], [0, NAV_STEP], [0, -NAV_STEP]]) {
      const next = navNodes.get(navKey(node.x + dx, node.z + dz));
      if (next && !staticBlocked(node.x + dx / 2, node.z + dz / 2, ENEMY_R + .02)) node.neighbors.push(next);
    }
  }
}
function nearestNavPoint(x, z) {
  let closest, distance = Infinity;
  for (const node of navNodes.values()) {
    const d = Math.hypot(node.x - x, node.z - z);
    if (d < distance) { closest = node; distance = d; }
  }
  return closest;
}
function updateNavigation() {
  for (const node of navNodes.values()) node.distance = Infinity;
  const start = nearestNavPoint(player.x, player.z);
  start.distance = 0;
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    for (const next of queue[i].neighbors) {
      if (next.distance !== Infinity) continue;
      next.distance = queue[i].distance + 1; queue.push(next);
    }
  }
}
function navigationWaypoint(foe) {
  if (foe.detour?.length) {
    while (foe.detour.length && Math.hypot(foe.x - foe.detour[0].x, foe.z - foe.detour[0].z) < .22) foe.detour.shift();
    if (foe.detour.length) { foe.waypoint = foe.detour[0]; return foe.waypoint; }
  }
  // Keep the destination until reached, so nearest-cell changes cannot reverse a step.
  if (foe.waypoint) {
    const remaining = Math.hypot(foe.x - foe.waypoint.x, foe.z - foe.waypoint.z);
    if (remaining > .22 && remaining < NAV_STEP * 2) return foe.waypoint;
  }
  const node = nearestNavPoint(foe.x, foe.z);
  let best = node;
  if (Math.hypot(foe.x - node.x, foe.z - node.z) < .65) {
    for (const next of node.neighbors) if (next.distance < best.distance) best = next;
  }
  foe.waypoint = best;
  return best;
}

// Short local paths can step back and go around a stationary ally at a doorway.
// The shared distance field still supplies the goal; this is only used when blocked.
function routeAroundAllies(foe) {
  const start = nearestNavPoint(foe.x, foe.z), queue = [start], parent = new Map([[start, null]]);
  for (let cursor = 0; cursor < queue.length && cursor < 120; cursor++) {
    const node = queue[cursor];
    if (node !== start && node.distance < start.distance) {
      const path = [];
      for (let step = node; step !== start; step = parent.get(step)) path.unshift(step);
      foe.detour = path; foe.waypoint = path[0]; return;
    }
    for (const next of node.neighbors) {
      if (parent.has(next)) continue;
      const from = node === start ? foe : node;
      const dx = next.x - from.x, dz = next.z - from.z, lengthSq = dx * dx + dz * dz;
      let open = true;
      if (node === start) for (let sample = 1; sample <= 8; sample++) {
        if (staticBlocked(from.x + dx * sample / 8, from.z + dz * sample / 8, ENEMY_R)) { open = false; break; }
      }
      if (!open) continue;
      for (const other of enemies) {
        if (other === foe || other.hp <= 0) continue;
        const t = Math.max(0, Math.min(1, ((other.x - from.x) * dx + (other.z - from.z) * dz) / (lengthSq || 1)));
        const closest = Math.hypot(other.x - from.x - dx * t, other.z - from.z - dz * t);
        const initial = Math.hypot(other.x - from.x, other.z - from.z);
        if (closest < ENEMY_R * 2 + .04 && closest < initial - .001) { open = false; break; }
      }
      if (open) { parent.set(next, node); queue.push(next); }
    }
  }
}

function circleHitsBox(x, z, radius, box) {
  const cx = Math.max(box.minX, Math.min(x, box.maxX));
  const cz = Math.max(box.minZ, Math.min(z, box.maxZ));
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < radius * radius;
}

function outsideArena(bullet) {
  return !insideWalkable(bullet.x, bullet.z);
}

function hitsPile(bullet) {
  if (!moneyPile) return false;
  return bullet.y < 1.35 && Math.hypot(bullet.x - moneyPile.x, bullet.z - moneyPile.z) < 1.05;
}

function hitsBox(bullet) {
  for (let i = 0; i < boxes.length; i += 1) {
    const box = boxes[i];
    if (bullet.x >= box.minX && bullet.x <= box.maxX
      && bullet.z >= box.minZ && bullet.z <= box.maxZ
      && bullet.y >= box.minY && bullet.y <= box.maxY) {
      return true;
    }
  }
  return false;
}

function hasLineOfSight(enemy) {
  losOrigin.set(enemy.x, 1.45, enemy.z);
  losDir.set(player.x - enemy.x, 1.62 - crouch * 0.56 - 1.45, player.z - enemy.z);
  const dist = losDir.length();
  if (dist < 0.001) return true;
  losDir.multiplyScalar(1 / dist);
  raycaster.set(losOrigin, losDir);
  raycaster.far = dist;
  return raycaster.intersectObjects(blockers, false).length === 0;
}

function forwardFromYaw(yaw, out) {
  out.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  return out;
}

function rightFromYaw(yaw, out) {
  out.set(Math.cos(yaw), 0, -Math.sin(yaw));
  return out;
}

function lookDirection(out) {
  const cosPitch = Math.cos(player.pitch);
  out.set(
    -Math.sin(player.yaw) * cosPitch,
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * cosPitch
  );
  return out;
}

function yawFromDirection(dx, dz) {
  return Math.atan2(-dx, -dz);
}

function angleDelta(from, to) {
  let delta = to - from;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function clearGroup(list) {
  for (let i = 0; i < list.length; i += 1) scene.remove(list[i].mesh);
  list.length = 0;
}

function resize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function audio() {
  if (!soundEnabled) return;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type, vol, slideTo) {
  if (!soundEnabled) return;
  try {
    const ctx = audio();
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, freq), t0);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    }
    gain.gain.setValueAtTime(Math.max(vol, 0.0001), t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch (err) {
    /* Audio can fail before a user gesture. The duel still runs. */
  }
}

function noiseBurst(dur, vol) {
  if (!soundEnabled) return;
  try {
    const ctx = audio();
    const length = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 700;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  } catch (err) {
    /* ignore */
  }
}

function playShot(isPlayer) {
  if (isPlayer) {
    const tier = currentWeapon();
    noiseBurst(0.05 + tier.level * 0.005, 0.18 + tier.level * 0.012);
    tone(tier.shotPitch, 0.07, "square", 0.04, 70);
  } else {
    noiseBurst(0.07, 0.14);
    tone(130, 0.1, "sawtooth", 0.04, 48);
  }
}

function currentWeapon() {
  return WEAPON_TIERS[weaponTierIndex];
}

function loadHighScore() {
  try {
    const saved = Number.parseInt(localStorage.getItem("pit_highscore") || "0", 10);
    return Number.isFinite(saved) ? Math.max(0, saved) : 0;
  } catch (err) {
    return 0;
  }
}

function saveHighScore() {
  try {
    localStorage.setItem("pit_highscore", String(highScore));
  } catch (err) {
    /* Storage can be unavailable in private browsing. */
  }
}

function resetRunProgress() {
  score = 0;
  combo = 0;
  maxCombo = 0;
  comboTimer = 0;
  applyWeaponTier(0, false);
  updateScoreHud();
}

function registerHit(headshot) {
  combo = comboTimer > 0 ? combo + 1 : 1;
  comboTimer = COMBO_WINDOW;
  maxCombo = Math.max(maxCombo, combo);
  const multiplier = Math.min(combo, 3);
  const points = (headshot ? 175 : 100) * multiplier;
  addScore(points, headshot ? "HEADSHOT" : "HIT", headshot);
  updateComboHud();
}

function resetCombo() {
  combo = 0;
  comboTimer = 0;
  updateComboHud();
}

function updateComboHud() {
  if (!ui.combo) return;
  ui.combo.hidden = combo < 2;
  ui.combo.textContent = `x${combo} COMBO`;
}

function addScore(points, label, critical = false) {
  const awarded = Math.max(0, Math.round(points));
  score += awarded;
  showScorePopup(`${label} +${awarded}`, critical ? "critical" : "");

  let nextTier = weaponTierIndex;
  while (nextTier + 1 < WEAPON_TIERS.length
    && score >= WEAPON_TIERS[nextTier + 1].minScore) {
    nextTier += 1;
  }
  if (nextTier !== weaponTierIndex) applyWeaponTier(nextTier, true);
  updateScoreHud();
}

function applyWeaponTier(index, announce) {
  weaponTierIndex = Math.max(0, Math.min(WEAPON_TIERS.length - 1, index));
  rebuildWeapon();
  ammo = MAGAZINES[weaponTierIndex];
  reserve = Math.max(96, ammo * 6);
  reloadTime = 0;
  updateScoreHud();
  if (!announce) return;
  const tier = currentWeapon();
  showScorePopup(`LVL ${tier.level} ${tier.name}`, "upgrade");
  showBanner(`WEAPON UPGRADE — ${tier.name}`, 1.15);
  tone(tier.shotPitch, 0.1, "square", 0.05);
  window.setTimeout(() => tone(tier.shotPitch * 1.5, 0.16, "square", 0.045), 100);
}

function updateScoreHud() {
  if (!ui.score) return;
  const tier = currentWeapon();
  const next = WEAPON_TIERS[weaponTierIndex + 1];
  ui.score.textContent = String(score);
  ui.weaponLevel.textContent = `LVL ${tier.level}`;
  ui.weaponName.textContent = tier.name;
  ui.weaponLevel.style.background = tier.bulletHex;
  ui.weaponProgress.style.background = tier.bulletHex;
  const progress = next
    ? (score - tier.minScore) / (next.minScore - tier.minScore)
    : 1;
  ui.weaponProgress.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
}

function showScorePopup(text, kind) {
  if (!ui.scorePopups) return;
  const popup = document.createElement("div");
  popup.className = `score-pop${kind ? ` ${kind}` : ""}`;
  popup.textContent = text;
  popup.style.left = `${50 + (Math.random() - 0.5) * 12}%`;
  popup.style.top = `${47 + (Math.random() - 0.5) * 8}%`;
  ui.scorePopups.appendChild(popup);
  window.setTimeout(() => popup.remove(), 900);
}

function finishScore() {
  if (score > highScore) {
    highScore = score;
    saveHighScore();
  }
  ui.endScore.textContent = String(score);
  ui.endHighScore.textContent = String(highScore);
  ui.endWeaponTier.textContent = `LVL ${currentWeapon().level}`;
  ui.endMaxCombo.textContent = `x${maxCombo}`;
}

function lockPointer() {
  const request = renderer.domElement.requestPointerLock();
  if (request && request.catch) request.catch(() => syncAimHint());
}

function startReload() {
  if (state !== "playing" && state !== "loot") return;
  if (document.pointerLockElement !== renderer.domElement || reloadTime > 0 || ammo === MAGAZINES[weaponTierIndex] || reserve <= 0) return;
  reloadTime = 2.1;
  firing = false;
  tone(240, 0.08, "square", 0.025);
}

function updateTacticalHud() {
  document.getElementById("round-timer").textContent = `${Math.floor(Math.ceil(roundTime) / 60)}:${String(Math.ceil(roundTime) % 60).padStart(2, "0")}`;
  document.getElementById("round-timer").classList.toggle("urgent", roundTime < 20);
  document.getElementById("ammo-count").textContent = ammo;
  document.getElementById("reserve-count").textContent = reserve;
  document.getElementById("ammo-weapon").textContent = currentWeapon().name;
  document.getElementById("reload-status").hidden = reloadTime <= 0;
  document.getElementById("reload-status").textContent = `RELOADING ${Math.ceil(reloadTime * 10) / 10}s`;
  document.querySelector(".ammo-panel").classList.toggle("low-ammo", ammo < 4);
  document.getElementById("movement-status").textContent = crouch > 0.5 ? "CROUCHED / PRECISION" : player.speed > 0.5 ? (keys.has("ShiftLeft") || keys.has("ShiftRight") ? "WALKING" : "MOVING / LOW ACCURACY") : "STANDING / PRECISION";
  ui.crosshair.style.width = `${22 + player.speed * 2 + recoil * 4}px`;
  ui.crosshair.style.height = `${22 + player.speed * 2 + recoil * 4}px`;
  const remaining = enemies.filter(foe => foe.hp > 0).length;
  document.getElementById("enemy-count").textContent = `${remaining} / ${enemies.length} HOSTILES`;
  drawRadar();
}

function drawRadar() {
  const ctx = radarCtx, size = 180, scale = 164 / (Math.max(arenaHalf, mapHalfZ) * 2);
  const coord = v => 90 + v * scale;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(15, 22, 25, 0.85)"; ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(204, 215, 209, 0.07)"; ctx.lineWidth = 1;
  for (let i = 10; i <= 170; i += 20) {
    ctx.beginPath(); ctx.moveTo(i, 8); ctx.lineTo(i, 172); ctx.moveTo(8, i); ctx.lineTo(172, i); ctx.stroke();
  }
  ctx.fillStyle = "#303d40";
  for (const tile of walkTiles) ctx.fillRect(coord(tile.x - TILE / 2), coord(tile.z - TILE / 2), TILE * scale, TILE * scale);
  ctx.fillStyle = "#616761";
  for (const box of boxes) ctx.fillRect(coord(box.minX), coord(box.minZ), (box.maxX - box.minX) * scale, (box.maxZ - box.minZ) * scale);
  ctx.fillStyle = "#d8b57c"; ctx.font = "bold 14px sans-serif"; ctx.fillText("A", 20, 30);
  for (const foe of enemies) {
    if (state !== "playing" || foe.hp <= 0 || !hasLineOfSight(foe)) continue;
    ctx.fillStyle = foe.isBoss ? "#ffd17c" : "#ff765e";
    ctx.beginPath(); ctx.arc(coord(foe.x), coord(foe.z), foe.isBoss ? 4 : 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.save(); ctx.translate(coord(player.x), coord(player.z)); ctx.rotate(-player.yaw);
  ctx.fillStyle = "rgba(139, 202, 224, 0.14)"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 32, -Math.PI * 0.72, -Math.PI * 0.28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#a8dcee"; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 5); ctx.lineTo(0, 3); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.restore();
}

function decorateCompound(level) {
  const stone = new THREE.MeshStandardMaterial({ color: 0xb6a17a, roughness: 0.94 });
  const pale = new THREE.MeshStandardMaterial({ color: 0xd4c5a4, roughness: 1 });
  const blue = new THREE.MeshStandardMaterial({ color: level.accent, roughness: 0.86 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x333b3b, roughness: 0.9 });
  const terracotta = new THREE.MeshStandardMaterial({ color: 0xa26e4f, roughness: 0.95 });
  const box = (w, h, d, x, y, z, mat) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; mapRoot.add(mesh); return mesh;
  };
  const edge = arenaHalf, north = mapHalfZ;
  // Facades sit on the perimeter, so their details do not obstruct movement.
  for (let i = -1; i <= 1; i++) {
    const x = i * (edge * 0.64), height = 8.5 + (i + 1) * 1.4;
    box(edge * 0.59, height, 2.5, x, height / 2, -north - 1.5, i === 0 ? pale : stone);
    box(edge * 0.61, 0.22, 2.8, x, height, -north - 1.5, pale);
    for (let row = 0; row < 2; row++) {
      for (let col = -1; col <= 1; col++) {
        const wx = x + col * 1.8, wy = 4.5 + row * 2.7;
        box(1.15, 1.55, 0.12, wx, wy, -north + 0.04, blue);
        box(1.3, 0.12, 0.3, wx, wy - 0.8, -north + 0.15, pale);
        box(0.055, 1.55, 0.16, wx, wy, -north + 0.12, dark);
      }
    }
  }
  for (const side of [-1, 1]) {
    box(2.5, 10, edge * 2, side * (edge + 1.5), 5, 0, side < 0 ? pale : stone);
    for (let z = -edge + 3; z < edge; z += 4) {
      box(0.12, 1.5, 1.15, side * (edge - 0.04), 5.3, z, blue);
      box(0.18, 0.12, 1.3, side * (edge - 0.1), 4.5, z, pale);
      box(0.3, 6.5, 0.28, side * (edge - 0.18), 3.25, z + 1.7, terracotta);
    }
  }
  // A recessed doorway and stone surround form the central landmark.
  box(3.5, 3.7, 0.13, 0, 1.85, -north + 0.02, dark);
  box(0.4, 4.1, 0.35, -1.95, 2.05, -north + 0.15, pale);
  box(0.4, 4.1, 0.35, 1.95, 2.05, -north + 0.15, pale);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.2, 6, 24, Math.PI), pale);
  arch.position.set(0, 4.0, -north + 0.15); mapRoot.add(arch);
  // Painted site stencil, created locally without external assets.
  const sign = document.createElement("canvas"); sign.width = 512; sign.height = 256;
  const ctx = sign.getContext("2d");
  ctx.fillStyle = "#182126"; ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = "#f4d58b"; ctx.font = "bold 48px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("BOSS COURT", 256, 82);
  ctx.font = "bold 29px sans-serif"; ctx.fillStyle = "#e8e3d5";
  ctx.fillText(level.short.toUpperCase(), 256, 145);
  ctx.font = "22px sans-serif"; ctx.fillText(`${level.acolytes} ACOLYTES / CLEAR ALL HOSTILES`, 256, 203);
  const texture = new THREE.CanvasTexture(sign); texture.colorSpace = THREE.SRGBColorSpace;
  const stencil = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.1), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
  stencil.position.set(0, 3.7, -north + 0.24); mapRoot.add(stencil);
  const site = new THREE.Mesh(new THREE.RingGeometry(2, 2.05, 4), new THREE.MeshBasicMaterial({color: 0xa85f36, side: THREE.DoubleSide}));
  site.rotation.x = -Math.PI / 2; site.rotation.z = Math.PI / 4; site.position.set(0, 0.03, -north + 4); mapRoot.add(site);
  // Wooden slats and shipping straps give existing collision cover a readable silhouette.
  for (const [x, z, w, d, h] of level.covers) {
    for (const y of [0.12, h - 0.12]) box(w + 0.05, 0.12, d + 0.05, x, y, z, stone);
    for (const offset of [-0.3, 0.3]) box(0.09, h + 0.04, d + 0.07, x + w * offset, h / 2, z, dark);
  }
}
