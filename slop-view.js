// Slop: AI experiments, unfinished cuts and films that aren't quite there yet. A film can have a world of its own
// (`world`); otherwise it sits on a loud band in the card's world: the AI-gradient field, a slime frame and a hard shadow.
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

// Each film: {slug, title, src, poster, width, height, world?}. Films are only listed once David has picked them.
export const slopFilms = [
  {
    slug: 'from-dial-up-to-starlink',
    title: 'From Dial-Up to Starlink',
    src: '/media/slop/from-dial-up-to-starlink.mp4',
    poster: '/images/slop/from-dial-up-to-starlink-poster.webp',
    width: 1280,
    height: 720,
    world: 'desktop',
  },
];

const video = film => `<video controls playsinline preload="metadata" poster="${escape(film.poster)}" style="--ar:${film.width}/${film.height}" aria-label="${escape(film.title)}">
      <source src="${escape(film.src)}" type="video/mp4">
    </video>`;

const renderBand = film => `
  <section class="sl-band" id="${escape(film.slug)}" aria-label="${escape(film.title)}" data-sl-film>
    ${video(film)}
  </section>`;

// Pixel art on a grid, one character per pixel and '.' for clear, merged into runs so each row is a few rects.
const win16 = {k:'#000000', w:'#ffffff', g:'#c0c0c0', d:'#808080', n:'#000080', b:'#0000ff', r:'#ff0000', y:'#ffff00', G:'#008000', p:'#ff00ff', c:'#00ffff', h:'#804000', e:'#efd08a', E:'#c09848'};
const pixels = (cls, rows) => {
  const width = Math.max(...rows.map(row => row.length));
  const runs = rows.flatMap((row, y) => [...row.matchAll(/([^.])\1*/g)].map(run => `<rect x="${run.index}" y="${y}" width="${run[0].length}" height="1" fill="${win16[run[1]]}"/>`));
  return `<svg class="${cls}" viewBox="0 0 ${width} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${runs.join('')}</svg>`;
};

const paint = pixels('sl-pixels', [
  '..............hh',
  '....kkkkkkk..hh',
  '..kkeeeeeeekhh',
  '.keerreeeehhk',
  '.keerreeeggeek',
  'keeeeeeeggeeeek',
  'keyyeeeerreeeek',
  'keyyeeekkebbbek',
  'keeeeek..kebbek',
  'keeeeeekkeeeek',
  '.keeppeeeeeeek',
  '.keeppeeeeeEk',
  '..kEeeeeeeEk',
  '...kkEEEEEk',
  '.....kkkkk',
]);

const floppy = pixels('sl-pixels', [
  'kkkkkkkkkkkkkkk',
  'knnggggggggnnnkk',
  'knngggkkgggnnnnk',
  'knngggkkgggnnnnk',
  'knngggkkgggnnnnk',
  'knnggggggggnnnnk',
  'knnnnnnnnnnnnnnk',
  'knnnnnnnnnnnnnnk',
  'knnwwwwwwwwwwnnk',
  'knnwddddddddwnnk',
  'knnwwwwwwwwwwnnk',
  'knnwddddddddwnnk',
  'knnwwwwwwwwwwnnk',
  'knnwwwwwwwwwwnnk',
  'kkkkkkkkkkkkkkkk',
]);

const bin = pixels('sl-pixels', [
  '....kkk..kkkk',
  '...kwwwkkwwwwk',
  '..kwwdwwkwwdwk',
  '.kkkwwwwwwwwkkk',
  'kgwkkkkkkkkkkwgk',
  'kggggggggggggggk',
  '.kgdgdgdgdgdgdk',
  '.kgdgdgdgdgdgdk',
  '.kgdgdgdgdgdgdk',
  '.kgdgdgdgdgdgdk',
  '..kgdgdgdgdgdk',
  '..kgdgdgdgdgdk',
  '..kgdgdgdgdgdk',
  '...kgdgdgdgdk',
  '...kkkkkkkkkk',
]);

const monitor = pixels('sl-pixels', [
  'kkkkkkkkkkkk',
  'kggggggggggk',
  'kgnnnnnnnngk',
  'kgnccnnnnngk',
  'kgncnnnnnngk',
  'kgnnnnnnnngk',
  'kggggggggggk',
  'kkkkkkkkkkkk',
  '....kggk',
  '..kkkkkkkk',
]);

const cursor = pixels('sl-cursor', [
  'k',
  'kk',
  'kwk',
  'kwwk',
  'kwwwk',
  'kwwwwk',
  'kwwwwwk',
  'kwwwwwwk',
  'kwwwwwwwk',
  'kwwwwwwwwk',
  'kwwwwwwkkkk',
  'kwwwkwwk',
  'kwwk.kwwk',
  'kwk..kwwk',
  'kk....kwwk',
  '......kwwk',
  '.......kk',
]);

// A paperclip assistant of our own drawing: a wire clip with big eyes and brows that lift when it blinks.
const clip = `<svg class="sl-clip" viewBox="0 0 44 100" aria-hidden="true">
      <path class="sl-wire-edge" d="M16 36V78a6 6 0 0 0 12 0V18a11 11 0 0 0-22 0V82a16 16 0 0 0 32 0V32"/>
      <path class="sl-wire" d="M16 36V78a6 6 0 0 0 12 0V18a11 11 0 0 0-22 0V82a16 16 0 0 0 32 0V32"/>
      <g class="sl-brows"><path d="M6 15.5q5-4 10-.5M23 15q5-3.5 10 .5"/></g>
      <g class="sl-eyes"><ellipse cx="11.5" cy="24" rx="5.2" ry="6.4"/><ellipse cx="28" cy="24" rx="5.2" ry="6.4"/><circle class="sl-pupil" cx="13.4" cy="25.4" r="2.4"/><circle class="sl-pupil" cx="29.9" cy="25.4" r="2.4"/></g>
    </svg>`;

const spark = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12.9 6.3 17.7 11.1 24 12C17.7 12.9 12.9 17.7 12 24C11.1 17.7 6.3 12.9 0 12C6.3 11.1 11.1 6.3 12 0Z"/></svg>`;
const errorIcon = `<svg class="sl-error-icon" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14.5" fill="#ff0000" stroke="#800000" stroke-width="1.5"/><path d="M10.5 10.5l11 11m0-11l-11 11" stroke="#fff" stroke-width="3.4" stroke-linecap="square"/></svg>`;
const titlebar = (title, buttons) => `<div class="sl-titlebar"><span>${escape(title)}</span><span class="sl-controls">${buttons.map(glyph => `<span>${glyph}</span>`).join('')}</span></div>`;
// An odometer, one strip of 0 to 9 per digit, rolled to its digit.
const counter = number => [...number].map((digit, i) => `<span class="sl-digit" style="--n:${digit};--i:${i}"><span>${[...'0123456789'].map(n => `<span>${n}</span>`).join('')}</span></span>`).join('');

// From Dial-Up to Starlink opens and closes on a teal desktop in 1998, so its world is that desktop.
function renderDesktop(film) {
  return `
  <section class="sl-desk" id="${escape(film.slug)}" aria-label="${escape(film.title)}" data-sl-film>
    <div class="sl-icons" aria-hidden="true">
      <div class="sl-icon" style="--at:.1s">${paint}<span>Paint</span></div>
      <div class="sl-icon" style="--at:.25s">${floppy}<span>final_FINAL_<wbr>v3.avi</span></div>
      <div class="sl-icon" style="--at:.4s">${bin}<span>Recycle Bin</span></div>
    </div>
    <div class="sl-counter" style="--at:.9s" aria-hidden="true"><span>You are visitor no.</span><span class="sl-digits">${counter('0001998')}</span></div>
    <div class="sl-badges" aria-hidden="true">
      <span class="sl-badge sl-badge--view" style="--at:1.1s">${monitor}<span>Best viewed at <b>800&times;600</b></span></span>
      <span class="sl-badge sl-badge--slop" style="--at:1.25s"><small>powered by</small><b>SLOP</b></span>
    </div>
    <div class="sl-dialog sl-error" style="--at:1.7s" aria-hidden="true">
      ${titlebar('slop.exe', ['&times;'])}
      <div class="sl-error-body">${errorIcon}<p>This program has performed an illegal operation and will be shut down.</p></div>
      <div class="sl-buttons"><span>Close</span><span>Details &gt;&gt;</span></div>
    </div>
    <figure class="sl-dialog sl-window" style="--at:.6s">
      ${titlebar(film.title, ['_', '&#9633;', '&times;'])}
      <div class="sl-screen">
        ${video(film)}
        <button type="button" class="sl-start" aria-label="${escape(`Connect: play ${film.title}`)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15L19 12z"/></svg>Connect</button>
        ${cursor}
      </div>
    </figure>
    <div class="sl-assistant" style="--at:2.3s" aria-hidden="true">
      <p class="sl-bubble">It looks like you&rsquo;re watching slop. Would you like help?</p>
      ${clip}
    </div>
    <div class="sl-taskbar" aria-hidden="true">
      <span class="sl-startmenu">${spark}Start</span>
      <span class="sl-task">${escape(film.title)}</span>
      <span class="sl-tray">11:59 PM</span>
    </div>
  </section>`;
}

const worlds = {desktop: renderDesktop};

export function renderSlop() {
  return `
  <div class="sl-page">
    <header class="video-intro page-wrap">
      <h1>Slop</h1>
      <p>This is a compilation of videos and AI outputs that I deem too “slop-esque” to publish elsewhere. Sometimes it’s not worth throwing good tokens after bad. Enjoy!</p>
    </header>
    ${slopFilms.map(film => (worlds[film.world] || renderBand)(film)).join('')}
  </div>`;
}

// Only one film plays at a time. A desktop pops its pieces on when it scrolls into view; without motion they are simply there.
let cleanup = null;
export function mountSlop(root) {
  cleanup?.();
  cleanup = null;
  if (!root) return;
  root.addEventListener('play', event => root.querySelectorAll('video').forEach(video => video !== event.target && video.pause()), true);
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const stops = [...root.querySelectorAll('[data-sl-film]')].map(sheet => {
    const video = sheet.querySelector('video');
    const start = sheet.querySelector('.sl-start');
    start?.addEventListener('click', () => video.play().catch(() => {}));
    video.addEventListener('play', () => {
      sheet.classList.add('has-played');
      if (start) start.tabIndex = -1;
    });
    if (still.matches || !sheet.matches('.sl-desk')) return () => {};
    sheet.classList.add('is-armed');
    const watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      watch.disconnect();
      sheet.classList.replace('is-armed', 'is-live');
    }, {threshold: 0.2});
    watch.observe(sheet);
    return () => watch.disconnect();
  });
  cleanup = () => stops.forEach(stop => stop());
}
