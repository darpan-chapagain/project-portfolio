# Hero sprites: the player and the family. 14 wide, facing right.
# Preview: python3 scripts/sprites/heroes.py  (writes /tmp/heroes.png, needs Pillow)
# Export:  python3 scripts/sprites/heroes.py src/game/heroes.ts
import json, sys
sys.path.insert(0, __import__('os').path.dirname(__file__))
from preview import render

W = 14
class Grid:
    def __init__(self, w, h): self.m = [['.'] * w for _ in range(h)]
    def put(self, x, y, rows):
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch == ' ': continue
                yy, xx = y + j, x + i
                if 0 <= yy < len(self.m) and 0 <= xx < len(self.m[0]): self.m[yy][xx] = ch
        return self
    def swap(self, a, b):
        for r in self.m:
            for i, c in enumerate(r):
                if c == a: r[i] = b
        return self
    def rows(self): return [''.join(r) for r in self.m]

# ---------------------------------------------------------------- heads (11 rows)
FACE = [  # shared lower face, rows 6..10 of the head; eyes at cols 7 and 10
    '.khhhhhssssssk',
    '.khhhssessesk.',
    '.khSssssssssk.',
    '..kSssssssesk.',
    '...kSsssssk...',
]
HEADS = {
  'me': [
    '.....kkkkk....',
    '...kkhhhhhkk..',
    '..khhhhghhhhk.',
    '.khhhhghhhhhhk',
    '.khhhhhhhhhhhk',
    '.khhhhhhhsshhk',
  ] + FACE,
  'buwa': [
    '..............',
    '....kkkkkkk...',
    '...khhhhhhhk..',
    '..khhhghhhhhk.',
    '.khhhhhhhhhhk.',
    '.khhhhhhhhhhhk',
  ] + FACE,
  'aama': [
    '.....kkkkk....',
    '...kkhhhhhkk..',
    '..khhhhghhhhk.',
    'kkkhhhhhhhhhhk',
    'khhkhhhhhhhhhk',
    'khhkhhhhssshhk',
  ] + FACE,
  'hajurbuwa': [  # dhaka topi
    '....kkkkkk....',
    '...krybnrybk..',
    '..kyrnbyrnbrk.',
    '..kkkkkkkkkkk.',
    '.kHHHHHHHHHHk.',
    '.kHHHHHHsssssk',
  ] + FACE,
  'hajuraama': [
    '..............',
    '.....kkkkk....',
    '...kkHHHHHkk..',
    'kkkHHHHgHHHHk.',
    'kHHkHHHHHHHHHk',
    'kHHkHHHHssssHk',
  ] + FACE,
}

# ---------------------------------------------------------------- bodies (rows 11..17)
def arm(fill, hand_row=17, swing=0):
    # near arm as a vertical stripe at cols 6..8, hand at the bottom; swing moves the hand
    rows = {13: f'k{fill}k', 14: f'k{fill}k', 15: f'k{fill}k', 16: f'k{fill}k'}
    return rows

BODIES = {
  'me': [
    '......kssk....',
    '.kk.kkyyyyk...',
    'kokkYyykykwwk.',
    'kokkYyykykwwk.',
    'kokkYyykykwyk.',
    '.kkkYyykykyyk.',
    '..kkkkkskkkkk.',
  ],
  'meSenior': [
    '......kssk....',
    '....kkGGGGk...',
    '...kGGGkGkwyk.',
    '...kGgGkGkwyk.',
    '...kGGGkGkwyk.',
    '...kGGGkGkyGk.',
    '...kkkkskkkkk.',
  ],
  'buwa': [
    '......kssk....',
    '....kkbwwbk...',
    '...kbbbkbkbbk.',
    '...kbbbkbkbbk.',
    '...kbbbkbkbbk.',
    '...kkkkkkkkkk.',
    '...kGGGsGGGGk.',
  ],
  'aama': [  # red sari, gold border, pallu over the shoulder
    '......kssk....',
    '....kkrrryk...',
    '...krrrkryrrk.',
    '...krrykrryrk.',
    '...kryrkrrryk.',
    '...kyrrkrrrrk.',
    '...krrrsrrrrk.',
  ],
  'hajurbuwa': [  # daura with a dark waistcoat
    '......kssk....',
    '....kkGccGk...',
    '...kGGckckGGk.',
    '...kGcckckcGk.',
    '...kGcckckcGk.',
    '...kGcccscccGk',
    '...kcccccccck.',
  ],
  'hajuraama': [  # green sari with a cream shawl
    '......kssk....',
    '....kkccccck..',
    '...kccckcccck.',
    '...kcccknnnck.',
    '...knnnknynnk.',
    '...knnyknnnnk.',
    '...knnnsnnnnk.',
  ],
}

# ---------------------------------------------------------------- legs (rows 18..21)
LEGS = {
  'idle': ['...kPPkPPk....', '...kPPkPPk....', '...kPPkPPk....', '..kkFkkkFkk...'],
  'walkA': ['...kPPkPPk....', '..kPPk.kPPk...', '.kPPk...kPPk..', 'kkFk.....kFkk.'],
  'walkB': ['....kPPPk.....', '....kPPPk.....', '....kPPk......', '...kkFkk......'],
  'jump': ['...kPPPPk.....', '..kPPkkPPk....', '..kFFk.kFFk...', '..............'],
}
SKIRT = {
  'idle': ['...kXXXXXXXk..', '...kXXXXXXXk..', '..kXXXXXXXXXk.', '..kkkkkkkkkkk.'],
  'walkA': ['...kXXXXXXXk..', '..kXXXXXXXXk..', '..kXXXXXXXXXk.', '.kkkkkkkkkkk..'],
  'walkB': ['...kXXXXXXXk..', '...kXXXXXXXXk.', '..kXXXXXXXXXk.', '..kkkkkkkkkkkk'],
  'jump': ['...kXXXXXXXk..', '...kXXXXXXXk..', '..kXXXXXXXXXk.', '..kkkkkkkkkkk.'],
}

PEOPLE = {
  'me':        dict(head='me',        body='me',        legs='b', feet='w'),
  'meSenior':  dict(head='me',        body='meSenior',  legs='G', feet='e'),
  'buwa':      dict(head='buwa',      body='buwa',      legs='G', feet='e', moustache=True),
  'aama':      dict(head='aama',      body='aama',      skirt='r', earring=True),
  'hajurbuwa': dict(head='hajurbuwa', body='hajurbuwa', legs='c', feet='e', moustache='w', cane=True),
  'hajuraama': dict(head='hajuraama', body='hajuraama', skirt='n', wrinkle=True),
}

def person(key, pose='idle', mask=False, tika=False, cry=False, hug=False):
    p = PEOPLE[key]
    g = Grid(W, 22)
    g.put(0, 0, HEADS[p['head']])
    g.put(0, 11, BODIES[p['body']])
    if 'skirt' in p:
        g.put(0, 18, [r.replace('X', p['skirt']) for r in SKIRT[pose]])
    else:
        g.put(0, 18, [r.replace('P', p['legs']).replace('F', p['feet']) for r in LEGS[pose]])
    if p.get('moustache'):
        g.put(8, 9, [('e' if p['moustache'] is True else p['moustache']) * 4])
    if p.get('earring'): g.put(3, 9, ['y'])
    if p.get('wrinkle'): g.put(11, 8, ['S'])
    if p.get('cane'): g.put(12, 15, ['oo', '.o', '.o', '.o', '.o', '.o', '.o'])
    if mask: g.put(7, 8, ['bbbbb', 'bbbbb', 'bbbb'])
    if tika: g.put(10, 6, ['r'])
    if cry:
        g.put(7, 7, ['S  S'])          # eyes shut
        g.put(9, 9, ['ee'])             # wobbly mouth
    if hug:
        # near arm reaches forward at shoulder height
        body = BODIES[p['body']]
        fill = body[3][7] if body[3][7] not in '.k' else 'y'
        g.put(6, 12, ['kkkkkkkk', 'k' + fill * 6 + 's', 'kkkkkkkk'])
    if pose == 'walkB' and not hug:
        # arm swings back on the passing frame
        g.put(6, 16, ['ks'])
    return g.rows()

BHAI = {
  'idle': [
    '....kkkkk...',
    '..kkhkhhkk..',
    '.khhhhhhhhk.',
    '.khhhhhhhhhk',
    '.khhhhhsshhk',
    '.khhhsssssk.',
    '.khhsessesk.',
    '.kSssssssk..',
    '..kSsssek...',
    '...kkkkk....',
    '..knnwnnk...',
    '..knnwknk...',
    '..kbbbsbk...',
    '...kskskk...',
    '...ksk.sk...',
    '..kkwk.kwk..',
  ],
}
def bhai(pose='idle', cry=False, hug=False):
    rows = [r for r in BHAI['idle']]
    g = Grid(12, 16).put(0, 0, rows)
    if pose == 'walkA': g.put(0, 13, ['..ksk..ksk..', '.ksk....ksk.', 'kkwk....kwkk'])
    if pose == 'walkB': g.put(0, 13, ['....kssk....', '....kssk....', '...kkwkk....'])
    if pose == 'jump': g.put(0, 13, ['..ksskssk...', '..kwwk.kwwk.', '............'])
    if cry: g.put(5, 6, ['S  S']); g.put(6, 8, ['ee'])
    if hug: g.put(5, 10, ['kkkkkk', 'nnnnns', 'kkkkkk'])
    return g.rows()

def all_frames():
    out = {}
    for key in PEOPLE:
        for pose in ['idle', 'walkA', 'walkB', 'jump']:
            out[f'{key}:{pose}'] = person(key, pose)
        out[f'{key}:cry'] = person(key, 'idle', cry=True)
        out[f'{key}:hug'] = person(key, 'idle', hug=True)
    for pose in ['idle', 'walkA', 'walkB', 'jump']:
        out[f'bhai:{pose}'] = bhai(pose)
    out['bhai:cry'] = bhai(cry=True); out['bhai:hug'] = bhai(hug=True)
    return out

SUITCASE = [
  '..kkkk..',
  '..k..k..',
  'kkkkkkkk',
  'kRRRRRRk',
  'kRyRRRRk',
  'kRRRRRRk',
  'kRRRRyRk',
  'kkkkkkkk',
  '.k....k.',
]

def export(path):
    f = all_frames()
    lines = ['// Generated by scripts/sprites/heroes.py. Edit the sprites there, then re-export. The player and the family, 14 wide and facing right.',
             '// Poses: idle, walkA, walkB, jump, cry, hug. Bhai is 12 wide.',
             'export const HERO_FRAMES: Record<string, string[]> = ' + json.dumps(f, indent=0).replace('\n', ' ') + ';',
             'export const SUITCASE = ' + json.dumps(SUITCASE) + ';', '']
    open(path, 'w').write('\n'.join(lines))

if __name__ == '__main__':
    if len(sys.argv) > 1: export(sys.argv[1]); sys.exit(0)
    f = all_frames()
    pick = ['me:idle','me:walkA','me:walkB','me:jump','me:cry','me:hug','meSenior:idle','buwa:idle','aama:idle','aama:walkA','hajurbuwa:idle','hajuraama:idle','bhai:idle','bhai:walkA','aama:cry','bhai:hug']
    sprites = [(k, f[k]) for k in pick]
    sprites.append(('me+mask', person('me', mask=True)))
    sprites.append(('me+tika', person('me', tika=True, cry=True)))
    render(sprites, '/tmp/heroes.png', scale=9)
    for k in pick:
        bad = [len(r) for r in f[k] if len(r) != len(f[k][0])]
        if bad: print('width mismatch', k, bad)
