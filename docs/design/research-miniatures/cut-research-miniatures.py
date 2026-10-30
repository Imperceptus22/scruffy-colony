"""V-172: cut the 59 research miniatures out of the four original sheets (read-only) into square WebP files.

Usage: python -I cut-research-miniatures.py <source dir with tafel-a..d.png> <app asset dir> <crop log json>

Cells come from foreground projections (the groups are not on exact quarters). The dark, slightly graded background is
modelled locally; motif pixels stay opaque, the soft contact shadow becomes translucent black (so it sits on any slot
colour), glows stay soft, and edge pixels are unmixed from the background, which avoids dark fringes. All miniatures
share one scale, so the painted upgrade chevrons keep the same size. Needs numpy and Pillow with WebP."""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw

SRC, OUT, LOG = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
SHEETS = ['a', 'b', 'c', 'd']
COUNTS = {'a': 16, 'b': 16, 'c': 16, 'd': 11}
CORE, SOFT, RING = 28.0, 6.0, 15
SIZE = 160  # 52 px slot at up to 3x density
# Sheet order of MALAUFTRAG.md; original upgrade ids (mobile-unlock-data.js), plus the mobile card and the fallback.
IDS = ['Dagadder', 'Megamace', 'Polierarm', 'Axeidic', 'Greatersword', 'Harmbalest', 'Supershield', 'Shieldblock',
       'Bootboost', 'Hellishmet', 'Pantastic', 'Smoldershoulder', 'Bestplate', 'GambesOP', 'equipment-optimization', 'research',
       'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Speedexplorer', 'Megaminer', 'Megalumber', 'Megafarming',
       'Megascience', 'Efficiency', 'Potency', 'Coordination', 'TrainTacular', 'Bounty', 'Egg', 'Gymystic',
       'Miners', 'Scientists', 'Trainers', 'Explorers', 'Magmamancers', 'UberHut', 'UberHouse', 'UberMansion',
       'UberHotel', 'UberResort', 'Gigastation', 'Blockmaster', 'Trapstorm', 'Battle', 'Bloodlust', 'Prismatic',
       'Prismalicious', 'Anger', 'Rage', 'Formations', 'Dominance', 'Barrier', 'attackRelic', 'enemyAttackRelic',
       'radonRelic', 'scienceRelic', 'breedRelic']


def lum(x):
    return x[..., 0] * .299 + x[..., 1] * .587 + x[..., 2] * .114


def runs(v, thr, min_gap):
    on = v > thr; res = []; s = None
    for i, x in enumerate(on):
        if x and s is None: s = i
        if not x and s is not None: res.append([s, i - 1]); s = None
    if s is not None: res.append([s, len(on) - 1])
    merged = []
    for r in res:  # sparkles and stray specks: merge runs separated by tiny gaps
        if merged and r[0] - merged[-1][1] <= min_gap: merged[-1][1] = r[1]
        else: merged.append(r)
    return merged


def box_blur(a, r):
    """Mean over a (2r+1)^2 window via summed-area table, edges clamped."""
    p = np.pad(a.astype(np.float64), r + 1, mode='edge')
    s = p.cumsum(0).cumsum(1); k = 2 * r + 1
    h, w = a.shape
    tot = s[k:k + h, k:k + w] - s[:h, k:k + w] - s[k:k + h, :w] + s[:h, :w]
    return (tot / (k * k)).astype(np.float32)


def local_std(a, r):
    m = box_blur(a, r); m2 = box_blur(a * a, r)
    return np.sqrt(np.maximum(m2 - m * m, 0))


def to_count(rs, k):
    """Drop specks, then merge across the smallest gap until exactly k groups remain."""
    rs = [list(r) for r in rs if r[1] - r[0] >= 3]
    while len(rs) > k:
        i = min(range(len(rs) - 1), key=lambda j: rs[j + 1][0] - rs[j][1])
        rs[i] = [rs[i][0], rs[i + 1][1]]; del rs[i + 1]
    assert len(rs) == k, rs
    return rs


def dilate(mask, r):
    """Square dilation by r pixels (separable shifts; Pillow's MaxFilter crashes on this runtime)."""
    out = mask.copy()
    for axis in (0, 1):
        acc = out.copy()
        for s in range(1, r + 1):
            fwd = np.zeros_like(out); bwd = np.zeros_like(out)
            if axis == 0: fwd[s:] = out[:-s]; bwd[:-s] = out[s:]
            else: fwd[:, s:] = out[:, :-s]; bwd[:, :-s] = out[:, s:]
            acc |= fwd | bwd
        out = acc
    return out


def erode(mask, r):
    return ~dilate(~mask, r)


def fill_holes(mask):
    inv = Image.fromarray(((~mask) * 255).astype(np.uint8)).convert('L')
    padded = Image.new('L', (inv.width + 2, inv.height + 2), 255); padded.paste(inv, (1, 1))
    ImageDraw.floodfill(padded, (0, 0), 128)
    outside = np.asarray(padded)[1:-1, 1:-1] == 128
    return ~outside


def background(img, fg):
    """Smooth local background: block medians of background pixels, gaps filled, bilinear upsampling."""
    h, w, _ = img.shape; bs = 24
    gh, gw = (h + bs - 1) // bs, (w + bs - 1) // bs
    grid = np.full((gh, gw, 3), np.nan)
    keep = ~dilate(fg, 21)
    for y in range(gh):
        for x in range(gw):
            blk = img[y * bs:(y + 1) * bs, x * bs:(x + 1) * bs]; m = keep[y * bs:(y + 1) * bs, x * bs:(x + 1) * bs]
            if m.sum() > bs * bs * .25: grid[y, x] = np.median(blk[m], axis=0)
    for _ in range(60):
        miss = np.isnan(grid[..., 0])
        if not miss.any(): break
        pad = np.pad(grid, ((1, 1), (1, 1), (0, 0)), constant_values=np.nan)
        nb = np.stack([pad[1:-1, :-2], pad[1:-1, 2:], pad[:-2, 1:-1], pad[2:, 1:-1]])
        mean = np.nanmean(nb, axis=0)
        grid[miss] = mean[miss]
    up = np.stack([np.asarray(Image.fromarray(np.ascontiguousarray(grid[..., c], dtype=np.float32), 'F').resize((w, h), Image.BILINEAR)) for c in range(3)], -1)
    return up


manifest = []
for sheet in SHEETS:
    img = np.asarray(Image.open(f'{SRC}/tafel-{sheet}.png').convert('RGB')).astype(np.float32)
    h, w, _ = img.shape
    rough = np.linalg.norm(img - np.median(img[:40, :40].reshape(-1, 3), axis=0), axis=-1) > 40
    bg = background(img, rough)
    dist = np.linalg.norm(img - bg, axis=-1)
    core = dist > CORE
    # Row bands, then columns inside each band (projection of the confident foreground only).
    strong = dist > 45
    layout = [4, 4, 4, 4] if sheet != 'd' else [4, 4, 3]
    rows = to_count(runs(strong.mean(axis=1), .002, 0), len(layout))
    cells = []
    for ri, (y0, y1) in enumerate(rows):
        cols = to_count(runs(strong[y0:y1 + 1].mean(axis=0), .002, 0), layout[ri])
        cells.append([(y0, y1, x0, x1) for (x0, x1) in cols])
    found = sum(len(r) for r in cells)
    assert found == COUNTS[sheet], (sheet, found, [len(r) for r in cells])
    # Crop windows reach halfway into each gap.
    ybounds = [0] + [(rows[i][1] + rows[i + 1][0]) // 2 for i in range(len(rows) - 1)] + [h - 1]
    n = 0
    for ri, row in enumerate(cells):
        xb = [0] + [(row[i][3] + row[i + 1][2]) // 2 for i in range(len(row) - 1)] + [w - 1]
        for ci, _cell in enumerate(row):
            n += 1
            Y0, Y1, X0, X1 = ybounds[ri], ybounds[ri + 1], xb[ci], xb[ci + 1]
            c_img, c_bg, c_d = img[Y0:Y1, X0:X1], bg[Y0:Y1, X0:X1], dist[Y0:Y1, X0:X1]
            Lc, Lb = lum(c_img), np.maximum(lum(c_bg), 1)
            # Painted motif = far from the background colour, or textured (dark leather, wood in shade); the
            # background and its soft shadows are smooth.
            texture = local_std(Lc, 2)
            c_core = (c_d > CORE) | ((texture > 4.5) & (c_d > 9) & (Lc <= Lb + 8))
            c_core = erode(dilate(c_core, 3), 3)
            # Keep the main group plus pieces close to it (sparkles, drops, wind lines); drop thin specks.
            near = dilate(erode(fill_holes(dilate(c_core, 9)), 6), 10)
            body = dilate(erode(fill_holes(c_core) & near, 1), 1)
            # Background enclosed by the motif (between paws, under arches) or caught around sparkles: plain
            # background colour in patches wider than a few pixels is not motif.
            plain = (c_d < 10) & (texture < 3)
            body &= ~dilate(erode(plain, 2), 2)
            # Glows and haloes (sparkles, magic, embers): smooth, moderately bright areas reachable from outside the
            # motif without crossing painted detail. They become soft, unmixed light instead of an opaque brown patch.
            cand = body & (texture < 3) & (c_d < 55)
            glow = np.zeros_like(body); grow = ~body
            for _ in range(30):
                nxt = dilate(grow, 1) & cand & ~glow
                if not nxt.any(): break
                glow |= nxt; grow = nxt
            body &= ~glow
            ring = dilate(body, RING) & ~body
            brighter = Lc > Lb + 2
            alpha = np.zeros(c_d.shape, np.float32); rgb = c_img.copy()
            # Soft halo / glow / anti-aliasing: unmix from the local background.
            soft = ring & brighter
            a_soft = box_blur(np.where(soft, np.clip((c_d - SOFT) / (80 - SOFT), 0, 1), 0), 1)
            # Contact shadow: translucent black, smoothed (the shadow is soft, the noise is not).
            shade = ring & ~brighter
            a_sh = box_blur(np.where(shade, np.clip((1 - Lc / Lb - .06) / .94, 0, .8), 0), 3)
            alpha[soft] = a_soft[soft]
            alpha[shade] = np.where(a_sh[shade] < .05, 0, a_sh[shade]); rgb[shade] = 0
            # Motif: opaque; its brighter outermost pixel row is unmixed from the background (no dark fringe).
            edge = body & ~erode(body, 1) & brighter
            a_edge = np.clip((c_d - SOFT) / (60 - SOFT), 0, 1)
            alpha[body] = 1; alpha[edge] = np.maximum(a_edge[edge], .5)
            unmix = (soft | edge) & (alpha > .01)
            a3 = alpha[..., None]
            rgb[unmix] = np.clip(c_bg + (c_img - c_bg) / np.maximum(a3, .01), 0, 255)[unmix]
            out = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)
            ys, xs = np.where(alpha > .02)
            box = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
            name = f'{sheet.upper()}{n:02d}'
            Image.fromarray(out, 'RGBA').crop((box[0], box[1], box[2] + 1, box[3] + 1)).save(f'{OUT}/raw-{name}.png')
            manifest.append({'sheet': sheet, 'pos': n, 'name': name, 'cell': [X0, Y0, X1, Y1], 'bbox': [box[0] + X0, box[1] + Y0, box[2] + X0, box[3] + Y0],
                             'w': box[2] - box[0] + 1, 'h': box[3] - box[1] + 1,
                             'touchesCell': bool(box[0] == 0 or box[1] == 0 or box[2] == X1 - X0 - 1 or box[3] == Y1 - Y0 - 1)})
    print(sheet, 'cells per row', [len(r) for r in cells])

assert len(manifest) == len(IDS) == 59
# One shared square: every miniature keeps the same scale, so the chevrons stay the same size.
side = int(max(max(m['w'], m['h']) for m in manifest) * 1.03) + 2
for i, m in enumerate(manifest):
    raw = Image.open(f"{OUT}/raw-{m['name']}.png")
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(raw, ((side - raw.width) // 2, (side - raw.height) // 2))
    small = canvas.convert('RGBa').resize((SIZE, SIZE), Image.LANCZOS).convert('RGBA')
    m['file'] = f"U-R{i + 1:02d}-{IDS[i]}.webp"; m['id'] = IDS[i]
    small.save(f"{OUT}/{m['file']}", 'WEBP', quality=90, alpha_quality=100, method=6)
    os.remove(f"{OUT}/raw-{m['name']}.png")
with open(LOG, 'w', newline='\n') as f:
    json.dump({'side': side, 'size': SIZE, 'motifs': manifest}, f, indent=1); f.write('\n')
print('side', side, 'touching cell edge:', [m['name'] for m in manifest if m['touchesCell']])
