import { contacts } from './content.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const external = (url, label, className = '') => `<a href="${escape(url)}" class="${className}" target="_blank" rel="noopener noreferrer">${escape(label)}<span class="sr-only"> (opens in a new tab)</span></a>`;
const caseStudy = (slug, label) => `<a href="/work/${escape(slug)}">${escape(label)}</a>`;

// Role titles, dates and reported achievements follow David's public CV at davidmorrison.me.
// Earlier roles have year-only dates; individual NEAR promotion dates are not stated.
// Campaign credits (HiJack, The Egg Is NEAR, Profile as a Canvas) were confirmed by David.
// A point is plain text, or { html } when it links to a case study.
const experience = [
  {
    company: 'Douro Labs',
    role: 'Social Lead, Special Projects',
    dates: 'May 2025 – Present',
    points: [
      'Own social strategy, voice and daily output for special projects across Layer 1 infrastructure and onchain perpetuals.',
      'Shape positioning with founders, product and engineering before launch, then run each project’s channels once it’s live.',
      'Explain sub-40ms block times, colocation consensus, matching systems and trading infrastructure to developers and traders, in a voice built on market structure and fast execution. Keep the public story accurate for an audience that notices when it isn’t.',
    ],
  },
  {
    company: 'NEAR Foundation',
    role: 'Head of Creative Campaigns & Social Media',
    dates: 'July 2021 – May 2025',
    progression: ['Community Lead', 'Community Engagement Lead', 'Head of Social Media', 'Head of Creative Campaigns & Social Media'],
    points: [
      'Led NEAR’s social channels and creative campaigns, working directly with co-founder Illia Polosukhin on brand strategy and communications.',
      'Grew X followers 500% in six months, and share of voice 600% in under three months by targeting developers directly.',
      'Ran the ecosystem’s largest CoinGecko co-marketing campaign: 20,000 users and 10,000+ on-chain transactions.',
      { html: `Led campaigns that made NEAR’s own X account the medium: ${caseStudy('near-hijack', 'HiJack')}, a staged takeover built to drive registrations for the $500k Online Hackathon; ${caseStudy('near-egg', 'The Egg Is NEAR')}; and ${caseStudy('near-profile-transformation', 'Profile as a Canvas')}.` },
      'Set the strategy for NEAR’s forum and Discord. Both reached all-time activity highs.',
      'Shaped marketing direction and company-wide planning in top-level strategy sessions at international offsites.',
      'Hired and mentored a Marketing Executive from onboarding to working independently.',
      { html: `Hosted NEARCON, NEAR’s annual conference, every year from 2022 to 2024; moderated a conversation with Edward Snowden on stage at [REDACTED] 2024; and represented NEAR at conferences worldwide, including ETHDenver 2024. <a href="/videos/speaking">Watch the talks</a>.` },
    ],
  },
  {
    company: 'Plutus.it',
    role: 'Community Manager & Customer Service Team Lead',
    dates: 'July 2018 – September 2021',
    points: [
      'Owned community and social for a crypto fintech startup across Discord, Telegram, BitcoinTalk and Reddit.',
      'Built customer support from scratch (Zendesk, live chat, guides and an FAQ database) and led the support team.',
      'Created an Ambassador Program for the community’s most active members.',
      'Worked with marketing to grow website and social traffic.',
      'Wrote due diligence reports on prospective partners for the executive team.',
    ],
  },
];
const earlierRoles = [
  { company: 'Dixons Carphone', role: 'Sales', dates: '2015 – 2018' },
  { company: 'McDonald’s', role: 'Crew Trainer', dates: '2011 – 2015' },
];

const funnel = [
  ['Positioning & messaging', 'Product voice and pre-launch positioning for Layer 1 and trading infrastructure'],
  ['Awareness', 'Social strategy, creative campaigns, staged takeovers, conference talks'],
  ['Acquisition & activation', 'Co-marketing, launches, hackathon sign-ups, on-chain campaigns'],
  ['Community & advocacy', 'Discord, forum and Telegram strategy; community ambassadors'],
  ['Support & retention', 'Support built from scratch: Zendesk, live chat, FAQs'],
  ['Measurement', 'Share of voice, engagement and campaign reporting'],
  ['Team & leadership', 'Hiring, mentoring, company-wide planning'],
];
const sideProjects = [
  {name:'PepTrack',url:'https://play.google.com/store/apps/details?id=com.peptrack.app',description:'Peptide tracking app on Google Play. Live and earning revenue.'},
  {name:'MascotVibe',url:'https://www.producthunt.com/products/mascotvibe',description:'AI tool that creates and animates brand mascots. Launched on Product Hunt.'},
  {name:'Infinite Strip',url:'https://infinitestrip.com/',description:'An autonomous experiment in AI creativity.'},
];

function job(item) {
  return `<article class="resume-job">
    <header class="resume-job-heading"><div><h3>${escape(item.company)}</h3><p class="resume-job-role">${escape(item.role)}</p></div><p class="resume-job-dates">${escape(item.dates)}</p></header>
    ${item.progression ? `<p class="resume-progression"><span class="resume-progression-label">Progression</span>${item.progression.map(escape).join(' <span aria-hidden="true">→</span> ')}</p>` : ''}
    <ul class="resume-job-points">${item.points.map(point => `<li>${point.html ?? escape(point)}</li>`).join('')}</ul>
  </article>`;
}

export function renderResume() {
  return `<article class="page-wrap resume-page" aria-labelledby="resume-title">
    <header class="resume-header">
      <div><h1 id="resume-title">Resume</h1><p class="resume-role">Social & Creative Marketing Lead</p><p class="resume-location">United Kingdom</p></div>
      <div class="resume-introduction"><p>Eight years leading social, creative campaigns and community for crypto and fintech startups.</p><p class="resume-introduction-detail">Startup teams are small, so my remit has always run the length of the funnel: positioning products before launch, building the audience, running the campaigns and partnerships that turn attention into sign-ups, and the community and support that keep people around. At NEAR Foundation I rose from Community Lead to Head of Creative Campaigns & Social Media, working directly with co-founder Illia Polosukhin on brand strategy and communications.</p><nav class="resume-contact-links" aria-label="Contact David Morrison"><a href="mailto:${escape(contacts.email)}">${escape(contacts.email)}</a>${external(contacts.linkedin, 'LinkedIn')}${external(contacts.telegram, 'Telegram')}</nav></div>
    </header>
    <section class="resume-section" aria-labelledby="resume-experience-title"><h2 id="resume-experience-title">Experience</h2><div class="resume-experience">${experience.map(job).join('')}<p class="resume-earlier"><span class="resume-earlier-label">Earlier</span>${earlierRoles.map(item => `<span class="resume-earlier-role">${escape(item.role)}, ${escape(item.company)} <span class="resume-earlier-dates">${escape(item.dates)}</span></span>`).join('<span class="resume-earlier-separator" aria-hidden="true"> · </span>')}</p></div></section>
    <section class="resume-section" aria-labelledby="resume-funnel-title"><h2 id="resume-funnel-title">Across the funnel</h2><dl class="resume-funnel">${funnel.map(([stage, evidence]) => `<div><dt>${escape(stage)}</dt><dd>${escape(evidence)}</dd></div>`).join('')}</dl></section>
    <section class="resume-section resume-education" aria-labelledby="resume-education-title"><h2 id="resume-education-title">Education</h2><div><article class="resume-qualification"><div><h3>Northumbria University</h3><p>Computer & Digital Forensics</p></div><p class="resume-job-dates">2015 – 2018</p></article></div></section>
    <section class="resume-section resume-certification" aria-labelledby="resume-certification-title"><h2 id="resume-certification-title">Certification</h2><div><article class="resume-qualification"><div><h3>General Assembly</h3><p>Product Management</p></div><p class="resume-job-dates">2021</p></article></div></section>
    <section class="resume-section" aria-labelledby="resume-projects-title"><h2 id="resume-projects-title">Built and shipped</h2><div class="resume-side-projects">${sideProjects.map(item=>`<article><h3>${external(item.url,item.name)}</h3><p>${escape(item.description)}</p></article>`).join('')}</div></section>
    <div class="resume-source">${external('https://davidmorrison.me/', 'Original CV on davidmorrison.me', 'resume-source-link')}</div>
  </article>`;
}
