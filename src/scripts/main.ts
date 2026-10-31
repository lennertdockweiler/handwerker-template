/**
 * Einstieg aller Client-Skripte. GSAP-Module (motion, process, hscroll) laden erst nach
 * window.load im Leerlauf – die Hero-Animation ist reines CSS und braucht sie nicht.
 * Kleine Module laden sofort, schwere (GSAP,
 * Galerie, Formulare) nur, wenn die Seite passende Elemente enthält.
 */
import { start, lazy } from './lifecycle';
import header from './modules/header';
import menu from './modules/menu';
import liveStatus from './modules/live-status';

start([
  header,
  menu,
  liveStatus,
  lazy('[data-anim],[data-anim-stagger],[data-parallax],[data-count],[data-magnetic],[data-hero],[data-inview]', () => import('./modules/motion'), { deferred: true }),
  lazy('[data-process]', () => import('./modules/process'), { deferred: true }),
  lazy('[data-hscroll]', () => import('./modules/hscroll'), { deferred: true }),
  lazy('[data-before-after]', () => import('./modules/before-after')),
  lazy('[data-plz-check]', () => import('./modules/plz')),
  lazy('[data-gallery]', () => import('./modules/gallery')),
  lazy('[data-lightbox]', () => import('./modules/lightbox')),
  lazy('[data-tabs]', () => import('./modules/tabs')),
  lazy('[data-accordion]', () => import('./modules/accordion')),
  lazy('[data-cursor-preview]', () => import('./modules/cursor-preview')),
  lazy('[data-carousel]', () => import('./modules/carousel')),
  lazy('[data-kosten]', () => import('./modules/kosten')),
  lazy('[data-form]', () => import('./modules/form')),
  lazy('[data-consent-embed]', () => import('./modules/consent-embed')),
  lazy('[data-hero-video]', () => import('./modules/hero-video')),
  lazy('[data-pitch]', () => import('./modules/pitch')),
]);

// Schlanker Service Worker: Demo läuft nach einmaligem Laden auch bei schlechtem Netz.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {}), { once: true });
}
