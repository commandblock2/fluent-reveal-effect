# AGENTS — Performance & Improvement Notes

This document captures maintainers’ notes for improving performance and implementation quality of the reveal effect.

## Performance considerations

- **Per-mousemove cost (container mode)**  
  The container `mousemove`/`pointermove` handler iterates all border elements and does:
  - (cached) intersection test
  - optional class toggle (`eff-reveal-visible`) for visibility
  - a single CSS variable write for pointer position (`--fx-x`, `--fx-y`)
  This is still `O(n)` per frame, but avoids per-element `background-image` string writes during movement.

- **Layout reads vs. writes**  
  Interleaving `getBoundingClientRect()` (read) and `style` updates (write) can cause layout thrash. Consider batching reads before writes.

- **Avoid repeated DOM queries**  
  Border/child selection is already done once at setup. Keep it that way; avoid re-querying on mousemove.

## Implemented optimizations (container mode)

1. **Throttle via `requestAnimationFrame`**
   - Store the last pointer position.
   - Only render once per frame.
   - This caps updates at ~60fps and avoids “overdraw” during fast movement.

2. **Cache bounding boxes**
   - Cache border element rects once.
   - Recompute on `resize`, `scroll`, and `pointerenter`.
   - Use cached rects during pointer move for intersection tests.

3. **Early exit**
   - If the cursor is outside the container bounds, bail before iterating children.

4. **Minimal DOM writes**
   - Border/container hover no longer writes `background-image` per element per frame.
   - Instead, it updates global CSS variables for pointer position once per frame and toggles a lightweight visibility class on affected borders.
   - This reduces style recalculation and avoids repeated gradient string construction in JS.

## Suggested improvements (medium/advanced)

1. **CSS variable + single event source**
   - Implemented for border/container hover: pointer position is written once per frame (`--fx-x`, `--fx-y`), and borders render the glow in CSS (pseudo-element) gated by a visibility class (`eff-reveal-visible`).
   - Remaining opportunity: extend the same pattern to per-child hover/click so inner elements also avoid per-move `background-image` writes.

2. **Spatial partitioning**
   - Bucket child elements by grid or row/column.
   - On mousemove, evaluate only nearby candidates.

3. **Pointer events + passive listeners**
   - Implemented `pointermove`/`pointerdown` with mouse fallbacks where needed.
   - Marked move listeners passive to avoid main-thread blocking.

## Rendering notes

- The “border” is not the CSS `border` property. It’s a wrapper element that renders the glow via a CSS pseudo-element (so the original `background-image` can remain untouched).
- Semi-transparency should be done via `background-color: rgba(...)` instead of `opacity`, to avoid fading text/icons and the reveal effect.

## Future enhancements

- Provide a built-in **container preset** that wires wrapper/child structure automatically.
- Offer a **performance mode** (e.g., `throttle: true`, `useRaf: true`, `cacheRects: true`).
- Add optional **debug overlays** to visualize intersection and gradient radius.