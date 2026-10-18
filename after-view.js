import { icon } from './icons.js';
import { projects } from './content.js';
import { tweetId, mountTweetEmbeds } from './tweet-embeds.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const external = source => `<a href="${escape(source.url)}" class="tweet-original-link" target="_blank" rel="noopener noreferrer">${escape(source.label)}<span class="sr-only"> (opens in a new tab)</span></a>`;


// These short introductions use the documented film facts. The original posts
// carry the films and their context; internal credit questions stay in the data.
const films = {
  'near-ai-film': {
    title: 'NEAR AI film',
    cardTitle: 'NEAR AI film',
    summary: 'A Snowden-related short film, made with AI.',
    introduction: 'A 25-second Snowden-related film, made with AI. Released by NEAR on 2 September 2024.',
    duration: '25 seconds',
    mark: 'NEAR',
    format: 'AI film / 25 seconds',
    mediaTitle: 'The film',
    contextTitle: 'The event context',
  },
  'slx-ai-reference': {
    title: 'Introducing Superluminal.',
    cardTitle: 'Introducing Superluminal.',
    summary: 'An AI-generated introduction film for Superluminal.',
    introduction: 'Superluminal’s introduction film. Made with AI, published in June 2026.',
    mark: 'Superluminal',
    format: 'AI introduction film',
    mediaTitle: 'The introduction film',
  },
};

const selectedFilms = () => projects.filter(item => films[item.slug]).sort((a, b) => Number(a.presentation === 'supporting') - Number(b.presentation === 'supporting'));

function post(source) {
  const id = tweetId(source.url);
  if (!id) return `<p class="film-source-link">${external(source)}</p>`;
  return `<div class="tweet-embed after-post" data-tweet-id="${escape(id)}" data-tweet-label="${escape(source.label)}" data-tweet-theme="light"><div class="tweet-source-heading">${external(source)}<span aria-hidden="true">${icon('up-right')}</span></div><div class="tweet-host"></div></div>`;
}

function card(item) {
  const film = films[item.slug];
  const supporting = item.presentation === 'supporting';
  return `<article class="after-project ${supporting ? 'after-project-supporting' : 'after-project-lead'}" id="${escape(item.slug)}">
    <a class="after-project-link" href="/work/${escape(item.slug)}">
      <div class="after-project-art ${supporting ? 'after-art-superluminal' : 'after-art-near'}" aria-hidden="true"><span class="after-art-top">${escape(item.brand)} / ${escape(item.dateLabel)}</span><span class="after-art-mark">${escape(film.mark)}</span><span class="after-art-bottom">${escape(film.format)}<span>${icon('up-right')}</span></span></div>
      <div class="after-project-copy"><h2>${escape(film.cardTitle)}</h2><p>${escape(film.summary)}</p><span class="after-project-cta">View the film <span aria-hidden="true">${icon('up-right')}</span></span></div>
    </a>
  </article>`;
}

export function renderAfter() {
  return `<div class="page-wrap after-page after-index">
    <section class="after-index-hero" aria-labelledby="after-title"><div><h1 id="after-title">After</h1></div><p>A selection of films made with AI.</p></section>
    <section class="after-selected" aria-label="Selected AI-generated films">${selectedFilms().map(card).join('')}</section>
  </div>`;
}

export function renderFilmPage(item) {
  const film = films[item?.slug];
  if (!film) return '';
  const sources = item.sources || [];
  const primaryUrl = item.media?.find(media => media.sourceUrl)?.sourceUrl;
  const primary = sources.find(source => source.url === primaryUrl) || sources[0];
  const context = sources.filter(source => source !== primary);
  const other = selectedFilms().find(project => project.slug !== item.slug);
  return `<div class="page-wrap after-page film-page">
    <div class="film-breadcrumb"><a href="/#work">Selected work</a></div>
    <header class="film-hero"><h1>${escape(film.title)}</h1><p>${escape(film.introduction)}</p></header>
    <dl class="film-facts"><div><dt>Brand</dt><dd>${escape(item.brand)}</dd></div><div><dt>Published</dt><dd>${escape(item.dateLabel)}</dd></div><div><dt>Production</dt><dd>AI-generated film</dd></div>${film.duration ? `<div><dt>Duration</dt><dd>${escape(film.duration)}</dd></div>` : ''}</dl>
    ${primary ? `<section class="timeline-chapter film-section" id="${escape(item.slug)}-film" aria-labelledby="film-release-title"><div class="film-section-heading"><h2 id="film-release-title">${escape(film.mediaTitle)}</h2></div><div class="film-posts">${post({...primary, label: `${item.brand} · original film post`})}</div></section>` : ''}
    ${context.length ? `<section class="timeline-chapter film-section film-context" id="${escape(item.slug)}-context" aria-labelledby="film-context-title"><div class="film-section-heading"><h2 id="film-context-title">${escape(film.contextTitle || 'The context')}</h2></div><div class="film-posts">${context.map(post).join('')}</div></section>` : ''}
    <nav class="film-end-nav" aria-label="Film navigation"><a href="/#work"><span aria-hidden="true">${icon('left')}</span> All work</a>${other ? `<a href="/work/${escape(other.slug)}">${escape(films[other.slug].cardTitle)} <span aria-hidden="true">${icon('up-right')}</span></a>` : ''}</nav>
  </div>`;
}

let dispose = () => {};
export function mountAfterPosts(root = null) {
  dispose();
  dispose = root ? mountTweetEmbeds(root) : () => {};
}


