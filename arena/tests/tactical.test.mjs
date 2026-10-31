import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../vendor/three.module.js';

// Exercise real scene geometry and game logic without requiring a GPU or browser.
const elements = new Map();
const noop = () => {};
const context2d = new Proxy({ getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) }, { get: (target, key) => key in target ? target[key] : noop });
function element(id = '') {
  return { id, value: ['map-select', 'boss-select'].includes(id) ? '0' : '1', hidden: false, style: {}, dataset: {},
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    getContext: () => context2d, showModal() { this.open = true; }, close() { this.open = false; }, listeners: new Map(), addEventListener(type, callback) { this.listeners.set(type, callback); }, setAttribute: noop, focus: noop,
    appendChild: noop, remove: noop, requestPointerLock() { document.pointerLockElement = this; return Promise.resolve(); } };
}
const document = { getElementById: id => {
  if (!elements.has(id)) elements.set(id, element(id));
  return elements.get(id);
}, createElement: () => element(), querySelector: selector => document.getElementById(selector),
  documentElement: element(), body: element(), addEventListener: noop, pointerLockElement: null,
  exitPointerLock() { this.pointerLockElement = null; } };
const loadedPortraits = [];
class TextureLoader {
  load(url, onLoad) {
    const path = new URL('../' + url, import.meta.url);
    assert.ok(existsSync(path), `local character atlas exists: ${url}`);
    const png = readFileSync(path);
    const texture = new THREE.Texture({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) });
    loadedPortraits.push(url); onLoad?.(texture);
    return texture;
  }
}
class Renderer {
  constructor({ canvas }) { this.domElement = canvas; this.shadowMap = {}; this.capabilities = { getMaxAnisotropy: () => 1 }; }
  setPixelRatio() {} setSize() {} render() {}
}
let randomSeed = Number(process.env.ARENA_TEST_SEED || 9137);
const seededMath = Object.create(Math);
seededMath.random = () => { randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0; return randomSeed / 4294967296; };
const sandbox = vm.createContext({ THREE: { ...THREE, WebGLRenderer: Renderer, TextureLoader }, document,
  window: { innerWidth: 1440, innerHeight: 900, addEventListener: noop, setTimeout: noop },
  localStorage: { getItem: () => '0', setItem: noop }, requestAnimationFrame: noop,
  console, Uint8ClampedArray, Math: seededMath });
const characterSource = (await readFile(new URL('../characters.js', import.meta.url), 'utf8')).replace('import * as THREE from "three";', '').replaceAll('export ', '');
vm.runInContext(characterSource, sandbox);
const source = (await readFile(new URL('../game.js', import.meta.url), 'utf8')).replace('import * as THREE from "three";', '').replace('import { buildHuman, animateHuman, preloadCharacterArt, ACOLYTE_ROSTER } from "./characters.js";', '');
vm.runInContext(source, sandbox);
const run = code => vm.runInContext(code, sandbox);
await new Promise(resolve => setImmediate(resolve));
assert.equal(run('!!scene && !!weapon && !!enemy.view'), true, 'initial scene builds');
assert.ok(run('boxes.length') > 50, 'streets, buildings and cover have collision bounds');
assert.equal(run('enemies.length'), 4, 'first boss has three acolytes');
assert.ok(run('enemy.view.face.isMesh && enemy.view.face.material.map'), 'boss uses its detailed illustrated character atlas');
assert.equal(run('enemy.view.key'), 'gilmar', 'Mendes gets his own likeness, not a generic head');
assert.equal(run('enemy.view.originalFrames.length'), 8, 'eight walking frames per character');
assert.equal(document.getElementById('start').disabled, false, 'deployment is enabled after character assets load');
assert.equal(run('enemies.slice(1).every(e => ACOLYTE_ROSTER.some(p => p.name === e.name))'), true, 'acolytes use researched politicians');
run('soundEnabled = false; startGame();');
assert.equal(run('state'), 'playing');
assert.equal(run('ammo'), 12);
run('playerShoot();');
assert.equal(run('ammo'), 11, 'shooting consumes ammunition');
assert.ok(run('player.pitch') > 0, 'firing produces vertical recoil');
run('startReload(); playerShoot();');
assert.equal(run('ammo'), 11, 'reload prevents shooting');
run('for (let i = 0; i < 43; i++) updatePlayer(0.05);');
assert.equal(run('ammo'), 12, 'reload fills the magazine');
assert.equal(run('reserve'), 95, 'reload consumes only missing rounds');
run('ammo = 0; reserve = 2; startReload(); for (let i = 0; i < 43; i++) updatePlayer(0.05);');
assert.equal(run('ammo'), 2, 'partial reserve reload');
assert.equal(run('reserve'), 0);
run('ammo = 0; startReload(); playerShoot();');
assert.equal(run('ammo'), 0, 'empty reserve never creates ammunition');
run('resetRound(); keys.add("KeyW"); for(let i = 0; i < 10; i++) updatePlayer(0.05);');
const running = run('player.speed');
run('keys.add("ShiftLeft"); for(let i = 0; i < 10; i++) updatePlayer(0.05);');
assert.ok(run('player.speed') < running * .6, 'walk slows movement');
run('keys.add("KeyC"); for(let i = 0; i < 10; i++) updatePlayer(0.05); updateFpsCamera(.05);');
assert.ok(run('camera.position.y') < 1.2, 'crouch lowers the camera');
run('keys.clear(); document.exitPointerLock();');
const before = run('roundTime');
run('frame();');
assert.equal(run('roundTime'), before, 'unlocking the mouse pauses the round');
run('roundTime = 60.5; updateTacticalHud();');
assert.equal(document.getElementById('round-timer').textContent, '1:01', 'clock does not render :60');
run('document.pointerLockElement = renderer.domElement; state = "playing"; enemy.hp = 1; damageEnemy(1.8);');
assert.equal(run('state'), 'playing', 'boss defeat alone does not secure the sector');
assert.equal(run('enemy.hp'), 0);
assert.ok(run('coins.length') >= 39, 'boss hit and defeat both spill coins');
assert.ok(run('banknotes.length') >= 24, 'boss hit and defeat both spill banknotes');
assert.ok(run('!!moneyPile'), 'boss defeat leaves a money pile');
run('beginLoot(); advanceLevel();');
assert.equal(run('levelIndex'), 0, 'cannot skip living acolytes');
run('for (const foe of enemies.slice(1)) { foe.hp = 1; damageEnemy(1.8, foe); }');
assert.equal(run('state'), 'loot', 'every enemy must be defeated');
run('advanceLevel();');
assert.equal(run('levelIndex'), 1);
assert.equal(run('state'), 'playing');
assert.equal(run('roundTime'), 180);
for (let i = 0; i < 5; i++) {
  run(`levelIndex = ${i}; loadMap(currentLevel()); dressEnemy(currentLevel()); resetRound(); state = "playing"; updateTacticalHud(); updateNavigation();`);
  assert.equal(run('enemies.length'), 4 + i, 'squads grow every level');
  assert.equal(run('enemies.filter(e => e.isBoss).length'), 1);
  assert.equal(run('staticBlocked(player.x, player.z, PLAYER_R)'), false, `player spawn is clear on map ${i}`);
  assert.equal(run('enemies.every(e => !staticBlocked(e.x, e.z, ENEMY_R))'), true, `enemy spawns clear on map ${i}`);
  assert.equal(run('new Set(enemies.map(e => `${e.x},${e.z}`)).size'), 4 + i, 'enemy spawns are distinct');
  assert.equal(run('enemies.every(e => Math.hypot(e.x - player.x, e.z - player.z) > 8)'), true, 'safe deployment distance');
  assert.equal(run('[...navNodes.values()].every(n => Number.isFinite(n.distance))'), true, `all routes connected on map ${i}`);
  assert.ok(run('walkTiles.length * TILE * TILE') > (i === 4 ? 1296 : 900), 'expanded playable area');
  assert.equal(run('insideWalkable(24,18)'), false, 'footprint is irregular');
  assert.equal(run('staticBlocked(-3, -6, PLAYER_R)'), true, 'building walls stop player movement');
  assert.equal(run('enemies.every(e => e.view.nameplate && e.view.barSprite)'), true, 'all hostiles have labels and bars');
  assert.equal(document.getElementById('enemy-count').textContent, `${4 + i} / ${4 + i} HOSTILES`);
  // AI must navigate from every spawn without entering solid geometry.
  run('fightDelay = 100; var seen = new Set(); for (let n = 0; n < 800; n++) { if (n % 9 === 0) updateNavigation(); for (const foe of enemies) { updateEnemy(.05, foe); if (hasLineOfSight(foe)) seen.add(foe); } }');
  assert.equal(run('seen.size'), 4 + i, `all enemies can reach a firing angle on map ${i}: ${run("JSON.stringify(enemies.map(e => ({ name: e.name, seen: seen.has(e), x: e.x, z: e.z, waypoint: e.waypoint && [e.waypoint.x,e.waypoint.z] })))")}`);
  assert.equal(run('enemies.every(e => !staticBlocked(e.x, e.z, ENEMY_R - .001))'), true, 'AI respects walls and cover');
  run('var guard = enemies[1]; clearGroup(bullets); player.hp = 100; enemyShoot(guard);');
  assert.equal(run('bullets[0].damage'), 3 + i, 'projectile retains its acolyte damage');
  run('damagePlayer(bullets[0].damage);');
  assert.equal(run('player.hp'), 97 - i, 'acolyte hits use their own damage');
  // A shot on an acolyte should never damage the boss.
  run('clearGroup(bullets); var target = enemies[1]; target.hp = target.maxHp; spawnBullet(target.x, 1.3, target.z, new THREE.Vector3(0,0,0), 0, "player");');
  const bossHp = run('enemy.hp');
  run('updateBullets(.01);');
  assert.ok(run('enemies[1].hp < enemies[1].maxHp'), 'projectile hits acolytes');
  assert.equal(run('enemy.hp'), bossHp, 'boss does not receive acolyte hit');
  // Acolytes-first defeat order must also keep the round alive until the boss falls.
  run('for (const foe of enemies.slice(1)) { foe.hp = 1; damageEnemy(1.8, foe); }');
  assert.equal(run('state'), 'playing');
  run('enemy.hp = 1; damageEnemy(1.8); updateTacticalHud();');
  assert.equal(run('state'), 'loot');
  assert.equal(document.getElementById('enemy-count').textContent, `0 / ${4 + i} HOSTILES`);
}
assert.equal(new Set(loadedPortraits).size, 12, 'five bosses and seven acolytes have local artwork');
assert.equal(loadedPortraits.some(url => url.startsWith('https:')), false, 'character likenesses do not depend on external image hosts');
assert.equal(run('enemy.maxHp'), 150, 'all five maps build and reset');
run('state = "loot"; advanceLevel();');
assert.equal(run('state'), 'ended');
assert.equal(run('cleared'), true, 'final sector completes the operation');
run('startGame(); document.pointerLockElement = renderer.domElement; roundTime = .00001; clock.getDelta = () => .05; frame();');
assert.equal(run('state'), 'ended', 'round timeout ends play');
assert.equal(document.getElementById('end-title').textContent, 'Time expired');
// Campaign selection cannot be bypassed by changing the hidden map/boss fields.
run('returnToMenu(); document.getElementById("map-select").value = "4"; document.getElementById("boss-select").value = "4";');
document.getElementById('mode-campaign').listeners.get('change')();
assert.equal(document.getElementById('single-options').hidden, true);
assert.equal(document.getElementById('campaign-route').hidden, false);
run('levelIndex = 4; startGame();');
assert.equal(run('levelIndex'), 0, 'new campaign always starts at stage one');
for (let stage = 0; stage < 5; stage++) {
  assert.equal(run('levelIndex'), stage);
  assert.equal(run('currentLevel().short'), run(`LEVELS[${stage}].short`));
  run('for (const foe of enemies) { foe.hp = 1; damageEnemy(1.68, foe); }');
  const carriedScore = run('score');
  const carriedTier = run('weaponTierIndex');
  run('advanceLevel();');
  assert.equal(run('score'), carriedScore, 'campaign score carries to next stage');
  assert.equal(run('weaponTierIndex'), carriedTier, 'weapon progression carries to next stage');
}
assert.equal(run('state'), 'ended');
assert.equal(document.getElementById('end-title').textContent, 'Campaign complete');
run('startGame();');
assert.equal(run('levelIndex'), 0, 'campaign completion offers a full restart');
run('returnToMenu();');
document.getElementById('mode-single').listeners.get('change')();
assert.equal(document.getElementById('single-options').hidden, false);
assert.equal(document.getElementById('campaign-route').hidden, true);
document.getElementById('map-select').value = '4';
document.getElementById('map-select').listeners.get('change')();
document.getElementById('boss-select').value = '0';
document.getElementById('boss-select').listeners.get('change')();
document.getElementById('start').listeners.get('click')();
assert.equal(run('levelIndex'), 4, 'single match uses chosen map');
assert.equal(run('enemy.name'), 'Gilmar Mendes', 'single match uses independent boss selection');
assert.equal(run('enemy.maxHp'), 75, 'selected boss retains its own stats');
assert.equal(run('enemies.length'), 8, 'map retains its own acolyte count');
assert.equal(document.getElementById('round-number').textContent, 'SINGLE MATCH / 01');
run('for (const foe of enemies) { foe.hp = 1; damageEnemy(1.68, foe); }');
assert.equal(run('state'), 'ended', 'single match ends immediately after all enemies are defeated');
assert.equal(document.getElementById('end-title').textContent, 'Match secured');
assert.equal(document.getElementById('again').textContent, 'Replay this match');
run('advanceLevel();');
assert.equal(run('levelIndex'), 4, 'single match never advances maps');
document.getElementById('again').listeners.get('click')();
assert.equal(run('state'), 'playing');
assert.equal(run('enemy.name'), 'Gilmar Mendes', 'replay preserves chosen boss');
assert.equal(run('levelIndex'), 4, 'replay preserves chosen map');
run('finishLose();');
assert.equal(document.getElementById('again').textContent, 'Replay this match', 'loss also offers a replay');
document.getElementById('change-match').listeners.get('click')();
assert.equal(run('state'), 'menu', 'change matchup returns to selection');
assert.equal(run('gameMode'), 'single');
// Exercise every independently chosen boss on a different map through the actual UI handlers.
for (let boss = 0; boss < 5; boss++) {
  document.getElementById('map-select').value = String((boss + 2) % 5);
  document.getElementById('boss-select').value = String(boss);
  document.getElementById('boss-select').listeners.get('change')();
  assert.equal(run('currentLevel().short'), run(`LEVELS[${boss}].short`));
  assert.equal(run('currentLevel().name'), run(`LEVELS[${(boss + 2) % 5}].name`));
}
run('startGame(); document.exitPointerLock(); syncAimHint();');
assert.equal(document.getElementById('pause-menu').hidden, false, 'paused game exposes mode/match menu');
document.getElementById('pause-menu').listeners.get('click')();
assert.equal(run('state'), 'menu');
assert.equal(document.getElementById('pause-menu').hidden, true);
// Silhouette cleanup ignores isolated pixels while preserving the connected actor.
run('var pixels = new Uint8ClampedArray(8 * 10 * 4); for (let y = 2; y <= 8; y++) for (let x = 2; x <= 4; x++) pixels[(y * 8 + x) * 4 + 3] = 255; pixels[7 * 4 + 3] = 255; var bounds = measureFrame(pixels, 8, 10);');
assert.equal(run('bounds.minX'), 2);
assert.equal(run('bounds.maxY'), 8);
assert.equal(run('bounds.headX'), 3);
assert.equal(run('pixels[7 * 4 + 3]'), 0, 'isolated generation speck is removed');
assert.equal(run('pixels[(5 * 8 + 3) * 4 + 3]'), 255, 'body silhouette stays intact');
// Character frame selection covers all eight cells and holds a planted pose at rest.
for (let frame = 0; frame < 8; frame++) {
  run(`animateHuman(enemy.view, (${frame} + .1) / 8 * Math.PI * 2, 1);`);
  assert.equal(run('enemy.view.frame'), frame);
  assert.ok(run('enemy.view.texture.offset.x') >= 0);
  assert.ok(run('enemy.view.texture.offset.y') >= 0);
  assert.ok(run('enemy.view.texture.offset.x + enemy.view.texture.repeat.x') <= 1);
  assert.ok(run('enemy.view.texture.offset.y + enemy.view.texture.repeat.y') <= 1);
}
run('animateHuman(enemy.view, 100, 0, false, 10);');
assert.equal(run('enemy.view.frame'), 0, 'stationary characters do not walk in place');
run('camera.position.set(4, 1.6, 8); enemy.view.group.position.set(0,0,0); enemy.view.faceCamera(camera, 1.2);');
assert.ok(Math.abs(run('enemy.view.billboard.rotation.y + 1.2 - Math.atan2(4,8)')) < .00001, 'character faces camera without head texture distortion');
document.getElementById('roster-open').listeners.get('click')();
assert.equal(document.getElementById('roster').open, true, 'character preview opens');
document.getElementById('roster-close').listeners.get('click')();
assert.equal(document.getElementById('roster').open, false);
// New hit volumes follow a human silhouette instead of a broad invisible target cylinder.
run('enemy.x = enemy.z = enemy.yaw = 0;');
assert.equal(run('hitsHuman({x: 0, y: 1.68, z: 0}, enemy)'), true, 'head is hittable at its actual height');
assert.equal(run('hitsHuman({x: .4, y: 1.68, z: 0}, enemy)'), false, 'air beside head is not a hit');
assert.equal(run('hitsHuman({x: 0, y: 2.05, z: 0}, enemy)'), false, 'nameplates are not hit targets');
assert.equal(run('hitsHuman({x: .10, y: .4, z: 0}, enemy)'), true, 'legs are hittable');
assert.equal(run('hitsHuman({x: -.28, y: 1.2, z: -.12}, enemy)'), true, 'bent arms are hittable');
// Movement phase must follow actual ground travel, including a failed movement step.
run('state = "menu"; selectMode("campaign"); startGame(); fightDelay = 100; updateNavigation(); var travelBefore = { x: enemy.x, z: enemy.z, phase: enemy.phase }; updateEnemy(.05, enemy);');
assert.ok(Math.abs(run('(enemy.phase - travelBefore.phase) - Math.hypot(enemy.x - travelBefore.x, enemy.z - travelBefore.z) / 1.35 * Math.PI * 2')) < .000001, 'footsteps track distance instead of a fixed animation speed');
run('enemy.hp = enemy.maxHp; damageEnemy(1.1);');
assert.ok(run('coins.length') > 0, 'nonlethal boss hits spill coins');
assert.ok(run('banknotes.length') > 0, 'nonlethal boss hits spill banknotes');
run('resetRound();');
assert.equal(run('coins.length + banknotes.length'), 0, 'replays clean up flying money');
assert.equal(run('moneyPile'), null, 'replays clean up money piles');
// A stationary ally beside a wall must not trap an approaching actor forever.
run('levelIndex = 2; loadMap(currentLevel()); dressEnemy(currentLevel()); resetRound(); state = "playing"; fightDelay = 100; for (const foe of enemies) foe.hp = 0; var walker = enemies[1], obstruction = enemies[3]; walker.hp = obstruction.hp = 100; walker.x = -3.75; walker.z = 12.649; obstruction.x = -4.731; obstruction.z = 12.847; updateNavigation(); var escaped = false; for (let i = 0; i < 300; i++) { updateEnemy(.05, walker); if (hasLineOfSight(walker)) { escaped = true; break; } }');
assert.equal(run('escaped'), true, 'actor backs out and routes around an ally beside a wall');
assert.equal(run('staticBlocked(walker.x, walker.z, ENEMY_R - .001)'), false, 'detours respect solid walls');
run('levelIndex = 0; loadMap(currentLevel()); dressEnemy(currentLevel()); resetRound(); state = "playing"; fightDelay = 0; for (const foe of enemies.slice(1)) foe.hp = 0; enemy.x = 0; enemy.z = 12; enemy.yaw = Math.PI; enemy.cool = .2; updateEnemy(.05, enemy);');
assert.equal(run('enemy.x'), 0);
assert.equal(run('enemy.z'), 12, 'enemy plants feet while preparing to fire');
assert.equal(run('enemy.view.frame'), 0, 'aiming uses the grounded stationary pose');
run('updateEnemy(.25, enemy);');
assert.ok(run('bullets.length') > 0, 'planted enemy fires after the aiming interval');
// Browser shortcuts must neither navigate away nor trigger gameplay actions.
function pressKey(code, modifiers = {}) {
  let prevented = false;
  run('onKeyDown')({ code, key: code === 'Enter' ? 'Enter' : code, repeat: false,
    preventDefault() { prevented = true; }, ...modifiers });
  return prevented;
}
for (const matchState of ['playing', 'loot']) {
  run(`state = "${matchState}"; reloadTime = 0; ammo = 1; reserve = 12; keys.clear(); document.pointerLockElement = renderer.domElement;`);
  for (const modifiers of [{ ctrlKey: true }, { ctrlKey: true, shiftKey: true }, { metaKey: true }, { metaKey: true, shiftKey: true }]) {
    assert.equal(pressKey('KeyR', modifiers), true, 'refresh shortcut is cancelled');
    assert.equal(run('reloadTime'), 0, 'modified R does not reload the weapon');
  }
  for (const [code, modifiers] of [['F5', {}], ['ArrowLeft', { altKey: true }], ['KeyF', { ctrlKey: true }], ['KeyP', { ctrlKey: true }], ['KeyL', { metaKey: true }], ['Backspace', {}]]) {
    assert.equal(pressKey(code, modifiers), true, 'browser command is cancelled during a match');
  }
  const stage = run('levelIndex');
  assert.equal(pressKey('Enter', { ctrlKey: true }), true);
  assert.equal(run('levelIndex'), stage, 'modified Enter does not advance the campaign');
  assert.equal(run('state'), matchState);
  assert.equal(pressKey('ControlRight', { ctrlKey: true }), true);
  assert.equal(pressKey('KeyW', { ctrlKey: true }), true);
  assert.equal(run('keys.has("ControlRight") && keys.has("KeyW")'), true, 'Ctrl-crouch movement is preserved');
  assert.equal(pressKey('Escape'), false, 'Escape can still pause and release the mouse');
  pressKey('KeyR');
  assert.ok(run('reloadTime') > 0, 'unmodified R still reloads');
}
run('state = "menu"; reloadTime = 0; keys.clear();');
assert.equal(pressKey('KeyR', { ctrlKey: true }), false, 'normal browser shortcuts remain available in setup');
assert.equal(run('reloadTime'), 0);
console.log('Passed: twelve local character sheets, eight-frame playback, stationary pose, camera facing, distance-based footsteps, silhouette cleanup, character preview, boss coin/banknote hit and kill effects, campaign, single match, navigation, gunplay, pause and progression.');
