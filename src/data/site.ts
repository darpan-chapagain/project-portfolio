// Everything personal lives here so it is easy to edit in one place.

export const person = {
  name: 'Darpan Chapagain',
  first: 'Darpan',
  last: 'Chapagain',
  pronunciation: 'dar-pan cha-pa-gain',
  nepali: 'दर्पण',
  email: 'darpanchapagain8@gmail.com',
  linkedin: 'https://www.linkedin.com/in/darpan-chapagain-8h28',
  github: 'https://github.com/darpan-chapagain',
  location: 'Dayton, Ohio',
  hometown: 'Kathmandu, Nepal',
  description:
    'Technical product manager with four years in software and fintech, now an M.S. Computer Science student at Wright State University.',
};

export type Role = {
  start: string;
  end: string;
  company: string;
  place: string;
  titles: string[];
  notes: string[];
};

export const roles: Role[] = [
  {
    start: 'Mar 2024',
    end: 'May 2025',
    company: 'AMNIL Technologies',
    place: 'Kathmandu, hybrid',
    titles: ['Technical Project Manager'],
    notes: ['Technical project management for banking and fintech software.'],
  },
  {
    start: 'Aug 2023',
    end: 'Jan 2024',
    company: 'F1Soft International',
    place: 'Kathmandu, onsite',
    titles: ['Project Manager'],
    notes: ['Project management for fintech products.'],
  },
  {
    start: 'Jan 2021',
    end: 'Jul 2023',
    company: 'Proshore (Digital Product Labs)',
    place: 'Remote, for a US client',
    titles: ['Tech Support Team Lead', 'Scrum Master', 'Customer Technical Support & PHP Developer'],
    notes: [
      'Started in support and PHP development. Promoted to team lead after one year.',
      'Key Contributor Award, 2022, for leading the response to a company-wide service outage.',
      'Gave a company knowledge-sharing talk on Hotjar and analytics-driven UX, 2023.',
    ],
  },
];

export const education = [
  {
    degree: 'M.S. Computer Science',
    school: 'Wright State University',
    place: 'Dayton, Ohio',
    when: 'Expected December 2027',
    detail: '',
  },
  {
    degree: 'B.Sc. (Hons) Computing, First Class Honours',
    school: 'Islington College, London Metropolitan University',
    place: 'Kathmandu, Nepal',
    when: 'December 2023',
    detail: 'US GPA equivalent 3.98 / 4.00',
  },
];

export const certifications = [
  'IBM AI Product Manager Professional Certificate',
  'Google Agile Project Management',
  'Scrum Master (Proshore)',
];

// Each note becomes a yellow sticky note on the home page.
export const toolkit = [
  { heading: 'Product', items: 'Discovery, backlogs, Scrum and LeSS, BRDs and SRS docs, KPI tracking' },
  { heading: 'Build', items: 'PHP and Laravel, Python, TypeScript, Kotlin, C#, SQL' },
  { heading: 'Data and infra', items: 'MySQL, PostgreSQL, Oracle, Redis, RabbitMQ, AWS, SLURM' },
  { heading: 'AI and vision', items: 'MediaPipe, OpenCV, on-device LLMs (Gemma 2B)' },
  { heading: 'Tools', items: 'Jira, Confluence, Figma, Lucidchart, Mixpanel' },
  { heading: 'Languages', items: 'Nepali, English, Hindi' },
];

// Lessons pulled straight from the project write-ups in README.md.
export const principles = [
  {
    title: 'No partial execution',
    body: 'A payroll run posts in full or halts. Half a payroll is harder to fix than none, and the same goes for half-shipped features.',
    project: 'automated-banking-payroll-processing-system',
  },
  {
    title: 'Safe to retry',
    body: 'Every state-changing request carries an idempotency key. A double click on a slow network should never open two bank accounts.',
    project: 'digital-account-opening-and-compliance-automation-system',
  },
  {
    title: 'Revoke the way you grant',
    body: 'Taking access away runs through the same audited path as giving it. The rare path deserves the same testing as the common one.',
    project: 'enterprise-access-control-and-role-management-platform',
  },
  {
    title: 'The model reads. The data decides.',
    body: 'In FitTracker the on-device LLM only parses what you ate. Every calorie comes from a verified database, so there is nothing to hallucinate.',
    project: 'fittracker',
  },
];

// Captions for the rotating card in the hero. `art` names a doodle in Doodles.astro.
export const heroFrames = [
  { art: 'stupa', caption: 'Kathmandu. Where it started.' },
  { art: 'laptop', caption: 'Remote for a US client. PHP dev to team lead.' },
  { art: 'vault', caption: 'Banking and fintech, back in Kathmandu.' },
  { art: 'biplane', caption: 'Dayton, Ohio. Home of flight, and my M.S.' },
  { art: 'book', caption: 'Reading more. Reviews coming soon.' },
];

export type Level = {
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
    n: 3,
    place: 'Kathmandu',
    when: 'Aug 2023 to Jan 2024',
    title: 'F1Soft International',
    art: 'vault',
    story: ['Project manager for fintech products, onsite in Kathmandu.'],
  },
  {
    n: 4,
    place: 'Kathmandu',
    when: 'Mar 2024 to May 2025',
    title: 'AMNIL Technologies',
    art: 'dial',
    story: ['Technical project manager for banking and fintech software, hybrid.'],
  },
  {
    n: 5,
    place: 'Side quests',
    when: 'Along the way',
    title: 'What I shipped',
    art: 'coins',
    story: [
      'Bank account opening, payroll, access control, notifications, a banking CMS and a 100,000-record data migration. Plus Hivelaya, a learning and job-matching platform.',
    ],
    projects: [
      'digital-account-opening-and-compliance-automation-system',
      'automated-banking-payroll-processing-system',
      'enterprise-access-control-and-role-management-platform',
      'multi-channel-banking-notification-system',
      'banking-microsite-and-content-management-platform',
      'large-scale-banking-data-migration-and-validation',
      'learning-management-and-job-matching-platform',
    ],
  },
  {
    n: 6,
    place: 'Kathmandu to Dayton',
    when: '2025',
    title: 'The flight',
    art: 'biplane',
    story: [
      'Moved to Dayton, Ohio, the hometown of the Wright brothers, for an M.S. in Computer Science at the university named after them.',
    ],
  },
  {
    n: 7,
    place: 'Dayton, Ohio',
    when: 'Now',
    title: 'Wright State University',
    art: 'peaks',
    story: [
      'M.S. Computer Science, expected December 2027.',
      'Building on the side: an offline AI fitness app, a 2D action game, real-time pose tracking and route optimization on an HPC cluster.',
    ],
    unlocked: ['On-device AI', 'Game systems', 'Computer vision', 'High performance computing'],
    projects: ['fittracker', 'himal-ash', 'real-time-pose-analysis-and-exercise-quality-tracking-system', 'high-performance-route-optimization'],
  },
];

export const nextLevel = {
  title: 'Next level',
  story:
    'Technical product and AI roles in fintech. Longer term, AI systems for financial inclusion, starting with alternative credit scoring.',
};
