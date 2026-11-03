const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load() {
  const context = vm.createContext({});
  context.window = context;
  for (const file of ['damage.js', 'scene.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context);
  return context.Scene;
}
const parts = svg => (svg.match(/data-part="/g) || []).length;
const count = (svg, re) => (svg.match(re) || []).length;
const clean = svg => !/undefined|NaN/.test(svg);
const HAZARDS = ['wind', 'quake', 'fire', 'flood', 'snow'];
const MODES = [['foundation', 'sink'], ['foundation', 'wash'], ['walls', 'crumble'], ['walls', 'burn'], ['roof', 'fly'], ['roof', 'burn'], ['roof', 'cave']];

test('the backdrop renders on its own', () => {
  const svg = load().backdrop();
  assert.match(svg, /^<svg/);
  assert.ok(clean(svg));
});

test('every possible house renders cleanly, one part per finished stage', () => {
  const S = load();
  for (let n = 0; n <= 6; n++) {
    for (let code = 0; code < 3 ** n; code++) {
      const picks = Array.from({ length: n }, (_, k) => Math.floor(code / 3 ** k) % 3);
      const svg = S.house({ picks, color: S.colors[code % 6].hex });
      assert.equal(parts(svg), n, String(picks));
      assert.ok(clean(svg), String(picks));
      assert.match(svg, new RegExp(`построено ${n} из 6`));
    }
  }
});

test('the construction site is on until the roof is done, the crane until the end', () => {
  const S = load();
  assert.match(S.house({ picks: [] }), /class="site"/);
  assert.match(S.house({ picks: [1, 1] }), /class="site"/);
  assert.ok(!S.house({ picks: [1, 1, 1] }).includes('class="site"'));
  assert.match(S.house({ picks: [1, 1, 1, 1, 1] }), /class="crane"/);
  assert.ok(!S.house({ picks: [1, 1, 1, 1, 1, 1] }).includes('class="crane"'));
});

test('the favourite colour paints the door', () => {
  const S = load();
  assert.ok(S.house({ picks: [1, 1, 1, 1], color: '#123456' }).includes('#123456'));
  assert.equal(S.colors.length, 6);
  for (const c of S.colors) assert.match(c.hex, /^#[0-9a-f]{6}$/);
});

test('a chosen part is shown as a ghost until it is built', () => {
  const S = load();
  const svg = S.house({ picks: [1], current: { stage: 1, pick: 2, mode: 'ghost' } });
  assert.equal(parts(svg), 2);
  assert.match(svg, /part walls ghost/);
});

test('a part under construction is revealed from the bottom up', () => {
  const S = load();
  const svg = S.house({ picks: [], current: { stage: 0, pick: 1, mode: 'building' }, progress: 0.5 });
  assert.match(svg, /part foundation building" data-part="foundation" clip-path="url\(#reveal\)"/);
  const rect = { dataset: { y: '286', h: '48' }, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
  S.progress({ querySelector: () => rect }, 0.25);
  assert.equal(rect.attrs.height, 12);
  assert.equal(rect.attrs.y, 286 + 36);
  S.progress({ querySelector: () => rect }, 1);
  assert.equal(rect.attrs.height, 48); assert.equal(rect.attrs.y, 286);
  S.progress(null, 1);
});

test('there is no rainbow anywhere, not even in the stained glass', () => {
  const S = load();
  const all = S.backdrop() + S.house({ picks: [2, 2, 2, 2, 2, 2] }) + S.house({ picks: [2, 2, 2, 2, 2, 2], dead: [] });
  assert.ok(!/rainbow|🌈/i.test(all));
  // The five stripes of the old window glass.
  for (const hex of ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff']) assert.ok(!all.includes(hex), hex);
  assert.match(all, /#ffd24a/, 'the mosaic keeps its gold');
});

test('every hazard draws its own weather and renders cleanly', () => {
  const S = load();
  const seen = new Set();
  for (const h of HAZARDS) {
    const svg = S.house({ picks: [1, 1, 1, 1, 1, 1], trial: h });
    assert.match(svg, new RegExp(`class="fg hz-${h}"`));
    assert.ok(clean(svg), h);
    seen.add(svg.slice(svg.indexOf('<g class="house">')));
  }
  assert.equal(seen.size, 5, 'each hazard should look different');
  assert.match(S.house({ picks: [1, 1, 1], trial: 'quake' }), /class="crack"/);
  assert.match(S.house({ picks: [1, 1, 1], trial: 'fire' }), /class="flame/);
  assert.match(S.house({ picks: [1, 1, 1], trial: 'flood' }), /class="water"/);
  assert.match(S.house({ picks: [1, 1, 1], trial: 'snow' }), /class="flake"/);
});

test('the hurricane is a proper storm: dark sky, clouds, heavy rain, lightning and flying leaves', () => {
  const svg = load().house({ picks: [1, 1, 1], trial: 'wind' });
  for (const part of ['class="tint"', 'class="clouds"', 'class="rain heavy"', 'class="bolt b1"', 'class="bolt b2"', 'class="flash"', 'class="gust"', 'class="leaf"', 'leaf twig']) assert.ok(svg.includes(part), part);
  assert.ok(count(svg, /<line /g) >= 60, 'plenty of rain');
});

test('every way a part can break is known and renders, as an animation and as a ruin', () => {
  const S = load();
  const hazardOf = { sink: 'quake', wash: 'flood', crumble: 'wind', burn: 'fire', fly: 'wind', cave: 'snow' };
  for (const [stage, mode] of MODES) {
    assert.equal(S.mode(stage, hazardOf[mode]), mode);
    for (const state of [{ fail: [`${stage}-${mode}`], trial: hazardOf[mode] }, { dead: [`${stage}-${mode}`] }]) {
      for (const picks of [[1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0], [2, 2, 2, 2, 2, 2], [2, 0, 1, 2, 1, 0]]) {
        const svg = S.house({ picks, ...state });
        assert.ok(clean(svg), `${stage}-${mode} ${picks}`);
        assert.equal(parts(svg), 6);
      }
    }
  }
  assert.equal(S.mode('windows', 'wind'), undefined);
});

test('breaking parts are animated, broken ones stay broken', () => {
  const S = load();
  assert.match(S.house({ picks: [1, 1, 1], trial: 'quake', fail: ['foundation-sink'] }), /class="tilt fail sink"/);
  const later = S.house({ picks: [1, 1, 1], dead: ['foundation-sink', 'roof-fly'] });
  assert.match(later, /class="tilt dead sink"/);
  assert.match(later, /class="roofx dead fly"/);
  assert.match(later, /class="body"/);
});

test('a wall falls apart into twelve blocks and leaves a heap made of its own material', () => {
  const S = load();
  const straw = S.house({ picks: [2, 0, 1, 1, 1, 1], trial: 'wind', fail: ['walls-crumble'] });
  assert.equal(count(straw, /class="chunk" style="--dx:[^"]*transform-origin:\d+px \d+px"><use href="#wallart"/g), 12);
  assert.match(straw, /<g id="wallart">/);
  assert.match(straw, /class="body fail crumble"/);
  assert.match(straw, /class="rubble fail crumble"/);
  assert.match(straw, /class="puffs crumble"/);
  assert.ok(!straw.includes('class="soot"'));
  const logs = S.house({ picks: [2, 1, 1, 1, 1, 1], trial: 'fire', fail: ['walls-burn'] });
  assert.equal(count(logs, /<rect class="soot"/g), 12);
  assert.match(logs, /class="rubble fail burn"/);
  assert.match(logs, /class="ember"/);
  assert.match(logs, /class="puff ash"/);
  const heap = svg => svg.slice(svg.indexOf('class="rubble'), svg.indexOf('class="puffs'));
  assert.notEqual(heap(straw), heap(S.house({ picks: [2, 1, 1, 1, 1, 1], trial: 'wind', fail: ['walls-crumble'] })));
  assert.ok(!S.house({ picks: [2, 0, 1, 1, 1, 1], dead: ['walls-crumble'] }).includes('class="puffs'), 'dust settles in the ruin');
});

test('when the walls go the roof comes down with them', () => {
  const S = load();
  assert.match(S.house({ picks: [1, 0, 1], trial: 'wind', fail: ['walls-crumble'] }), /class="top fail drop"><g class="roofx">/);
  assert.match(S.house({ picks: [1, 1, 1], trial: 'fire', fail: ['walls-burn'] }), /class="top fail drop late"/);
  assert.match(S.house({ picks: [1, 0, 1], dead: ['walls-crumble'] }), /class="top dead drop"/);
  const both = S.house({ picks: [1, 0, 0], trial: 'wind', fail: ['walls-crumble', 'roof-fly'] });
  assert.match(both, /class="top fail drop"><g class="roofx fail fly">/);
});

test('a branch roof is torn into five panels and leaves bare rafters', () => {
  const S = load();
  const svg = S.house({ picks: [1, 1, 0, 1, 1, 1], trial: 'wind', fail: ['roof-fly'] });
  assert.equal(count(svg, /<use href="#roofart"/g), 5);
  assert.equal(count(svg, /--op:0/g), 6, 'five panels and the decoration blow away');
  assert.match(svg, /class="rafters"/);
  assert.match(svg, /class="roofx fail fly"/);
});

test('fire burns a roof down to charred rafters and leaves smoke over the ruin', () => {
  const S = load();
  const fail = S.house({ picks: [1, 1, 0, 1, 1, 1], trial: 'fire', fail: ['roof-burn'] });
  assert.match(fail, /class="rafters"/);
  assert.match(fail, /class="burnable"/);
  assert.match(fail, /class="soot" d=/);
  assert.match(fail, /flame onfire/);
  assert.ok(!fail.includes('class="smolder"'));
  assert.match(S.house({ picks: [1, 1, 0, 1, 1, 1], dead: ['roof-burn'] }), /class="smolder"/);
  const safe = S.house({ picks: [2, 2, 2], trial: 'fire' });
  assert.ok(!safe.includes('onfire') && !safe.includes('class="soot"') && !safe.includes('burnable'));
});

test('snow piles on the roof, then pushes a hole through it', () => {
  const S = load();
  assert.match(S.house({ picks: [1, 1, 1], trial: 'snow' }), /class="snowcap"/);
  assert.ok(!S.house({ picks: [1, 1], trial: 'snow' }).includes('snowcap'));
  const cave = S.house({ picks: [1, 1, 0], trial: 'snow', fail: ['roof-cave'] });
  assert.match(cave, /class="roofx fail cave"/);
  assert.match(cave, /class="hole"/);
  assert.match(S.house({ picks: [1, 1, 0], dead: ['roof-cave'] }), /class="hole"/);
  assert.ok(!S.house({ picks: [1, 1, 1] }).includes('class="hole"'));
});

test('an earthquake cracks the house and opens the ground under it', () => {
  const S = load();
  const fail = S.house({ picks: [0, 1, 1], trial: 'quake', fail: ['foundation-sink'] });
  assert.match(fail, /class="cracks"/);
  assert.match(fail, /class="fissure fail"/);
  assert.equal(count(fail, /class="pebble"/g), 10, 'tiles shake loose');
  assert.match(S.house({ picks: [0, 1, 1], dead: ['foundation-sink'] }), /class="fissure dead"/);
  const safe = S.house({ picks: [2, 1, 1], trial: 'quake' });
  assert.ok(!safe.includes('class="cracks"') && !safe.includes('fissure') && !safe.includes('pebble'));
});

test('a flood carries debris, and leaves mud and a water line behind', () => {
  const S = load();
  const flood = S.house({ picks: [0, 1, 1], trial: 'flood', fail: ['foundation-wash'] });
  assert.match(flood, /class="float"/);
  assert.match(flood, /🦆/);
  assert.ok(!flood.includes('class="mud"') && !flood.includes('class="stain"'));
  const after = S.house({ picks: [0, 1, 1], dead: ['foundation-wash'] });
  assert.match(after, /class="mud"/);
  assert.match(after, /class="stain"/);
});
