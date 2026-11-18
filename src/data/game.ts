// The script for the game at /play.
//
// The game walks through `levels` in site.ts, in order, and looks up each one here by its id.
// Every position (`at`) is in game pixels from the start of that level. The screen is 320 wide,
// and the player walks about 70 pixels a second.
//
// To add a level: add it to `levels` in site.ts with a new id, then add an entry below.
// A level with no entry still shows up as a short street with one building and its card.

export type Scene = 'kathmandu' | 'remote' | 'city' | 'ohio';

export type BuildingType =
  | 'college' | 'homeoffice' | 'tower' | 'office' | 'airport' | 'university';

export type PropType =
  | 'stupa' | 'flags' | 'desk' | 'familyhome' | 'whiteboard' | 'apartment' | 'mirror' | 'studytable' | 'lamp' | 'tree'
  | 'worldmap' | 'rating' | 'workdesk' | 'chart';

/** People the player meets. `name` shows over their speech bubble, `en` underneath in small type. */
export const cast: Record<string, { name: string; en?: string; look: string }> = {
  me: { name: 'You', look: 'me' },
  student: { name: 'Student', look: 'student' },
  dev: { name: 'Dev', look: 'dev' },
  qa: { name: 'QA', look: 'qa' },
  exec: { name: 'Bank executive', look: 'exec' },
  intern: { name: 'Intern', look: 'intern' },
  intern2: { name: 'Intern', look: 'intern2' },
  junior: { name: 'Junior PM', look: 'junior' },
  junior2: { name: 'Junior PM', look: 'junior2' },
  aama: { name: 'Aama', en: 'Mom', look: 'aama' },
  buwa: { name: 'Buwa', en: 'Dad', look: 'buwa' },
  bhai: { name: 'Bhai', en: 'Little brother', look: 'bhai' },
  hajuraama: { name: 'Hajuraama', en: 'Grandma', look: 'hajuraama' },
  hajurbuwa: { name: 'Hajurbuwa', en: 'Grandpa', look: 'hajurbuwa' },
  prof: { name: 'Professor', look: 'prof' },
  sellerAU: { name: 'Seller', en: 'Australia', look: 'seller' },
  sellerEU: { name: 'Seller', en: 'Europe', look: 'seller2' },
  sellerUS: { name: 'Seller', en: 'US', look: 'seller3' },
  sellerAsia: { name: 'Seller', en: 'Asia', look: 'seller' },
  team: { name: 'Team', look: 'dev' },
  manager: { name: 'Manager', look: 'manager' },
  banker: { name: 'Bank', look: 'banker' },
  teammate: { name: 'Teammate', look: 'friend' },
  supervisor: { name: 'Supervisor', look: 'supervisor' },
  friend: { name: 'Friends', look: 'friend' },
  friend2: { name: 'Friends', look: 'friend2' },
};

export type Line = {
  /** A key from `cast`. Leave out for the player's own thought. */
  who?: string;
  text: string;
  /** Narration in a caption box instead of a bubble. */
  narrate?: boolean;
};

export type Beat = {
  at: number;
  lines?: Line[];
  /** Hold the player still until the lines are done. */
  lock?: boolean;
  /** Special moments the game knows how to play. */
  action?: 'levelUp' | 'join' | 'leaveParty' | 'goHome' | 'farewell' | 'lookBack' | 'mirror' | 'build' | 'grind' | 'fold';
  /** For `build`: what is being built (shown over the desk). */
  label?: string;
  /** For `build`: the app rating once it ships. */
  value?: number;
  /** For `build`: how the shipped toast names it. */
  shipped?: string;
  /** For `join`: index into this level's npcs. For `mirror`: index into props. */
  target?: number;
  /** For `farewell`: who starts crying, and at which line (0 is the first). 'me' is the player. */
  cry?: Record<string, number>;
  /** For `farewell`: who hugs the player at the end, in order. */
  hug?: string[];
};

export type LevelScript = {
  scene: Scene;
  length: number;
  building: { type: BuildingType; at: number; sign: string; note?: string };
  props?: { type: PropType; at: number; label?: string; clear?: boolean }[];
  /** `inside`: starts inside the family home and comes out during the farewell. */
  npcs?: { who: string; at: number; facing?: 1 | -1; mask?: boolean; party?: boolean; wave?: boolean; inside?: boolean }[];
  /** Day and night flip, faster and faster, between these two points. */
  nightCycle?: { from: number; to: number };
  beats?: Beat[];
  /** Skills from site.ts float here, one every `gap` pixels. */
  skills?: { from: number; gap: number };
  boss?: { name: string; look: 'clock' | 'outage' | 'records' | 'queue' | 'blob'; at: number; hp?: number; beaten?: string[] };
  /** Something that drops when the boss is beaten: an icon key from icons.ts, or 'diploma'.
   *  With `skill`, it counts as the level's first skill. `then` are toasts after you pick it up. */
  reward?: { item: string; label: string; skill?: boolean; then?: { text: string; icon?: string }[] };
  /** F1Soft's delivery run: walk past each bank to put the app live there. */
  deliver?: { label: string; total: number; at: number[]; done?: Line; result?: string };
  /** Proshore: where the app's star rating starts. */
  rating?: number;
  /** This level ends at a runway and flies to the next one. */
  flight?: { plane: number; caption: string };
  /** Words on the chapter card. Leave out to use the story from site.ts. */
  card?: string[];
};

export const script: Record<string, LevelScript> = {
  islington: {
    scene: 'kathmandu',
    length: 980,
    building: { type: 'college', at: 120, sign: 'ISLINGTON', note: 'CLOSED: COVID-19' },
    props: [
      { type: 'stupa', at: 24 },
      { type: 'flags', at: 250 },
      { type: 'desk', at: 400 },
    ],
    npcs: [
      { who: 'student', at: 268, mask: true },
      { who: 'student', at: 290, mask: true, facing: -1 },
    ],
    nightCycle: { from: 390, to: 790 },
    beats: [
      { at: 420, lines: [{ text: 'Class by day. Client work by night.' }] },
      { at: 500, lines: [{ text: 'Lecture at 10.' }] },
      { at: 570, lines: [{ text: 'Client tickets after.' }] },
      { at: 640, lines: [{ text: 'Assignment due tomorrow.' }] },
      { at: 710, lines: [{ text: 'Sleep? Later.' }] },
    ],
    boss: { name: 'THE CLOCK', look: 'clock', at: 840, hp: 3, beaten: ['Time management: beaten.'] },
    reward: { item: 'diploma', label: 'First Class Honours', skill: true, then: [{ text: 'Ping from work: Promoted to team lead.', icon: 'medal' }] },
    card: [
      'Covid shut the campus. I studied from home and worked remote for a US client at the same time. Class by day, client work by night.',
      'Time was the hardest boss. I still finished with First Class Honours.',
    ],
  },

  proshore: {
    scene: 'remote',
    length: 1460,
    building: { type: 'homeoffice', at: 70, sign: 'PROSHORE', note: 'SHOPIFY APPS' },
    rating: 4.5,
    props: [
      { type: 'worldmap', at: 190 },
      { type: 'workdesk', at: 440 },
      { type: 'rating', at: 512 },
      { type: 'workdesk', at: 620 },
      { type: 'lamp', at: 760 },
      { type: 'workdesk', at: 1070 },
    ],
    npcs: [
      { who: 'sellerAU', at: 340, facing: -1 },
      { who: 'team', at: 486, facing: -1 },
      { who: 'sellerEU', at: 560, facing: -1 },
      { who: 'sellerUS', at: 905, facing: -1 },
      { who: 'sellerEU', at: 955, facing: -1 },
      { who: 'sellerAsia', at: 1005, facing: -1 },
    ],
    beats: [
      { at: 200, lines: [{ text: 'Shopify sellers everywhere. US, Europe, Asia, Australia.' }] },
      { at: 300, lines: [{ who: 'sellerAU', text: 'Can the app sync my stock to Etsy too?' }] },
      {
        at: 380,
        lock: true,
        action: 'build',
        label: 'STOCK SYNC',
        shipped: 'Etsy stock sync',
        value: 4.7,
        lines: [{ text: "Good call. Team, let's build it." }, { who: 'team', text: 'On it!' }],
      },
      { at: 530, lines: [{ who: 'sellerEU', text: 'Love it. Can it pull in eBay orders too?' }] },
      {
        at: 590,
        lock: true,
        action: 'build',
        label: 'EBAY ORDERS',
        shipped: 'eBay orders',
        value: 4.8,
        lines: [{ text: 'Next sprint. Team?' }, { who: 'team', text: "We're on it." }],
      },
      {
        at: 880,
        lines: [
          { who: 'sellerUS', text: "Orders aren't syncing!" },
          { who: 'sellerEU', text: 'Is the app down?' },
          { who: 'sellerAsia', text: 'My listings vanished!' },
        ],
      },
      { at: 1040, lock: true, action: 'grind', lines: [{ text: "I'm on it. We'll fix this." }] },
    ],
    skills: { from: 700, gap: 44 },
    boss: { name: 'OUTAGE', look: 'outage', at: 1250, hp: 3, beaten: ['Outage beaten. Everything syncs again.'] },
    reward: { item: 'trophy', label: 'Key Contributor Award', then: [{ text: '14 straight days to bring it back.', icon: 'clock' }] },
    card: [
      'Shopify apps for sellers in the US, Europe, Asia and Australia. I started in support, so I heard what sellers needed first, and took it to the team.',
      'Feature by feature, the rating went from 4.5 to 4.8. Then a company-wide outage took fourteen straight days to bring back, and earned me a Key Contributor Award.',
    ],
  },

  f1soft: {
    scene: 'city',
    length: 1400,
    building: { type: 'tower', at: 70, sign: 'F1SOFT' },
    props: [{ type: 'chart', at: 290 }, { type: 'chart', at: 900 }],
    npcs: [
      { who: 'manager', at: 250, facing: -1 },
      { who: 'dev', at: 420 },
      { who: 'qa', at: 466 },
      { who: 'exec', at: 512, facing: -1 },
      { who: 'teammate', at: 1000 },
      { who: 'banker', at: 1040, facing: -1 },
    ],
    beats: [
      {
        at: 225,
        lock: true,
        lines: [
          { who: 'manager', text: "We need to hit this quarter's revenue target." },
          { text: "We'll get there. Team, let's go." },
        ],
      },
      { at: 400, lines: [{ who: 'dev', text: "API's ready. Who's testing it?" }] },
      { at: 446, lines: [{ who: 'qa', text: 'Three bugs in UAT.' }] },
      { at: 492, lines: [{ who: 'exec', text: 'We go live Friday. Right?' }] },
      { at: 540, lines: [{ text: 'On it.' }] },
      {
        at: 1005,
        lock: true,
        lines: [
          { who: 'banker', text: 'We need 100,000 records moved. Nothing can be lost.' },
          { text: "Team, let's do this." },
          { who: 'teammate', text: "Let's go!" },
        ],
      },
    ],
    deliver: { label: 'Banks live', total: 16, at: [600, 680, 760, 840], done: { text: 'Done.' }, result: '+$11,000' },
    skills: { from: 645, gap: 80 },
    boss: { name: '100K RECORDS', look: 'records', at: 1190, hp: 3, beaten: ['100,000+ records moved.'] },
    reward: { item: 'database', label: 'Zero data loss, zero rollbacks' },
    card: [
      'My first big company. More teams, more executives, more people to keep in sync, and a revenue target to hit.',
      'We shipped mobile banking apps to 16 banks, and the new features brought in $11,000 more.',
    ],
  },

  amnil: {
    scene: 'city',
    length: 1220,
    building: { type: 'office', at: 150, sign: 'AMNIL' },
    props: [{ type: 'whiteboard', at: 656 }],
    npcs: [
      { who: 'supervisor', at: 96, facing: -1 },
      { who: 'intern', at: 340, party: true },
      { who: 'junior', at: 410, party: true },
      { who: 'intern2', at: 480, party: true },
      { who: 'junior2', at: 550, party: true },
    ],
    beats: [
      {
        at: 60,
        lock: true,
        action: 'levelUp',
        lines: [
          { who: 'supervisor', text: 'I need you to lead this team.' },
          { who: 'supervisor', text: 'I expect more from you now.' },
          { text: "I'm ready." },
        ],
      },
      { at: 330, action: 'join', target: 1 },
      { at: 400, action: 'join', target: 2 },
      { at: 470, action: 'join', target: 3 },
      { at: 540, action: 'join', target: 4 },
      {
        at: 640,
        lock: true,
        lines: [
          { text: "Gather round. Here's what I've learned." },
          { who: 'intern', text: 'How do I write a good ticket?' },
          { text: 'Start with the user.' },
          { who: 'junior', text: 'Client wants it yesterday.' },
          { text: 'Then we cut scope, not quality.' },
        ],
      },
      { at: 1190, action: 'leaveParty' },
    ],
    skills: { from: 770, gap: 50 },
    boss: { name: '3-DAY QUEUE', look: 'queue', at: 1010, hp: 3, beaten: ['3 days, down to under an hour.'] },
    reward: { item: 'clock', label: 'Account opening under an hour' },
    card: [
      'Grew into a senior role. Led the team with a steadier hand, and ran the PM internship program for interns and juniors.',
    ],
  },

  flight: {
    scene: 'kathmandu',
    length: 1260,
    building: { type: 'airport', at: 600, sign: 'KTM AIRPORT' },
    props: [{ type: 'flags', at: 20 }, { type: 'familyhome', at: 80 }],
    // Everyone starts inside. They come out in this order after the night on the terrace,
    // and stand at `at`, between the front door and you.
    npcs: [
      { who: 'bhai', at: 218, inside: true },
      { who: 'aama', at: 202, inside: true },
      { who: 'buwa', at: 186, inside: true },
      { who: 'hajuraama', at: 170, inside: true },
      { who: 'hajurbuwa', at: 155, inside: true },
    ],
    beats: [
      {
        // walk in the front door, up the stairs, out onto the terrace for the night
        at: 120,
        action: 'goHome',
        lines: [{ text: 'Is this it?' }, { text: 'I can do more.' }, { text: 'I want to learn more.' }],
      },
      {
        at: 150,
        action: 'farewell',
        cry: { hajuraama: 0, aama: 1, me: 3, bhai: 4 },
        hug: ['aama', 'bhai'],
        lines: [
          { who: 'hajuraama', text: 'Hajuraama puts tika on your forehead.', narrate: true },
          { who: 'aama', text: 'Eat on time. Call every day.' },
          { who: 'buwa', text: "Go. We're proud of you." },
          { who: 'bhai', text: 'Bring me something from America!' },
          { who: 'hajurbuwa', text: 'Our blessings go with you.' },
        ],
      },
      { at: 420, action: 'lookBack' },
    ],
    flight: { plane: 860, caption: 'Kathmandu to Ohio. 2025.' },
    card: [
      'I wanted to see how far I could go. Leaving home was the hardest part.',
      'They cheered me out the door anyway.',
    ],
  },

  'wright-state': {
    scene: 'ohio',
    length: 1400,
    building: { type: 'university', at: 600, sign: 'WRIGHT STATE' },
    props: [
      { type: 'mirror', at: 300 },
      { type: 'apartment', at: 330 },
      { type: 'whiteboard', at: 780 },
      { type: 'studytable', at: 880 },
      { type: 'tree', at: 540 },
      { type: 'tree', at: 1050 },
      { type: 'mirror', at: 1220, clear: true },
    ],
    npcs: [
      { who: 'prof', at: 818, facing: -1 },
      { who: 'friend', at: 872 },
      { who: 'friend2', at: 926, facing: -1 },
    ],
    beats: [
      { at: 296, action: 'mirror', target: 0 },
      { at: 384, lines: [{ text: 'Rice: burnt. Try again.' }] },
      { at: 446, action: 'fold', lines: [{ text: 'Laundry: figured out.' }] },
      { at: 790, lines: [{ who: 'prof', text: "Good question. Let's dig in." }] },
      { at: 880, lines: [{ who: 'friend', text: 'Library till midnight?' }] },
      { at: 1216, action: 'mirror', target: 6, lines: [{ text: 'There you are.' }] },
    ],
    skills: { from: 980, gap: 48 },
    card: [
      'Working on myself. Learning from professors and friends. Living alone and figuring it out.',
      'I think I found myself.',
    ],
  },
};

/** The last door, after the final level. */
export const sequel = {
  sign: 'LEVEL',
  poster: ['THE SEQUEL', 'COMING SOON'],
  card: [
    'Ready for the sequel: product management, ideally in fintech.',
    'Want a part in it?',
  ],
};

/** Which icon each skill from site.ts shows as. Keys are the exact skill names. */
export const skillIcons: Record<string, string> = {
  'Computing degree, First Class': 'diploma',
  'PHP and Laravel': 'code',
  Scrum: 'board',
  'Leading through a crisis': 'shield',
  'Public speaking': 'mic',
  'Large Scale Scrum': 'teams',
  'Multi-client delivery': 'phones',
  'Data migration': 'database',
  'Core banking integrations': 'bank',
  'CDD and ECDD compliance': 'idcheck',
  'Mentoring PMs': 'mentor',
  'On-device AI': 'chip',
  'Game systems': 'controller',
  'Computer vision': 'eye',
  'High performance computing': 'rack',
};
