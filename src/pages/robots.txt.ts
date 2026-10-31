import type { APIRoute } from 'astro';
import { site } from '@/lib/config';
import { absUrl } from '@/lib/seo';

/** DEMO-SCHUTZ: Bei meta.noindex sperrt robots.txt alles und es gibt keine Sitemap. */
export const GET: APIRoute = () => {
  const body = site.config.meta.noindex
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /pitch/\n\nSitemap: ${absUrl('/sitemap-index.xml')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
