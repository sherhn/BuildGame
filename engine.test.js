const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('./engine');
const HAZARDS = Object.keys(G.hazards);
const combos = (a, n) => n ? a.flatMap((x, i) => combos(a.slice(i + 1), n - 1).map(c => [x, ...c])) : [[]];
const play = (picks, forecast = ['quake', 'wind', 'fire']) => { const s = G.create(forecast); for (const i of picks) G.pick(s, i); return s; };
// Every house that can legally be built for a forecast, as finished states.
function* houses(forecast, picks = []) {
  const s = { forecast, picks };
  if (G.finished(s)) { yield s; return; }
  for (let i = 0; i < 3; i++) if (G.canPick(s, i)) yield* houses(forecast, [...picks, i]);
}
// The cheapest way to survive a forecast, followed by the given decoration.
function safeHouse(forecast, pretty) {
  let best = null;
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
    let s;
    try { s = play([a, b, c, ...pretty], forecast); } catch { continue; } // too expensive
    if (G.result(s).stars.tough && (!best || G.coins(s) > G.coins(best))) best = s;
  }
  return best;
}

test('six stages, three choices each, half for strength and half for beauty', () => {
  assert.equal(G.stages.length, 6);
  assert.equal(new Set(G.stages.map(s => s.id)).size, 6);
  for (const s of G.stages) { assert.equal(s.options.length, 3, s.id); assert.ok(s.ask && s.options.every(o => o.name && o.icon && o.fact), s.id); }
  assert.deepEqual(G.stages.map(s => s.kind), ['strong', 'strong', 'strong', 'pretty', 'pretty', 'pretty']);
  assert.deepEqual([0, 1, 2].map(G.cost), [1, 2, 3]);
  assert.deepEqual([0, 1, 2].map(G.taps), [3, 4, 5]);
});

test('every fear names a known hazard and has a message; decoration fears nothing', () => {
  for (const s of G.stages) for (const o of s.options) for (const [h, text] of Object.entries(o.fears)) {
    assert.ok(G.hazards[h], `${s.id}/${o.name}: ${h}`);
    assert.ok(text.length > 10);
    assert.equal(s.kind, 'strong', `${s.id} must not break`);
  }
  assert.equal(HAZARDS.length, 5);
  for (const h of HAZARDS) assert.ok(G.targets(h).length > 0, `${h} must test something`);
  assert.deepEqual(G.targets('quake'), ['Фундамент']);
});

test('the purse always lasts to the end: no dead ends and never overspent', () => {
  const walk = (s, seen) => {
    if (G.finished(s)) { assert.ok(G.coins(s) >= 0); return; }
    assert.ok(G.canPick(s, 0), `cheapest choice must stay open after ${s.picks}`);
    seen.n++;
    for (let i = 0; i < 3; i++) if (G.canPick(s, i)) walk({ picks: [...s.picks, i] }, seen);
  };
  const seen = { n: 0 };
  walk({ picks: [] }, seen);
  assert.ok(seen.n > 100);
});

test('an unaffordable pick throws and leaves the house untouched', () => {
  const s = play([2, 2, 2, 2]);
  assert.equal(G.coins(s), 2);
  const before = JSON.stringify(s);
  assert.ok(!G.canPick(s, 2) && !G.canPick(s, 1) && G.canPick(s, 0));
  for (const bad of [2, 1, 3, -1, 0.5]) assert.throws(() => G.pick(s, bad));
  assert.equal(JSON.stringify(s), before);
  G.pick(s, 0); G.pick(s, 0);
  assert.ok(G.finished(s));
  assert.throws(() => G.pick(s, 0));
});

test('choosing the middle everywhere never survives, whatever the forecast', () => {
  for (const forecast of combos(HAZARDS, 3)) {
    assert.ok(!G.result(play([1, 1, 1, 1, 1, 1], forecast)).stars.tough, `middle survived ${forecast}`);
    assert.ok(!G.result(play([0, 0, 0, 0, 0, 0], forecast)).stars.tough, `cheapest survived ${forecast}`);
    assert.ok(!G.result(play([1, 1, 1, 0, 0, 0], forecast)).stars.tough);
  }
});

test('no single choice rescues a stage: every strong stage needs different materials for different forecasts', () => {
  for (const k of [0, 1, 2]) {
    const needs = new Set();
    for (const forecast of G.forecasts) needs.add(G.stages[k].options.findIndex(o => !forecast.some(h => h in o.fears)));
    assert.ok(needs.size >= 2, `${G.stages[k].id} always needs the same choice`);
  }
});

test('every playable forecast has a safe house that still leaves room for the third star', () => {
  assert.ok(G.forecasts.length >= 8);
  for (const f of G.forecasts) {
    assert.equal(f.length, 3); assert.equal(new Set(f).size, 3);
    assert.ok(G.minSafeCost(f) <= G.BUDGET - G.PRETTY_GOAL, String(f));
    assert.ok([...houses(f)].some(h => G.result(h).starCount === 3), `no 3-star house for ${f}`);
  }
});

test('the hurricane is always the finale, the other trials come before it in any order', () => {
  const key = f => [...f].sort().join();
  const playable = new Set(G.forecasts.filter(f => f.includes('wind')).map(key)), seen = new Set(), orders = new Set();
  let n = 1;
  const rng = () => { n = (n * 16807) % 2147483647; return n / 2147483647; };
  for (let i = 0; i < 400; i++) {
    const f = G.draw(rng);
    assert.equal(f[2], G.FINALE); assert.equal(G.FINALE, 'wind');
    assert.ok(playable.has(key(f)), String(f));
    seen.add(key(f)); orders.add(f.join());
  }
  assert.equal(seen.size, playable.size);
  assert.equal(playable.size, 6);
  assert.ok(orders.size > seen.size, 'the first two trials should swap places');
  for (let i = 0; i < 20; i++) assert.equal(G.create().forecast[2], 'wind');
});

test('no rainbows in the game', () => {
  const text = JSON.stringify(G.stages) + JSON.stringify(G.hazards) + JSON.stringify(G.titles);
  assert.ok(!/🌈|радуг/i.test(text));
});

test('a forecast must be three different known hazards', () => {
  for (const bad of [[], ['wind'], ['wind', 'wind', 'fire'], ['wind', 'fire', 'lava'], 'wind', null]) assert.throws(() => G.create(bad), String(bad));
  const s = G.create(['snow', 'wind', 'flood']);
  assert.deepEqual(s.forecast, ['snow', 'wind', 'flood']); assert.deepEqual(s.picks, []);
});

test('each trial breaks only what fears it, in forecast order', () => {
  const s = play([2, 0, 1, 0, 0, 0], ['fire', 'quake', 'snow']);
  const [fire, quake, snow] = G.trials(s);
  assert.deepEqual([fire.hazard, quake.hazard, snow.hazard], ['fire', 'quake', 'snow']);
  assert.deepEqual(fire.fails.map(f => f.stage), ['walls']);
  assert.match(fire.fails[0].text, /Солома/);
  assert.ok(quake.passed && quake.fails.length === 0);
  assert.deepEqual(snow.fails.map(f => f.stage), ['roof']);
});

test('a part that already broke is not broken twice', () => {
  const s = play([2, 0, 0, 0, 0, 0], ['wind', 'fire', 'snow']);
  const [wind, fire, snow] = G.trials(s);
  assert.deepEqual(wind.fails.map(f => f.stage), ['walls', 'roof']);
  assert.ok(fire.fails.length === 0 && fire.already && !fire.passed);
  assert.ok(snow.fails.length === 0 && snow.already);
  assert.deepEqual(G.result(s).broken, ['walls', 'roof']);
});

test('every title can be earned, and so can three stars', () => {
  const seen = new Set(); let perfect = 0;
  for (const f of G.forecasts) for (const s of houses(f)) {
    const r = G.result(s);
    seen.add(r.title);
    assert.ok(G.titles[r.title], r.title);
    assert.equal(r.stars.tough, r.broken.length === 0);
    if (r.starCount === 3) perfect++;
  }
  assert.deepEqual([...seen].sort(), Object.keys(G.titles).sort());
  assert.ok(perfect > 50, 'three stars should be rare but not a needle in a haystack');
});

test('titles match the style of the house', () => {
  const f = ['wind', 'quake', 'flood'];
  const title = (picks, forecast = f) => G.result(play(picks, forecast)).title;
  assert.equal(title([0, 0, 0, 1, 1, 1]), 'straw');
  assert.equal(title([1, 1, 1, 0, 0, 0]), 'wobbly');
  assert.equal(title([2, 2, 2, 0, 0, 0]), 'fortress');
  assert.equal(title([2, 2, 2, 1, 0, 0]), 'fortress');
  assert.equal(G.result(safeHouse(f, [0, 0, 0])).title, 'sturdy');
  assert.equal(G.result(safeHouse(f, [1, 1, 1])).title, 'perfect');
  assert.equal(G.result(safeHouse(f, [2, 1, 1])).title, 'palace');
});

test('stars: built always, tough if nothing broke, pretty from 6 points of decoration', () => {
  const f = ['wind', 'quake', 'flood'];
  const good = G.result(safeHouse(f, [1, 1, 1]));
  assert.deepEqual(good.stars, { built: true, tough: true, pretty: true });
  assert.equal(good.starCount, 3); assert.equal(good.tip, '');
  const plain = G.result(safeHouse(f, [0, 0, 0]));
  assert.deepEqual(plain.stars, { built: true, tough: true, pretty: false });
  assert.match(plain.tip, /дешёвое|красот/);
  const weak = G.result(play([1, 1, 1, 2, 2, 1], f));
  assert.equal(weak.stars.tough, false); assert.equal(weak.stars.pretty, true);
  assert.match(weak.tip, /без красных значков/);
});

test('a result needs a finished house', () => {
  assert.throws(() => G.result(play([1, 1])));
});
