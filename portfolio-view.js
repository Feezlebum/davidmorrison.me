import { icon } from './icons.js';
import { previewMedia } from './preview-media.js';
import { campaignThumbnails } from './campaign-thumbnails.js';
import { previewVideos } from './preview-videos.js';
import { mountProjectPreviews } from './preview-player.js';
import { mountCircularSlider } from './circular-slider.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const order = ['near-hijack', 'fogo-launch', 'near-profile-transformation', 'near-egg', 'near-ai-film', 'slx-ai-reference'];
const titles = {
  'near-hijack': 'HiJack',
  'fogo-launch': 'Fogo Fire Launch',
  'near-profile-transformation': 'Profile as a Canvas',
  'near-egg': 'The Egg Is NEAR',
  'near-ai-film': 'NEAR AI film',
  'slx-ai-reference': 'Superluminal',
};

function mediaFor(slug) {
  if (slug === 'near-hijack') return {path:'/images/near-hijack/hijack-broadcast.webp',alt:'The masked HiJack character in the green campaign broadcast.',width:1800,height:914};
  if (slug === 'near-profile-transformation') {
    const video = previewVideos[slug];
    return {path:video.posterUrl,alt:'The dragon film from NEAR’s user-owned AI and Chain Abstraction reveal.',width:video.width,height:video.height};
  }
  return previewMedia[slug];
}

const entries = order.map(slug => ({slug,title:titles[slug],thumbnail:campaignThumbnails[slug],media:mediaFor(slug),video:previewVideos[slug]}));
let selectedSlug = 'near-hijack';

function projectLink(entry, selected) {
  return `<li class="circular-project"><a class="project-index-link" data-project="${escape(entry.slug)}" href="/work/${escape(entry.slug)}" aria-label="${escape(entry.title)}" draggable="false" ${selected ? 'aria-current="true"' : ''}><span class="project-index-thumbnail" aria-hidden="true"><img src="${escape(entry.thumbnail.path)}" alt="" width="${entry.thumbnail.width}" height="${entry.thumbnail.height}" draggable="false" decoding="async"></span><span class="project-index-name sr-only">${escape(entry.title)}</span></a></li>`;
}

// The intro reel opens the page, under the header. Its captions are burned in, so it plays muted in a loop;
// "Watch with sound" restarts it with sound and native controls. Reduced motion and Save Data leave it on its poster.
const heroIcons = {
  sound: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h2.5L8 3v10L4.5 10H2z"/><path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12 3.5a6 6 0 0 1 0 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 3h3v10H4zM9 3h3v10H9z"/></svg>',
  play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.5v11L13 8z"/></svg>',
};

const hero = `<section class="home-hero" aria-label="Intro film">
    <div class="home-hero-frame">
      <video muted loop playsinline preload="metadata" poster="/images/home/intro-poster.webp" width="1280" height="720" aria-label="Intro film">
        <source src="/media/home/intro.mp4" type="video/mp4">
      </video>
      <div class="home-hero-controls">
        <button type="button" data-hero-sound>${heroIcons.sound}Watch with sound</button>
        <button type="button" class="home-hero-toggle" data-hero-toggle aria-label="Play intro film">${heroIcons.play}</button>
      </div>
    </div>
  </section>`;

export function renderHome() {
  const active = entries.find(entry => entry.slug === selectedSlug) || entries[0];
  return `${hero}
  <div class="portfolio-home page-wrap">
    <section class="project-explorer" id="work" aria-labelledby="portfolio-title">
      <h1 id="portfolio-title" class="sr-only">David Morrison — Selected work</h1>
      <nav class="circular-slider" data-circular-slider aria-label="Projects" aria-roledescription="carousel" aria-describedby="carousel-instructions">
        <p class="sr-only" id="carousel-instructions">Use the left and right arrow keys to browse projects. Press Enter to open a case study.</p>
        <div class="circular-track" data-circular-track><ul>${entries.map(entry => projectLink(entry,entry.slug === active.slug)).join('')}</ul></div>
        <a class="circular-current" data-carousel-current href="/work/${escape(active.slug)}"><span data-carousel-title>${escape(active.title)}</span><span aria-hidden="true">${icon('up-right')}</span></a>
        <div class="circular-controls"><p class="circular-hint">Drag to explore</p><div><button type="button" data-carousel-prev aria-label="Previous project">${icon('left')}</button><button type="button" data-carousel-next aria-label="Next project">${icon('right')}</button></div></div>
        <p class="sr-only" data-carousel-status aria-live="polite" aria-atomic="true"></p>
      </nav>
      <div class="project-gallery">
        <p class="explorer-introduction">Eight years leading social, creative campaigns and community for crypto startups. Selected work for NEAR, Fogo and Superluminal.</p>
        <div class="project-preview-wrap"><a class="project-preview" href="/work/${escape(active.slug)}" aria-label="Open ${escape(active.title)} case study">
          <figure class="project-preview-media"><img data-preview-image src="${escape(active.media.path)}" alt="${escape(active.media.alt)}" width="${active.media.width}" height="${active.media.height}" fetchpriority="high" decoding="async"></figure>
          <div class="project-preview-caption"><h2 data-preview-title>${escape(active.title)}</h2><span aria-hidden="true">${icon('up-right')}</span></div>
        </a><button class="preview-playback" type="button" data-preview-playback hidden aria-label="Pause video preview">Pause</button></div>
      </div>
    </section>
    <section class="explorer-about" id="about" aria-labelledby="about-title"><h2 id="about-title">About</h2><div><p>I’m David Morrison, a UK-based social and creative marketing lead. I’ve spent eight years at crypto and fintech startups, where small teams meant hands-on work across nearly every stage of the funnel: positioning, social, creative campaigns, launches, community and support.</p><p>At NEAR Foundation I rose from Community Lead to Head of Creative Campaigns & Social Media. I now lead social for special projects at Douro Labs.</p><p>I’m at home on a stage, too. I hosted NEARCON every year from 2022 to 2024, moderated a conversation with Edward Snowden at [REDACTED] 2024, and speak regularly at crypto events around the world. <a href="/videos/speaking">Watch the talks</a>.</p><a class="quiet-link" href="/resume">Experience & background <span aria-hidden="true">${icon('up-right')}</span></a></div></section>
    <section class="explorer-about explorer-testimonials" id="testimonials" aria-labelledby="testimonials-title"><h2 id="testimonials-title">Testimonials</h2><div>${testimonials.map(testimonial).join('')}</div></section>
  </div>`;
}

// Quotes are verbatim and link to where they were said.
const testimonials = [
  {
    quote: 'I’ve never seen marketing done as well as by @NEARProtocol',
    name: 'Advait Jayant',
    role: 'CSO, OpenGradient',
    photo: '/images/testimonials/advait-jayant.webp',
    context: {label: 'On Profile as a Canvas', href: '/work/near-profile-transformation'},
    source: {label: 'On X, 10 May 2024', url: 'https://x.com/advait_jayant/status/1789063420441997335'},
  },
  {
    quote: 'I kind of respect people that take bold risks like this',
    name: 'Mike Ippolito',
    role: 'Cofounder, Blockworks',
    photo: '/images/testimonials/mike-ippolito.webp',
    context: {label: 'On HiJack', href: '/work/near-hijack'},
    source: {label: 'On Bell Curve, 6 September 2024', url: 'https://www.youtube.com/watch?v=it3n5LFs46Y&t=630s'},
  },
  {
    quote: 'NEAR’s social media hype machine effectively sold to the world that their system was a) developed by them and did not infringe any rights, and b) was decentralized and safe.',
    name: 'Dominic Williams',
    role: 'Founder, ICP',
    photo: '/images/testimonials/dominic-williams.webp',
    source: {label: 'On X, 22 October 2026', url: 'https://x.com/dominic_w/status/2113261945671320015'},
  },
];

const testimonial = item => `<figure class="testimonial">
      <blockquote><p>“${escape(item.quote)}”</p></blockquote>
      <figcaption><img src="${escape(item.photo)}" alt="" width="96" height="96" loading="lazy" decoding="async"><span><strong>${escape(item.name)}</strong> ${escape(item.role)}<span class="testimonial-links">${item.context ? `<a href="${escape(item.context.href)}">${escape(item.context.label)}</a>` : ''}<a href="${escape(item.source.url)}" target="_blank" rel="noopener noreferrer">${escape(item.source.label)}<span class="sr-only"> (opens in a new tab)</span></a></span></span></figcaption>
    </figure>`;

// Plays only while on screen and the tab is visible. A pause the visitor chooses sticks; one we make doesn't.
function mountHero(section) {
  if (!section) return () => {};
  const video = section.querySelector('video');
  const toggle = section.querySelector('[data-hero-toggle]');
  const sound = section.querySelector('[data-hero-sound]');
  let wanted = !(matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData);
  let visible = false;
  const label = () => {
    toggle.setAttribute('aria-label', `${wanted ? 'Pause' : 'Play'} intro film`);
    toggle.innerHTML = wanted ? heroIcons.pause : heroIcons.play;
  };
  const sync = () => {
    if (wanted && visible && !document.hidden) video.play().catch(() => { wanted = false; label(); });
    else if (!video.paused) video.pause();
  };
  toggle.addEventListener('click', () => { wanted = !wanted; label(); sync(); });
  sound.addEventListener('click', () => {
    Object.assign(video, {currentTime: 0, muted: false, loop: false, controls: true});
    section.classList.add('has-sound');
    wanted = true;
    sync();
  });
  video.addEventListener('play', () => { wanted = true; label(); });
  video.addEventListener('pause', () => { if (visible && !document.hidden) { wanted = false; label(); } });
  const watch = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold: 0.25});
  watch.observe(section);
  document.addEventListener('visibilitychange', sync);
  label();
  return () => { watch.disconnect(); document.removeEventListener('visibilitychange', sync); video.pause(); };
}

let dispose = () => {};
export function mountHome(root = null) {
  dispose();
  dispose = () => {};
  if (!root) return;
  let slider;
  const currentLink = root.querySelector('[data-carousel-current]');
  const currentTitle = root.querySelector('[data-carousel-title]');
  const preview = mountProjectPreviews(root, entries, selectedSlug, slug => {
    selectedSlug = slug;
    currentLink.href = `/work/${slug}`;
    currentTitle.textContent = titles[slug];
    slider?.select(slug);
  });
  slider = mountCircularSlider(root.querySelector('[data-circular-slider]'), selectedSlug, slug => preview.select(slug));
  const stopHero = mountHero(document.querySelector('.home-hero'));
  dispose = () => { slider.dispose(); preview(); stopHero(); };
}

