# AGENTS — Performance & Improvement Notes

This document captures maintainers’ notes for improving performance and implementation quality of the reveal effect.

## Performance considerations

- **Per-mousemove cost (container mode)**  
  The container `mousemove` handler iterates all border elements and does:
  - layout read (`getBoundingClientRect`)
  - intersection test
  - optional style write (`background-image`)
  This is `O(n)` per mousemove and can be costly with many elements.

- **Layout reads vs. writes**  
  Interleaving `getBoundingClientRect()` (read) and `style` updates (write) can cause layout thrash. Consider batching reads before writes.

- **Avoid repeated DOM queries**  
  Border/child selection is already done once at setup. Keep it that way; avoid re-querying on mousemove.

## Suggested improvements (low risk)

1. **Throttle via `requestAnimationFrame`**
   - Store the last mouse event.
   - Only render once per frame.
   - This caps updates at ~60fps and avoids “overdraw” during fast mouse movement.

2. **Cache bounding boxes**
   - Cache border element rects once.
   - Recompute on `resize`, `scroll`, or content/layout changes.
   - Use cached rects during mousemove for intersection tests.

3. **Early exit**
   - If the cursor is outside the container bounds, bail before iterating children.

4. **Minimal DOM writes**
   - Only update `background-image` if the computed gradient changed since last frame.
   - This reduces style recalculation and paint.

## Suggested improvements (medium/advanced)

1. **CSS variable + single event source**
   - Set CSS variables on the container (`--fx-x`, `--fx-y`).
   - Use those variables in child gradients via `background-position` or `mask`.
   - Reduces per-element JS updates and offloads work to the compositor.

2. **Spatial partitioning**
   - Bucket child elements by grid or row/column.
   - On mousemove, evaluate only nearby candidates.

3. **Pointer events + passive listeners**
   - Use `pointermove` and `pointerdown` where appropriate.
   - Mark listeners passive when possible to avoid main-thread blocking.

## Rendering notes

- The “border” is not the CSS `border` property. It’s a wrapper element whose background receives a radial gradient.
- Semi-transparency should be done via `background-color: rgba(...)` instead of `opacity`, to avoid fading text/icons and the reveal effect.

## Future enhancements

- Provide a built-in **container preset** that wires wrapper/child structure automatically.
- Offer a **performance mode** (e.g., `throttle: true`, `useRaf: true`, `cacheRects: true`).
- Add optional **debug overlays** to visualize intersection and gradient radius.