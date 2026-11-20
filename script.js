(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const START = 2014;
  const END = 2027;
  const wideQuery = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const story = document.querySelector(".story");
  const track = document.querySelector(".story__track");
  const chapters = [...document.querySelectorAll(".chapter")];
  const ticksEl = document.querySelector(".ruler__ticks");
  const marker = document.querySelector(".ruler__marker");
  const markerYear = document.querySelector(".ruler__year");
  const heroLines = [...document.querySelectorAll(".hero__line")];
  const hero = document.querySelector(".hero");

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---- Ruler ticks ---- */
  for (let y = START; y <= END; y++) {
    const tick = document.createElement("div");
    tick.className = "ruler__tick" + ((y - START) % 2 === 0 ? " is-major" : "");
    tick.style.left = ((y - START) / (END - START)) * 100 + "%";
    if ((y - START) % 2 === 0 && y < END) {
      const label = document.createElement("span");
      label.textContent = y;
      tick.appendChild(label);
    }
    ticksEl.appendChild(tick);
  }

  /* ---- Pinned horizontal scroll ---- */
  let pinned = false;
  let maxShift = 0;
  let anchors = [];
  let markerX = 0;

  function measure() {
    const shouldPin = wideQuery.matches && !reduceQuery.matches;
    if (shouldPin !== pinned) {
      pinned = shouldPin;
      story.classList.toggle("is-pinned", pinned);
      if (!pinned) {
        story.style.height = "";
        track.style.transform = "";
      }
    }
    if (!pinned) return;

    maxShift = Math.max(0, track.scrollWidth - window.innerWidth);
    story.style.height = maxShift + window.innerHeight + "px";

    // Map horizontal offset -> year, anchored at each chapter's centre.
    anchors = chapters.map((c) => ({
      x: c.offsetLeft + c.offsetWidth / 2 - window.innerWidth / 2,
      year: parseFloat(c.dataset.year),
    }));
  }

  function yearAt(x) {
    if (x <= anchors[0].x) return anchors[0].year;
    for (let i = 1; i < anchors.length; i++) {
      if (x <= anchors[i].x) {
        const a = anchors[i - 1];
        const b = anchors[i];
        return a.year + ((x - a.x) / (b.x - a.x)) * (b.year - a.year);
      }
    }
    return anchors[anchors.length - 1].year;
  }

  function updateStory() {
    if (!pinned) return;
    const rect = story.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / (story.offsetHeight - window.innerHeight)));
    const shift = progress * maxShift;
    track.style.transform = `translate3d(${-shift}px,0,0)`;

    const year = Math.min(END - 0.05, Math.max(START, yearAt(shift)));
    const rulerWidth = ticksEl.clientWidth;
    const targetX = ((year - START) / (END - START)) * rulerWidth;
    markerX += (targetX - markerX) * 0.25;
    marker.style.transform = `translate3d(${markerX}px,0,0)`;
    markerYear.textContent = year >= 2026.6 ? "Now" : Math.floor(year);
  }

  /* ---- Hero parallax ---- */
  function updateHero() {
    if (reduceQuery.matches) return;
    const y = Math.min(window.scrollY, hero.offsetHeight);
    heroLines[0].style.transform = `translate3d(${y * -0.12}px,0,0)`;
    heroLines[1].style.transform = `translate3d(${y * 0.18}px,0,0)`;
  }

  /* ---- Frame loop ---- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHero();
      updateStory();
      ticking = false;
      if (pinned && Math.abs(markerX) > 0) requestAnimationFrame(settle);
    });
  }
  // Let the marker ease to rest after scrolling stops.
  let settleFrames = 0;
  function settle() {
    if (settleFrames++ > 20) { settleFrames = 0; return; }
    updateStory();
    requestAnimationFrame(settle);
  }

  /* ---- Copy email ---- */
  const copyBtn = document.querySelector(".contact__copy");
  const mailEl = document.querySelector(".contact__mail");
  if (copyBtn && mailEl) {
    copyBtn.addEventListener("click", async () => {
      const text = mailEl.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied";
      } catch (err) {
        const range = document.createRange();
        range.selectNodeContents(mailEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = "Press Ctrl+C";
      }
      setTimeout(() => { copyBtn.textContent = "Copy email"; }, 2000);
    });
  }

  /* ---- Wire up ---- */
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { measure(); onScroll(); });
  wideQuery.addEventListener("change", () => { measure(); onScroll(); });
  reduceQuery.addEventListener("change", () => { measure(); onScroll(); });
  window.addEventListener("load", () => { measure(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); onScroll(); });
  measure();
  onScroll();
})();
