import { readFile, stat, readdir } from 'node:fs/promises';
import { dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let checked = 0;
async function checkReference(value, source) {
  if (/^(https:|#|mailto:)/.test(value)) return;
  assert(!/^[a-z]+:/i.test(value), `Protocolo no permitido: ${source}: ${value}`);
  const path = resolve(value.startsWith('/') ? root : dirname(source), decodeURIComponent(value.split(/[?#]/)[0]).replace(/^\//, ''));
  assert(!relative(root, path).startsWith('..'), `Ruta fuera de la web: ${value}`);
  const info = await stat(path);
  if (info.isDirectory()) await stat(resolve(path, 'index.html'));
  checked++;
}

async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'tools') continue;
    const full = resolve(path, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (extname(full) === '.html') {
      const html = await readFile(full, 'utf8');
      assert(/<html lang="es"/.test(html), `Falta idioma espaÃ±ol: ${entry.name}`);
      assert(/name="viewport"/.test(html), `Falta viewport: ${entry.name}`);
      for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) await checkReference(match[1], full);
    }
  }
}

const feedPath = resolve(root, 'news.json');
const feed = JSON.parse(await readFile(feedPath, 'utf8'));
assert.equal(feed.schemaVersion, 1);
assert(Array.isArray(feed.items));
const ids = new Set();
for (const item of feed.items) {
  assert(typeof item.id === 'string' && item.id.trim() && !ids.has(item.id), 'ID de noticia vacÃ­o o duplicado');
  ids.add(item.id);
  assert(typeof item.caption === 'string' && item.caption.trim() && item.caption.length <= 90 && !/[\r\n]/.test(item.caption), `Caption invÃ¡lido: ${item.id}`);
  assert(item.enabled === undefined || typeof item.enabled === 'boolean', `enabled invÃ¡lido: ${item.id}`);
  assert(typeof item.imageUrl === 'string' && item.imageUrl.trim(), `Imagen ausente: ${item.id}`);
  await checkReference(item.imageUrl, feedPath);
  if (!item.imageUrl.startsWith('https:')) assert((await stat(resolve(root, item.imageUrl))).size <= 4 * 1024 * 1024, `Imagen mayor de 4 MiB: ${item.id}`);
  if (item.linkUrl) await checkReference(item.linkUrl, feedPath);
}
await walk(root);
const css = await readFile(resolve(root, 'style.css'), 'utf8');
for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) await checkReference(match[1], resolve(root, 'style.css'));
console.log(`OK: ${feed.items.length} noticias, ${checked} referencias locales; artÃ­culos, recursos y feed vÃ¡lidos.`);
