(function () {
  'use strict';
  const E = GardenEngine, A = GardenArt;
  const KEY = 'lumiere-virgo-garden-v1';
  const app = document.getElementById('app');
  const soundButton = document.getElementById('sound');
  const resetDialog = document.getElementById('reset-dialog');
  let state = null, screen = 'home', audio = null, sound = false, bloomPlayed = false;
  const icons = { water: '💧', food: '🌱', sun: '☀️', observe: '👀' };
  const descriptions = { water: '土に、うるおいを', food: '育つ力を、少しだけ', sun: '光をあてて土を乾かす', observe: '何も足さず、ひと休み' };
  const storageNote = text => { document.getElementById('storage-note').textContent = text; };
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      state = E.restore(JSON.parse(saved));
      if (!state) storageNote('前の記録を読み込めませんでした。新しい種から遊べます。');
    }
  } catch { storageNote('このブラウザでは記録を保存できません。ページを開いている間は遊べます。'); }
  function save() {
    try {
      if (state) localStorage.setItem(KEY, JSON.stringify(state));
      else localStorage.removeItem(KEY);
    } catch { storageNote('記録を保存できませんでした。ページを閉じると続きから再開できない場合があります。'); }
  }
  function scene(seed, stage, wilt = false, small = false, message = '', extra = '') {
    return `<div class="scene play-scene ${extra}">${message ? `<p class="speech">${message}</p>` : ''}${A.garden(seed, stage, wilt, small, `${E.SEEDS[seed].name}の${wilt ? 'しおれた' : E.STAGES[stage]}姿`)}<img class="guide" src="assets/virgo-guide.png" width="1254" height="1254" alt="花壇を見守る乙女座のちびキャラ。麦とすずらんの飾りに、白と緑と金の衣装。"><div class="effect-layer" aria-hidden="true"></div></div>`;
  }
  function journal() {
    return `<details class="journal"><summary>お世話の手帳をひらく · ${state.history.length}日分</summary><ol>${state.history.map(h => `<li><strong>${h.day}日目 ${icons[h.action]} ${E.ACTIONS[h.action]}</strong><p>${h.message}</p><span>水分 ${h.after.water} / 栄養 ${h.after.food} / 元気 ${h.after.health}</span></li>`).join('')}</ol></details>`;
  }
  function home() {
    return `<section aria-labelledby="home-title"><div class="hero"><div class="hero-copy"><span class="eyebrow">VIRGO'S LITTLE GARDEN</span><h1 id="home-title" tabindex="-1">おとめ座の<br><em>ちいさな花壇</em></h1><p class="tagline">～小さなやさしさが、花を咲かせる～</p><p class="lead">ひと粒の種に、今日できることを。<br>お水をあげたり、そっと見守ったり。<br>あなたと育てる、6日間の小さな物語。</p><button class="primary" data-do="${state ? 'resume' : 'select'}">${state ? state.phase === 'result' ? '前のお花に会いにいく' : 'つづきから育てる' : '小さな種を植える'} <span aria-hidden="true">→</span></button><p class="fine">${state ? `${E.SEEDS[state.seed].name} · ${state.day}日目の記録があります` : '約3〜5分 · 登録不要 · 音なしでも楽しめます'}</p></div><div class="hero-visual"><p class="speech">たくさんよりも、ちょうどよく。<br>お花の声に、耳をすませてみよう。</p><div class="scene home-scene">${A.garden('margaret', 5)}<img class="guide" src="assets/virgo-guide.png" width="1254" height="1254" alt="やさしく案内する乙女座のちびキャラ"></div><p class="visual-caption">ひとつの花から、やさしさが育つ。</p></div></div><div class="steps"><p><span>01</span> 種をえらぶ</p><p><span>02</span> 様子をみて、お世話</p><p><span>03</span> お花に出会う</p></div><div class="home-bottom"><p class="fine">いつも頑張らなくていい。見守ることも、やさしさ。</p>${state ? '<button class="text-button" data-do="reset">新しい種からはじめる</button>' : ''}</div>${help()}</section>`;
  }
  function help() {
    return '<details class="help"><summary>花壇の育て方</summary><ul><li>1日にひとつ、お世話を選んで「次の日へ」。6日目に花の姿が決まります。実際の日付を待つ必要はありません。</li><li>水分は25〜80、栄養は25〜85が目安。ゲージと葉っぱを見て考えてみてね。</li><li>水分85以上、栄養90以上になるお世話は元気が減るよ。足りない日が続いても、しおれてしまいます。</li><li>しおれても、元気が残っていれば回復できます。ちょうどいい土で「様子を見る」のも、立派なお世話。</li><li>種類によって、水分と栄養の減り方が少し違います。すずらんは日なたが少し苦手。</li><li>記録はこのブラウザに自動保存。名前の入力も、外部へのデータ送信もありません。</li></ul></details>';
  }
  function select() {
    return `<section class="inner center" aria-labelledby="select-title"><span class="eyebrow">CHOOSE YOUR LITTLE SEED</span><h1 id="select-title" class="section-title" tabindex="-1">どのお花を、育てよう？</h1><p class="fine">気になる種を、ひとつ選んでね。<br>お花によって、好きなお世話も少しずつ違うよ。</p><div class="seeds">${Object.entries(E.SEEDS).map(([id, seed]) => `<button class="seed-card" data-seed="${id}" aria-label="${seed.name}の種を植える"><svg viewBox="85 60 190 220" role="img" aria-label="${seed.name}の花">${A.plant(id, 5)}</svg><strong>${seed.name}</strong><small>${seed.subtitle}</small></button>`).join('')}</div><div class="seed-note"><img src="assets/virgo-guide.png" width="1254" height="1254" alt="乙女座の案内人"><p>どの種にも、花を咲かせる力があるよ。<br>今日はどんな気分かな？心が惹かれるお花を選んでね。</p></div><p class="fine">一度選ぶと6日間、一緒に育てます。</p><button class="text-button" data-do="home">← はじめの画面へ</button></section>`;
  }
  function metrics() {
    return `<div class="metrics">${[['water', '水分', '25〜80が目安'], ['food', '栄養', '25〜85が目安'], ['health', '元気', '0になると枯れるよ']].map(([key, label, range]) => `<div class="metric ${key}"><div class="metric-head"><span>${label}</span><small>${state[key]} / 100</small></div><div class="track" role="meter" aria-label="${label}" aria-valuenow="${state[key]}" aria-valuemin="0" aria-valuemax="100"><div class="fill" style="width:${state[key]}%"></div></div><p class="range">${range}</p></div>`).join('')}</div>`;
  }
  function play() {
    const c = E.condition(state), last = state.history.at(-1);
    const review = state.phase === 'review';
    const changes = review ? ['water', 'food', 'health'].map((key, i) => { const n = last.after[key] - last.before[key]; return `<span>${['水分', '栄養', '元気'][i]} ${n >= 0 ? '+' : ''}${n}</span>`; }).join('') : '';
    return `<section class="inner" aria-labelledby="play-title"><div class="garden-top"><span class="day-label">${state.day}日目 <small>/ 6日間</small></span><span class="condition ${c.tone}" role="status">${c.label}</span></div><div class="day-dots" aria-label="6日間のうち${state.day}日目">${Array.from({ length: 6 }, (_, i) => `<span class="${i + 1 < state.day ? 'done' : i + 1 === state.day ? 'current' : ''}"></span>`).join('')}</div><div class="center"><h1 class="garden-name" id="play-title" tabindex="-1">あなたの${E.SEEDS[state.seed].name}</h1><span class="stage-label">${state.health <= 0 ? 'しずかに、育ちを終えました' : `${E.STAGES[state.stage]} · ${state.stage === 0 ? '土の中で、準備中' : state.stage === 4 ? 'もうすぐ、花ひらく' : '小さな命が育っています'}`}</span></div>${scene(state.seed, state.stage, state.health < 50 || state.water < 20, state.outcome === 'small', review ? last.message : c.hint)}${metrics()}${review ? `<div class="review" aria-live="polite"><h2>${state.day}日目のお世話をしたよ</h2><div class="delta">${changes}</div><p>${state.outcome ? state.outcome === 'withered' ? 'お花は育ちを終えたよ。一緒に、今日までを振り返ってみよう。' : '6日間のやさしさが、お花の姿になったよ。' : 'ひとつお世話したら、あとはひと休み。夜の間に水分と栄養が少し減ったよ。'}</p><button class="primary" data-do="next">${state.outcome ? '育ったお花を見る' : '次の日へ'} <span aria-hidden="true">→</span></button></div>` : `<div class="action-heading"><h2>今日、何をしてあげよう？</h2><span>1日にひとつのお世話</span></div><div class="actions">${Object.keys(E.ACTIONS).map(key => `<button class="care-button" data-action="${key}"><span class="icon" aria-hidden="true">${icons[key]}</span><span><strong>${E.ACTIONS[key]}</strong><small>${descriptions[key]}</small></span></button>`).join('')}</div><p class="fine center">${E.SEEDS[state.seed].hint}</p>`}<div class="play-bottom"><button class="text-button" data-do="reset">最初からやり直す</button><button class="text-button" data-do="home">はじめの画面へ</button></div>${journal()}${help()}</section>`;
  }
  function result() {
    const dead = state.outcome === 'withered', small = state.outcome === 'small';
    const heading = dead ? '枯れてしまった' : small ? '小さくかわいく開花' : '元気いっぱいに開花';
    return `<section class="inner result center" aria-labelledby="result-title"><span class="eyebrow">YOUR LITTLE GARDEN STORY</span><h1 id="result-title" class="section-title" tabindex="-1">${heading}</h1><span class="badge">${E.SEEDS[state.seed].name} · ${state.day}日間の物語</span>${scene(state.seed, dead ? Math.max(2, state.stage) : 5, dead, small, '', dead ? 'withered-scene' : '')}<p class="result-message">${dead ? 'うまくいかない日もあるよ。<br>また一緒に育ててみよう！' : 'あなたの小さなやさしさが、<br>こんなに素敵な花を咲かせたよ！'}</p><p class="result-note">${dead ? 'お水も肥料も、多ければいいわけではないんだね。<br>今日気づいたことは、きっと次の種への贈りもの。' : small ? '大きくなくても、あなたと育った大切なひとつ。<br>その小さな花に、ありがとうを。' : '手をかける日も、そっと見守る日も。<br>ちょうどいいやさしさが、根っこの力になったね。'}</p><div class="result-actions"><button class="primary" data-do="again">もう一度遊ぶ <span aria-hidden="true">↻</span></button><a class="return-link" href="https://lumiere-star-atelier.sanasa.chatgpt.site/">星のアトリエへ戻る ↗</a></div>${journal()}</section>`;
  }
  function render(focus = false) {
    app.innerHTML = screen === 'home' ? home() : screen === 'select' ? select() : state?.phase === 'result' ? result() : play();
    if (focus) {
      app.querySelector('h1')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  function effect(type) {
    const layer = app.querySelector('.effect-layer');
    if (!layer) return;
    layer.className = `effect-layer ${type}-effect`;
    layer.innerHTML = Array.from({ length: type === 'bloom' ? 25 : 12 }, (_, i) => `<span class="particle" style="--x:${15 + (i * 19) % 62}%;--y:${type === 'water' ? 28 : 6 + (i * 13) % 50}%;--delay:${(i % 6) * .11}s;--size:${11 + i % 4 * 3}px">${type === 'water' ? '💧' : type === 'bloom' ? i % 3 ? '❀' : '✧' : '✧'}</span>`).join('');
    if (type !== 'bloom') app.querySelector('.scene')?.classList.add('growth');
  }
  async function tune(type) {
    if (!sound || document.hidden) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') await audio.resume();
      if (!sound || document.hidden) return;
      const notes = type === 'bloom' ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25];
      notes.forEach((hz, i) => {
        const osc = audio.createOscillator(), gain = audio.createGain(), start = audio.currentTime + i * .14;
        osc.type = 'sine'; osc.frequency.value = hz;
        gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.045, start + .025); gain.gain.exponentialRampToValueAtTime(.0001, start + .6);
        osc.connect(gain); gain.connect(audio.destination); osc.start(start); osc.stop(start + .65);
      });
    } catch { sound = false; updateSound(); storageNote('この環境では音を再生できません。音なしでそのまま楽しめます。'); }
  }
  function updateSound() { soundButton.textContent = `♫ 音 ${sound ? 'ON' : 'OFF'}`; soundButton.setAttribute('aria-pressed', String(sound)); }
  soundButton.addEventListener('click', () => { sound = !sound; updateSound(); if (sound) tune('care'); else if (audio) audio.suspend().catch(() => {}); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && audio) audio.suspend().catch(() => {}); });
  app.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.seed && screen === 'select') { state = E.create(button.dataset.seed); bloomPlayed = false; save(); screen = 'play'; render(true); return; }
    if (button.dataset.action && state?.phase === 'care' && screen === 'play') {
      state = E.care(state, button.dataset.action); save(); render(); effect(button.dataset.action); tune('care');
      app.querySelector('.review .primary')?.focus({ preventScroll: true }); return;
    }
    switch (button.dataset.do) {
      case 'select': screen = 'select'; render(true); break;
      case 'resume': screen = 'play'; render(true); break;
      case 'home': screen = 'home'; render(true); break;
      case 'next':
        state = E.next(state); save(); render(true);
        if (state.phase === 'result' && state.outcome !== 'withered') { effect('bloom'); if (!bloomPlayed) { tune('bloom'); bloomPlayed = true; } }
        break;
      case 'reset': if (state) { resetDialog.returnValue = 'cancel'; resetDialog.showModal(); } else { screen = 'select'; render(true); } break;
      case 'again': state = null; save(); screen = 'select'; render(true); break;
    }
  });
  resetDialog.addEventListener('close', () => { if (resetDialog.returnValue === 'reset') { state = null; save(); screen = 'select'; render(true); } });
  // An open second tab should use the most recently saved garden, never overwrite it silently.
  window.addEventListener('storage', event => {
    if (event.key !== KEY) return;
    try { state = event.newValue ? E.restore(JSON.parse(event.newValue)) : null; } catch { state = null; }
    screen = 'home'; render(); storageNote('別のタブで花壇が更新されました。最新の記録から再開できます。');
  });
  render();
})();
