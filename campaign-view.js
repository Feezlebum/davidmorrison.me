import { icon } from './icons.js';
import { tweetId, mountTweetEmbeds } from './tweet-embeds.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const external = (url, title, className = '') => `<a href="${escape(url)}" class="${className}" target="_blank" rel="noopener noreferrer">${escape(title)}<span class="sr-only"> (opens in a new tab)</span></a>`;
const list = value => Array.isArray(value) ? value : value ? [value] : [];
const paragraphs = value => list(value).map(paragraph => `<p>${escape(paragraph)}</p>`).join('');
const pad = number => String(number).padStart(2, '0');
const themes = { 'near-egg': 'egg', 'fogo-launch': 'fogo', 'near-profile-transformation': 'profile' };
const nextProjects = [
  { slug: 'near-hijack', title: 'HiJack' },
  { slug: 'fogo-launch', title: 'Fogo Fire Launch' },
  { slug: 'near-profile-transformation', title: 'The Profile as a Canvas' },
  { slug: 'near-egg', title: 'The Egg Is NEAR' },
];

// Each page borrows the look of the campaign it documents. Fogo runs dark like its
// night-time broadcast; Profile starts in blackout and lightens chapter by chapter;
// Egg is pastel and iridescent like the reveal film. Native posts follow the surface.
const darkThemes = new Set(['fogo', 'profile']);
const postTheme = (theme, step) => {
  if (theme === 'profile') return step && step.order >= 4 ? 'light' : 'dark';
  return darkThemes.has(theme) ? 'dark' : 'light';
};

function post(source, theme = 'light') {
  const id = tweetId(source.url);
  if (!id) return external(source.url, source.label, 'campaign-source-link');
  return `<div class="tweet-embed campaign-post" data-tweet-id="${escape(id)}" data-tweet-theme="${theme}" data-tweet-label="${escape(source.label)}">
    <div class="tweet-source-heading">${external(source.url, source.label, 'tweet-original-link')}<span aria-hidden="true">${icon('up-right')}</span></div>
    <div class="tweet-host"></div>
  </div>`;
}

function picture(media, { hero = false } = {}) {
  const path = media?.path || media?.localPath;
  if (!path) return '';
  return `<figure class="campaign-image ${hero ? 'campaign-hero-image' : 'campaign-full-image'}">
    <div class="campaign-image-frame"><img src="${escape(path)}" alt="${escape(media.alt)}" ${media.width ? `width="${escape(media.width)}"` : ''} ${media.height ? `height="${escape(media.height)}"` : ''} decoding="async" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'}></div>
    ${media.caption || media.credit ? `<figcaption>${media.caption ? `<span>${escape(media.caption)}</span>` : ''}${media.credit ? `<span>${escape(media.credit)}</span>` : ''}</figcaption>` : ''}
  </figure>`;
}

function references(sources, className = '') {
  if (!sources?.length) return '';
  return `<ul class="campaign-references ${className}">${sources.map(source => `<li>${external(source.url, source.label, 'campaign-source-link')}</li>`).join('')}</ul>`;
}

function timing(step) {
  const date = step.dateLabel || step.displayTime;
  if (!date) return '';
  const text = `${escape(date)}${step.displayTime && step.displayTime !== date ? ` <span>${escape(step.displayTime)}</span>` : ''}`;
  return step.exactDate ? `<time datetime="${escape(step.preciseTimestamp || step.exactDate)}">${text}</time>` : `<span>${text}</span>`;
}

function chapter(step, theme) {
  const links = step.sourceLinks || [];
  const posts = links.filter(source => tweetId(source.url));
  const otherSources = links.filter(source => !posts.includes(source));
  const earned = step.sourceType === 'earned-media' || step.sourceType === 'coverage';
  const sourceLabel = step.id === 'fogo-public-reactions' ? 'Replies' : 'Press';
  const body = step.body || step.caption;
  const hasImage = Boolean(step.media?.path || step.media?.localPath);
  const tone = postTheme(theme, step);
  return `<li class="timeline-chapter campaign-chapter campaign-step-${step.order} ${earned ? 'campaign-earned' : ''} ${posts.length > 1 ? 'campaign-multiple-posts' : ''} ${posts.length || hasImage ? 'campaign-with-media' : ''} ${hasImage && posts.length ? 'campaign-image-and-post' : ''}" id="${escape(step.id)}" tabindex="-1" data-tone="${tone}">
    <article>
      <div class="campaign-chapter-head">
        <span class="campaign-chapter-number" aria-hidden="true"><span>${pad(step.order)}</span></span>
        <div class="campaign-chapter-heading"><div class="campaign-chapter-meta">${timing(step)}${earned ? `<span class="campaign-earned-label">${sourceLabel}</span>` : ''}</div><h3>${escape(step.title)}</h3></div>
      </div>
      <div class="campaign-chapter-body">
        <div class="campaign-chapter-copy">${paragraphs(body)}${references(otherSources)}</div>
        ${step.media ? picture(step.media) : ''}
        ${posts.length ? `<div class="campaign-chapter-posts ${posts.length > 1 ? 'campaign-post-grid' : ''}">${posts.map(source => post(source, tone)).join('')}</div>` : ''}
      </div>
    </article>
  </li>`;
}

// Decorative heart-monitor trace for Fogo's hospital-bed act.
const ecg = `<svg class="fogo-ecg" viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 46 H120 l10 -4 l8 4 H170 l8 -36 l10 66 l9 -44 l7 14 H300 l10 -4 l8 4 H350 l8 -36 l10 66 l9 -44 l7 14 H480 l10 -4 l8 4 H530 l8 -36 l10 66 l9 -44 l7 14 H600"/></svg>`;
// "Darkness is coming" in Morse, as decoded from the opening video.
const morse = '-.. .- .-. -.- -. . ... ... / .. ... / -.-. --- -- .. -. --.';

function hero(project, campaign, theme) {
  const meta = `<div class="campaign-hero-meta"><span>${escape(campaign.brand || project.brand)}</span><span>${escape(campaign.dateLabel)}</span></div>`;
  const title = `<h1>${escape(campaign.title)}</h1>`;
  const summary = `<p class="campaign-summary">${escape(campaign.summary || campaign.subtitle)}</p>`;
  if (theme === 'fogo') {
    return `<header class="campaign-hero fogo-hero">
      <div class="fogo-stage">
        <div class="fogo-heat" aria-hidden="true">${Array.from({ length: 14 }, (_, index) => `<i style="--i:${index}"></i>`).join('')}</div>
        <div class="fogo-stage-top" aria-hidden="true"><span class="fogo-live"><span class="fogo-live-dot"></span>Live</span><span>Fire record attempt</span></div>
        <div class="fogo-hero-copy">${meta}${title}${summary}</div>
        <div class="fogo-scrubber" aria-hidden="true"><span class="fogo-scrubber-played"></span><span class="fogo-scrubber-cut">Feed cut</span></div>
      </div>
    </header>`;
  }
  if (theme === 'profile') {
    return `<header class="campaign-hero profile-hero">
      <div class="profile-banner" aria-hidden="true"><p class="profile-morse"><span>${morse}</span><span>${morse}</span></p></div>
      <div class="profile-identity">
        <div class="profile-avatar" aria-hidden="true"></div>
        ${meta}${title}<p class="profile-handle">@NEARProtocol</p>${summary}
      </div>
    </header>`;
  }
  if (theme === 'egg') {
    const still = campaign.heroStill;
    return `<header class="campaign-hero egg-hero">
      <div class="egg-hero-copy">${meta}${title}${summary}</div>
      ${still ? `<figure class="egg-hero-art"><div class="egg-shell"><div class="egg-shell-inner"><img src="${escape(still.path)}" alt="${escape(still.alt)}" width="${still.width}" height="${still.height}" fetchpriority="high" decoding="async"><svg class="egg-crack" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 10 L14 4 L24 14 L36 5 L47 15 L58 6 L69 14 L80 5 L90 13 L100 8"/></svg></div></div><figcaption>${escape(still.caption)}</figcaption></figure>` : ''}
    </header>`;
  }
  return `<header class="campaign-hero">${meta}${title}${summary}</header>`;
}

function featuredMedia(project, campaign, theme) {
  const sequence = campaign.sequence || [];
  const featureId = `${project.slug}-featured-film`;
  const featureUrl = campaign.heroSourceUrl || (campaign.heroMedia?.kind === 'tweet' ? campaign.heroMedia.sourceUrl : null);
  if (theme === 'fogo') {
    const acts = [
      { id: `${project.slug}-featured-broadcast`, day: 'Day one', kind: 'fire', title: 'The fire broadcast', step: sequence.find(step => step.id === 'fogo-fire-broadcast') },
      { id: featureId, day: 'Day two', kind: 'hospital', title: 'The hospital bed', step: sequence.find(step => step.id === 'fogo-launch-reveal') },
    ].map(act => ({ ...act, source: act.step?.sourceLinks.find(source => tweetId(source.url)) })).filter(act => act.source);
    if (!acts.length) return '';
    const markup = act => `<article class="campaign-act campaign-act-${act.kind} timeline-chapter" id="${escape(act.id)}" tabindex="-1" aria-labelledby="${escape(act.id)}-title">
      ${act.kind === 'fire' ? '<div class="fogo-act-flare" aria-hidden="true"><span class="fogo-live"><span class="fogo-live-dot"></span>Live</span></div>' : `<div class="fogo-act-monitor" aria-hidden="true">${ecg}</div>`}
      <div class="campaign-act-meta"><span>${act.day}</span>${timing(act.step)}</div><h2 id="${escape(act.id)}-title">${escape(act.title)}</h2>${post(act.source, act.kind === 'fire' ? 'dark' : 'light')}
    </article>`;
    return `<section class="campaign-feature-section campaign-two-acts" aria-label="The two launch films">${acts.map(markup).join('<div class="fogo-cut" aria-hidden="true"><span>Feed cut</span></div>')}</section>`;
  }
  if (theme === 'profile') {
    const reveal = sequence.find(step => step.featured);
    const source = reveal?.sourceLinks.find(source => tweetId(source.url));
    return `<section class="campaign-feature-section campaign-profile-feature" aria-label="The blackout and the reveal">
      <div class="campaign-profile-record"><h2>The blackout</h2>${picture(campaign.heroMedia, { hero: true })}</div>
      ${source ? `<article class="campaign-hero-feature timeline-chapter" id="${escape(featureId)}" tabindex="-1" aria-labelledby="${escape(featureId)}-title"><div class="campaign-act-meta">${timing(reveal)}</div><h2 id="${escape(featureId)}-title">The reveal</h2>${post(source, 'dark')}</article>` : ''}
    </section>`;
  }
  if (!featureUrl) return campaign.heroMedia ? `<section class="campaign-feature-section">${picture(campaign.heroMedia, { hero: true })}</section>` : '';
  const source = { url: featureUrl, label: 'The original NEAR reveal film' };
  return `<section class="campaign-feature-section campaign-single-feature" aria-labelledby="${escape(featureId)}-title">
    <div class="campaign-feature-caption"><h2 id="${escape(featureId)}-title">The reveal</h2>${campaign.heroMedia?.caption ? `<p>${escape(campaign.heroMedia.caption)}</p>` : ''}</div>
    <div class="campaign-hero-feature timeline-chapter" id="${escape(featureId)}" tabindex="-1">${post(source, postTheme(theme))}</div>
  </section>`;
}

function visualThreads(campaign) {
  const threads = campaign.visualThreads || [];
  if (!threads.length) return '';
  return `<section class="campaign-visual-thread" aria-labelledby="visual-thread-title"><h2 id="visual-thread-title">On the profile</h2><div>${threads.map(thread => `<article>
    ${thread.title ? `<h3>${escape(thread.title)}</h3>` : ''}${paragraphs(thread.body || thread.summary || thread.caption)}${thread.media ? picture(thread.media) : ''}${references(thread.sourceLinks)}
  </article>`).join('')}</div></section>`;
}

function relatedWork(campaign, theme) {
  const related = campaign.relatedWork || [];
  if (!related.length) return '';
  const tone = theme === 'fogo' ? 'dark' : 'light';
  return `<section class="campaign-related" aria-labelledby="campaign-related-title"><h2 id="campaign-related-title">Related work</h2>${related.map(item => {
    const sources = item.sourceLinks || item.sources || [];
    const posts = sources.filter(source => tweetId(source.url));
    return `<article class="campaign-related-item ${posts.length ? 'timeline-chapter' : ''}" ${posts.length ? `id="${escape(item.id)}" tabindex="-1"` : ''}>
      <div>${item.dateLabel ? `<p class="campaign-related-date">${escape(item.dateLabel)}</p>` : ''}<h3>${escape(item.title)}</h3></div>
      <div>${paragraphs(item.body || item.summary)}${item.credits?.length ? `<div class="campaign-related-credits">${paragraphs(item.credits)}</div>` : ''}${references(sources.filter(source => !posts.includes(source)))}</div>
      ${posts.length ? `<div class="campaign-related-posts ${posts.length > 1 ? 'campaign-post-grid' : ''}">${posts.map(source => post(source, tone)).join('')}</div>` : ''}
    </article>`;
  }).join('')}</section>`;
}

function results(campaign) {
  const counters = campaign.counterSnapshots || [];
  const observations = campaign.results || [];
  if (!counters.length && !observations.length) return '';
  const counterNote = counters.length && campaign.counterNote ? `<p class="campaign-counter-note" id="campaign-counter-note">${escape(campaign.counterNote)}</p>` : '';
  return `<section class="campaign-results timeline-chapter" id="campaign-results" tabindex="-1" aria-labelledby="campaign-results-title">
    <h2 id="campaign-results-title">Results</h2><div class="campaign-results-content">
      ${counters.length ? `<dl class="campaign-result-counters">${counters.map(counter => `<div class="campaign-counter" data-observed-at="${escape(counter.observedAt)}" data-published-date="${escape(counter.publishedDate)}" data-precision="${escape(counter.precision)}" ${counterNote ? 'aria-describedby="campaign-counter-note"' : ''}>
        <dt>${escape(counter.label)}</dt><dd class="campaign-counter-value">${escape(counter.displayValue)}</dd>
        <dd class="campaign-counter-evidence">${counter.evidenceAnchor ? `<a class="campaign-source-link" href="#${escape(counter.evidenceAnchor)}" aria-label="${escape(counter.label)} — source post">View source post</a>` : external(counter.sourceUrl, 'View source post', 'campaign-source-link')}</dd>
      </div>`).join('')}</dl>` : ''}${counterNote}
      ${observations.length ? `<div class="campaign-result-observations">${observations.map(result => `<article><h3>${escape(result.title)}</h3>${paragraphs(result.body)}
        ${result.evidenceAnchor ? `<a class="campaign-source-link" href="#${escape(result.evidenceAnchor)}">${escape(result.evidenceLabel || 'View the evidence')}</a>` : ''}
        ${references((result.sourceLinks || []).filter(source => !result.evidenceAnchor || !tweetId(source.url)))}
      </article>`).join('')}</div>` : ''}
      ${campaign.measurementContext?.length ? `<details class="campaign-measurement"><summary>Measurement context</summary>${paragraphs(campaign.measurementContext)}${campaign.measurementSource ? references([campaign.measurementSource]) : ''}</details>` : ''}
    </div>
  </section>`;
}

export function renderCampaignPage(project, campaign) {
  const theme = themes[project.slug] || campaign.theme || 'profile';
  const sequence = campaign.sequence || [];
  const idea = typeof campaign.idea === 'string' ? { title: campaign.idea } : campaign.idea;
  const facts = [
    ...(campaign.role ? [{ title: 'My role', value: campaign.role }] : []),
    { title: 'Goal', value: campaign.objective },
    { title: 'Formats', value: list(campaign.formats).join(' · '), items: list(campaign.formats) },
  ].filter(fact => fact.value);
  const next = nextProjects[(nextProjects.findIndex(item => item.slug === project.slug) + 1) % nextProjects.length];
  const credits = campaign.credits || [];
  const resultsMarkup = results(campaign);
  const factValue = fact => fact.items ? `<ul class="campaign-format-list">${fact.items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : escape(fact.value);
  return `<div class="page-wrap campaign-page campaign-${escape(theme)}" data-campaign-theme="${escape(theme)}" data-project="${escape(project.slug)}">
    <div class="breadcrumb campaign-breadcrumb"><a href="/#work">Selected work</a></div>
    ${hero(project, campaign, theme)}
    <div class="campaign-brief"><dl class="campaign-facts">${facts.map(fact => `<div><dt>${escape(fact.title)}</dt><dd>${factValue(fact)}</dd></div>`).join('')}</dl>
    ${resultsMarkup ? `<a class="campaign-results-jump" href="#campaign-results">See the results <span aria-hidden="true">${icon('down')}</span></a>` : ''}</div>
    <section class="campaign-story" aria-labelledby="campaign-story-title"><h2 id="campaign-story-title">${escape(idea?.title || campaign.subtitle || 'The idea')}</h2><div class="campaign-story-copy">${paragraphs(list(campaign.intro).slice(0, 2))}</div></section>
    ${featuredMedia(project, campaign, theme)}
    <section class="campaign-sequence" id="campaign-timeline" aria-labelledby="campaign-timeline-title">
      <div class="campaign-sequence-heading"><h2 id="campaign-timeline-title">How it ran</h2>${campaign.timelineTimezone ? `<p>Times ${escape(campaign.timelineTimezone)}</p>` : ''}</div>
      <details class="campaign-chapter-menu"><summary>Jump to a step <span aria-hidden="true">${icon('plus')}</span></summary><nav class="campaign-chapter-nav" aria-label="Campaign steps"><ol>${sequence.map(step => `<li><a href="#${escape(step.id)}"><span>${pad(step.order)}</span>${escape(step.title)}</a></li>`).join('')}</ol></nav></details>
      <ol class="campaign-chapters">${sequence.map(step => chapter(step, theme)).join('')}</ol>
    </section>
    ${resultsMarkup}${visualThreads(campaign)}${relatedWork(campaign, theme)}
    <section class="campaign-sources" aria-labelledby="campaign-sources-title"><h2 id="campaign-sources-title">Credits and sources</h2><div>${credits.length ? `<div class="campaign-credits">${paragraphs(credits)}</div>` : ''}<details><summary>All sources</summary>${references(campaign.sources || [], 'campaign-all-sources')}</details></div></section>
    <nav class="campaign-end-nav" aria-label="Project navigation"><a href="/#work"><span aria-hidden="true">${icon('left')}</span> All work</a><a href="/work/${escape(next.slug)}">Next: ${escape(next.title)} <span aria-hidden="true">${icon('right')}</span></a></nav>
  </div>`;
}

let dispose = () => {};
export function mountCampaignTimeline(root = null) {
  dispose();
  dispose = () => {};
  if (!root) return dispose;
  const unmountPosts = mountTweetEmbeds(root);
  const links = Array.from(root.querySelectorAll('.campaign-chapter-nav a'));
  const chapters = Array.from(root.querySelectorAll('.campaign-chapter'));
  const current = id => links.forEach(link => link.hash === `#${id}` ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
  if (chapters[0]) current(chapters[0].id);
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) current(entry.target.id);
  }, { rootMargin: '-10% 0px -60% 0px' });
  chapters.forEach(chapter => observer.observe(chapter));
  let active = true;
  dispose = () => {
    if (!active) return;
    active = false;
    observer.disconnect();
    unmountPosts();
  };
  return dispose;
}

