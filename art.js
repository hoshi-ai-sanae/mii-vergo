(function () {
  'use strict';
  function blossom(x, y, size, kind) {
    if (kind === 'lily') return `<g transform="translate(${x} ${y}) scale(${size})"><path d="M-9-4Q-14 5-13 12L-7 9L0 14L7 9L13 12Q14 5 9-4Q0-13-9-4Z" fill="#fffdf4" stroke="#b5bd99" stroke-width="1.5"/><path d="M-7 0Q0-5 7 0" fill="none" stroke="#e5e7d5" stroke-width="2"/></g>`;
    const petals = kind === 'chamomile' ? 9 : 12;
    return `<g transform="translate(${x} ${y}) scale(${size})">${Array.from({ length: petals }, (_, i) => `<ellipse cx="0" cy="-16" rx="${kind === 'chamomile' ? 4.4 : 5.7}" ry="13" transform="rotate(${i * 360 / petals})" fill="#fffdf7" stroke="#dcd7bb" stroke-width="1"/>`).join('')}<circle r="10" fill="#dbb64f" stroke="#ba9643" stroke-width="1.4"/><path d="M-4-3l1 1m6-3l1 1m-3 6l1 1m-6 0l1 1" stroke="#b99138" stroke-width="1.5" stroke-linecap="round"/></g>`;
  }
  function plant(seed, stage, wilt = false, small = false) {
    const stem = '#6c8a58', leaf = '#9daf7e';
    if (stage === 0) return '<ellipse cx="180" cy="269" rx="9" ry="5" fill="#9a6b40" stroke="#754a30"/><path d="M176 269l7-2" stroke="#c9a17a" stroke-width="2"/>';
    const top = [269, 235, 208, 162, 121, 105][stage];
    let body = `<path d="M180 275Q177 225 180 ${top}" fill="none" stroke="${stem}" stroke-width="5" stroke-linecap="round"/>`;
    const leaves = [[166, 230, -1], [193, 214, 1], [164, 191, -1], [195, 170, 1], [164, 152, -1], [193, 137, 1]];
    const count = [0, 1, 2, 4, 5, 6][stage];
    leaves.slice(0, count).forEach(([x, y, d]) => { body += `<path d="M180 ${y + 10}Q${x + d * 15} ${y + 9} ${x + d * 20} ${y - 16}Q${x - d * 6} ${y - 23}180 ${y + 10}Z" fill="${leaf}" stroke="${stem}" stroke-width="1.5"/><path d="M180 ${y + 10}L${x + d * 15} ${y - 10}" stroke="${stem}" opacity=".5"/>`; });
    if (stage === 4) body += '<path d="M180 125Q160 103 179 95Q202 102 180 125" fill="#e4d9bb" stroke="#87956a" stroke-width="2"/><path d="M180 122l-5-14m5 14l6-15" stroke="#8da16e" stroke-width="2"/>';
    if (stage === 5) {
      if (seed === 'lily') {
        body += `<path d="M180 145Q145 53 118 113M173 119Q205 64 224 115" fill="none" stroke="${stem}" stroke-width="3"/>`;
        [[119, 117], [135, 96], [154, 97], [192, 100], [211, 98], [224, 122]].forEach(([x, y]) => { body += blossom(x, y, .9, seed); });
      } else {
        body += `<path d="M180 202Q155 156 130 151M180 180Q200 136 230 140" fill="none" stroke="${stem}" stroke-width="3"/>`;
        body += blossom(180, 99, seed === 'chamomile' ? .85 : 1.14, seed);
        body += blossom(129, 147, .73, seed) + blossom(231, 134, .66, seed);
        if (seed === 'chamomile') body += `<path d="M180 244Q218 192 248 202" fill="none" stroke="${stem}" stroke-width="2"/>${blossom(249, 198, .5, seed)}`;
      }
    }
    return `<g class="plant ${wilt ? 'wilt' : ''}" style="transform-origin:180px 275px"><g transform="translate(${small ? 36 : 0} ${small ? 55 : 0}) scale(${small ? .8 : 1})">${body}</g></g>`;
  }
  function garden(seed = 'margaret', stage = 5, wilt = false, small = false, label = '') {
    return `<svg class="garden-art" viewBox="0 0 360 330" role="img" aria-label="${label || 'やわらかな光に包まれた花壇'}"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#f6f4df"/><stop offset="1" stop-color="#edf0dd"/></linearGradient><linearGradient id="earth" x2="0" y2="1"><stop stop-color="#b19b7c"/><stop offset="1" stop-color="#8f785f"/></linearGradient></defs><path d="M25 270V135A155 155 0 0 1 335 135V270Z" fill="url(#sky)"/><circle cx="276" cy="68" r="23" fill="#eedb9c" opacity=".8"/><path d="M25 218Q90 161 159 214Q256 151 335 208V275H25" fill="#dce3c6"/><path d="M25 240Q104 192 185 237Q262 202 335 226V279H25" fill="#c7d4ad"/><g stroke="#f9f5e8" stroke-width="6" stroke-linecap="round" opacity=".85"><path d="M40 236V188m25 43v-49m25 48v-44m208 44v-44m25 50v-49M29 211h74m184 0h49"/></g><g fill="#b7c79c"><ellipse cx="49" cy="264" rx="34" ry="19"/><ellipse cx="309" cy="265" rx="30" ry="19"/></g><g stroke="#9aaa7d" stroke-width="2"><path d="M61 271l-14-36m12 26l11-22m235 32l13-36m-11 25l-11-23"/></g><ellipse cx="180" cy="291" rx="143" ry="16" fill="#b5b68e" opacity=".25"/><path d="M53 268L73 301Q180 319 287 301L307 268" fill="#cba88a" stroke="#ae8c6b" stroke-width="2"/><path d="M73 291Q180 307 287 291" fill="none" stroke="#b49273"/><ellipse cx="180" cy="269" rx="127" ry="21" fill="url(#earth)" stroke="#d9bea0" stroke-width="5"/><g fill="#d2b99b" opacity=".7"><ellipse cx="91" cy="271" rx="4" ry="2"/><ellipse cx="240" cy="274" rx="5" ry="2"/><ellipse cx="153" cy="280" rx="3" ry="2"/><ellipse cx="269" cy="263" rx="3" ry="2"/></g>${plant(seed, stage, wilt, small)}<g fill="#e6c4c3"><circle cx="46" cy="248" r="4"/><circle cx="319" cy="251" r="4"/></g><path d="M72 69q8-8 16 0m-6-5q8-8 16 0" fill="none" stroke="#a7b08d" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }
  window.GardenArt = { garden, blossom, plant };
})();
