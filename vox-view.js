// VOX: paper-collage explainer films. Each band is a collage cut from its film's own stills
// (scripts/cut-vox-pieces.mjs); the scene pieces seek the film and the field follows the scene.
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export const voxFilms = [
  {
    slug: 'i-want-to-believe',
    title: 'I Want to Believe',
    src: '/media/vox/i-want-to-believe.mp4',
    poster: '/images/vox/i-want-to-believe-poster.webp',
    restField: '#1d6246',
    scenes: [
      {name: 'signal', label: 'the signal', start: 0, field: '#01848a'},
      {name: 'abduction', label: 'the abduction', start: 6, field: '#d05413'},
      {name: 'crop-circle', label: 'the crop circle', start: 12, field: '#4e2e7d'},
      {name: 'believe', label: 'the evidence board', start: 18, field: '#1d6246'},
    ],
  },
  {
    slug: 'the-inner-circle',
    title: 'The Inner Circle',
    src: '/media/vox/the-inner-circle.mp4',
    poster: '/images/vox/the-inner-circle-poster.webp',
    restField: '#0e1a36',
    scenes: [
      {name: 'world', label: 'the world', start: 0, field: '#133b6b'},
      {name: 'compass', label: 'the compass', start: 8, field: '#26205c'},
      {name: 'eye', label: 'the eye', start: 16, field: '#0c3a40'},
      {name: 'close', label: 'the eye closing', start: 24, field: '#081024'},
    ],
  },
];

const pieceSrc = (film, name) => `/images/vox/pieces/${film.slug}/${name}.webp`;
const img = (film, name, width, height, extra = '') => `<img src="${pieceSrc(film, name)}" alt="" width="${width}" height="${height}" decoding="async" draggable="false"${extra}>`;
const play = (film, name, cls, inner) => {
  const scene = film.scenes.find(item => item.name === name);
  return `<button type="button" class="vox-piece vox-play ${cls}" data-start="${scene.start}" aria-label="${escape(`Play from ${scene.label}`)}">${inner}</button>`;
};
const anchor = (name, left, top) => `<span class="vox-anchor" data-anchor="${name}" style="left:${left}%;top:${top}%"></span>`;
const frame = film => `
    <figure class="vox-frame">
      <video controls playsinline preload="metadata" poster="${escape(film.poster)}" aria-label="${escape(film.title)}">
        <source src="${escape(film.src)}" type="video/mp4">
      </video>
      <button type="button" class="vox-start" aria-label="${escape(`Play ${film.title}`)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.2v13.6L19.4 12z"/></svg></button>
      ${anchor('frame-tr', 97, 1.4)}${anchor('frame-tc', 50, 1.4)}${anchor('frame-bl', 3, 98.6)}
    </figure>`;

// Pieces for each film. Strings are drawn between named anchors once the pieces have landed.
const collages = {
  'i-want-to-believe': film => `
    <div class="vox-beam" aria-hidden="true"></div>
    ${img(film, 'ufo-small', 530, 250, ' class="vox-piece vox-ufo-small" aria-hidden="true"')}
    ${play(film, 'crop-circle', 'vox-crop-circle', img(film, 'crop-circle', 941, 1350))}
    ${img(film, 'house-1', 304, 206, ' class="vox-piece vox-house vox-house--1" aria-hidden="true"')}
    ${img(film, 'house-2', 304, 218, ' class="vox-piece vox-house vox-house--2" aria-hidden="true"')}
    ${img(film, 'house-3', 362, 198, ' class="vox-piece vox-house vox-house--3" aria-hidden="true"')}
    ${play(film, 'abduction', 'vox-ufo', img(film, 'ufo', 780, 262))}
    ${frame(film)}
    ${play(film, 'believe', 'vox-alien', `${img(film, 'alien', 521, 1010)}${anchor('alien', 6.5, 54.8)}`)}
    <div class="vox-piece vox-toaster" aria-hidden="true">${img(film, 'polaroid-toaster', 345, 375)}${anchor('toaster', 74.2, 79)}</div>
    ${img(film, 'arcs', 255, 210, ' class="vox-piece vox-arcs" aria-hidden="true"')}
    ${play(film, 'signal', 'vox-signal', img(film, 'signal', 941, 1185))}
    <svg class="vox-strings" aria-hidden="true">
      <path data-from="alien" data-to="frame-tr" data-to-narrow="frame-bl"></path>
      <path data-from="toaster" data-to="frame-bl"></path>
      <circle data-pin="frame-tr" r="7"></circle>
      <circle data-pin="frame-bl" r="7"></circle>
    </svg>`,
  // Everything hangs off the eye: gold strings from its triangle to the two suited figures and to the film itself.
  // The eye on the page shuts with the film's closing coda.
  'the-inner-circle': film => `
    ${play(film, 'world', 'vox-globe', img(film, 'globe', 951, 1171))}
    ${img(film, 'medallions', 382, 352, ' class="vox-piece vox-medallions" aria-hidden="true"')}
    ${play(film, 'compass', 'vox-compass', img(film, 'compass', 952, 1581))}
    ${play(film, 'eye', 'vox-eye', `${img(film, 'eye', 963, 762)}${img(film, 'eye-closed', 963, 762, ' class="vox-eye-shut"')}${anchor('eye-l', 6, 97.9)}${anchor('eye-c', 50, 97.9)}${anchor('eye-r', 94, 97.9)}`)}
    ${frame(film)}
    <div class="vox-piece vox-figure vox-figure--left" aria-hidden="true">${img(film, 'figure-left', 252, 352)}${anchor('figure-left', 58, 8.8)}</div>
    <div class="vox-piece vox-figure vox-figure--right" aria-hidden="true">${img(film, 'figure-right', 277, 362)}${anchor('figure-right', 41.9, 7.2)}</div>
    <svg class="vox-strings" aria-hidden="true">
      <path class="is-gold" data-from="eye-l" data-to="figure-left"></path>
      <path class="is-gold" data-from="eye-r" data-to="figure-right"></path>
      <path class="is-gold" data-from="eye-c" data-to="frame-tc"></path>
    </svg>`,
};

function renderFilmBand(film) {
  return `
  <section class="vox-band vox-band--film vox-band--${film.slug}" id="${film.slug}" style="--field:${film.restField}" aria-label="${escape(film.title)}" data-vox-film="${film.slug}">
    ${collages[film.slug](film)}
  </section>`;
}

export function renderVox() {
  return `
  <div class="vox-page">
    <header class="video-intro page-wrap">
      <h1>VOX Style Animations</h1>
      <p>An exploration of VOX style animations using ElevenLabs, Mirelo, Omni, Opus 5.5, and more. These are artistic throwaways, but the concept can be applied to explainers, marketing assets, and any story that needs a complicated idea to land in under thirty seconds.</p>
    </header>
    ${voxFilms.map(renderFilmBand).join('')}
  </div>`;
}

function mountBand(band, still, narrow) {
  const film = voxFilms.find(item => item.slug === band.dataset.voxFilm);
  const video = band.querySelector('video');
  const pieces = [...band.querySelectorAll('.vox-play')];
  const svg = band.querySelector('.vox-strings');

  // Scenes come from the film, so a scene without its own piece (a closing coda) still sets the field.
  let current = -1;
  const select = index => {
    if (index === current) return;
    current = index;
    const scene = film.scenes[index];
    band.style.setProperty('--field', scene ? scene.field : film.restField);
    band.dataset.scene = scene ? scene.name : '';
    pieces.forEach(item => Number(item.dataset.start) === scene?.start ? item.setAttribute('aria-current', 'true') : item.removeAttribute('aria-current'));
  };
  const indexAt = seconds => film.scenes.reduce((found, scene, i) => seconds >= scene.start - 0.05 ? i : found, 0);
  const sync = () => select(video.paused && video.currentTime === 0 ? -1 : indexAt(video.currentTime));
  const start = band.querySelector('.vox-start');
  start.addEventListener('click', () => video.play().catch(() => {}));
  video.addEventListener('play', () => {
    band.classList.add('has-played');
    start.tabIndex = -1;
    // One film at a time.
    document.querySelectorAll('.vox-page video').forEach(other => other !== video && other.pause());
  });
  video.addEventListener('timeupdate', sync);
  video.addEventListener('seeked', sync);
  pieces.forEach(item => item.addEventListener('click', () => {
    video.currentTime = Number(item.dataset.start);
    select(indexAt(Number(item.dataset.start)));
    video.play().catch(() => {});
  }));

  // Strings between anchors, measured from the laid-out pieces; thread hangs with a little slack.
  const centre = (name, box) => {
    const rect = band.querySelector(`[data-anchor="${name}"]`).getBoundingClientRect();
    return [rect.left + rect.width / 2 - box.left, rect.top + rect.height / 2 - box.top];
  };
  const layout = () => {
    const box = band.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(band).fontSize);
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    for (const path of svg.querySelectorAll('path')) {
      const to = narrow.matches && path.dataset.toNarrow ? path.dataset.toNarrow : path.dataset.to;
      const [x1, y1] = centre(path.dataset.from, box);
      const [x2, y2] = centre(to, box);
      const sag = Number(path.dataset.sag || 0) * em;
      const length = Math.hypot(x2 - x1, y2 - y1) || 1;
      const mx = (x1 + x2) / 2 - ((y2 - y1) / length) * sag, my = (y1 + y2) / 2 + ((x2 - x1) / length) * sag;
      path.setAttribute('d', `M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`);
      path.style.setProperty('--length', Math.ceil(path.getTotalLength()));
    }
    for (const pin of svg.querySelectorAll('circle')) {
      const [cx, cy] = centre(pin.dataset.pin, box);
      pin.setAttribute('cx', cx); pin.setAttribute('cy', cy);
    }
  };
  const resize = new ResizeObserver(layout);
  resize.observe(band);
  band.querySelectorAll('.vox-piece').forEach(item => resize.observe(item));
  layout();

  // Pieces assemble when the band comes into view; the string is drawn once every one has landed.
  let live = true;
  const string = () => Promise.all(band.getAnimations({subtree: true}).map(animation => animation.finished.catch(() => {}))).then(() => {
    if (!live) return;
    layout();
    requestAnimationFrame(() => band.classList.add('is-strung'));
  });
  let watch = null;
  if (still.matches) {
    band.classList.add('is-strung');
  } else {
    band.classList.add('is-armed');
    watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      watch.disconnect();
      band.classList.replace('is-armed', 'is-live');
      requestAnimationFrame(string);
    }, {threshold: 0.2});
    watch.observe(band);
  }
  return () => { live = false; resize.disconnect(); watch?.disconnect(); };
}

let cleanup = null;
export function mountVox(root) {
  cleanup?.();
  cleanup = null;
  if (!root) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 900px), (max-aspect-ratio: 1/1)');
  const bands = [...root.querySelectorAll('[data-vox-film]')].map(band => mountBand(band, still, narrow));
  cleanup = () => bands.forEach(stop => stop());
}
