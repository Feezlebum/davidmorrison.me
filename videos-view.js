// Videos index: one collage card per category, each styled in its own category's world.
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const piece = (path, cls, width, height) => `<img class="vc-piece ${cls}" src="/images/vox/pieces/${path}.webp" alt="" width="${width}" height="${height}" decoding="async" draggable="false">`;
// The four-point sparkle every AI feature ships with.
const spark = cls => `<svg class="sl-spark ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12.9 6.3 17.7 11.1 24 12C17.7 12.9 12.9 17.7 12 24C11.1 17.7 6.3 12.9 0 12C6.3 11.1 11.1 6.3 12 0Z"/></svg>`;

export const videoCategories = [
  {
    slug: 'vox',
    title: 'VOX',
    href: '/videos/vox',
    // Paper collage on a flat field: pieces from the VOX films, with the saucer beaming down on the letters.
    art: () => `
      <span class="vc-beam" aria-hidden="true"></span>
      ${piece('the-inner-circle/globe', 'vc-globe', 951, 1171)}
      ${piece('i-want-to-believe/alien', 'vc-alien', 521, 1010)}
      ${piece('i-want-to-believe/ufo', 'vc-ufo', 780, 262)}`,
  },
  {
    slug: 'motion-design',
    title: 'Motion Design',
    href: '/videos/motion-design',
    // A motion study that only plays on hover: a ball bouncing with squash and stretch and a trail of ghosts,
    // over the easing curve that drives it.
    art: () => `
      <svg class="mt-graph" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path class="mt-handle" d="M8 88 L46 88 M92 14 L56 14"/>
        <path class="mt-curve" pathLength="1" d="M8 88 C46 88 56 14 92 14"/>
        <circle cx="46" cy="88" r="1.6"/><circle cx="56" cy="14" r="1.6"/>
      </svg>
      <span class="mt-floor" aria-hidden="true"></span>
      ${[3, 2, 1, 0].map(lag => `<span class="mt-ball-x mt-ghost-${lag}" style="--lag:${lag}" aria-hidden="true"><span class="mt-ball-y"><span class="mt-ball"></span></span></span>`).join('')}`,
  },
  {
    slug: 'slop',
    title: 'Slop',
    href: '/videos/slop',
    // AI experiments and cuts that never quite landed, dressed as the slop they're named after: an AI-gradient field,
    // sparkles everywhere, and slime letters that drip into a puddle. The goo filter melts the drips into the type.
    art: () => `
      <svg class="sl-defs" aria-hidden="true" focusable="false"><filter id="sl-goo" x="-25%" y="-40%" width="150%" height="420%" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 24 -11"/>
      </filter></svg>
      <span class="sl-swirl" aria-hidden="true"></span>
      ${spark('sl-spark-1')}${spark('sl-spark-2')}${spark('sl-spark-3')}${spark('sl-spark-4')}${spark('sl-spark-5')}
      <svg class="sl-puddle" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 7C9 3 17 9 27 6S45 1 55 5S75 10 85 5S96 3 100 6V20H0Z"/></svg>`,
  },
];

const title = text => `<span class="vc-title">${text.split(' ').map(word =>
  `<span class="vc-word">${[...word].map((letter, i) => `<span class="vc-letter" style="--i:${i}">${escape(letter)}</span>`).join('')}</span>`).join('')}</span>`;

export function renderVideos() {
  return `
  <section class="page-wrap videos-page" aria-labelledby="videos-title">
    <h1 id="videos-title" class="sr-only">Videos</h1>
    <ul class="video-categories">
      ${videoCategories.map(category => `
      <li><a class="video-category video-category--${category.slug}" href="${escape(category.href)}">
        ${category.art()}
        ${title(category.title)}
      </a></li>`).join('')}
    </ul>
  </section>`;
}
