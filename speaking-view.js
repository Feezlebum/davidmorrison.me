// Speaking: talks and interviews on a dark stage. Each talk plays on a stage screen under its own spotlight, with
// the event badge hanging beside it on a lanyard. YouTube only loads when a talk is played.
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

// Each talk: {slug, video, start (seconds), thumb, event, year, role, title, note}. `start` is where David comes on.
export const talks = [
  {
    slug: 'redacted-2024-snowden',
    video: 'VCfTLQo5QZ0',
    start: 1377,
    thumb: 'maxresdefault',
    event: '[REDACTED]',
    year: '2024',
    role: 'Moderator',
    title: 'Digital Sovereignty in the Age of AI',
    note: 'In conversation with Edward Snowden.',
  },
  {
    slug: 'ethdenver-2024',
    video: '1ohlR_tPlVM',
    start: 594,
    thumb: 'hqdefault',
    event: 'ETHDenver',
    year: '2024',
    role: 'Speaker',
    title: 'NEAR Protocol: An Overview',
    note: 'An introduction to NEAR, framed as Two Truths and a Lie.',
  },
];

const watchUrl = talk => `https://www.youtube.com/watch?v=${talk.video}&t=${talk.start}s`;
const clock = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// A row of stage lamps on a lighting bar, and the silhouetted front row. Shared with the Speaking card on /videos.
export const lamps = count => `<span class="sp-lamps" aria-hidden="true">${Array.from({length: count}, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>`;

export function crowd(cls) {
  const heads = (y, r, step, offset, row) => Array.from({length: Math.ceil(240 / step) + 1}, (_, i) => {
    const x = offset + i * step, h = y + ((i * 7) % 3) * .7;
    return `<path class="sp-head" style="--i:${i + row * 3}" d="M${x - r * 2.1} 24 C${x - r * 2.1} ${h + r * 1.5} ${x - r} ${h + r * 1.2} ${x} ${h + r * 1.2} S${x + r * 2.1} ${h + r * 1.5} ${x + r * 2.1} 24 Z M${x} ${h} m${-r} 0 a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0"/>`;
  }).join('');
  return `<svg class="${cls}" viewBox="0 0 240 24" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
    <g class="sp-row-back">${heads(10, 2.4, 8.5, 2, 1)}</g><g class="sp-row-front">${heads(14, 3.2, 11, -1, 0)}</g>
  </svg>`;
}

export const mic = cls => `<svg class="${cls}" viewBox="0 0 40 100" aria-hidden="true" focusable="false">
  <ellipse cx="20" cy="96" rx="13" ry="3"/><path d="M19 95 V44 h2 V95 Z"/><path d="M20 46 L31 20 l1.8 .8 L21.8 46.8 Z"/>
  <rect x="27" y="4" width="9" height="19" rx="4.5" transform="rotate(22 31.5 13.5)"/>
</svg>`;

function renderTalk(talk) {
  return `
    <article class="sp-set" id="${escape(talk.slug)}" aria-labelledby="${escape(talk.slug)}-title" data-sp-set>
      <div class="sp-screen">
        <div class="sp-player" data-sp-player>
          <img src="https://i.ytimg.com/vi/${escape(talk.video)}/${escape(talk.thumb)}.jpg" alt="" width="1280" height="720" loading="lazy" decoding="async">
          <button type="button" class="sp-play" data-video="${escape(talk.video)}" data-start="${talk.start}" data-title="${escape(`${talk.title}, ${talk.event} ${talk.year}`)}" aria-label="${escape(`Play ${talk.title}, ${talk.event} ${talk.year}, from ${clock(talk.start)}`)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.2v13.6L19.4 12z"/></svg>
          </button>
        </div>
      </div>
      <div class="sp-badge">
        <svg class="sp-lanyard" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M4 0h16l27 100h-6zM80 0h16L59 100h-6z"/></svg>
        <div class="sp-pass">
          <p class="sp-event"><span>${escape(talk.event)}</span><span>${escape(talk.year)}</span></p>
          <p class="sp-role">${escape(talk.role)}</p>
          <h2 id="${escape(talk.slug)}-title">${escape(talk.title)}</h2>
          <p class="sp-note">${escape(talk.note)}</p>
          <a class="sp-watch" href="${escape(watchUrl(talk))}" target="_blank" rel="noopener noreferrer">Watch on YouTube from ${clock(talk.start)}<span class="sr-only"> (opens in a new tab)</span></a>
        </div>
      </div>
    </article>`;
}

export function renderSpeaking() {
  return `
  <div class="sp-page">
    <header class="video-intro page-wrap">
      <h1>Speaking</h1>
      <p>I hosted NEARCON every year from 2022 to 2024, and I speak regularly at crypto events around the world, as a speaker, a host and a moderator. Here are two of those talks, each cued to where I come on.</p>
    </header>
    <section class="sp-stage" aria-label="Talks" data-sp-stage>
      ${lamps(9)}
      ${talks.map(renderTalk).join('')}
      <div class="sp-floor">${crowd('sp-crowd')}</div>
    </section>
  </div>`;
}

// Lights come up on the stage when it scrolls into view. A talk loads YouTube only when its play button is pressed.
let cleanup = null;
export function mountSpeaking(root) {
  cleanup?.();
  cleanup = null;
  if (!root) return;
  root.querySelectorAll('.sp-play').forEach(button => button.addEventListener('click', () => {
    const {video, start, title} = button.dataset;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video)}?start=${Number(start)}&autoplay=1&rel=0`;
    frame.title = title;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    // The page sends no referrer, but YouTube's player needs one to start.
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.allowFullscreen = true;
    const player = button.closest('[data-sp-player]');
    player.replaceChildren(frame);
    player.closest('[data-sp-set]').classList.add('is-playing');
    frame.focus();
  }));
  const stage = root.querySelector('[data-sp-stage]');
  if (!stage || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  stage.classList.add('is-dark');
  const watch = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    watch.disconnect();
    stage.classList.replace('is-dark', 'is-lit');
  }, {threshold: 0.12});
  watch.observe(stage);
  cleanup = () => watch.disconnect();
}
