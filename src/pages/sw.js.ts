import type { APIRoute } from 'astro';
import { allPagePaths } from '@/lib/routes';
import { withBase, basePath } from '@/lib/paths';

/**
 * Schlanker Service Worker:
 *  - Precache aller Seiten (HTML) beim ersten Besuch
 *  - /_astro/* (gehashte Assets) cache-first
 *  - Seiten network-first mit Cache-Fallback → Demo läuft auch bei schlechtem Netz im Betrieb
 */
export const GET: APIRoute = () => {
  const version = Date.now().toString(36);
  const pages = JSON.stringify(allPagePaths().map(withBase));
  const B = JSON.stringify(basePath);
  const js = `const V='hw-${version}';const PAGES=${pages};const B=${B};
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(PAGES.map(p=>c.add(p)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
if(u.pathname.startsWith(B+'/_astro/')){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res})));return}
if(r.mode==='navigate'||r.headers.get('accept')?.includes('text/html')){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res}).catch(()=>caches.match(r).then(m=>m||caches.match(B+'/'))));}});`;
  return new Response(js, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
};
