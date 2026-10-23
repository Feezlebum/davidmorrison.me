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

export function renderHome() {
  const active = entries.find(entry => entry.slug === selectedSlug) || entries[0];
  return `<div class="portfolio-home page-wrap">
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
    quote: 'NEAR’s social media hype machine effectively sold to the world that their system was a) developed by them and did not infringe any rights, and b) was decentralized and safe.',
    name: 'Dominic Williams',
    role: 'Founder, ICP',
    photo: '/images/testimonials/dominic-williams.webp',
    source: {label: 'On X, 22 October 2026', url: 'https://x.com/dominic_w/status/2113261945671320015'},
  },
];

const testimonial = item => `<figure class="testimonial">
      <blockquote><p>“${escape(item.quote)}”</p></blockquote>
      <figcaption><img src="${escape(item.photo)}" alt="" width="96" height="96" loading="lazy" decoding="async"><span><strong>${escape(item.name)}</strong> ${escape(item.role)}<a href="${escape(item.source.url)}" target="_blank" rel="noopener noreferrer">${escape(item.source.label)}<span class="sr-only"> (opens in a new tab)</span></a></span></figcaption>
    </figure>`;

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
  dispose = () => { slider.dispose(); preview(); };
}

