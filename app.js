// State
const state = {
  hours: 0,
  age: null,
  yearsLeft: null,
  wakingHours: 16,
  lifeExpectancy: 77
};

// DOM Elements
const clock = document.getElementById('clock');
const clockFill = document.getElementById('clock-fill');
const clockHandle = document.getElementById('clock-handle');
const clockText = document.getElementById('clock-text');
const scrollPrompt = document.querySelector('.scroll-prompt');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initScrollAnimations();
  initAgeInput();
  initReclaimSlider();
  generateCalendar();
});

// ============================================
// CLOCK INTERACTION
// ============================================

function initClock() {
  const svg = clock;
  const centerX = 200;
  const centerY = 200;
  const radius = 160;

  let isDragging = false;

  function getAngleFromMouse(e) {
    const rect = svg.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 400 / rect.height;

    const x = (e.clientX - rect.left) * scaleX - centerX;
    const y = (e.clientY - rect.top) * scaleY - centerY;

    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    return angle;
  }

  function updateClock(angle) {
    // Convert angle to hours (0-16 waking hours)
    const hours = Math.min(state.wakingHours, Math.max(0, (angle / (Math.PI * 2)) * state.wakingHours));
    state.hours = Math.round(hours * 2) / 2; // Round to 0.5

    // Update arc
    const endAngle = (state.hours / state.wakingHours) * Math.PI * 2;
    const arcPath = describeArc(centerX, centerY, radius, 0, endAngle);
    clockFill.setAttribute('d', arcPath);

    // Update handle position
    const handleAngle = endAngle - Math.PI / 2;
    const handleX = centerX + radius * Math.cos(handleAngle);
    const handleY = centerY + radius * Math.sin(handleAngle);
    clockHandle.setAttribute('cx', handleX);
    clockHandle.setAttribute('cy', handleY);

    // Update text (just the number)
    clockText.textContent = state.hours;

    // Update tick marks (highlight active ticks)
    updateTickMarks();

    // Update all dependent elements
    updateAllStats();
  }

  function onMouseDown(e) {
    isDragging = true;
    svg.style.cursor = 'grabbing';
    // Immediate update on click/down
    onMouseMove(e);
  }

  function onMouseMove(e) {
    // Should update if dragging
    if (!isDragging) return;

    // Prevent default to stop scrolling/selection while dragging
    e.preventDefault();

    // Support both mouse and touch
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const angle = getAngleFromMouse(clientX, clientY);
    updateClock(angle);
  }

  function getAngleFromMouse(clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = clientX - centerX;
    const y = clientY - centerY;

    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    return angle;
  }

  function onMouseUp() {
    isDragging = false;
    svg.style.cursor = 'grab';

    // Show scroll prompt after first interaction
    if (state.hours > 0) {
      scrollPrompt.style.opacity = '1';
    }
  }

  // Mouse events
  svg.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  // Touch events
  svg.addEventListener('touchstart', (e) => {
    isDragging = true;
    onMouseDown(e); // Trigger immediate update
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (isDragging) {
      e.preventDefault();
      onMouseMove(e);
    }
  }, { passive: false });

  document.addEventListener('touchend', onMouseUp);

  // Initialize with 0
  updateClock(0);
}

function describeArc(x, y, radius, startAngle, endAngle) {
  if (endAngle - startAngle >= Math.PI * 2) {
    endAngle = startAngle + Math.PI * 2 - 0.001;
  }

  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
  ].join(' ');
}

function polarToCartesian(centerX, centerY, radius, angle) {
  const adjustedAngle = angle - Math.PI / 2;
  return {
    x: centerX + radius * Math.cos(adjustedAngle),
    y: centerY + radius * Math.sin(adjustedAngle)
  };
}

function updateTickMarks() {
  const ticks = document.querySelectorAll('.tick-marks .tick');
  const activeTickCount = Math.floor(state.hours);

  ticks.forEach((tick, index) => {
    if (index < activeTickCount) {
      tick.classList.add('active');
    } else {
      tick.classList.remove('active');
    }
  });
}

// ============================================
// UPDATE STATS
// ============================================

function updateAllStats() {
  const hours = state.hours;

  // Daily
  document.getElementById('daily-hours').textContent = hours;

  // Weekly
  const weekly = hours * 7;
  document.getElementById('weekly-hours').textContent = weekly;

  // Monthly
  const monthly = Math.round(hours * 30);
  const monthlyDays = Math.round(monthly / 24 * 10) / 10;
  document.getElementById('monthly-hours').textContent = monthly;
  document.getElementById('monthly-days').textContent = monthlyDays;

  // Yearly
  const yearly = Math.round(hours * 365);
  const yearlyDays = Math.round(yearly / 24);
  const yearlyMonths = Math.round(yearlyDays / 30 * 10) / 10;
  document.getElementById('yearly-hours').textContent = yearly.toLocaleString();
  document.getElementById('yearly-days').textContent = yearlyDays;
  document.getElementById('yearly-months').textContent = yearlyMonths;

  // Year bar fill is animated via scroll, store target for animation
  const yearBarFill = document.getElementById('year-bar-fill');
  yearBarFill.dataset.targetWidth = (hours / state.wakingHours) * 100;

  // Update Opportunity Costs
  updateOpportunityCosts(hours);

  // Update mini clocks
  updateMiniClocks();

  // Update calendar
  updateCalendar();

  // Update silhouette if visible
  if (state.yearsLeft) {
    updateSilhouette();
  }
}

function updateOpportunityCosts(dailyHours) {
  const yearlyHours = dailyHours * 365;

  // 1 book ~ 10 hours (60,000 words at 250wpm = 4 hours, but let's be generous for study/dense books)
  // Actually Pudding style uses "average reader" stats. 
  // Let's say 7 hours per book.
  const books = Math.floor(yearlyHours / 7);

  // 1 language ~ 480 hours (FSI elementary proficiency)
  const languages = (yearlyHours / 480).toFixed(1);

  // Walk across country ~ 3 months @ 8 hours/day = ~700 hours?
  // PCT is 5 months. 
  // Let's say "Walk across France". ~1000km. 5km/hr = 200 hours.
  const countries = Math.floor(yearlyHours / 200);

  // Update with proper pluralization
  const booksEl = document.getElementById('alt-books');
  const langsEl = document.getElementById('alt-languages');
  const walkEl = document.getElementById('alt-walk');

  booksEl.innerHTML = `Read <span class="highlight">${books.toLocaleString()}</span> ${books === 1 ? 'book' : 'books'}`;
  langsEl.innerHTML = `Mastered <span class="highlight">${languages}</span> ${parseFloat(languages) === 1 ? 'language' : 'languages'}`;
  walkEl.innerHTML = `Walked across <span class="highlight">${countries}</span> ${countries === 1 ? 'country' : 'countries'}`;

  // Show container if hours > 0
  const container = document.getElementById('opportunity-cost');
  if (dailyHours > 0) {
    container.classList.add('visible');
  }
}

function updateMiniClocks() {
  // Mini clocks are now animated via scroll - this just ensures they have the target value stored
  const miniClocks = document.querySelectorAll('.mini-clock-fill');
  miniClocks.forEach(clock => {
    clock.dataset.targetAngle = (state.hours / state.wakingHours) * Math.PI * 2;
  });
}

// Helper to draw arc at a specific progress (0-1)
function drawMiniClockArc(element, progress) {
  const targetAngle = parseFloat(element.dataset.targetAngle) || 0;
  const currentAngle = targetAngle * progress;
  if (currentAngle > 0.01) {
    const arcPath = describeArc(50, 50, 40, 0, currentAngle);
    element.setAttribute('d', arcPath);
  } else {
    element.setAttribute('d', '');
  }
}

function generateCalendar() {
  const grid = document.getElementById('calendar-grid');
  for (let i = 0; i < 30; i++) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    grid.appendChild(day);
  }
}

function updateCalendar() {
  // Calendar fill is now animated via scroll - store target value
  const days = document.querySelectorAll('.calendar-day');
  const fillPercent = (state.hours / state.wakingHours) * 100;

  days.forEach(day => {
    day.classList.add('filled');
    day.dataset.targetFill = fillPercent;
  });
}

// Helper to set calendar fill at a specific progress (0-1)
function setCalendarFill(progress) {
  const days = document.querySelectorAll('.calendar-day');
  days.forEach(day => {
    const targetFill = parseFloat(day.dataset.targetFill) || 0;
    day.style.setProperty('--fill', `${targetFill * progress}%`);
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Daily section - fade in content
  gsap.from('#daily .content > *', {
    scrollTrigger: {
      trigger: '#daily',
      start: 'top 70%',
      end: 'top 30%',
      scrub: 1,
    },
    y: 50,
    opacity: 0,
    stagger: 0.2
  });

  // Daily mini-clock fill - TIME-BASED animation triggered on scroll enter
  const dailyClockFill = document.querySelector('#daily .mini-clock-fill');
  if (dailyClockFill) {
    ScrollTrigger.create({
      trigger: '#daily',
      start: 'top 60%',
      onEnter: () => animateMiniClockFill(dailyClockFill, 1.2),
      onLeaveBack: () => resetMiniClockFill(dailyClockFill)
    });
  }

  // Weekly section - fade in content
  gsap.from('#weekly .stat-text', {
    scrollTrigger: {
      trigger: '#weekly',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 1,
    },
    y: 50,
    opacity: 0
  });

  // Week clocks - stagger appearance + TIME-BASED fill animation
  const weekClocks = document.querySelectorAll('.week-clocks .mini-clock');
  weekClocks.forEach((clock, index) => {
    const fillPath = clock.querySelector('.mini-clock-fill');

    // Scale in animation
    gsap.from(clock, {
      scrollTrigger: {
        trigger: '#weekly',
        start: 'top 70%',
        end: 'top 30%',
        scrub: 1
      },
      scale: 0,
      opacity: 0,
      delay: index * 0.1
    });

    // Fill animation - triggered when section enters view
    if (fillPath) {
      ScrollTrigger.create({
        trigger: '#weekly',
        start: 'top 50%',
        onEnter: () => animateMiniClockFill(fillPath, 0.8, index * 0.15),
        onLeaveBack: () => resetMiniClockFill(fillPath)
      });
    }
  });

  // Monthly section - fade in content
  gsap.from('#monthly .stat-text, #monthly .stat-subtext', {
    scrollTrigger: {
      trigger: '#monthly',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 1,
    },
    y: 50,
    opacity: 0,
    stagger: 0.1
  });

  // Calendar - scale in
  gsap.from('.calendar-day', {
    scrollTrigger: {
      trigger: '#monthly',
      start: 'top 70%',
      end: 'top 30%',
      scrub: 1
    },
    scale: 0,
    opacity: 0,
    stagger: {
      grid: [5, 7],
      from: 'start',
      amount: 0.5
    }
  });

  // Calendar fill - TIME-BASED animation triggered on scroll
  ScrollTrigger.create({
    trigger: '#monthly',
    start: 'top 40%',
    onEnter: () => animateCalendarFill(1.5),
    onLeaveBack: () => setCalendarFill(0)
  });

  // Yearly section - fade in content
  gsap.from('#yearly .stat-text, #yearly .stat-subtext', {
    scrollTrigger: {
      trigger: '#yearly',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 1,
    },
    y: 50,
    opacity: 0,
    stagger: 0.1
  });

  // Year bar - scale in
  gsap.from('.year-bar', {
    scrollTrigger: {
      trigger: '#yearly',
      start: 'top 70%',
      end: 'top 40%',
      scrub: 1
    },
    scaleX: 0,
    transformOrigin: 'left center'
  });

  // Year bar fill - TIME-BASED animation
  ScrollTrigger.create({
    trigger: '#yearly',
    start: 'top 40%',
    onEnter: () => {
      gsap.fromTo('#year-bar-fill',
        { width: '0%' },
        {
          width: `${(state.hours / state.wakingHours) * 100}%`,
          duration: 1.5,
          ease: 'power2.out'
        }
      );
    },
    onLeaveBack: () => {
      gsap.set('#year-bar-fill', { width: '0%' });
    }
  });

  // Highlight alternatives one by one
  gsap.utils.toArray('.alternative-item').forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 70%',
      end: 'top 40%',
      onEnter: () => item.classList.add('active'),
      onLeaveBack: () => item.classList.remove('active')
    });
  });
}

// Animate mini-clock fill over time (not scroll-scrubbed)
function animateMiniClockFill(element, duration = 1, delay = 0) {
  const proxy = { progress: 0 };
  gsap.to(proxy, {
    progress: 1,
    duration: duration,
    delay: delay,
    ease: 'power2.out',
    onUpdate: () => drawMiniClockArc(element, proxy.progress)
  });
}

// Reset mini-clock fill
function resetMiniClockFill(element) {
  element.setAttribute('d', '');
}

// Animate calendar fill over time
function animateCalendarFill(duration = 1) {
  const proxy = { progress: 0 };
  gsap.to(proxy, {
    progress: 1,
    duration: duration,
    ease: 'power2.out',
    onUpdate: () => setCalendarFill(proxy.progress)
  });
}

// ============================================
// AGE INPUT & LIFE GRID
// ============================================

function initAgeInput() {
  const ageInput = document.getElementById('age-input');
  const ageSubmit = document.getElementById('age-submit');

  function submitAge() {
    const age = parseInt(ageInput.value);
    if (age && age > 0 && age < state.lifeExpectancy) {
      state.age = age;
      state.yearsLeft = state.lifeExpectancy - age;

      // Update years left display
      document.getElementById('years-left').textContent = state.yearsLeft;

      // Generate Life Grid
      generateLifeGrid(age);

      // Show remaining sections
      showRemainingSection();
    }
  }

  ageSubmit.addEventListener('click', submitAge);
  ageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAge();
  });
}

function generateLifeGrid(currentAge) {
  const grid = document.getElementById('life-grid');
  grid.innerHTML = '';

  // Total weeks in 80 years (approx)
  const totalWeeks = 80 * 52;
  const ageInWeeks = currentAge * 52;
  const remainingWeeks = totalWeeks - ageInWeeks;

  // Calculate scroll weeks based on percentage of WAKING hours
  const percentScroll = state.hours / state.wakingHours;
  const totalScrollWeeks = Math.round(remainingWeeks * percentScroll);

  // Update stats
  document.getElementById('grid-scroll-weeks').textContent = totalScrollWeeks.toLocaleString();

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < totalWeeks; i++) {
    const dot = document.createElement('div');
    dot.className = 'life-week';

    // Logic for Wrap-Reverse (Bottom to Top)
    // 0 is Bottom-Left.
    // We want Lived at Bottom. Scroll at Top. Free in Middle.

    if (i < ageInWeeks) {
      dot.classList.add('lived'); // 0..Age (Bottom)
    } else {
      const weeksUntilDeath = totalWeeks - 1 - i;
      // If we are in the last X weeks of the grid (Top), that's scroll time.
      if (weeksUntilDeath < totalScrollWeeks) {
        dot.classList.add('scroll');
      } else {
        dot.classList.add('free');
      }
    }
    fragment.appendChild(dot);
  }
  grid.appendChild(fragment);

  // Animate grid entry
  gsap.from('.life-week', {
    scrollTrigger: {
      trigger: '#life-grid',
      start: 'top 60%',
      end: 'bottom 80%',
      scrub: 1
    },
    scale: 0,
    opacity: 0,
    stagger: {
      amount: 1,
      from: "end" // Animate from top (end) to bottom? Or random.
    }
  });

}

function showRemainingSection() {
  const remainingSection = document.getElementById('remaining');
  const lifeGridSection = document.getElementById('life-grid-section');
  const silhouetteSection = document.getElementById('silhouette');
  const reclaimSection = document.getElementById('reclaim');
  const finalSection = document.getElementById('final');

  // Show sections
  remainingSection.classList.add('active');
  lifeGridSection.classList.add('active');
  silhouetteSection.classList.add('active');
  reclaimSection.classList.add('active');
  finalSection.classList.add('active');

  // Refresh ScrollTrigger
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);

  // Scroll to remaining section
  setTimeout(() => {
    remainingSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);

  // Initialize silhouette animation after a delay
  setTimeout(() => {
    initSilhouetteAnimation();
  }, 800);
}

// ============================================
// SILHOUETTE ANIMATION
// ============================================

function initSilhouetteAnimation() {
  ScrollTrigger.refresh();
  updateSilhouette();

  // Animate silhouette fill on scroll
  gsap.to('#silhouette-fill-rect', {
    scrollTrigger: {
      trigger: '#silhouette',
      start: 'top 50%',
      end: 'center center',
      scrub: 1,
    },
    attr: {
      y: function () {
        const fillPercent = (state.hours / state.wakingHours);
        const fillHeight = 500 * fillPercent;
        return 500 - fillHeight;
      }
    },
    ease: 'none'
  });
}

function updateSilhouette() {
  if (!state.yearsLeft) return;

  const fillPercent = state.hours / state.wakingHours;
  const yearsOnSocialMedia = (state.yearsLeft * fillPercent).toFixed(1);

  document.getElementById('silhouette-years').textContent = `${yearsOnSocialMedia} years`;

  // Update reclaim section initial state
  document.getElementById('reclaim-slider').value = state.hours;
  updateReclaimDisplay();
}

// ============================================
// RECLAIM SLIDER
// ============================================

function initReclaimSlider() {
  const slider = document.getElementById('reclaim-slider');

  slider.addEventListener('input', updateReclaimDisplay);
}

function updateReclaimDisplay() {
  if (!state.yearsLeft) return;

  const slider = document.getElementById('reclaim-slider');
  const newHours = parseFloat(slider.value);
  const originalHours = state.hours;

  // Calculate years
  const originalPercent = originalHours / state.wakingHours;
  const newPercent = newHours / state.wakingHours;

  const originalYears = state.yearsLeft * originalPercent;
  const newYears = state.yearsLeft * newPercent;
  const reclaimedYears = originalYears - newYears;

  // Update display
  document.getElementById('reclaim-hours').textContent = newHours;
  document.getElementById('reclaim-years').textContent = reclaimedYears.toFixed(1);

  // Update silhouettes
  const originalFillHeight = 500 * originalPercent;
  const newFillHeight = 500 * newPercent;
  const reclaimedFillHeight = 500 * (reclaimedYears / state.yearsLeft);

  // Current silhouette (stays at original)
  document.getElementById('reclaim-fill-rect').setAttribute('y', 500 - originalFillHeight);

  // Reclaimed silhouette (shows the reclaimed portion in green)
  document.getElementById('reclaimed-fill-rect').setAttribute('y', 500 - reclaimedFillHeight);

  // Show/hide reclaimed silhouette
  const reclaimedWrapper = document.querySelector('.silhouette-wrapper.reclaimed');
  if (reclaimedYears > 0) {
    reclaimedWrapper.classList.add('visible');
  } else {
    reclaimedWrapper.classList.remove('visible');
  }
}
