// Minimaler statischer Server für gebaute Varianten (Screenshots, Lighthouse).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml', '.mp4': 'video/mp4' };

export function serve(dir, port = 0) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
      let file = join(dir, url);
      try {
        if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      } catch {}
      try {
        let body = await readFile(file);
        const type = TYPES[extname(file)] ?? 'application/octet-stream';
        const headers = { 'Content-Type': type, 'Cache-Control': url.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache' };
        // Wie Cloudflare/Netlify: Text-Ressourcen komprimiert ausliefern
        const enc = String(req.headers['accept-encoding'] ?? '');
        if (/text|javascript|json|svg|xml/.test(type)) {
          if (enc.includes('br')) { body = brotliCompressSync(body); headers['Content-Encoding'] = 'br'; }
          else if (enc.includes('gzip')) { body = gzipSync(body); headers['Content-Encoding'] = 'gzip'; }
        }
        res.writeHead(200, headers);
        res.end(body);
      } catch {
        const nf = await readFile(join(dir, '404.html')).catch(() => 'Not found');
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(nf);
      }
    });
    server.listen(port, '127.0.0.1', () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` }));
  });
}
