# PIT — Tactical Operations

A Three.js shooter with five bosses, politician acolyte squads, and compact street maps. No build step or account is required. The cast uses twelve individual, detailed illustrated sprite sheets in the 3D arenas. Each contains eight walking poses. The three Supreme Court judges wear judicial robes over formal suits; Bolsonaro and Lula wear presidential suits with green-and-yellow sashes.

Choose **View the characters** in the menu for a large animated preview of every likeness. These are camera-facing 2D character sprites, rather than rigged 3D models. Facial features stay intact instead of being stretched over primitive heads. Playback follows distance travelled, stops in a planted stance, and reverses while retreating. Enemies pause their feet to aim before firing. Atlas normalization aligns heads and soles and removes disconnected edge specks. All character images are bundled locally; there are no live portrait requests.

Run from this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 in a desktop browser with WebGL and pointer lock support. Choose a game type, adjust mouse sensitivity, and deploy. Click the arena to capture the mouse; Esc releases it and pauses combat. During active and paused matches, refresh shortcuts (Ctrl/Cmd+R, Ctrl/Cmd+Shift+R, and F5) are suppressed. Modified keys do not trigger weapon reloads or stage changes. Use C to crouch; browser/OS-reserved shortcuts may take precedence over webpage controls.

- **Campaign:** always starts with Gilmar Mendes in Dust Compound and progresses through all five stages in the order below. Boss selection is fixed. Score and weapon upgrades carry to the next stage. Defeat allows a retry of the current stage; finishing the campaign offers a restart from stage one.
- **Single Match:** select any map and any boss independently. The map determines its acolyte count, layout, and timer; the boss retains its own health and combat statistics. Clearing all enemies ends the match immediately. Both victory and defeat offer **Replay this match** and **Change map / boss**.
- While paused, **Change mode / match** returns to setup. Changing the setup starts a fresh run.

| Control | Action |
| --- | --- |
| WASD | Move |
| Mouse / left click | Aim / fire |
| Shift | Walk |
| C or Ctrl | Crouch |
| R | Reload |
| Enter after clearing all enemies | Next sector / final results |

| Zone | Boss | Acolytes | Time |
| --- | --- | --- | --- |
| Dust Compound | Gilmar Mendes | 3 | 2:45 |
| Blue Quarter | Dias Toffoli | 4 | 3:00 |
| Old Market | Jair Bolsonaro | 5 | 3:15 |
| Checkpoint | Alexandre de Moraes | 6 | 3:30 |
| Last Stand | Lula | 7 | 3:45 |

Each map fits within 54 × 42 world units, with its own irregular footprint, connected courtyards, building blocks, side lanes, and flanking loops. Solid walls and crates block movement and shots. Enemies navigate around buildings and spread out near one another. Defeat the boss and every acolyte to secure the sector; the HUD tracks remaining hostiles. The radar shows opponents only with clear line of sight: gold for the boss, red for acolytes.

Standing still improves accuracy. Movement and sustained fire increase spread; firing also raises your aim. Reloading takes 2.1 seconds and consumes reserve ammunition. Each sector starts with full health, a loaded magazine, and at least 96 reserve rounds. Defeating an acolyte restores 6 health and 12 reserve rounds; bosses restore 12 health and 24 rounds, with health capped at 100. Hits, headshots, and combos unlock improved weapons across the run.

Boss hits eject coins and fluttering R$ 100 notes. Defeating a boss produces a larger money shower and leaves a shootable pile of cash. Replaying or changing stages clears old loot.

This remains a solo game with progressive weapon unlocks. Multiplayer, team rounds, bomb objectives, and a purchase economy are not implemented.

Validation:

```sh
node --check game.js
node --check characters.js
node tests/tactical.test.mjs
node tests/character-art.test.mjs
```

The gameplay tests use the actual Three.js scene and geometry with browser API and image-loading stubs. They cover twelve local atlases, frame selection, stationary poses, camera facing, distance-based footsteps, silhouette cleanup, the character preview, boss hit/kill money effects and cleanup, navigation, collisions, gunplay, campaign order, single-match selection and replay, timers, and pause. The art tests decode the actual twelve RGBA PNG files and check all 96 frames for connected, visible, uncropped silhouettes, transparent backgrounds, adequate resolution, and distinct animation artwork. WebGL rendering, browser pointer lock, and subjective facial likeness still need browser/human review.

Character references and portraits:

The original photographs in `faces/` were preserved and used as identity references for the five generated boss sheets. Original sprites were made with the built-in imagegen tool; exact prompts and reference links are recorded in [assets/characters/prompts.json](assets/characters/prompts.json). Final sheets are in `assets/characters/*-walk.png`.

[Counter-Strike 2](https://www.counter-strike.net/cs2) supplied the visual reference for grounded adult proportions, natural weapon handling, and detailed clothing. The [Three.js animation blending example](https://threejs.org/examples/webgl_animation_skinning_blending.html) and [Quaternius Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html) were researched as rigged-model alternatives. No Valve or third-party model assets are redistributed.

Acolyte character references: [Arthur Lira](https://www.camara.leg.br/deputados/160541), [Rodrigo Maia](https://www.camara.leg.br/deputados/74693), [Kim Kataguiri](https://www.camara.leg.br/deputados/204536), [Tabata Amaral](https://www.camara.leg.br/deputados/204534), [Aguinaldo Ribeiro](https://www.camara.leg.br/deputados/160527), [André Ferreira](https://www.camara.leg.br/deputados/204423), and [Abilio Brunini](https://www.camara.leg.br/deputados/220593). The acolyte art is an illustrative interpretation, generated from names and appearance descriptions; it does not incorporate downloaded official photos.
