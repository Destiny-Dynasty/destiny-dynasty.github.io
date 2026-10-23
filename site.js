/* El mismo feed alimenta la web y el launcher. */
const serverAddress = 'destinydynasty.tatnikhost.net';
document.querySelectorAll('[data-copy-ip]').forEach(button => {
  const original = button.innerHTML;
  button.addEventListener('click', async () => {
    const feedback = document.getElementById('copy-feedback');
    try {
      await navigator.clipboard.writeText(serverAddress);
      feedback.textContent = 'Dirección copiada. ¡Nos vemos dentro!';
      button.textContent = '¡Dirección copiada!';
      window.setTimeout(() => { button.innerHTML = original; }, 2500);
    } catch {
      feedback.textContent = `Copia esta dirección: ${serverAddress}`;
      button.textContent = serverAddress;
    }
  });
});

function safeHttpsUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, document.baseURI);
    if (url.protocol === 'https:' || (url.origin === location.origin && ['localhost', '127.0.0.1'].includes(location.hostname))) return url.href;
  } catch { /* Enlace inválido. */ }
  return null;
}

async function loadNews() {
  try {
    const response = await fetch('news.json', { cache: 'no-cache', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Feed no disponible');
    const feed = await response.json();
    if (feed.schemaVersion !== 1 || !Array.isArray(feed.items)) throw new Error('Feed inválido');
    const grid = document.getElementById('news-grid');
    const existing = [...grid.children];
    const cards = feed.items.filter(item => item && typeof item === 'object' && item.enabled !== false).slice(0, 8).map(item => {
      const image = safeHttpsUrl(new URL(item.imageUrl, response.url).href);
      if (!image || typeof item.caption !== 'string' || !item.caption.trim()) return null;
      const link = safeHttpsUrl(item.linkUrl);
      // Reutiliza los títulos editoriales, respetando orden y retirada del feed.
      const original = link && existing.find(node => node.href === link && node.querySelector('img')?.src === image);
      if (original) { original.querySelector('p').textContent = item.caption.slice(0, 90); return original; }
      const card = document.createElement(link ? 'a' : 'article');
      card.className = 'news-card';
      if (link) { card.href = link; if (new URL(link).origin !== location.origin) { card.target = '_blank'; card.rel = 'noopener noreferrer'; } }
      const img = document.createElement('img');
      img.src = image; img.alt = item.caption.slice(0, 90); img.loading = 'lazy'; img.width = 1120; img.height = 500;
      const content = document.createElement('div');
      const label = document.createElement('span'); label.className = 'eyebrow'; label.textContent = 'NOVEDADES DE DESTINY';
      const title = document.createElement('h3'); title.textContent = item.caption.slice(0, 90);
      content.append(label, title);
      if (link) { const cta = document.createElement('span'); cta.className = 'text-link'; cta.textContent = 'Leer novedad ↗'; cta.style.marginTop = '18px'; content.append(cta); }
      card.append(img, content);
      return card;
    }).filter(Boolean);
    grid.replaceChildren(...cards);
    document.getElementById('news-message').textContent = cards.length ? '' : 'Todavía no hay novedades publicadas. Nos encontramos en Discord.';
  } catch {
    document.getElementById('news-message').textContent = 'No pudimos actualizar las novedades. Estos son los últimos anuncios incluidos en la web.';
  }
}

async function loadLauncherRelease() {
  try {
    const response = await fetch('https://api.github.com/repos/Destiny-Dynasty/Destiny-Launcher/releases/latest', { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return;
    const release = await response.json();
    if (release.draft || release.prerelease || !Array.isArray(release.assets)) return;
    const asset = release.assets.find(item => /\.exe$/i.test(item.name) && /setup|installer|instalador/i.test(item.name));
    if (!asset) return;
    const url = safeHttpsUrl(asset.browser_download_url);
    if (!url || new URL(url).hostname !== 'github.com' || !new URL(url).pathname.startsWith('/Destiny-Dynasty/Destiny-Launcher/releases/download/')) return;
    const link = document.getElementById('launcher-download');
    link.href = url; link.textContent = 'Descargar launcher para Windows ↗';
    document.getElementById('release-status').textContent = `Versión ${String(release.tag_name).slice(0, 40)} · Windows x64`;
    link.closest('.step').querySelector('p').textContent = 'Descarga el instalador oficial para Windows. Destiny Launcher prepara Minecraft, Fabric y los archivos del modpack.';
    const faq = [...document.querySelectorAll('details')].find(item => item.querySelector('summary').textContent.includes('descargar el nuevo launcher'));
    if (faq) faq.querySelector('p').textContent = 'Sí. Encontrarás el instalador oficial para Windows en el paso 02 de esta página. La descarga procede de las publicaciones oficiales de Destiny Launcher en GitHub.';
  } catch { /* Conserva el estado de preparación y el enlace a publicaciones. */ }
}
loadNews();
loadLauncherRelease();
