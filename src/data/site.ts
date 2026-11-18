// Everything personal lives here so it is easy to edit in one place.

export const person = {
  name: 'Darpan Chapagain',
  first: 'Darpan',
  last: 'Chapagain',
  syllables: 'Dar·pan Cha·pa·gain',
  ipa: '/ˈdɑːr.pʌn ˈtʃɑː.pɑː.ɡɑː.ɪŋ/',
  sayIt: 'DAR-pun CHAH-pah-gah-ing',
  nepali: 'दर्पण',
  email: 'darpanchapagain8@gmail.com',
  linkedin: 'https://www.linkedin.com/in/darpan-chapagain-8h28',
  github: 'https://github.com/darpan-chapagain',
  location: 'Fairborn, Ohio',
  school: 'Wright State University',
  nepaliFull: ['दर्पण', 'चापागाईं'],
  hometown: 'Kathmandu, Nepal',
  description:
    'Technical product manager with four years in software, most recently banking products for 16+ financial institutions. Now an M.S. Computer Science student at Wright State University.',
};

export type Role = {
  start: string;
  end: string;
  company: string;
  place: string;
  titles: string[];
  summary: string;
  /** Short wins. <strong> marks the number that matters. */
  highlights: string[];
  /** Role changes inside one company, oldest first. */
  steps?: { title: string; when: string }[];
  /** One number for the career line on the home page. */
  headline: string;
  projects: string[];
};

export const roles: Role[] = [
  {
    start: 'Mar 2024',
    end: 'May 2025',
    company: 'AMNIL Technologies',
    place: 'Kathmandu, hybrid',
    titles: ['Technical Project Manager'],
    headline: 'Account opening cut from <strong>3 days to under 1 hour</strong>',
    summary:
      'Led delivery of 5+ enterprise banking products from backlog to production, with backend, frontend, QA, design and DevOps on the team.',
    highlights: [
      'Compliance automation for CDD and ECDD cut customer onboarding from <strong>3 days to under 1 hour</strong> and manual document errors by <strong>60%</strong>.',
      'Payroll automation now runs securely for <strong>10,000+ employees</strong> a month, with <strong>40%</strong> less HR effort.',
      'SMS and Viber notifications with provider failover reach a <strong>99.5%+</strong> delivery rate.',
      'Nabil Bank’s microsite got <strong>70%</strong> faster and kept visitors <strong>2.3x</strong> longer.',
      'Shipped 3 small and 2 large projects in two quarters, and ran the PM internship program.',
    ],
    projects: [
      'digital-account-opening-and-compliance-automation-system',
      'automated-banking-payroll-processing-system',
      'enterprise-access-control-and-role-management-platform',
      'multi-channel-banking-notification-system',
      'banking-microsite-and-content-management-platform',
      'learning-management-and-job-matching-platform',
    ],
  },
  {
    start: 'Aug 2023',
    end: 'Jan 2024',
    company: 'F1Soft International',
    place: 'Kathmandu, onsite',
    titles: ['Project Manager'],
    headline: 'Mobile banking for <strong>16 banks</strong> and <strong>100,000+</strong> users',
    summary:
      'Ran mobile and internet banking delivery for 16 financial institutions at once, each with its own compliance rules, branding and core banking system.',
    highlights: [
      'The apps served <strong>100,000+</strong> users across banks including NIMB, Nepal Bank, ADBL and Everest Bank.',
      'Brought in Large Scale Scrum across departments and sped up delivery by <strong>20%</strong>.',
      'Migrated <strong>100,000+</strong> legacy customer records with zero data loss and zero rollbacks.',
      'Launched features that brought in <strong>$11,000</strong> of new revenue, and lifted client satisfaction by <strong>60%</strong>.',
    ],
    projects: ['large-scale-banking-data-migration-and-validation'],
  },
  {
    start: 'Jan 2021',
    end: 'Jul 2023',
    company: 'Proshore (Digital Product Labs)',
    place: 'Remote, for a US client',
    titles: ['Tech Support Team Lead', 'Scrum Master'],
    headline: 'Customer replies cut from <strong>12 hours to 45 minutes</strong>',
    summary:
      'SaaS that keeps Shopify, Etsy, WooCommerce, Amazon and eBay stores in sync. Started out fixing bugs in PHP, ended up leading the support team.',
    steps: [
      { title: 'Support and PHP developer', when: 'Jan 2021 to Feb 2022' },
      { title: 'Scrum Master', when: 'Jun 2021 to Feb 2023' },
      { title: 'Team lead', when: 'Jan 2022 to Jul 2023' },
    ],
    highlights: [
      'Cut average customer response time from <strong>12 hours to 45 minutes</strong>.',
      'Fed client feedback straight into the backlog and took the app store rating from <strong>4.5 to 4.8</strong>.',
      'Raised customer satisfaction from <strong>75% to 90%</strong> in a year, leading a team of 6.',
      'Key Contributor Award for <strong>14 straight days</strong> on a company-wide outage.',
    ],
    projects: ['e-commerce-marketplace-integration-and-synchronization-platform'],
  },
];

// Banks and financial institutions I've shipped for. Text only, no logos.
export const clients = [
  'Nabil Bank', 'NIMB', 'Nepal Bank', 'ADBL', 'Everest Bank', 'Citizens Bank', 'Muktinath', 'Shangrila', 'Mahalaxmi',
];

export const education = [
  {
    degree: 'M.S. Computer Science',
    school: 'Wright State University',
    place: 'Fairborn, Ohio',
    when: 'Expected December 2027',
    detail: 'GPA 4.00 / 4.00',
  },
  {
    degree: 'B.Sc. (Hons) Computing, First Class Honours',
    school: 'Islington College, London Metropolitan University',
    place: 'Kathmandu, Nepal',
    when: 'December 2023',
    detail: 'US GPA equivalent 3.98 / 4.00',
  },
];

// Add a url to show a "verify" link next to a certificate.
export const certifications: { name: string; issuer: string; url?: string }[] = [
  { name: 'AI Product Manager Professional Certificate', issuer: 'IBM' },
  { name: 'Agile Project Management', issuer: 'Google, on Coursera' },
  { name: 'Scrum Master Training', issuer: 'Proshore' },
  { name: 'PHP Development Training', issuer: 'Proshore' },
];

// The three projects on the home page, each with the line that sells it.
export const selectedWork: { id: string; line: string }[] = [
  {
    id: 'e-commerce-marketplace-integration-and-synchronization-platform',
    line: 'Rating up from 4.5 to 4.8, for sellers across four continents',
  },
  {
    id: 'large-scale-banking-data-migration-and-validation',
    line: '100,000+ customer records moved with zero data loss and zero rollbacks',
  },
  {
    id: 'fittracker',
    line: 'An LLM (Gemma 2B) running on the phone. Fully offline, nothing leaves the device',
  },
];

// Little ticket stubs on the home and Work pages.
export const recognition = [
  { year: '2022', title: 'Key Contributor Award', where: 'Digital Product Labs', note: 'Fourteen straight days with the team, bringing back a company-wide sync outage.' },
  { year: '2023', title: 'Speaker', where: 'Proshore knowledge sharing', note: 'Talk to an international audience on Hotjar and analytics-driven UX.', link: 'https://proshore.eu/kss-level-up-website-with-hotjar/' },
  { year: '2024', title: 'Internship mentor', where: 'AMNIL Technologies', note: 'Designed and ran the PM internship: Agile, user stories, sprint structure, Jira.' },
  { year: '2026', title: 'Vice Secretary', where: 'Nepal Student Association, Wright State', note: 'Also community service chair. Events, outreach and coordination.' },
];

// Each note becomes a yellow sticky note on the How I build page, and a skills line on the Work page.
export const toolkit = [
  { heading: 'Product', items: 'User stories, backlogs, sprint planning, Scrum and LeSS, BRDs and SRS docs, KPIs' },
  { heading: 'Banking', items: 'Core banking integrations, maker-checker flows, CDD and ECDD compliance' },
  { heading: 'Build', items: 'PHP and Laravel, Python, JavaScript, SQL, REST APIs, Kotlin, C#' },
  { heading: 'Data and infra', items: 'MySQL, Oracle, PostgreSQL, Redis, RabbitMQ, AWS, SLURM' },
  { heading: 'AI and vision', items: 'MediaPipe, OpenCV, NumPy, on-device LLMs (Gemma 2B)' },
  { heading: 'Commerce', items: 'Shopify, WooCommerce, Etsy, Amazon, eBay APIs' },
  { heading: 'Tools', items: 'Jira, Confluence, ClickUp, Figma, Balsamiq, Lucidchart, Mixpanel' },
  { heading: 'Languages', items: 'Nepali, English, Hindi' },
];

// The "How I build" board. One card per project, every card links somewhere.
// Facts come from the project write-ups in README.md and the master resume.
export type BoardCard = {
  from: string;
  title: string;
  body: string;
  metric: string;
  project?: string;
  href?: string;
  label?: string;
};

export const board: { column: string; hint: string; cards: BoardCard[] }[] = [
  {
    column: 'Listen',
    hint: 'what customers feel',
    cards: [
      {
        from: 'DPL',
        title: 'Start in the support queue',
        body: 'My first job at Digital Product Labs was answering seller tickets on five Shopify apps that are still live. Replies went from 12 hours to 45 minutes.',
        metric: '4.5 → 4.8 app rating',
        project: 'e-commerce-marketplace-integration-and-synchronization-platform',
      },
      {
        from: 'AMNIL',
        title: 'Measure the wait',
        body: 'Customers never see the compliance rules. They see how long it takes to open an account.',
        metric: '3 days → under 1 hour',
        project: 'digital-account-opening-and-compliance-automation-system',
      },
      {
        from: 'AMNIL',
        title: 'The website is the front door',
        body: "For a lot of customers, the bank's website is the bank. We made Nabil Bank's microsite 70% faster.",
        metric: '2.3x page retention',
        project: 'banking-microsite-and-content-management-platform',
      },
    ],
  },
  {
    column: 'Decide',
    hint: 'what goes first',
    cards: [
      {
        from: 'F1Soft',
        title: 'Sixteen banks, one backlog',
        body: 'Mobile and internet banking for 16 banks at once. Large-Scale Scrum put every team on one shared backlog.',
        metric: '20% faster delivery',
        href: '/journey/#level-3',
        label: 'F1Soft, level 3 of my journey',
      },
      {
        from: 'AMNIL',
        title: 'One profile, not four tools',
        body: 'Learners were piecing together courses, certificates, resumes and job boards. We joined them into one skills profile.',
        metric: 'thousands of learners in Nepal',
        project: 'learning-management-and-job-matching-platform',
      },
      {
        from: 'Independent',
        title: 'Playable first, bigger later',
        body: 'Get a slice someone can play, then grow it. New moves and enemies plug into one state machine.',
        metric: '3 levels in about 2 weeks',
        project: 'himal-ash',
      },
    ],
  },
  {
    column: 'Build',
    hint: 'so it holds',
    cards: [
      {
        from: 'AMNIL',
        title: 'No partial execution',
        body: 'A payroll run posts in full or halts. Half a payroll is harder to fix than none.',
        metric: '10,000+ employees a month',
        project: 'automated-banking-payroll-processing-system',
      },
      {
        from: 'AMNIL',
        title: 'Revoke the way you grant',
        body: 'Taking access away runs through the same audited approval path as giving it.',
        metric: 'full audit trail',
        project: 'enterprise-access-control-and-role-management-platform',
      },
      {
        from: 'Independent',
        title: 'The model reads. The data decides.',
        body: 'The on-device LLM only parses what you ate. Every calorie comes from a verified database.',
        metric: 'Gemma 2B, on the phone',
        project: 'fittracker',
      },
      {
        from: 'Independent',
        title: 'Angles, not pixels',
        body: 'Form feedback comes from joint angles, so it holds up at any camera distance.',
        metric: 'real-time rep counting',
        project: 'real-time-pose-analysis-and-exercise-quality-tracking-system',
      },
    ],
  },
  {
    column: 'Ship',
    hint: 'and prove it',
    cards: [
      {
        from: 'AMNIL',
        title: 'Every message lands',
        body: 'SMS and Viber alerts with provider failover. If one provider drops, the next picks up and customers never notice.',
        metric: '99.5%+ delivery',
        project: 'multi-channel-banking-notification-system',
      },
      {
        from: 'F1Soft',
        title: 'Move it once',
        body: 'Check the data before, move it in verified batches, reconcile every count after. Nothing lost, nothing rolled back.',
        metric: '100,000+ records',
        project: 'large-scale-banking-data-migration-and-validation',
      },
      {
        from: 'Independent',
        title: 'Price it before you scale it',
        body: 'The same route search ran on an HPC cluster and on AWS, compared on speed and cost.',
        metric: 'HPC vs AWS',
        project: 'high-performance-route-optimization',
      },
    ],
  },
];

// Captions for the rotating card in the hero. `art` names a doodle in Doodles.astro.
export const heroFrames = [
  { art: 'stupa', caption: 'Kathmandu. Where it started.' },
  { art: 'laptop', caption: 'Remote for a US client. PHP dev to team lead.' },
  { art: 'vault', caption: 'Banking software for 16+ banks in Nepal.' },
  { art: 'biplane', caption: 'Fairborn, Ohio. M.S. at Wright State.' },
  { art: 'book', caption: 'Reading more. Reviews coming soon.' },
];

export type Level = {
  /** Stable key. The game at /play looks up this level's script in src/data/game.ts by it. */
  id: string;
  n: number;
  place: string;
  when: string;
  title: string;
  art: string;
  story: string[];
  unlocked?: string[];
  boss?: string;
  projects?: string[];
};

export const levels: Level[] = [
  {
    id: 'islington',
    n: 1,
    place: 'Kathmandu',
    when: 'Until 2023',
    title: 'Islington College',
    art: 'stupa',
    story: [
      'B.Sc. (Hons) Computing, awarded by London Metropolitan University.',
      'Graduated with First Class Honours in December 2023, while working at Proshore for most of it.',
    ],
    unlocked: ['Computing degree, First Class'],
  },
  {
    id: 'proshore',
    n: 2,
    place: 'Remote, US client',
    when: 'Jan 2021 to Jul 2023',
    title: 'Proshore',
    art: 'laptop',
    story: [
      'Joined Digital Product Labs as customer technical support and PHP developer.',
      'Promoted to tech support team lead after a year, and served as Scrum Master.',
    ],
    boss: 'A company-wide service outage. Fourteen straight days to bring it back, and a Key Contributor Award after.',
    unlocked: ['PHP and Laravel', 'Scrum', 'Leading through a crisis', 'Public speaking'],
    projects: ['e-commerce-marketplace-integration-and-synchronization-platform'],
  },
  {
    id: 'f1soft',
    n: 3,
    place: 'Kathmandu',
    when: 'Aug 2023 to Jan 2024',
    title: 'F1Soft International',
    art: 'vault',
    story: ['Project manager for mobile and internet banking, running 16 financial institutions at once.'],
    boss: 'Moving 100,000+ legacy customer records to a new system without losing a single one. Zero data loss, zero rollbacks.',
    unlocked: ['Large Scale Scrum', 'Multi-client delivery', 'Data migration'],
    projects: ['large-scale-banking-data-migration-and-validation'],
  },
  {
    id: 'amnil',
    n: 4,
    place: 'Kathmandu',
    when: 'Mar 2024 to May 2025',
    title: 'AMNIL Technologies',
    art: 'dial',
    story: [
      'Technical project manager for enterprise banking products, with backend, frontend, QA, design and DevOps on the team.',
      'Also ran Hivelaya, a learning and job-matching platform in one: courses, skill checks, a resume builder and job matches. It served thousands of learners across Nepal.',
    ],
    boss: 'Opening a bank account took 3 days. Compliance automation brought it under an hour.',
    unlocked: ['Core banking integrations', 'CDD and ECDD compliance', 'Mentoring PMs'],
    projects: [
      'digital-account-opening-and-compliance-automation-system',
      'automated-banking-payroll-processing-system',
      'enterprise-access-control-and-role-management-platform',
      'multi-channel-banking-notification-system',
      'banking-microsite-and-content-management-platform',
      'learning-management-and-job-matching-platform',
    ],
  },
  {
    id: 'flight',
    n: 5,
    place: 'Kathmandu to Ohio',
    when: '2025',
    title: 'The flight',
    art: 'biplane',
    story: [
      'Moved to Fairborn, Ohio, for an M.S. in Computer Science at Wright State University, named after the Wright brothers from neighbouring Dayton.',
    ],
  },
  {
    id: 'wright-state',
    n: 6,
    place: 'Fairborn, Ohio',
    when: 'Now',
    title: 'Wright State University',
    art: 'peaks',
    story: [
      'M.S. Computer Science with a 4.0 GPA, expected December 2027.',
      'Building on the side: an offline AI fitness app, a 2D action game, real-time pose tracking and route optimization on an HPC cluster.',
    ],
    unlocked: ['On-device AI', 'Game systems', 'Computer vision', 'High performance computing'],
    projects: ['fittracker', 'himal-ash', 'real-time-pose-analysis-and-exercise-quality-tracking-system', 'high-performance-route-optimization'],
  },
];

export const nextLevel = {
  title: 'Next level',
  story:
    'Product management, ideally in fintech, though a good problem anywhere will do. Longer term, AI systems for financial inclusion, starting with alternative credit scoring.',
};
