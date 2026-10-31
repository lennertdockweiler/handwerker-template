/** Hero-Video: nur ohne Reduced Motion und ohne Save-Data; mobil eigene, kleinere Datei */
import { reduceMotion, saveData } from '../lifecycle';

export default function heroVideo() {
  const v = document.querySelector<HTMLVideoElement>('[data-hero-video]');
  if (!v || reduceMotion() || saveData()) return;
  const mobile = matchMedia('(max-width: 47.99rem)').matches;
  v.src = (mobile ? v.dataset.srcMobil : v.dataset.src) ?? '';
  v.muted = true;
  v.play().then(() => v.classList.add('is-playing')).catch(() => {});
  return () => {
    v.pause();
    v.removeAttribute('src');
    v.load();
  };
}
