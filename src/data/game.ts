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
  | 'stupa' | 'flags' | 'desk' | 'familyhome' | 'whiteboard' | 'apartment' | 'mirror' | 'studytable' | 'lamp' | 'tree';

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
  action?: 'levelUp' | 'join' | 'leaveParty' | 'goHome' | 'farewell' | 'lookBack' | 'mirror';
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
  /** Something that drops when the boss is beaten. It counts as the level's first skill. */
  reward?: { item: 'diploma'; label: string; then?: string[] };
  /** F1Soft's delivery run: touch each kiosk to put the app live at more banks. */
  deliver?: { label: string; total: number; at: number[]; done?: Line };
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
    reward: { item: 'diploma', label: 'First Class Honours', then: ['Ping from work: Promoted to team lead.'] },
    card: [
      'Covid shut the campus. I studied from home and worked remote for a US client at the same time. Class by day, client work by night.',
      'Time was the hardest boss. I still finished with First Class Honours.',
    ],
  },

  proshore: {
    scene: 'remote',
    length: 760,
    building: { type: 'homeoffice', at: 90, sign: 'PROSHORE', note: 'REMOTE, US CLIENT' },
    props: [{ type: 'lamp', at: 230 }, { type: 'lamp', at: 470 }],
    skills: { from: 270, gap: 50 },
    boss: { name: 'OUTAGE', look: 'outage', at: 590, hp: 3, beaten: ['14 straight days. Key Contributor Award.'] },
  },

  f1soft: {
    scene: 'city',
    length: 1080,
    building: { type: 'tower', at: 70, sign: 'F1SOFT' },
    npcs: [
      { who: 'dev', at: 250 },
      { who: 'qa', at: 296 },
      { who: 'exec', at: 342, facing: -1 },
    ],
    beats: [
      { at: 236, lines: [{ who: 'dev', text: "API's ready. Who's testing it?" }] },
      { at: 282, lines: [{ who: 'qa', text: 'Three bugs in UAT.' }] },
      { at: 328, lines: [{ who: 'exec', text: 'We go live Friday. Right?' }] },
      { at: 372, lines: [{ text: 'On it.' }] },
    ],
    deliver: { label: 'Banks live', total: 16, at: [440, 520, 600, 680], done: { text: 'Done.' } },
    skills: { from: 480, gap: 80 },
    boss: { name: '100K RECORDS', look: 'records', at: 880, hp: 3, beaten: ['100,000+ records moved. Nothing lost.'] },
    card: [
      'My first big company. More teams, more executives, more people to keep in sync.',
      'We shipped mobile banking apps to 16 banks.',
    ],
  },

  amnil: {
    scene: 'city',
    length: 1120,
    building: { type: 'office', at: 120, sign: 'AMNIL' },
    props: [{ type: 'whiteboard', at: 586 }],
    npcs: [
      { who: 'intern', at: 280, party: true },
      { who: 'junior', at: 350, party: true },
      { who: 'intern2', at: 420, party: true },
      { who: 'junior2', at: 490, party: true },
    ],
    beats: [
      { at: 40, action: 'levelUp' },
      { at: 270, action: 'join', target: 0 },
      { at: 340, action: 'join', target: 1 },
      { at: 410, action: 'join', target: 2 },
      { at: 480, action: 'join', target: 3 },
      {
        at: 570,
        lock: true,
        lines: [
          { who: 'intern', text: 'How do I write a good ticket?' },
          { text: 'Start with the user.' },
          { who: 'junior', text: 'Client wants it yesterday.' },
          { text: 'Then we cut scope, not quality.' },
        ],
      },
      { at: 1090, action: 'leaveParty' },
    ],
    skills: { from: 690, gap: 50 },
    boss: { name: '3-DAY QUEUE', look: 'queue', at: 930, hp: 3, beaten: ['3 days, down to under an hour.'] },
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
      { at: 380, lines: [{ text: 'Rice: burnt. Try again.' }] },
      { at: 450, lines: [{ text: 'Laundry: figured out.' }] },
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
