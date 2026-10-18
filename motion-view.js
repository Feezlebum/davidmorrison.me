// Motion Design: each film sits on a sheet in its own visual world. The Lennon piece is hand-drawn ink on
// parchment, so its sheet is parchment too, dressed with ink lifted from the film (scripts/cut-ink-pieces.mjs).
// The Bach Solfeggio is an engraved score that plays itself, so its sheet is a page of that score.
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export const motionFilms = [
  {
    slug: 'lennon-1968',
    title: 'John Lennon, BBC2, 6 June 1968',
    src: '/media/motion-design/lennon-1968.mp4',
    poster: '/images/motion-design/lennon-1968-poster.webp',
  },
  {
    slug: 'cpe-bach-solfeggio',
    title: 'C.P.E. Bach, Solfeggio in C minor, H 220, 1766',
    src: '/media/motion-design/cpe-bach-solfeggio.mp4',
    poster: '/images/motion-design/cpe-bach-solfeggio-poster.webp',
  },
];

const ink = (film, name, width, height, cls) => `<img class="md-ink ${cls}" src="/images/motion-design/${film.slug}/${name}.webp" alt="" width="${width}" height="${height}" decoding="async" draggable="false">`;

const player = film => `
      <video controls playsinline preload="metadata" poster="${escape(film.poster)}" aria-label="${escape(film.title)}">
        <source src="${escape(film.src)}" type="video/mp4">
      </video>
      <button type="button" class="md-start" aria-label="${escape(`Play ${film.title}`)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.2v13.6L19.4 12z"/></svg></button>`;

// A slightly unsteady hand-drawn outline for the note card, folded at the top-right corner like the film's own notes.
const cardOutline = `<svg class="md-outline" viewBox="0 0 160 92" preserveAspectRatio="none" aria-hidden="true">
  <path pathLength="1" d="M1.2 1.6 C40 .8 90 1.9 151.2 1.1 L158.8 8.6 C158.3 34 159.2 62 158.6 90.6 C110 91.3 52 90.2 1.4 90.9 C.9 61 1.8 30 1.2 1.6 Z M151.2 1.1 C151.6 3.6 151 6.2 151.4 8.9 L158.8 8.6"/>
</svg>`;

function renderLennon(film) {
  return `
  <section class="md-sheet md-sheet--${film.slug}" id="${film.slug}" aria-label="${escape(film.title)}" data-md-film>
    ${ink(film, 'date', 470, 110, 'md-date md-write')}
    ${ink(film, 'glasses-crowd', 1760, 574, 'md-glasses md-fade')}
    <figure class="md-card">${player(film)}
      ${cardOutline}
    </figure>
    ${ink(film, 'dolls', 520, 624, 'md-dolls md-fade')}
    ${ink(film, 'scribble', 410, 440, 'md-scribble md-fade')}
    <div class="md-rail" aria-hidden="true">
      <svg class="md-track" viewBox="0 0 1000 20" preserveAspectRatio="none"><path d="M0 4.2 C200 3.6 420 4.8 640 4 S900 3.4 1000 4.4"/><path d="M0 16.4 C260 15.8 500 17 720 16.2 S920 15.6 1000 16.6"/></svg>
      ${ink(film, 'train', 1014, 384, 'md-train')}
    </div>
    ${ink(film, 'agree', 1380, 320, 'md-agree md-write')}
    ${ink(film, 'credit', 1580, 110, 'md-credit md-write')}
  </section>`;
}

// The film is printed on the page as one system of the score, between the opening and closing systems
// lifted from its last frame. Under it a live staff writes the melody the way the film does.
function renderSolfeggio(film) {
  return `
  <section class="md-sheet md-sheet--${film.slug}" id="${film.slug}" aria-label="${escape(film.title)}" data-md-film>
    ${ink(film, 'opening', 1090, 182, 'bs-opening md-write')}
    <figure class="bs-system">${player(film)}</figure>
    <svg class="bs-staff" aria-hidden="true" data-bs-staff></svg>
    ${ink(film, 'close', 1020, 140, 'bs-close md-write')}
    ${ink(film, 'title', 1340, 66, 'bs-title md-write')}
  </section>`;
}

const renderers = {'lennon-1968': renderLennon, 'cpe-bach-solfeggio': renderSolfeggio};

export function renderMotion() {
  return `
  <div class="md-page">
    <header class="video-intro page-wrap">
      <h1>Motion Design</h1>
    </header>
    ${motionFilms.map(film => renderers[film.slug](film)).join('')}
  </div>`;
}

// The Solfeggio's opening bar in sixteenths, as diatonic steps from middle C. Later bars rise and fall in sequence.
const opening = [-7, -5, -3, 0, 2, 1, 0, -1, 0, -3, -2, -3, -4, -5, -4, -6];
const sequence = [0, 2, 4, 1, 3, 5, 2, 0, -1, 1];
const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs) => { const node = document.createElementNS(NS, name); for (const key in attrs) node.setAttribute(key, attrs[key]); return node; };

// Engrave the melody across the staff at its current size: noteheads, stems and double beams in fours,
// the line the film draws between notes, and red rings on the accents.
function engrave(svg) {
  const {width: w, height: h} = svg.getBoundingClientRect();
  svg.replaceChildren();
  if (!w || !h) return null;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const s = h / 16, mid = h * .52, dx = s * 1.75, beat = s * .9;
  const lines = el('g', {class: 'bs-lines'});
  for (let i = -2; i <= 2; i++) lines.append(el('line', {x1: 0, x2: w, y1: mid + i * s, y2: mid + i * s, pathLength: 1}));
  svg.append(lines);
  const notes = [];
  let x = s * 3;
  for (let bar = 0; x < w - s * 3; bar++) {
    const shift = sequence[bar % sequence.length];
    for (let i = 0; i < 16 && x < w - s * 3; i++) {
      const k = opening[i] + 2 + shift;
      notes.push({x, y: mid - k * s / 2, group: Math.floor(notes.length / 4)});
      x += dx + (i % 4 === 3 ? beat : 0);
    }
  }
  const path = el('polyline', {class: 'bs-line', points: notes.map(n => `${n.x},${n.y}`).join(' ')});
  svg.append(path);
  const lengths = [0];
  for (let i = 1; i < notes.length; i++) lengths.push(lengths[i - 1] + Math.hypot(notes[i].x - notes[i - 1].x, notes[i].y - notes[i - 1].y));
  const total = lengths.at(-1) || 1;
  path.style.strokeDasharray = total;
  path.style.strokeDashoffset = total;
  const groups = [];
  for (let g = 0; g * 4 < notes.length; g++) {
    const members = notes.slice(g * 4, g * 4 + 4);
    const up = members.reduce((sum, n) => sum + n.y, 0) / members.length > mid;
    const dir = up ? -1 : 1, side = up ? s * .55 : -s * .55;
    // A slanted beam, eased toward flat, then pushed out so the shortest stem is still a good length.
    const first = members[0], last = members.at(-1);
    const slope = members.length > 1 ? ((last.y - first.y) / (last.x - first.x)) * .35 : 0;
    const beamAt = (n, offset) => first.y + offset + slope * (n.x - first.x);
    const reach = Math.max(...members.map(n => dir * (n.y - beamAt(n, 0)))) + s * 3.2;
    const group = el('g', {class: 'bs-group'});
    for (const n of members) {
      const note = el('g', {class: 'bs-note'});
      const sx = n.x + side;
      note.append(el('line', {class: 'bs-stem', x1: sx, x2: sx, y1: n.y, y2: beamAt(n, dir * reach)}));
      note.append(el('ellipse', {class: 'bs-head', cx: n.x, cy: n.y, rx: s * .62, ry: s * .44, transform: `rotate(-22 ${n.x} ${n.y})`}));
      group.append(note);
      n.node = note;
    }
    if (members.length > 1) {
      const x1 = first.x + side, x2 = last.x + side;
      for (const layer of [0, 1]) {
        const y = beamAt(first, dir * (reach - layer * s * .8)), y2 = y + slope * (x2 - x1), t = s * .2;
        group.append(el('polygon', {class: 'bs-beam', points: `${x1},${y - t} ${x2},${y2 - t} ${x2},${y2 + t} ${x1},${y + t}`}));
      }
    }
    svg.append(group);
    groups.push(group);
  }
  // Accents ring red, as they do in the film.
  const rings = [];
  notes.forEach((n, i) => {
    if (i % 22 !== 13) return;
    const ring = el('g', {class: 'bs-ring'});
    for (const r of [1.4, 2.6, 4]) ring.append(el('circle', {cx: n.x, cy: n.y, r: s * r}));
    svg.insertBefore(ring, lines.nextSibling);
    rings.push({at: i, node: ring});
  });
  const dot = el('circle', {class: 'bs-dot', cx: notes[0]?.x ?? 0, cy: notes[0]?.y ?? 0, r: s * .78});
  svg.append(dot);
  return {notes, groups, rings, path, lengths, total, dot};
}

// Plays the engraved melody: the black note leads, the line follows it, and each note is printed as it is passed.
function playStaff(svg, still) {
  let score = null, frame = 0, start = 0, running = false, hold = 0;
  const speed = 8.5; // notes per second, Prestissimo
  const reset = () => {
    if (!score) return;
    svg.classList.remove('is-clearing');
    score.notes.forEach(n => n.node.classList.remove('is-on'));
    score.groups.forEach(g => g.classList.remove('is-on'));
    score.rings.forEach(r => r.node.classList.remove('is-on'));
    score.path.style.strokeDashoffset = score.total;
    start = performance.now();
    hold = 0;
  };
  const showAll = () => {
    if (!score) return;
    score.notes.forEach(n => n.node.classList.add('is-on'));
    score.groups.forEach(g => g.classList.add('is-on'));
    score.path.style.strokeDashoffset = 0;
    score.dot.style.display = 'none';
  };
  const tick = now => {
    frame = requestAnimationFrame(tick);
    if (!score?.notes.length) return;
    const last = score.notes.length - 1;
    const t = Math.min(last, (now - start) / 1000 * speed);
    const i = Math.floor(t), f = t - i, a = score.notes[i], b = score.notes[Math.min(last, i + 1)];
    score.dot.setAttribute('cx', a.x + (b.x - a.x) * f);
    score.dot.setAttribute('cy', a.y + (b.y - a.y) * f);
    score.path.style.strokeDashoffset = score.total - (score.lengths[i] + (score.lengths[Math.min(last, i + 1)] - score.lengths[i]) * f);
    for (let n = 0; n <= i; n++) score.notes[n].node.classList.add('is-on');
    for (let g = 0; g < score.groups.length && (g * 4 + 3 <= i || (g * 4 <= i && i === last)); g++) score.groups[g].classList.add('is-on');
    score.rings.forEach(r => r.at <= i && r.node.classList.add('is-on'));
    if (t < last) return;
    // Hold the finished line, let it fade from the page, then play it again.
    hold ||= now;
    if (now - hold > 1800) svg.classList.add('is-clearing');
    if (now - hold > 2700) reset();
  };
  const run = on => {
    if (on === running || still.matches) return;
    running = on;
    if (on) { reset(); frame = requestAnimationFrame(tick); } else cancelAnimationFrame(frame);
  };
  const build = () => {
    score = engrave(svg);
    if (still.matches) showAll(); else reset();
  };
  build();
  let sized = 0;
  const resize = new ResizeObserver(() => { cancelAnimationFrame(sized); sized = requestAnimationFrame(build); });
  resize.observe(svg);
  const watch = new IntersectionObserver(([entry]) => run(entry.isIntersecting), {threshold: 0.05});
  watch.observe(svg);
  return () => { resize.disconnect(); watch.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(sized); };
}

let cleanup = null;
export function mountMotion(root) {
  cleanup?.();
  cleanup = null;
  if (!root) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const stops = [...root.querySelectorAll('[data-md-film]')].map(sheet => {
    const video = sheet.querySelector('video');
    const start = sheet.querySelector('.md-start');
    start.addEventListener('click', () => video.play().catch(() => {}));
    video.addEventListener('play', () => {
      sheet.classList.add('has-played');
      start.tabIndex = -1;
      document.querySelectorAll('.md-page video').forEach(other => other !== video && other.pause());
    });
    const staff = sheet.querySelector('[data-bs-staff]');
    const stopStaff = staff ? playStaff(staff, still) : () => {};
    // The ink draws itself in when the sheet arrives; without motion it is simply there.
    if (still.matches) return stopStaff;
    sheet.classList.add('is-armed');
    const watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      watch.disconnect();
      sheet.classList.replace('is-armed', 'is-live');
    }, {threshold: 0.15});
    watch.observe(sheet);
    return () => { watch.disconnect(); stopStaff(); };
  });
  cleanup = () => stops.forEach(stop => stop());
}
