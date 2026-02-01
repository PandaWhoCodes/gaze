# Gaze: Social Media Time Visualizer

A scroll-driven, interactive experience that helps users confront how much of their life they spend on social media.

## Inspiration

- [The Pudding: Laughing Online](https://pudding.cool/2019/10/laugh/) - User input drives data comparison
- [The Pudding: Emotion Wheel](https://pudding.cool/2022/12/emotion-wheel/) - Guided self-reflection
- [The Pudding: Birthday Paradox](https://pudding.cool/2018/04/birthday-paradox/) - Personal input creates personalized narrative

## Core Concept

The user inputs their daily social media hours via an interactive clock. As they scroll, they watch that number compound: daily → weekly → monthly → yearly → lifetime. The climax: a human silhouette fills up, showing how much of *them* belongs to the feed.

The twist: they can drag the fill back down and watch a second "reclaimed" silhouette appear beside them—the version of themselves that could exist.

## Visual Style

- **Bold/editorial** - High contrast, strong typography, punchy and direct
- **Limited palette** - 2-3 colors max, one bold accent for "claimed" time
- **Pudding-level polish** - 60fps animations, smooth easing, scroll-scrubbed transitions

## The Experience Flow

### Section 1: The Hook

Full screen. Dark background. Bold typography:

> "How many hours a day do you spend on social media?"

Below: an interactive **24-hour clock face** (showing ~16 waking hours). User drags an arc to set hours. The filled portion grows immediately—visceral feedback.

Live counter below:
> "4 hours"

Prompt to scroll.

### Section 2: The Scroll Journey

Scroll-driven progression through full-viewport sections:

**A. Daily**
Clock stays pinned. Text fades in:
> "That's 4 hours today."

**B. Weekly**
Clock multiplies into 7 small clocks. Counter animates:
> "28 hours this week."

**C. Monthly**
Clocks dissolve into calendar grid. 30 days filled.
> "120 hours this month. That's 5 full days."

**D. Yearly**
Calendar compresses to year bar. Typography gets bolder:
> "1,460 hours this year. 60 days. Two entire months."

Each transition is scroll-locked. User controls pace but can't skip.

### Section 3: The Age Question

Scroll pauses. Screen dims. Simple input:

> "How old are you?"

After input (e.g., 27):
> "You have about 50 years left."

(Based on 77-year average life expectancy)

### Section 4: The Silhouette

A **human silhouette** fades in. Minimal, outline style.

As user scrolls, color fills from feet up. The fill level = percentage of remaining waking life spent on social media.

At 4 hours/day (25% of waking hours), color rises to just above the knees.

Text updates as fill rises:
> "This much of you belongs to the scroll."

Final state:
> "6.8 years. Standing in the feed."

### Section 5: The Reclaim

After the silhouette fills, a pause. Prompt:

> "Drag down to reclaim your time."

User drags the fill level down. As they drag:

- Color drains from top of fill downward
- Counter updates: "2 hours/day → You'd reclaim 3.4 years"
- A **second silhouette** appears beside the first—a ghost version, glowing subtly

The second silhouette represents the reclaimed self. The you that could exist.

## Technical Approach

### Stack
- **HTML/CSS/JS** - Single page, no framework
- **GSAP + ScrollTrigger** - Scroll-driven animations (Pudding's choice)
- **SVG** - Silhouette and clock, scalable and animatable

### File Structure
```
index.html
styles.css
app.js
assets/
  silhouette.svg
  clock.svg (optional, may generate with JS)
```

### Key Interactions

1. **Clock drag** - Custom SVG arc manipulation, updates on drag
2. **Scroll sections** - GSAP ScrollTrigger with pinning and scrubbing
3. **Silhouette fill** - SVG clipPath or mask, animated by scroll position
4. **Reclaim drag** - Reversible interaction, updates both silhouettes

### Animation Principles

- Smooth easing (power2.out or custom bezier)
- Scroll-scrubbed, not scroll-triggered (tied to scroll position)
- Typography fades/slides in with purpose
- 60fps, no jank
- Mobile responsive

## Success Criteria

- [ ] First interaction (clock) feels immediately tactile
- [ ] Scroll progression builds emotional weight
- [ ] Silhouette fill is the gut-punch moment
- [ ] Reclaim interaction provides agency, not guilt
- [ ] Animations feel Pudding-smooth throughout
- [ ] Works beautifully on mobile
