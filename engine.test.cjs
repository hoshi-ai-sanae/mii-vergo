'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('./engine.js');
function run(seed, actions) {
  let s = E.create(seed);
  for (const a of actions) {
    if (s.phase === 'result') break;
    s = E.next(E.care(s, a));
  }
  return s;
}
for (const seed of Object.keys(E.SEEDS)) {
  test(`${seed}: 水・肥料の連投は枯れる／一度の失敗では枯れない`, () => {
    for (const action of ['water', 'food']) {
      const first = E.care(E.create(seed), action);
      assert.ok(first.health > 0);
      assert.equal(first.outcome, null);
      const s = run(seed, Array(6).fill(action));
      assert.equal(s.outcome, 'withered');
      assert.equal(s.health, 0);
    }
  });
  test(`${seed}: ゲージを観察して適切なお世話をすると元気に開花`, () => {
    let s = E.create(seed);
    while (s.phase !== 'result') {
      const action = s.water < 35 ? 'water' : s.food < 27 ? 'food' : 'observe';
      s = E.next(E.care(s, action));
    }
    assert.equal(s.outcome, 'bright');
    assert.equal(s.day, 6);
    assert.equal(s.stage, 5);
    assert.equal(s.history.length, 6);
  });
  test(`${seed}: しおれから回復／小さな花を咲かせられる`, () => {
    const weak = run(seed, ['water', 'water']);
    assert.ok(weak.health > 0 && weak.health < 50);
    const recovered = E.next(E.care(weak, 'sun'));
    assert.ok(recovered.health > weak.health);
    assert.ok(recovered.water < weak.water);
    const flower = run(seed, ['water', 'water', 'sun', 'observe', 'food', 'water']);
    assert.equal(flower.outcome, 'small');
    assert.equal(flower.stage, 5);
    assert.ok(flower.health > weak.health);
  });
  test(`${seed}: お水を一度もあげないと、最後には枯れる`, () => {
    assert.equal(run(seed, Array(6).fill('observe')).outcome, 'withered');
  });
  test(`${seed}: 1日1回／元データを変更しない／無効な操作を拒否`, () => {
    const original = E.create(seed), copy = JSON.stringify(original);
    const s = E.care(original, 'observe');
    assert.equal(JSON.stringify(original), copy);
    assert.equal(E.care(s, 'water'), s);
    assert.equal(E.care(original, 'bad'), original);
    assert.equal(E.care(original, 'toString'), original);
    assert.equal(E.next(original), original);
    assert.equal(E.next(s).day, 2);
  });
  test(`${seed}: 途中と結果を保存して復元／壊れた記録を拒否`, () => {
    let s = E.create(seed);
    for (let day = 0; day < 6 && s.phase !== 'result'; day++) {
      s = E.care(s, s.water < 35 ? 'water' : s.food < 27 ? 'food' : 'observe');
      assert.deepEqual(E.restore(JSON.parse(JSON.stringify(s))), s);
      s = E.next(s);
      assert.deepEqual(E.restore(JSON.parse(JSON.stringify(s))), s);
    }
    const tampered = JSON.parse(JSON.stringify(s));
    tampered.health = 12345;
    assert.equal(E.restore(tampered).health, s.health);
    assert.equal(E.restore({ ...s, history: Array(7).fill({ action: 'water' }) }), null);
    assert.equal(E.restore({ ...s, seed: 'toString' }), null);
    assert.equal(E.restore({ ...s, phase: 'bad' }), null);
  });
  test(`${seed}: 全4,096通りの6日間を調べ、値の範囲・結果・復元を検証`, () => {
    const outcomes = { bright: 0, small: 0, withered: 0 };
    let inspected = 0;
    for (let code = 0; code < 4096; code++) {
      let s = E.create(seed), n = code;
      for (let day = 0; day < 6 && s.phase !== 'result'; day++) {
        const action = Object.keys(E.ACTIONS)[n % 4];
        n = Math.floor(n / 4);
        s = E.next(E.care(s, action));
        for (const key of ['water', 'food', 'health']) assert.ok(s[key] >= 0 && s[key] <= 100);
      }
      assert.equal(s.phase, 'result');
      assert.deepEqual(E.restore(JSON.parse(JSON.stringify(s))), s);
      outcomes[s.outcome]++; inspected++;
    }
    assert.equal(inspected, 4096);
    for (const n of Object.values(outcomes)) assert.ok(n > 0);
    console.log(seed, outcomes);
  });
}
test('不正な保存データを安全に拒否', () => {
  for (const bad of [null, {}, [], 'test', { version: 2, seed: 'lily' }]) assert.equal(E.restore(bad), null);
});
