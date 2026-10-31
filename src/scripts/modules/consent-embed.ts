/** Zwei-Klick-Lösung: externer Inhalt (Karte/Video) lädt erst nach Klick */
import { listeners } from '../lifecycle';

export default function consentEmbed() {
  const { signal, off } = listeners();
  document.querySelectorAll<HTMLElement>('[data-consent-embed]').forEach((box) => {
    box.querySelector('[data-consent-load]')?.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = box.dataset.consentEmbed!;
      f.title = box.dataset.title ?? '';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.allowFullscreen = true;
      box.replaceChildren(f);
      f.focus();
    }, { signal, once: true });
  });
  return off;
}
