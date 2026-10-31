import * as THREE from "three";

export const ACOLYTE_ROSTER = [
  { name: "Arthur Lira", id: 160541, sprite: "arthur-lira" },
  { name: "Rodrigo Maia", id: 74693, sprite: "rodrigo-maia" },
  { name: "Kim Kataguiri", id: 204536, sprite: "kim-kataguiri" },
  { name: "Tabata Amaral", id: 204534, sprite: "tabata-amaral" },
  { name: "Aguinaldo Ribeiro", id: 160527, sprite: "aguinaldo-ribeiro" },
  { name: "André Ferreira", id: 204423, sprite: "andre-ferreira" },
  { name: "Abilio Brunini", id: 220593, sprite: "abilio-brunini" },
];
export const CHARACTER_ART = ["gilmar", "toffoli", "bolsonaro", "moraes", "lula", ...ACOLYTE_ROSTER.map(p => p.sprite)];
const art = new Map();
const COLS = 4, ROWS = 2, CELL_W = 320, CELL_H = 640;

// Keep the largest connected silhouette. This removes isolated generation specks without
// cutting clothing, hands or antialiased edges out of the character.
export function measureFrame(pixels, width, height) {
  const labels = new Int32Array(width * height), queue = new Int32Array(width * height);
  let label = 0, largest = 0, area = 0;
  for (let start = 0; start < labels.length; start++) {
    if (labels[start] || pixels[start * 4 + 3] < 96) continue;
    label++; labels[start] = label; queue[0] = start;
    let end = 1;
    for (let cursor = 0; cursor < end; cursor++) {
      const p = queue[cursor], x = p % width, y = Math.floor(p / width);
      for (const next of [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, y > 0 ? p - width : -1, y < height - 1 ? p + width : -1]) {
        if (next < 0 || labels[next] || pixels[next * 4 + 3] < 96) continue;
        labels[next] = label; queue[end++] = next;
      }
    }
    if (end > area) { largest = label; area = end; }
  }
  if (!area) return { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1, headX: width / 2 };
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let p = 0; p < labels.length; p++) {
    if (labels[p] !== largest) continue;
    const x = p % width, y = Math.floor(p / width);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  let headSum = 0, headCount = 0;
  for (let y = minY; y < minY + (maxY - minY) * .12; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (labels[y * width + x] === largest) { headSum += x; headCount++; }
    }
  }
  for (let p = 0; p < labels.length; p++) {
    if (labels[p] === largest) continue;
    const x = p % width, y = Math.floor(p / width);
    const adjacent = (x > 0 && labels[p - 1] === largest) || (x < width - 1 && labels[p + 1] === largest)
      || (y > 0 && labels[p - width] === largest) || (y < height - 1 && labels[p + width] === largest);
    if (!adjacent) pixels[p * 4 + 3] = 0;
  }
  return { minX, minY, maxX, maxY, headX: headCount ? headSum / headCount : (minX + maxX) / 2 };
}

function normalizeAtlas(image) {
  const frames = [];
  let maxHeight = 0, left = 0, right = 0;
  for (let frame = 0; frame < 8; frame++) {
    // Rounded boundaries also handle atlases whose dimensions are not multiples of four.
    const x = Math.round(frame % COLS * image.width / COLS), y = Math.round(Math.floor(frame / COLS) * image.height / ROWS);
    const w = Math.round((frame % COLS + 1) * image.width / COLS) - x;
    const h = Math.round((Math.floor(frame / COLS) + 1) * image.height / ROWS) - y;
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h), bounds = measureFrame(data.data, w, h);
    ctx.putImageData(data, 0, 0);
    frames.push({ canvas, ...bounds });
    maxHeight = Math.max(maxHeight, bounds.maxY - bounds.minY + 1);
    left = Math.max(left, bounds.headX - bounds.minX); right = Math.max(right, bounds.maxX - bounds.headX);
  }
  const scale = Math.min((CELL_H - 32) / maxHeight, (CELL_W / 2 - 8) / Math.max(left, right));
  const atlas = document.createElement("canvas"); atlas.width = CELL_W * COLS; atlas.height = CELL_H * ROWS;
  const ctx = atlas.getContext("2d"); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  frames.forEach((frame, i) => {
    const x = i % COLS * CELL_W + CELL_W / 2 - frame.headX * scale;
    const y = Math.floor(i / COLS) * CELL_H + CELL_H - 8 - (frame.maxY + 1) * scale;
    ctx.drawImage(frame.canvas, x, y, frame.canvas.width * scale, frame.canvas.height * scale);
  });
  const texture = new THREE.CanvasTexture(atlas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false; texture.minFilter = texture.magFilter = THREE.LinearFilter;
  return { texture, frames: frames.map(({ canvas, ...bounds }) => bounds), scale };
}

export async function preloadCharacterArt() {
  await Promise.all(CHARACTER_ART.map(key => new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(`./assets/characters/${key}-walk.png`, source => {
      try {
        const normalized = normalizeAtlas(source.image); source.dispose();
        art.set(key, normalized); resolve();
      } catch (error) { reject(error); }
    }, undefined, () => reject(new Error(`Could not load character art: ${key}`)));
  })));
}

export function buildHuman({ look = {} } = {}) {
  const key = look.face || look.sprite || "arthur-lira", asset = art.get(key);
  if (!asset) throw new Error(`Character art was not preloaded: ${key}`);
  const group = new THREE.Group(), body = new THREE.Group(), billboard = new THREE.Group();
  group.add(billboard); billboard.add(body);
  const texture = asset.texture.clone(); texture.needsUpdate = true;
  const armor = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .38,
    depthWrite: true, side: THREE.DoubleSide, toneMapped: false });
  // The full rendered actor preserves the face and clothing; no primitive head or limbs.
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1, 2), armor);
  face.position.y = .985; body.add(face);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.25, 24), new THREE.MeshBasicMaterial({
    color: 0x15130f, transparent: true, opacity: .18, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.scale.y = .7; shadow.position.y = .015;
  shadow.raycast = () => {}; group.add(shadow);
  const muzzle = new THREE.Mesh(new THREE.PlaneGeometry(.12, .12), new THREE.MeshBasicMaterial({
    color: 0xffd28a, transparent: true, opacity: .9, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  muzzle.position.set(.28, 1.04, .025); muzzle.rotation.z = Math.PI / 4; muzzle.visible = false; muzzle.raycast = () => {}; body.add(muzzle);
  const view = { group, body, billboard, face, armor, texture, shadow, muzzle, bulk: 1, key, frame: -1,
    movement: 0, death: 0, originalFrames: asset.frames, normalizedScale: asset.scale };
  setFrame(view, 0);
  view.faceCamera = (camera, yaw, fall = 0) => {
    const angle = Math.atan2(camera.position.x - group.position.x, camera.position.z - group.position.z);
    billboard.rotation.y = angle - yaw;
    view.death = fall;
    body.rotation.z = -fall * .65;
    body.position.y = -fall * .22;
    armor.opacity = Math.max(0, 1 - fall / 1.25);
    shadow.material.opacity = .18 * Math.max(0, 1 - fall / 1.25);
  };
  return view;
}

function setFrame(view, frame) {
  frame = ((frame % 8) + 8) % 8;
  if (frame === view.frame) return;
  view.frame = frame;
  // An inset prevents adjacent cells bleeding into the current actor at distance.
  const iw = 1 / (CELL_W * COLS), ih = 1 / (CELL_H * ROWS);
  view.texture.repeat.set(1 / COLS - 2 * iw, 1 / ROWS - 2 * ih);
  view.texture.offset.set(frame % COLS / COLS + iw, 1 - (Math.floor(frame / COLS) + 1) / ROWS + ih);
}

export function animateHuman(view, phase, movement = 0, firing = false, idleTime = 0, backward = false) {
  view.movement = movement;
  const cycle = phase / (Math.PI * 2) * 8;
  setFrame(view, movement > .08 ? Math.floor(backward ? -cycle : cycle) : 0);
  if (!view.death) {
    view.body.scale.y = movement > .08 ? 1 : 1 + Math.sin(idleTime * 2) * .0018;
    view.body.position.z = firing ? -.018 : 0;
  }
  const hit = Math.min(1, view.armor.emissiveIntensity || 0);
  view.armor.color.setRGB(1, 1 - hit * .35, 1 - hit * .35);
}
