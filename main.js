const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroSvg = document.querySelector('.dog-svg');
const headGroup = heroSvg?.querySelector('.dog-head-group');
const leftEarl = heroSvg?.querySelector('.dog-ear.ear-left');
const rightEarl = heroSvg?.querySelector('.dog-ear.ear-right');
const leftLid = heroSvg?.querySelector('.dog-eyelid.left-lid');
const rightLid = heroSvg?.querySelector('.dog-eyelid.right-lid');
const tail = heroSvg?.querySelector('.dog-tail');
const heroFallback = document.querySelector('.hero-fallback');

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function toggleClass(element, className, duration) {
  if (!element) return;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), duration);
}

function scheduleBlink() {
  const delay = randomBetween(3000, 8000);
  window.setTimeout(() => {
    if (!leftLid || !rightLid) return scheduleBlink();
    toggleClass(leftLid, 'blink', 240);
    toggleClass(rightLid, 'blink', 240);
    scheduleBlink();
  }, delay);
}

function scheduleEarTwitch() {
  const delay = randomBetween(4000, 10000);
  window.setTimeout(() => {
    const ear = Math.random() > 0.5 ? leftEarl : rightEarl;
    toggleClass(ear, 'twitch', randomBetween(180, 300));
    scheduleEarTwitch();
  }, delay);
}

function scheduleTailFlick() {
  const delay = randomBetween(6000, 12000);
  window.setTimeout(() => {
    toggleClass(tail, 'flick', randomBetween(300, 600));
    scheduleTailFlick();
  }, delay);
}

function scheduleHeadTilt() {
  if (!headGroup) return;
  const delay = randomBetween(1000, 3000);
  window.setTimeout(() => {
    headGroup.classList.add('tilt');
    window.setTimeout(() => headGroup.classList.remove('tilt'), 1800);
    scheduleHeadTilt();
  }, delay);
}

function initDogAnimation() {
  if (prefersReducedMotion) {
    if (heroFallback) {
      heroFallback.style.opacity = '1';
    }
    return;
  }

  scheduleBlink();
  scheduleEarTwitch();
  scheduleTailFlick();
  scheduleHeadTilt();
}

window.addEventListener('DOMContentLoaded', initDogAnimation);
