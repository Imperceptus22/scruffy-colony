const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'artwork/diorama/source-package');
const supplementalDir = path.join(root, 'artwork/diorama/supplemental');
const appDir = path.join(root, 'app/src/main/assets/game');
const appDioramaDir = path.join(appDir, 'mobile-assets/diorama');
const groupNames = { B: 'buildings', E: 'equipment', R: 'resources', J: 'jobs', M: 'biomes', S: 'scenes', T: 'terrain', U: 'ui' };
const maxSizes = { buildings: 512, equipment: 512, resources: 256, jobs: 384, biomes: 448, scenes: 640, terrain: 256, interface: 512 };

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function cleanTransparentMatte(data, width, height) {
  const pixels = width * height;
  const queue = new Int32Array(pixels);
  const seen = new Uint8Array(pixels);
  let tail = 0;
  for (let i = 0; i < pixels; i++) {
    const offset = i * 4;
    if (data[offset + 3] === 0 || data[offset + 3] > 128) continue;
    const r = data[offset], g = data[offset + 1], b = data[offset + 2];
    const redMatte = r >= 200 && g <= 85 && b <= 85;
    const cyanMatte = r <= 85 && g >= 165 && b >= 165;
    if (redMatte || cyanMatte) {
      let nearest = -1, nearestDistance = 3;
      for (let y = Math.max(0, Math.floor(i / width) - 2); y <= Math.min(height - 1, Math.floor(i / width) + 2); y++) {
        for (let x = Math.max(0, (i % width) - 2); x <= Math.min(width - 1, (i % width) + 2); x++) {
          const candidate = y * width + x;
          if (data[candidate * 4 + 3] < 240) continue;
          const dx = x - (i % width), dy = y - Math.floor(i / width), distance = Math.hypot(dx, dy);
          if (distance > 2 || distance >= nearestDistance) continue;
          const cr = data[candidate * 4], cg = data[candidate * 4 + 1], cb = data[candidate * 4 + 2];
          if (redMatte ? cr >= 170 && cg <= 110 && cb <= 110 : cr <= 110 && cg >= 140 && cb >= 140) { nearest = candidate; nearestDistance = distance; }
        }
      }
      if (nearest < 0) {
        let bestDistance = 3;
        for (let y = Math.max(0, Math.floor(i / width) - 2); y <= Math.min(height - 1, Math.floor(i / width) + 2); y++) {
          for (let x = Math.max(0, (i % width) - 2); x <= Math.min(width - 1, (i % width) + 2); x++) {
            const candidate = y * width + x;
            if (data[candidate * 4 + 3] < 240) continue;
            const distance = Math.hypot(x - (i % width), y - Math.floor(i / width));
            if (distance < bestDistance) { nearest = candidate; bestDistance = distance; }
          }
        }
      }
      if (nearest >= 0) {
        for (let channel = 0; channel < 3; channel++) data[offset + channel] = data[nearest * 4 + channel];
      }
    }
  }

  let head = 0;
  for (let i = 0; i < pixels; i++) if (data[i * 4 + 3] !== 0) { queue[tail++] = i; seen[i] = 1; }
  while (head < tail) {
    const pixel = queue[head++], x = pixel % width, y = Math.floor(pixel / width);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const next = ny * width + nx, offset = next * 4;
      if (seen[next]) continue;
      const source = pixel * 4;
      data[offset] = data[source]; data[offset + 1] = data[source + 1]; data[offset + 2] = data[source + 2];
      seen[next] = 1;
      queue[tail++] = next;
    }
  }
  return data;
}

function cropToAlphaBounds(data, width, height, threshold = 8, padding = 2) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] <= threshold) continue;
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  if (maxX < 0) throw new Error('Cannot crop an image with no visible pixels.');
  const rect = {
    left: Math.max(0, minX - padding), top: Math.max(0, minY - padding),
    width: Math.min(width, maxX + padding + 1) - Math.max(0, minX - padding),
    height: Math.min(height, maxY + padding + 1) - Math.max(0, minY - padding),
  };
  const cropped = Buffer.alloc(rect.width * rect.height * 4);
  for (let y = 0; y < rect.height; y++) {
    const from = ((rect.top + y) * width + rect.left) * 4;
    data.copy(cropped, y * rect.width * 4, from, from + rect.width * 4);
  }
  return { data: cropped, rect };
}

function stageSourcePackage(from) {
  const manifestFile = path.join(from, 'manifest.json');
  const input = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (input.items?.length !== 89) throw new Error(`Expected 89 source items; got ${input.items?.length ?? 'none'}`);
  fs.mkdirSync(sourceDir, { recursive: true });
  const copy = (relative) => {
    const source = path.join(from, relative), destination = path.join(sourceDir, relative);
    if (!fs.existsSync(source)) throw new Error(`Missing source package file: ${relative}`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  };
  copy('manifest.json');
  copy('README.md');
  for (const folder of ['objects', 'world', 'special', 'interface']) {
    for (const name of fs.readdirSync(path.join(from, folder))) {
      if (!/\.(png|json|txt)$/i.test(name)) continue;
      copy(`${folder}/${name}`);
    }
  }
  for (const item of input.items) {
    copy(item.file);
    copy(`${item.file}.json`);
    copy(`${item.file}.prompt.txt`);
  }
}

async function buildSupplemental(groups) {
  const manifestPath = path.join(supplementalDir, 'manifest.json');
  const replacementManifestPath = path.join(supplementalDir, 'header-replacements.json');
  const combatManifestPath = path.join(supplementalDir, 'combat-clearing.json');
  const sources = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const replacements = JSON.parse(fs.readFileSync(replacementManifestPath, 'utf8'));
  const combatScene = JSON.parse(fs.readFileSync(combatManifestPath, 'utf8'));
  sources.push({ key: 'combat-clearing', sourceGroup: 'combat-clearing', items: [{ id: combatScene.id, key: combatScene.key, filename: combatScene.filename, sourceRect: combatScene.sourceRect, domain: 'scenes' }] });
  const items = [];
  for (const atlas of sources) {
    const domain = atlas.items[0].domain;
    const maxSize = domain === 'scenes' ? maxSizes.scenes : domain === 'navigation' ? 100 : maxSizes.interface;
    groups[domain] ??= {};
    for (const item of atlas.items) {
      const replacement = atlas.key === 'headers' && replacements.find(entry => entry.id === item.id);
      const standalone = atlas.key === 'combat-clearing';
      const sourceGroup = replacement ? 'header-replacements' : atlas.sourceGroup || atlas.key;
      const atlasPath = path.join(supplementalDir, 'source-atlases', sourceGroup, `${item.id}.png`);
      const promptPath = path.join(supplementalDir, 'prompts', sourceGroup, `${item.id}.prompt.txt`);
      const defaultAtlasPath = path.join(supplementalDir, 'source-atlases', `${atlas.key}.png`);
      const defaultPromptPath = path.join(supplementalDir, 'prompts', `${atlas.key}.prompt.txt`);
      const sourcePath = replacement || standalone ? atlasPath : defaultAtlasPath;
      const sourcePromptPath = replacement || standalone ? promptPath : defaultPromptPath;
      if (!fs.existsSync(sourcePath) || !fs.existsSync(sourcePromptPath)) throw new Error(`Missing supplemental source or prompt: ${item.id}`);
      const sourceMetadata = await sharp(sourcePath).metadata();
      const sourceRect = replacement || standalone
        ? { left: 0, top: 0, width: sourceMetadata.width, height: sourceMetadata.height }
        : item.sourceRect;
      const { data, info } = await sharp(sourcePath).extract(sourceRect).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      cleanTransparentMatte(data, info.width, info.height);
      const crop = domain === 'materials' || domain === 'navigation' ? cropToAlphaBounds(data, info.width, info.height) : { data, rect: { left: 0, top: 0, width: info.width, height: info.height } };
      const outputPath = path.join(appDioramaDir, item.filename);
      await sharp(crop.data, { raw: { width: crop.rect.width, height: crop.rect.height, channels: 4 } })
        .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
        .webp({ quality: 92, alphaQuality: 100, effort: 4, smartSubsample: true })
        .toFile(outputPath);
      const url = `mobile-assets/diorama/${item.filename}`;
      const mapKey = domain === 'scenes' ? ({ H01: 'colony', H02: 'building-workshop', H03: 'equipment-armory' }[item.id] || item.key) : item.key;
      if (!mapKey || (domain !== 'scenes' && Object.hasOwn(groups[domain], mapKey))) throw new Error(`Duplicate supplemental map key ${domain}.${mapKey}`);
      groups[domain][mapKey] = url;
      const outputInfo = await sharp(outputPath).metadata();
      items.push({
        id: item.id, key: item.key, domain, mapKey, filename: item.filename, sourceGroup,
        sourceAtlas: replacement || standalone ? `source-atlases/${sourceGroup}/${item.id}.png` : `source-atlases/${atlas.key}.png`,
        sourcePrompt: replacement || standalone ? `prompts/${sourceGroup}/${item.id}.prompt.txt` : `prompts/${atlas.key}.prompt.txt`,
        sourceManifestSha256: standalone ? sha256(combatManifestPath) : undefined,
        sourceRect, replaces: replacement?.replaces, renditionCrop: crop.rect, sourceSize: { width: info.width, height: info.height },
        outputSize: { width: outputInfo.width, height: outputInfo.height },
        sourceAtlasSha256: sha256(sourcePath), sourcePromptSha256: sha256(sourcePromptPath), outputSha256: sha256(outputPath),
      });
    }
  }
  fs.writeFileSync(path.join(supplementalDir, 'build-manifest.json'), `${JSON.stringify({
    sourceManifestSha256: sha256(manifestPath), headerReplacementManifestSha256: sha256(replacementManifestPath), combatSceneManifestSha256: sha256(combatManifestPath), count: items.length, items,
  }, null, 2)}\n`);
  return items;
}

async function build() {
  const sourceArgument = process.argv.find(arg => arg.startsWith('--source='))?.slice('--source='.length);
  if (sourceArgument) stageSourcePackage(path.resolve(sourceArgument));
  const sourceManifestFile = path.join(sourceDir, 'manifest.json');
  if (!fs.existsSync(sourceManifestFile)) throw new Error('Source package missing; pass --source=<production package> once to preserve it first.');
  const manifest = JSON.parse(fs.readFileSync(sourceManifestFile, 'utf8'));
  if (manifest.items.length !== 89 || new Set(manifest.items.map(item => item.id)).size !== 89) throw new Error('Source manifest must contain 89 unique IDs.');
  fs.mkdirSync(appDioramaDir, { recursive: true });
  const groups = Object.fromEntries(Object.values(groupNames).map(name => [name, {}]));
  const items = [];
  const sourceHashes = new Map();
  const hashFile = file => {
    if (!sourceHashes.has(file)) sourceHashes.set(file, sha256(file));
    return sourceHashes.get(file);
  };
  for (const item of manifest.items) {
    const group = groupNames[item.id[0]];
    if (!group || !item.key || !item.sourceRect || !item.source || !item.sourcePrompt) throw new Error(`Incomplete source provenance for ${item.id}`);
    const sourcePath = path.join(sourceDir, item.file), atlasPath = path.join(sourceDir, item.source);
    const promptPath = path.join(sourceDir, item.sourcePrompt);
    if (!fs.existsSync(sourcePath) || !fs.existsSync(atlasPath) || !fs.existsSync(promptPath)) throw new Error(`Incomplete package inputs for ${item.id}`);
    const sourceSha256 = hashFile(sourcePath);
    if (sourceSha256 !== item.sha256) throw new Error(`Source crop hash mismatch for ${item.id}`);
    const crop = sharp(atlasPath).extract(item.sourceRect).ensureAlpha();
    const { data, info } = await crop.raw().toBuffer({ resolveWithObject: true });
    const sourcePixels = await sharp(sourcePath).ensureAlpha().raw().toBuffer();
    if (sourcePixels.length !== data.length || !sourcePixels.equals(data)) throw new Error(`Crop no longer matches atlas mapping for ${item.id}`);
    const maxSize = maxSizes[item.group];
    if (!maxSize) throw new Error(`No output scale defined for ${item.id} (${item.group})`);
    cleanTransparentMatte(data, info.width, info.height);
    const trimAlpha = ['buildings', 'equipment', 'resources', 'interface'].includes(item.group) || (item.group === 'terrain' && item.key.startsWith('terrain-'));
    const alphaCrop = trimAlpha ? cropToAlphaBounds(data, info.width, info.height) : { data, rect: { left: 0, top: 0, width: info.width, height: info.height } };
    const outputName = `${item.id}-${item.key}.webp`;
    const outputFile = path.join(appDioramaDir, outputName);
    await sharp(alphaCrop.data, { raw: { width: alphaCrop.rect.width, height: alphaCrop.rect.height, channels: 4 } })
      .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
      .webp({ quality: 92, alphaQuality: 100, effort: 4, smartSubsample: true })
      .toFile(outputFile);
    const relativeUrl = `mobile-assets/diorama/${outputName}`;
    const mapKey = item.group === 'interface' ? 'ui' : item.group;
    const key = mapKey === 'resources' ? item.key.toLowerCase() : item.key;
    if (Object.hasOwn(groups[mapKey], key)) throw new Error(`Duplicate Diorama map key ${mapKey}.${key}`);
    groups[mapKey][key] = relativeUrl;
    const outputMetadata = await sharp(outputFile).metadata();
    items.push({
      id: item.id, key: item.key, group: item.group, file: relativeUrl,
      sourceAsset: item.file, source: item.source, sourceRect: item.sourceRect, sourcePrompt: item.sourcePrompt,
      renditionCrop: alphaCrop.rect,
      sourceSha256, sourceAtlasSha256: hashFile(atlasPath), sourcePromptSha256: hashFile(promptPath),
      sourceSize: { width: info.width, height: info.height },
      outputSize: { width: outputMetadata.width, height: outputMetadata.height },
      outputSha256: sha256(outputFile),
    });
  }
  const supplementalItems = await buildSupplemental(groups);
  const mapSource = `// Generated by tools/build-diorama-assets.cjs. Do not edit by hand.\n(function (root, assets) {\n  if (typeof module === 'object' && module.exports) module.exports = assets;\n  root.DioramaAssets = assets.DioramaAssets;\n})(globalThis, ${JSON.stringify({ DioramaAssets: groups }, null, 2)});\n`;
  fs.writeFileSync(path.join(appDir, 'mobile-diorama-assets.js'), mapSource);
  fs.writeFileSync(path.join(root, 'artwork/diorama/manifest.json'), `${JSON.stringify({
    sourceRevision: manifest.sourceRevision,
    count: items.length,
    encoding: { format: 'WebP', quality: 92, alphaQuality: 100, effort: 4, alphaCrop: { groups: ['buildings', 'equipment', 'resources', 'interface', 'terrain tiles'], threshold: 8, padding: 2 }, matteCleanup: 'See docs/design/diorama-assets.md.' },
    items,
  }, null, 2)}\n`);
  const totalBytes = [...items.map(item => path.join(appDir, item.file)), ...supplementalItems.map(item => path.join(appDioramaDir, item.filename))]
    .reduce((total, file) => total + fs.statSync(file).size, 0);
  console.log(`Built ${items.length} base and ${supplementalItems.length} supplemental Diorama assets (${totalBytes} bytes).`);
}

module.exports = { cleanTransparentMatte, cropToAlphaBounds };
if (require.main === module) build().catch(error => { console.error(error); process.exitCode = 1; });
