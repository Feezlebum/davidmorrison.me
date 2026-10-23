// AI: films made with AI, the pipeline behind them, and the strategy and products around them. The page is a node graph
// on a dark canvas. The pipeline's nodes are wired in order, the final cut fans out to output nodes that play the films,
// and every wire is drawn between real port positions, so the graph follows the layout at any width.
import { previewVideos } from './preview-videos.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export const aiKit = ['Claude', 'Codex', 'ElevenLabs', 'OpenRouter', 'Fal'];

// David's process on every film: generation, then the audits, audio alignment and refinement that finish it.
// Kinds colour the nodes: input, generate, audio, check, output.
export const aiPipeline = [
  {id: 'brief', kind: 'input', title: 'Brief & script', body: 'What the film has to say, and how many seconds it has to say it.'},
  {id: 'frames', kind: 'generate', title: 'Frames', body: 'Keyframes and references for every shot.'},
  {id: 'motion', kind: 'generate', title: 'Motion', body: 'Each shot generated as several takes.'},
  {id: 'voice', kind: 'audio', title: 'Voice & sound', body: 'Voice, music and effects.'},
  {id: 'audit', kind: 'check', title: 'Audit', body: 'Every take checked for continuity, acting and artefacts. Failures go back for a retake.'},
  {id: 'align', kind: 'audio', title: 'Audio alignment', body: 'Picture and sound locked together, cut by cut.'},
  {id: 'refine', kind: 'check', title: 'Refinement', body: 'More passes on the weak moments.'},
  {id: 'cut', kind: 'output', title: 'Final cut', body: 'Graded, mixed and exported.'},
];

// Films David confirmed were made with AI, in two rows: the NEAR film beside the two VOX films, then three widescreen
// films. Each links to the page where it lives in its own world.
const twimg = slug => previewVideos[slug].streamUrl;
export const aiFilms = [
  [
    {slug: 'near-ai-film', title: 'NEAR AI film', meta: 'NEAR Foundation · 2024', src: twimg('near-ai-film'), poster: '/images/project-previews/near-ai-film.jpg', width: 1280, height: 720, href: '/work/near-ai-film', link: 'The film and its context'},
    {slug: 'i-want-to-believe', title: 'I Want to Believe', meta: 'VOX-style animation', src: '/media/vox/i-want-to-believe.mp4', poster: '/images/vox/i-want-to-believe-poster.webp', width: 720, height: 1280, href: '/videos/vox#i-want-to-believe', link: 'See it in collage'},
    {slug: 'the-inner-circle', title: 'The Inner Circle', meta: 'VOX-style animation', src: '/media/vox/the-inner-circle.mp4', poster: '/images/vox/the-inner-circle-poster.webp', width: 720, height: 1280, href: '/videos/vox#the-inner-circle', link: 'See it in collage'},
  ],
  [
    {slug: 'slx-ai-reference', title: 'Introducing Superluminal', meta: 'Superluminal · 2026', src: twimg('slx-ai-reference'), poster: '/images/project-previews/superluminal-introduction.jpg', width: 1280, height: 720, href: '/work/slx-ai-reference', link: 'The original post'},
    {slug: 'lennon-1968', title: 'John Lennon, BBC2, 1968', meta: 'Motion design', src: '/media/motion-design/lennon-1968.mp4', poster: '/images/motion-design/lennon-1968-poster.webp', width: 1920, height: 1080, href: '/videos/motion-design#lennon-1968', link: 'See it on the page'},
    {slug: 'from-dial-up-to-starlink', title: 'From Dial-Up to Starlink', meta: 'Slop', src: '/media/slop/from-dial-up-to-starlink.mp4', poster: '/images/slop/from-dial-up-to-starlink-poster.webp', width: 1280, height: 720, href: '/videos/slop#from-dial-up-to-starlink', link: 'See it on the desktop'},
  ],
];

export const aiBuilds = [
  {kind: 'input', label: 'Strategy', title: 'NEAR’s AI strategy', body: 'Wrote the positioning for NEAR Foundation’s AI strategy launch and helped shape the brand strategy around user-owned AI.', href: '/work/near-profile-transformation', link: 'Profile as a Canvas, the campaign that announced it'},
  {kind: 'output', label: 'Product', title: 'MascotVibe', body: 'A profitable SaaS that creates and animates brand mascots. Built with AI.', href: 'https://mascotvibe.com/', link: 'mascotvibe.com'},
  {kind: 'generate', label: 'Experiment', title: 'Infinite Strip', body: 'An autonomous experiment in AI creativity.', href: 'https://infinitestrip.com/', link: 'infinitestrip.com'},
];

// Wires: [from node, from port, to node, to port, variant]. The final cut fans out to every film.
const wires = [
  ['kit', 'out', 'brief', 'in'],
  ...aiPipeline.slice(1).map((node, i) => [aiPipeline[i].id, 'out', node.id, 'in']),
  ['audit', 'retake', 'motion', 'back', 'retake'],
  ...aiFilms.flat().map(film => ['cut', 'fan', `out-${film.slug}`, 'in', 'fan']),
];

const port = (name, kind = name) => `<span class="ai-port ai-port--${kind}" data-port="${name}" aria-hidden="true"></span>`;
const external = href => /^https?:/.test(href);
const linkAttrs = href => external(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
const newTab = href => external(href) ? '<span class="sr-only"> (opens in a new tab)</span>' : '';
const arrow = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg>';

const step = (node, i) => `
      <li class="ai-node ai-node--${node.kind}" data-node="${node.id}">
        ${port('in')}${node.id === 'cut' ? '' : port('out')}${node.id === 'audit' ? port('retake') : ''}${node.id === 'motion' ? port('back') : ''}${node.id === 'cut' ? port('fan') : ''}
        <p class="ai-node-head"><span class="ai-node-kind">${String(i + 1).padStart(2, '0')} · ${escape(node.kind)}</span></p>
        <h3>${escape(node.title)}</h3>
        <p>${escape(node.body)}</p>
      </li>`;

const output = film => `
        <article class="ai-node ai-node--output ai-film${film.height > film.width ? ' ai-film--tall' : ''}" id="ai-${escape(film.slug)}" data-node="out-${escape(film.slug)}" style="--ar:${film.width}/${film.height}">
          ${port('in')}
          <p class="ai-node-head"><span class="ai-node-kind">Output</span><span class="ai-status" aria-hidden="true">ready</span></p>
          <div class="ai-screen">
            <video controls playsinline preload="none" poster="${escape(film.poster)}" aria-label="${escape(film.title)}">
              <source src="${escape(film.src)}" type="video/mp4">
            </video>
          </div>
          <div class="ai-film-foot">
            <div><h3>${escape(film.title)}</h3><p>${escape(film.meta)}</p></div>
            <a href="${escape(film.href)}">${escape(film.link)} ${arrow}</a>
          </div>
        </article>`;

const build = item => `
      <article class="ai-node ai-node--${item.kind} ai-build">
        <p class="ai-node-head"><span class="ai-node-kind">${escape(item.label)}</span></p>
        <h3>${escape(item.title)}</h3>
        <p>${escape(item.body)}</p>
        <a href="${escape(item.href)}"${linkAttrs(item.href)}>${escape(item.link)}${newTab(item.href)} ${arrow}</a>
      </article>`;

export function renderAi() {
  return `
  <div class="ai-page">
    <svg class="ai-defs" aria-hidden="true" focusable="false"><filter id="ai-denoise" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>
    </filter></svg>
    <div class="ai-canvas page-wrap">
      <svg class="ai-wires" aria-hidden="true" focusable="false"></svg>
      <header class="ai-hero">
        <div class="ai-title-wrap">
          <h1 class="ai-title">AI</h1>
          <p class="ai-steps" aria-hidden="true">step <span>30</span>/30</p>
        </div>
        <div class="ai-hero-copy">
          <p>I make films with AI and build the pipelines behind them. Generating a shot is the easy part. The work is in the audits, the audio alignment and the refinement passes that get a film to a finished cut.</p>
          <p>At NEAR Foundation I wrote the positioning for the AI strategy launch. I’ve also built MascotVibe, a profitable AI SaaS.</p>
          <div class="ai-node ai-node--input ai-kit" data-node="kit">
            ${port('out')}
            <p class="ai-node-head"><span class="ai-node-kind">Kit</span></p>
            <ul>${aiKit.map(tool => `<li>${escape(tool)}</li>`).join('')}<li>Image and video models</li></ul>
          </div>
        </div>
      </header>

      <section class="ai-section" aria-labelledby="ai-pipeline-title">
        <h2 class="ai-label" id="ai-pipeline-title">How a film gets made</h2>
        <ol class="ai-pipeline">${aiPipeline.map(step).join('')}
        </ol>
      </section>

      <section class="ai-section" aria-labelledby="ai-films-title">
        <h2 class="ai-label" id="ai-films-title">Films</h2>
        <div class="ai-films">
          ${aiFilms.map(row => `<div class="ai-film-row">${row.map(output).join('')}
          </div>`).join('')}
        </div>
      </section>

      <section class="ai-section ai-section--builds" aria-labelledby="ai-builds-title">
        <h2 class="ai-label" id="ai-builds-title">Strategy and products</h2>
        <div class="ai-builds">${aiBuilds.map(build).join('')}
        </div>
      </section>
    </div>
  </div>`;
}

// Each port's CSS sets --dir (up, down, left or right), the way its wire leaves it, so the layout decides the curves.
const directions = {up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]};
function centre(element, origin) {
  const box = element.getBoundingClientRect();
  return [box.left + box.width / 2 - origin.left, box.top + box.height / 2 - origin.top];
}
function curve(root, from, to) {
  const origin = root.getBoundingClientRect();
  const [ax, ay] = centre(from, origin);
  const [bx, by] = centre(to, origin);
  const [adx, ady] = directions[getComputedStyle(from).getPropertyValue('--dir').trim()] || directions.right;
  const [bdx, bdy] = directions[getComputedStyle(to).getPropertyValue('--dir').trim()] || directions.left;
  const reach = Math.min(220, Math.max(48, Math.hypot(bx - ax, by - ay) * .45));
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}C${(ax + adx * reach).toFixed(1)} ${(ay + ady * reach).toFixed(1)} ${(bx + bdx * reach).toFixed(1)} ${(by + bdy * reach).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
}

const time = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

let cleanup = null;
export function mountAi(root) {
  cleanup?.();
  cleanup = null;
  if (!root) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = root.querySelector('.ai-canvas');
  const svg = root.querySelector('.ai-wires');
  const node = id => root.querySelector(`[data-node="${id}"]`);

  // Wires: a cable and a signal that runs along it. Ports hidden by the layout (display:none) drop their wire.
  svg.innerHTML = wires.map(([from, , to, , variant], i) => `<g class="ai-wire ai-wire--${node(from).className.match(/ai-node--(\w+)/)[1]}${variant ? ` ai-wire--${variant}` : ''}" data-to="${to}" style="--i:${i}"><path class="ai-cable" pathLength="1"/><path class="ai-signal" pathLength="1"/></g>`).join('');
  const groups = [...svg.children];
  const draw = () => {
    svg.setAttribute('viewBox', `0 0 ${canvas.clientWidth} ${canvas.clientHeight}`);
    wires.forEach(([from, fromPort, to, toPort], i) => {
      const a = node(from).querySelector(`[data-port="${fromPort}"]`);
      const b = node(to).querySelector(`[data-port="${toPort}"]`);
      const shown = a.offsetParent && b.offsetParent;
      groups[i].hidden = !shown;
      if (shown) groups[i].querySelectorAll('path').forEach(path => path.setAttribute('d', curve(canvas, a, b)));
    });
  };
  let frame = 0;
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
  const resize = new ResizeObserver(schedule);
  resize.observe(canvas);
  root.querySelectorAll('.ai-node').forEach(item => resize.observe(item));
  document.fonts?.ready.then(schedule);
  draw();

  // The wires draw in, one after another, as the graph scrolls into view.
  let watch;
  if (still) canvas.classList.add('is-live');
  else {
    canvas.classList.add('is-armed');
    watch = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      watch.disconnect();
      canvas.classList.replace('is-armed', 'is-live');
    }, {threshold: 0.05});
    watch.observe(canvas);
  }

  // The title denoises: displacement noise that settles to nothing over thirty steps. It runs again on hover.
  const title = root.querySelector('.ai-title');
  const displace = root.querySelector('#ai-denoise feDisplacementMap');
  const turbulence = root.querySelector('#ai-denoise feTurbulence');
  const counter = root.querySelector('.ai-steps span');
  let denoising = 0;
  const denoise = () => {
    if (still || denoising) return;
    const start = performance.now();
    const duration = 1900;
    title.classList.add('is-noisy');
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      displace.setAttribute('scale', (110 * (1 - eased)).toFixed(1));
      turbulence.setAttribute('seed', String(Math.floor(now / 70) % 97));
      counter.textContent = String(Math.round(eased * 30));
      title.style.setProperty('--clean', eased.toFixed(3));
      if (t < 1) denoising = requestAnimationFrame(tick);
      else { denoising = 0; title.classList.remove('is-noisy'); }
    };
    denoising = requestAnimationFrame(tick);
  };
  denoise();
  title.addEventListener('pointerenter', denoise);

  // Films: one plays at a time. The output node's header becomes its progress bar and its fan wire goes live.
  const films = [...root.querySelectorAll('.ai-film')];
  const stops = films.map(film => {
    const video = film.querySelector('video');
    const status = film.querySelector('.ai-status');
    const wire = svg.querySelector(`[data-to="${film.dataset.node}"]`);
    const update = () => {
      film.style.setProperty('--p', video.duration ? (video.currentTime / video.duration).toFixed(4) : 0);
      status.textContent = video.ended ? 'done' : video.paused ? (video.currentTime ? `paused ${time(video.currentTime)}` : 'ready') : `playing ${time(video.currentTime)}`;
      film.classList.toggle('is-playing', !video.paused && !video.ended);
      wire?.classList.toggle('is-playing', !video.paused && !video.ended);
    };
    const play = () => {
      films.forEach(other => other !== film && other.querySelector('video').pause());
      update();
    };
    video.addEventListener('play', play);
    ['pause', 'ended', 'timeupdate', 'seeked'].forEach(type => video.addEventListener(type, update));
    return () => video.pause();
  });

  cleanup = () => {
    cancelAnimationFrame(frame);
    cancelAnimationFrame(denoising);
    resize.disconnect();
    watch?.disconnect();
    stops.forEach(stop => stop());
  };
}
