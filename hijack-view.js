import { icon } from './icons.js';
import { projects } from './content.js';
import { tweetId, mountTweetEmbeds } from './tweet-embeds.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const external = (url, label, className = '') => `<a href="${escape(url)}" class="${className}" target="_blank" rel="noopener noreferrer">${escape(label)}<span class="sr-only"> (opens in a new tab)</span></a>`;
const project = slug => projects.find(item => item.slug === slug);
const tag = text => `<span class="hijack-label">${escape(text)}</span>`;
const image = (media, { lazy = false, sizes = '(max-width:760px) 100vw, 1200px' } = {}) => `<picture><source type="image/webp" srcset="/images/near-hijack/hijack-broadcast-small.webp 900w, /images/near-hijack/hijack-broadcast.webp 1800w" sizes="${escape(sizes)}"><img src="${escape(media.path || media.posterPath)}" alt="${escape(media.alt)}" width="${media.width || 2874}" height="${media.height || 1460}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></picture>`;

function indexProject(item) {
  const media = item.heroMedia?.kind === 'image' ? item.heroMedia : null;
  const path = media?.localPath || media?.path;
  return `<li><a class="case-option ${path ? 'has-image' : ''}" href="/work/${escape(item.slug)}">
    ${path ? `<figure class="case-option-image"><img src="${escape(path)}" alt="${escape(media.alt)}" width="${media.width}" height="${media.height}" loading="lazy" decoding="async"></figure>` : ''}
    <div class="case-option-copy"><p class="case-option-meta"><span>${escape(item.brand)}</span><span>${escape(item.dateLabel)}</span></p><h3>${escape(item.title)}</h3><p class="case-option-summary">${escape(item.summary)}</p></div>
    <span class="case-option-arrow" aria-hidden="true">${icon('up-right')}</span>
  </a></li>`;
}

export function renderCampaignIndex() {
  const lead = project('near-hijack');
  const other = ['fogo-launch', 'near-profile-transformation', 'near-egg'].map(project).filter(Boolean);
  return `<div class="page-wrap before-index">
    <section class="before-index-heading" aria-labelledby="before-title"><h1 id="before-title">Before the Singularity</h1><p>Social platforms as a canvas. Every touchpoint, part of the story.</p></section>
    <a class="campaign-lead" href="/work/near-hijack" aria-label="HiJack — NEAR case study">
      <div class="campaign-lead-art">${image(lead.heroMedia, { sizes: '(max-width:760px) 100vw, 65vw' })}</div>
      <div class="campaign-lead-copy"><p class="campaign-lead-meta">${tag(lead.brand)}<span>${escape(lead.dateLabel)}</span></p><h2>HiJack</h2><p class="campaign-lead-description">${escape(lead.subtitle)}</p><p class="campaign-lead-role">${escape(lead.role)}</p><span class="case-entry">View the case study <span aria-hidden="true">${icon('up-right')}</span></span></div>
    </a>
    <section class="case-selection" aria-labelledby="cases-title"><h2 id="cases-title">Selected campaigns</h2><ol class="case-options">${other.map(indexProject).join('')}</ol></section>
    <p class="index-editorial-note">Campaigns built across the profile, feed and film.</p>
  </div>`;
}

function timelineIndex(item) {
  return `<aside class="timeline-sidebar"><details class="timeline-index" open><summary>Timeline <span aria-hidden="true">${icon('plus')}</span></summary><nav aria-label="HiJack timeline"><p class="hijack-label">Timeline</p><ol>${item.sequence.map(step => `<li><a href="#${escape(step.id)}"><span>${escape(step.preciseTimestamp ? step.displayTime : '—')}</span>${escape(step.title)}</a></li>`).join('')}</ol></nav></details></aside>`;
}

function sourceCards(step) {
  if (!step.sourceLinks.length) return '';
  const closing = step.id === 'closing-invitation';
  return `<ol class="timeline-sources ${closing ? 'closing-sources' : ''} ${step.id === 'central-film' ? 'film-post' : ''}" aria-label="${closing ? 'Closing thread in original order' : 'Original posts'}">${step.sourceLinks.map((source, index) => `<li class="tweet-panel"><div class="tweet-embed" data-tweet-id="${escape(tweetId(source.url))}" data-tweet-label="${escape(source.label)}" data-tweet-theme="dark"><div class="tweet-source-heading">${closing ? `<span class="source-order">${String(index + 1).padStart(2, '0')}</span>` : ''}${external(source.url, source.label, 'tweet-original-link')}<span aria-hidden="true">${icon('up-right')}</span></div><div class="tweet-host"></div></div></li>`).join('')}</ol>`;
}

function timelineMedia(step) {
  const media = step.media;
  if (step.id === 'account-opening-scene' && media?.localPath) {
    return `<figure class="profile-evidence"><img src="${escape(media.localPath)}" alt="${escape(media.alt)}" width="${media.width}" height="${media.height}" loading="lazy" decoding="async"><figcaption>${escape(media.caption)}<span>${escape(media.credit)}</span></figcaption></figure>`;
  }
  if (step.id === 'central-film' && media?.localPath) {
    return `<figure class="timeline-film"><video controls preload="none" poster="${escape(media.posterPath)}"><source src="${escape(media.localPath)}" type="video/mp4">${media.captionsPath ? `<track kind="captions" src="${escape(media.captionsPath)}" srclang="en" label="English" default>` : ''}Your browser cannot play this video. ${external(media.sourceUrl, 'View original film')}</video><figcaption>${escape(media.caption)}</figcaption></figure>`;
  }
  return '';
}

// Each chapter reads like a line in a broadcast log: the UTC time is the headline marker.
function timelineChapter(step) {
  const displayTime = step.displayTime.replace(/ UTC$/, '');
  const stamp = step.preciseTimestamp ? `<time datetime="${escape(step.preciseTimestamp)}">${escape(displayTime)}</time>` : `<span class="unrecorded-time">${escape(displayTime)}</span>`;
  return `<li class="timeline-chapter ${step.id === 'central-film' ? 'film-chapter' : ''} ${step.preciseTimestamp ? '' : 'untimed-chapter'}" id="${escape(step.id)}" tabindex="-1"><div class="timeline-stamp"><span class="timeline-number" aria-hidden="true">${String(step.order).padStart(2, '0')}</span>${stamp}</div><article class="timeline-content"><h3>${escape(step.title)}</h3><p class="chapter-copy">${escape(step.body)}</p>${timelineMedia(step)}${sourceCards(step)}</article></li>`;
}

function results(item) {
  const get = label => item.results.find(metric => metric.label === label);
  const mindshare = get('Mindshare');
  const trending = get('Trending on X');
  const coverage = get('Organic coverage');
  const registrations = get('Event and hackathon sign-ups');
  const sentiment = get('Sentiment change');
  return `<section class="hijack-results" aria-labelledby="results-title"><div class="hijack-results-heading"><p class="hijack-label">After the broadcast</p><h2 id="results-title">Results</h2></div><div class="hijack-result-content">
    <div class="hijack-metrics">
      <div><p class="hijack-metric-value">${escape(mindshare.value)}</p><h3>Increase in mindshare</h3><p>In-house tracking of discussion on X.</p></div>
      <div><p class="hijack-metric-value">${escape(trending.value)} ${escape(trending.unit)}</p><h3>Trending on X</h3></div>
      <div><p class="hijack-metric-value">${escape(coverage.value)}</p><h3>Pieces of organic coverage</h3><p>Including CoinDesk and Protos.</p></div>
    </div>
    <div class="hijack-result-notes"><div class="registration-result"><h3>${escape(registrations.value)} registrations</h3><p>More people registered for [REDACTED] and the $500k Online Hackathon.</p></div>
    <div class="hijack-tradeoff"><h3>The trade-off</h3><p>Measured sentiment fell by roughly ${escape(sentiment.value.replace('≈', ''))} points. Reaction was split, and the coverage below shows both sides.</p></div></div>
    <p class="hijack-methodology">Mindshare and sentiment come from in-house tracking of discussion on X.</p>
    <details class="hijack-measurement"><summary>Measurement context</summary><p>These are my own campaign figures. Mindshare and sentiment come from in-house tracking of discussion on X and haven’t been independently audited. I don’t have the comparison period, denominator, sample size, sentiment scale or trending territory to hand. September 2024 is when the campaign ran, not a measurement window. Sentiment is in points, not percent. Registrations went up, but I can’t put a number on the lift or attribute it to the campaign alone.</p></details>
  </div></section>`;
}

function press(item) {
  const coverage = item.sources.filter(source => source.kind === 'coverage');
  return `<section class="hijack-press" aria-labelledby="press-title"><h2 id="press-title">Press</h2><div><ul>${coverage.map(source => `<li>${external(source.url, source.label)}</li>`).join('')}</ul><p>The press was as split as the timeline.</p></div></section>`;
}

export function renderHiJack() {
  const item = project('near-hijack');
  const film = item.sequence.find(step => step.id === 'central-film');
  return `<div class="page-wrap hijack-page"><div class="breadcrumb"><a href="/#work">Selected work</a></div>
    <section class="hijack-hero" aria-labelledby="hijack-title">
      <div class="hijack-screen">
        ${image(item.heroMedia)}
        <div class="hijack-screen-fx" aria-hidden="true"></div>
        <p class="hijack-screen-bug" aria-hidden="true"><span class="hijack-rec"></span>Signal interrupted</p>
        <p class="hijack-screen-clock" aria-hidden="true">04.09.24 · 18:23:52 UTC</p>
        <div class="hijack-hero-copy"><p class="hijack-hero-meta"><span>${escape(item.brand)}</span><span>${escape(item.dateLabel)}</span></p><h1 id="hijack-title" class="hijack-title" data-text="HiJack">HiJack</h1><p class="hijack-subtitle">${escape(item.subtitle)}</p></div>
      </div>
      <p class="hijack-screen-credit"><span>${escape(item.heroMedia.caption)}</span><span>${escape(item.heroMedia.credit)}</span></p>
    </section>
    <section class="hijack-brief" aria-label="Campaign summary">
      <p class="hijack-intro">${escape(item.intro[0])}</p>
      <dl class="hijack-facts"><div><dt>My role</dt><dd>${escape(item.role)}</dd></div><div><dt>Goal</dt><dd>${escape(item.objective)}</dd></div><div><dt>Formats</dt><dd>Profile · Posts · Phone line · Film</dd></div></dl>
      <a class="hijack-jump" href="#campaign-timeline">See how it ran <span aria-hidden="true">${icon('down')}</span></a>
    </section>
    <section class="hijack-idea" aria-labelledby="idea-title">
      <div class="hijack-idea-copy"><p class="hijack-label">The idea</p><h2 id="idea-title">${escape(item.idea.title)}</h2><p>${escape(item.idea.body)}</p><p>${escape(item.intro[2])}</p></div>
      <div class="hijack-hero-film timeline-chapter" id="near-hijack-featured-film" tabindex="-1" aria-label="HiJack’s main film"><p class="hijack-label">The film</p>${sourceCards(film)}</div>
    </section>
    <section class="hijack-timeline-section" id="campaign-timeline" aria-labelledby="timeline-title"><header class="hijack-timeline-heading"><h2 id="timeline-title">How it ran</h2><p><time datetime="${escape(item.timelineDate)}">${escape(item.timelineDateLabel)}</time><span>All times ${escape(item.timelineTimezone)}</span></p></header><div class="timeline-layout">${timelineIndex(item)}<ol class="campaign-timeline">${item.sequence.map(timelineChapter).join('')}</ol></div></section>
    ${results(item)}${press(item)}
    <section class="hijack-credits" aria-labelledby="hijack-credits-title"><h2 id="hijack-credits-title">Credits and sources</h2><div><p><strong>${escape(item.role)}</strong> · David Morrison</p><p>Inspired by the 1987 Max Headroom broadcast intrusion.</p><p class="hijack-media-credit">Broadcast still: David Morrison. Profile screenshot preserved by CoinDesk.</p><details><summary>All original posts</summary><ul>${item.sources.filter(source => source.kind !== 'coverage').map(source => `<li>${external(source.url, source.label)}</li>`).join('')}</ul></details></div></section>
    <nav class="case-end-nav" aria-label="Case study navigation"><a href="/#work"><span aria-hidden="true">${icon('left')}</span> All work</a><a href="/work/fogo-launch">Next: Fogo Fire Launch <span aria-hidden="true">${icon('right')}</span></a></nav>
  </div>`;
}

let cleanup = () => {};
export function mountHiJackTimeline() {
  cleanup();
  cleanup = () => {};
  const page = document.querySelector('.hijack-page');
  const index = page?.querySelector('.timeline-index');
  if (!index) return;
  const query = matchMedia('(max-width:900px)');
  const setOpen = () => { index.open = !query.matches; };
  setOpen();
  query.addEventListener('change', setOpen);
  const links = Array.from(index.querySelectorAll('a'));
  const chapters = Array.from(page.querySelectorAll('.campaign-timeline > .timeline-chapter'));
  const setCurrent = id => links.forEach(link => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  const initial = chapters.find(chapter => `#${chapter.id}` === location.hash) || chapters[0];
  if (initial) setCurrent(initial.id);
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
  }, { rootMargin: '-10% 0px -55% 0px' });
  chapters.forEach(chapter => observer.observe(chapter));
  const unmountTweets = mountTweetEmbeds(page);
  cleanup = () => {
    query.removeEventListener('change', setOpen);
    observer.disconnect();
    unmountTweets();
  };
}



