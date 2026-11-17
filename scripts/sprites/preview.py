# Sprite prototyping: render char-grid sprites at large scale to iterate on the look.
from PIL import Image, ImageDraw
PAL = {
 'k':'#1c1915','w':'#fbf8f0','g':'#7d7668','s':'#c98f63','S':'#a06a45','y':'#ecd96f','Y':'#c4a43c',
 'b':'#5f7fa8','B':'#3c587e','r':'#b9553f','R':'#86392a','n':'#5f8a5a','N':'#3f6a3c','c':'#efe4c6',
 'G':'#4d483f','H':'#b9b3a7','t':'#7fb6ea','o':'#e09a4a','p':'#d97a8a','h':'#2e2925','e':'#1c1915',
}
def render(sprites, path, scale=10, bg='#ece5d5'):
    pad = 2
    W = sum(max(len(r) for r in s) + pad for _, s in sprites) + pad
    Hh = max(len(s) for _, s in sprites) + pad * 2 + 3
    im = Image.new('RGB', (W * scale, Hh * scale), bg)
    d = ImageDraw.Draw(im)
    x = pad
    for name, rows in sprites:
        w = max(len(r) for r in rows)
        top = Hh - pad - len(rows)
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch in PAL:
                    d.rectangle([(x + i) * scale, (top + j) * scale, (x + i + 1) * scale - 1, (top + j + 1) * scale - 1], fill=PAL[ch])
        d.text((x * scale, 2), name, fill='#1c1915')
        x += w + pad
    im.save(path)
