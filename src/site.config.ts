// Single source of truth for identity and contact details.
export const site = {
  name: 'Alexander Strelkov',
  initials: 'AS',
  role: 'Fintech advisor · Partners, integrations & AI agents',
  headline: 'I help finance-software companies sell through partners, connect to ERPs and put AI agents into daily use.',
  tagline:
    '15 years building partner channels, ERP and embedded integrations, and enterprise implementations for payments and finance-software companies in North America and EMEA.',
  pitch: 'Partner programs, integrations and AI agents for finance-software companies.',
  location: 'Vancouver · Pacific time · Working across North America and EMEA',
  email: 'hello@example.com', // TODO: your public email address
  linkedin: 'https://www.linkedin.com/in/alexanderstrelkov/',
  photo: '/alex.jpg',
  bookingPath: '/book',
};

export const mailto = (subject = 'Intro call') =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

export const nav = [
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
];
