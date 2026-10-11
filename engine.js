(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GardenEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SEEDS = Object.freeze({
    margaret: { name: 'マーガレット', subtitle: 'まっすぐ、光に向かって', waterLoss: 14, foodLoss: 7, hint: '少し乾いたらお水を。栄養はときどきで大丈夫。' },
    chamomile: { name: 'カモミール', subtitle: 'ほっとする、小さな陽だまり', waterLoss: 16, foodLoss: 6, hint: 'お水を少しよく飲むよ。栄養のあげすぎには気をつけて。' },
    lily: { name: 'すずらん', subtitle: 'そっと、しあわせの鈴を鳴らして', waterLoss: 11, foodLoss: 8, hint: 'お水はゆっくり減るよ。日なたより、ひと休みが好き。' }
  });
  const ACTIONS = Object.freeze({ water: '水をあげる', food: '肥料をあげる', sun: '日なたに置く', observe: '様子を見る' });
  const STAGES = ['種', '芽', '双葉', '葉が増える', 'つぼみ', '開花'];
  const clamp = n => Math.max(0, Math.min(100, n));
  function create(seed) {
    if (!Object.hasOwn(SEEDS, seed)) throw new Error('Unknown seed');
    return { version: 1, seed, day: 1, water: 54, food: 52, health: 76, dryDays: 0, stage: 0, phase: 'care', outcome: null, history: [] };
  }
  function condition(s) {
    if (s.health <= 0) return { label: '枯れてしまった', tone: 'dry', hint: 'たくさんの気づきが、次の花につながるよ。' };
    if (s.water >= 85) return { label: '土がびしょびしょ', tone: 'warning', hint: 'お水はもう十分。日なたで土を乾かしてあげよう。' };
    if (s.food >= 90) return { label: '栄養が多すぎる', tone: 'warning', hint: '肥料はお休み。必要なお水をあげながら、見守ろう。' };
    if (s.water < 25) return { label: 'お水がほしい', tone: 'warning', hint: '土が乾いて、葉っぱが下を向いているよ。お水がほしいみたい。' };
    if (s.food < 25) return { label: '栄養がほしい', tone: 'warning', hint: '葉っぱの色が少し薄いね。肥料をあげると喜びそう。' };
    if (s.health < 50) return { label: '少ししおれている', tone: 'warning', hint: 'まだ回復できるよ。水分と栄養がほどよければ、見守るのもお世話。' };
    if (s.stage === 0) return { label: '種の中で準備中', tone: 'good', hint: '土の水分と栄養は、今ちょうどいいよ。最初はそっと見守るのもおすすめ。' };
    return { label: 'すくすく育っている', tone: 'good', hint: '葉っぱが気持ちよさそう。今の水分と栄養を見て、お世話を選んでね。' };
  }
  function care(state, action) {
    if (state.phase !== 'care' || !Object.hasOwn(ACTIONS, action)) return state;
    const s = { ...state, history: [...state.history] };
    const seed = SEEDS[s.seed];
    const before = { water: s.water, food: s.food, health: s.health };
    if (action === 'water') s.water = clamp(s.water + 44);
    if (action === 'food') s.food = clamp(s.food + 43);
    if (action === 'sun') { s.water = clamp(s.water - 14); s.health = clamp(s.health + (s.seed === 'lily' ? 1 : 5)); }
    if (action === 'observe') s.health = clamp(s.health + 4);
    // Check excess BEFORE overnight consumption: repeated watering must remain harmful.
    const wet = s.water >= 85, rich = s.food >= 90;
    s.water = clamp(s.water - seed.waterLoss);
    s.food = clamp(s.food - seed.foodLoss);
    s.dryDays = s.water < 20 ? s.dryDays + 1 : 0;
    const reasons = [];
    if (wet) { s.health -= 28; reasons.push('お水が多くて、根が苦しそう。明日は土を乾かしてあげよう。'); }
    if (rich) { s.health -= 26; reasons.push('肥料が多すぎて、元気が減ってしまったよ。しばらく肥料はお休み。'); }
    if (s.water < 20) { s.health -= 26 + Math.min(14, (s.dryDays - 1) * 7); reasons.push('土が乾いてしおれてきたよ。次はお水をあげてみよう。'); }
    if (s.food < 16) { s.health -= 10; reasons.push('栄養が足りなくなってきたよ。少し肥料がほしいみたい。'); }
    if (!wet && !rich && s.water >= 20 && s.water <= 80 && s.food >= 16 && s.food < 90) {
      s.health += 10;
      reasons.push(action === 'observe' ? '今日はそっと見守ったよ。根っこが休めて、元気が戻ったね。' : s.health < 50 ? '少し元気を取り戻したよ。この調子で、ちょうどいいお世話を続けよう。' : 'ちょうどいいお世話で、葉っぱがぴんと元気になったよ。');
    }
    s.health = clamp(s.health);
    s.stage = s.health <= 0 ? s.stage : (s.day === 6 ? 5 : Math.min(4, s.day));
    s.history.push({ day: s.day, action, before, after: { water: s.water, food: s.food, health: s.health }, message: reasons.join(' ') });
    s.phase = 'review';
    if (s.health <= 0) s.outcome = 'withered';
    else if (s.day === 6) s.outcome = s.health >= 70 ? 'bright' : 'small';
    return s;
  }
  function next(state) {
    if (state.phase !== 'review') return state;
    return state.outcome ? { ...state, phase: 'result' } : { ...state, day: state.day + 1, phase: 'care' };
  }
  // Reconstruct saved data from validated choices rather than trusting stored numbers.
  function restore(raw) {
    try {
      if (!raw || raw.version !== 1 || !Object.hasOwn(SEEDS, raw.seed) || !Array.isArray(raw.history) || raw.history.length > 6 || !['care', 'review', 'result'].includes(raw.phase)) return null;
      let state = create(raw.seed);
      for (let i = 0; i < raw.history.length; i++) {
        const item = raw.history[i];
        if (!item || state.phase !== 'care' || !Object.hasOwn(ACTIONS, item.action)) return null;
        state = care(state, item.action);
        if (i < raw.history.length - 1) state = next(state);
      }
      if (state.phase !== raw.phase) state = next(state);
      if (state.phase !== raw.phase) return null;
      return state;
    } catch { return null; }
  }
  return { SEEDS, ACTIONS, STAGES, create, care, next, condition, restore };
});
