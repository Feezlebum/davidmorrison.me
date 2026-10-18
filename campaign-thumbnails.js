// Decorative artwork made for this portfolio, separate from campaign evidence.
const artwork = (slug, description) => ({
  path: `/images/campaign-thumbnails/${slug}.webp`,
  width: 512,
  height: 512,
  kind: 'original-portfolio-artwork',
  description,
});

export const campaignThumbnails = {
  'near-hijack': artwork('near-hijack', 'A green sculpted signal-mask with a black visor and displaced scanlines.'),
  'fogo-launch': artwork('fogo-launch', 'A violet obsidian shard ignited by a red-orange flame.'),
  'near-profile-transformation': artwork('near-profile-transformation', 'An illuminated identity silhouette fractured within a black-glass panel.'),
  'near-egg': artwork('near-egg', 'A chrome egg with pastel reflections and a fine opening seam.'),
  'near-ai-film': artwork('near-ai-film', 'A silver neural knot around an emerald core beneath a luminous aperture.'),
  'slx-ai-reference': artwork('slx-ai-reference', 'An optical prism on a stepped stone monument splitting a beam of light.'),
};
