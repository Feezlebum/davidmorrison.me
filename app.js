import { projects, contacts } from './content.js';
import { renderHome, mountHome } from './portfolio-view.js';
import { renderResume } from './resume-view.js';
import { renderAfter, renderFilmPage, mountAfterPosts } from './after-view.js';
import { campaignContent } from './campaign-content.js';
import { renderCampaignPage, mountCampaignTimeline } from './campaign-view.js';
import { renderCampaignIndex, renderHiJack, mountHiJackTimeline } from './hijack-view.js';
import { renderVox, mountVox } from './vox-view.js';
import { renderVideos } from './videos-view.js';
import { renderMotion, mountMotion } from './motion-view.js';
import { renderSlop, mountSlop } from './slop-view.js';

const main = document.querySelector('#main');
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const project = slug => projects.find(item => item.slug === slug);

function header(route) {
  document.querySelector('#header').innerHTML = `
    <a class="identity" href="/" aria-label="David Morrison, home">David Morrison</a>
    <nav aria-label="Main navigation" class="header-links">
      <a href="/#work" ${route.startsWith('/work/') || ['/before', '/after'].includes(route) ? 'aria-current="location"' : ''}>Selected work</a>
      <a href="/videos" ${route === '/videos' ? 'aria-current="page"' : route.startsWith('/videos/') ? 'aria-current="location"' : ''}>Videos</a>
      <a href="/#about">About</a>
      <a href="/resume" ${route === '/resume' ? 'aria-current="page"' : ''}>Resume</a>
      <a href="#contact">Contact</a>
    </nav>`;
}

function footer() {
  document.querySelector('#footer').innerHTML = `
    <div class="portfolio-footer" id="contact">
      <p><a class="footer-email" href="mailto:${escape(contacts.email)}">${escape(contacts.email)}</a></p>
      <div class="footer-links"><a href="${escape(contacts.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn<span class="sr-only"> (opens in a new tab)</span></a><a href="https://x.com/daovid" target="_blank" rel="noopener noreferrer">X<span class="sr-only"> (opens in a new tab)</span></a></div>
      <span class="footer-credit">© ${new Date().getFullYear()} David Morrison</span>
    </div>`;
}

let renderedRoute;
function render() {
  const route = location.pathname.replace(/\/$/, '') || '/';
  renderedRoute = route;
  document.body.classList.remove('after-theme');
  document.body.classList.toggle('hijack-theme', route === '/work/near-hijack');
  document.body.classList.toggle('fogo-theme', route === '/work/fogo-launch');
  document.body.classList.toggle('profile-theme', route === '/work/near-profile-transformation');
  document.body.classList.toggle('egg-theme', route === '/work/near-egg');
  document.body.classList.toggle('home-route', route === '/');
  document.body.classList.toggle('videos-route', route === '/videos' || route.startsWith('/videos/'));
  document.body.classList.toggle('vox-route', route === '/videos/vox');
  header(route);
  footer();
  let html;
  let title;
  const currentProject = route.startsWith('/work/') ? project(route.slice('/work/'.length)) : null;
  if (route === '/') {
    html = renderHome(); title = 'David Morrison — Selected work';
  } else if (route === '/resume') {
    html = renderResume(); title = 'Resume — David Morrison';
  } else if (route === '/videos') {
    html = renderVideos();
    title = 'Videos — David Morrison';
  } else if (route === '/videos/vox') {
    html = renderVox(); title = 'VOX — David Morrison';
  } else if (route === '/videos/motion-design') {
    html = renderMotion(); title = 'Motion Design — David Morrison';
  } else if (route === '/videos/slop') {
    html = renderSlop(); title = 'Slop — David Morrison';
  } else if (route === '/before') {
    html = renderCampaignIndex(); title = 'Before the Singularity — David Morrison';
  } else if (route === '/after') {
    html = renderAfter(); title = 'After — David Morrison';
  } else if (route === '/work/near-hijack') {
    html = renderHiJack(); title = 'NEAR HiJack — David Morrison';
  } else if (currentProject?.category === 'before' && campaignContent[currentProject.slug]) {
    html = renderCampaignPage(currentProject, campaignContent[currentProject.slug]); title = `${currentProject.title} — David Morrison`;
  } else if (currentProject?.category === 'after') {
    html = renderFilmPage(currentProject); title = `${currentProject.title} — David Morrison`;
  } else {
    html = '<section class="not-found"><p class="eyebrow">404</p><h1>That page isn’t here.</h1><a href="/">Return to selected work</a></section>';
    title = 'Page not found — David Morrison';
  }
  main.innerHTML = html;
  mountHome(document.querySelector('.portfolio-home'));
  mountHiJackTimeline();
  mountCampaignTimeline(document.querySelector('.campaign-page'));
  mountAfterPosts(document.querySelector('.after-page'));
  mountVox(document.querySelector('.vox-page'));
  mountMotion(document.querySelector('.md-page'));
  mountSlop(document.querySelector('.sl-page'));
  document.title = title;
  const descriptions = {
    'near-ai-film': 'An AI-generated NEAR film, released in September 2024.',
    'slx-ai-reference': 'An AI-generated introduction film for Superluminal, released in June 2026.',
  };
  document.querySelector('meta[name="description"]').content = descriptions[currentProject?.slug] || currentProject?.summary || (route === '/videos' ? 'Videos — David Morrison.' : route === '/videos/vox' ? 'VOX: short paper-collage explainer films by David Morrison.' : route === '/videos/motion-design' ? 'Motion design by David Morrison.' : route === '/videos/slop' ? 'Slop: AI experiments and unfinished films by David Morrison.' : route === '/resume' ? 'David Morrison’s resume. Head of Creative Campaigns & Social Media at NEAR Foundation; now leading social for special projects at Douro Labs.' : route === '/before' ? 'Selected campaigns for NEAR and Fogo.' : route === '/after' ? 'Selected AI-generated films for NEAR and Superluminal.' : 'David Morrison: eight years leading social, creative campaigns and community for crypto and fintech startups. Selected work for NEAR, Fogo and Superluminal.');
  const themeColors = {'/work/near-hijack':'#060a08','/work/fogo-launch':'#120a12','/work/near-profile-transformation':'#000000','/work/near-egg':'#f4eef6'};
  document.querySelector('meta[name="theme-color"]').content = themeColors[route] || '#f8f8f5';
  if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
}

document.addEventListener('click', event => {
  if (event.defaultPrevented) return;
  const link = event.target.closest('a');
  if (!link || link.target || link.hasAttribute('download') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || !['http:', 'https:'].includes(url.protocol)) return;
  if (url.pathname === location.pathname && url.hash) return;
  event.preventDefault();
  history.pushState({}, '', url.pathname + url.search + url.hash);
  render();
  if (!url.hash) window.scrollTo(0, 0);
  main.focus({preventScroll: true});
});
window.addEventListener('popstate', () => {
  const route = location.pathname.replace(/\/$/, '') || '/';
  if (route === renderedRoute) return;
  render();
  if (!location.hash) window.scrollTo(0, 0);
});
render();
