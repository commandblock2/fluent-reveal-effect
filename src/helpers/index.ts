import {
  type IResource,
  type IArea,
  type IEffectOptions,
  type ClickedElement,
} from "../types";

let _borderFxCssInjected = false;

function ensureBorderFxCss() {
  if (_borderFxCssInjected) return;
  _borderFxCssInjected = true;

  const style = document.createElement("style");
  style.setAttribute("data-fluent-reveal-effect", "border-fx");
  style.textContent = `
:root {
  --fx-x: 0px;
  --fx-y: 0px;
}

.eff-reveal-border-fx {
  position: relative;
  isolation: isolate;
}

.eff-reveal-border-fx > * {
  position: relative;
  z-index: 1;
}

.eff-reveal-border-fx::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 120ms ease;

  background-image: radial-gradient(
    circle var(--fx-size) at calc(var(--fx-x) - var(--fx-left)) calc(var(--fx-y) - var(--fx-top)),
    var(--fx-color),
    rgba(255,255,255,0)
  );
  will-change: opacity, background-image;
}

.eff-reveal-border-fx.eff-reveal-visible::before {
  opacity: 1;
}
`;
  document.head.appendChild(style);
}

// ** Postion ******************************************************************
function getOffset(element: HTMLElement) {
  const bounding = element.getBoundingClientRect();

  return {
    top: bounding.top,
    left: bounding.left,
  };
}

// with Mouse
function getXY(element: HTMLElement, e: MouseEvent) {
  const offset = getOffset(element);
  const x = e.pageX - offset.left - window.scrollX;
  const y = e.pageY - offset.top - window.scrollY;

  return [x, y];
}

// for Container
function intersectRect(r1: IArea, r2: IArea) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}
function isIntersected(
  rect: DOMRect,
  cursorX: number,
  cursorY: number,
  gradientSize: number,
) {
  const cursorArea: IArea = {
    left: cursorX - gradientSize,
    right: cursorX + gradientSize,
    top: cursorY - gradientSize,
    bottom: cursorY + gradientSize,
  };

  const elArea: IArea = {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom,
  };

  const result = intersectRect(cursorArea, elArea);
  return result;
}

// ** CSS Effect ***************************************************************
function lightHoverEffect(
  gradientSize: number,
  x: number,
  y: number,
  lightColor: string,
) {
  return `radial-gradient(circle ${gradientSize}px at ${x}px ${y}px, ${lightColor}, rgba(255,255,255,0))`;
}

function lightClickEffect(
  gradientSize: number,
  x: number,
  y: number,
  lightColor: string,
) {
  return `${lightHoverEffect(gradientSize, x, y, lightColor)}, radial-gradient(circle ${70}px at ${x}px ${y}px, rgba(255,255,255,0), ${lightColor}, rgba(255,255,255,0), rgba(255,255,255,0))`;
}

// ** Basic Draw Effect ********************************************************
function drawEffect(
  element: HTMLElement,
  x: number,
  y: number,
  lightColor: string,
  gradientSize: number,
  cssLightEffect: string | null = null,
) {
  const lightBg =
    cssLightEffect === null
      ? lightHoverEffect(gradientSize, x, y, lightColor)
      : cssLightEffect;

  element.style.backgroundImage = lightBg;
}

// with Mouse
function drawHoverEffect(
  element: HTMLElement,
  lightColor: string,
  gradientSize: number,
  e: MouseEvent,
) {
  const [x, y] = getXY(element, e);
  drawEffect(element, x, y, lightColor, gradientSize);
}

export function drawClickEffect(
  element: HTMLElement,
  lightColor: string,
  gradientSize: number,
  e: MouseEvent,
) {
  const [x, y] = getXY(element, e);

  const cssLightEffect = lightClickEffect(gradientSize, x, y, lightColor);
  drawEffect(element, x, y, lightColor, gradientSize, cssLightEffect);
}

// ** SideEffect Draw Effect ***************************************************
function clearEffect(resource: IResource) {
  resource.el.style.backgroundImage = resource.oriBg;
}

// Wrapper
function enableBackgroundEffects(
  resource: IResource,
  lightColor: string,
  gradientSize: number,
  clickEffect: boolean,
  pressed: ClickedElement,
) {
  const element = resource.el;
  const moveEvent = "onpointermove" in window ? "pointermove" : "mousemove";
  const leaveEvent = "onpointerleave" in window ? "pointerleave" : "mouseleave";

  if (clickEffect) {
    const downEvent = "onpointerdown" in window ? "pointerdown" : "mousedown";
    const upEvent = "onpointerup" in window ? "pointerup" : "mouseup";
    element.addEventListener(downEvent, (event) => {
      drawClickEffect(element, lightColor, gradientSize, event);
    });

    element.addEventListener(upEvent, (event) => {
      clearEffect(resource);
      drawHoverEffect(element, lightColor, gradientSize, event);
    });
  }

  element.addEventListener(
    moveEvent,
    (e) => {
      if (clickEffect && pressed.element == element) {
        drawClickEffect(element, lightColor, gradientSize, e);
      } else {
        drawHoverEffect(element, lightColor, gradientSize, e);
      }
    },
    { passive: true },
  );

  element.addEventListener(leaveEvent, () => {
    clearEffect(resource);
  });
}

export function enableBorderEffects(
  resource: IResource,
  childrenBorders: IResource[],
  options: IEffectOptions,
) {
  ensureBorderFxCss();

  const element = resource.el;
  const root = document.documentElement;

  const childrenBorderL = childrenBorders.length;
  let containerRect = element.getBoundingClientRect();
  const childrenRects = childrenBorders.map((child) =>
    child.el.getBoundingClientRect(),
  );

  // Toggle visibility class only when intersection state changes
  const lastVisible: boolean[] = childrenBorders.map(() => false);

  const updateRects = () => {
    containerRect = element.getBoundingClientRect();

    for (let i = 0; i < childrenBorderL; i++) {
      const child = childrenBorders[i].el;
      const r = child.getBoundingClientRect();
      childrenRects[i] = r;

      child.classList.add("eff-reveal-border-fx");
      child.style.setProperty("--fx-left", `${r.left}px`);
      child.style.setProperty("--fx-top", `${r.top}px`);
      child.style.setProperty("--fx-size", `${options.gradientSize}px`);
      child.style.setProperty("--fx-color", `${options.lightColor}`);
    }
  };

  const clearAll = () => {
    for (let i = 0; i < childrenBorderL; i++) {
      const child = childrenBorders[i];

      if (lastVisible[i]) {
        child.el.classList.remove("eff-reveal-visible");
        lastVisible[i] = false;
      }
    }
  };

  let rafId: number | null = null;
  let lastCursor: { x: number; y: number } | null = null;

  const render = () => {
    if (!lastCursor) {
      rafId = null;
      return;
    }

    const cursorX = lastCursor.x;
    const cursorY = lastCursor.y;

    if (
      cursorX < containerRect.left ||
      cursorX > containerRect.right ||
      cursorY < containerRect.top ||
      cursorY > containerRect.bottom
    ) {
      clearAll();
      rafId = null;
      return;
    }

    // One write per frame: global pointer coords in client space
    root.style.setProperty("--fx-x", `${cursorX}px`);
    root.style.setProperty("--fx-y", `${cursorY}px`);

    for (let i = 0; i < childrenBorderL; i++) {
      const intersect = isIntersected(
        childrenRects[i],
        cursorX,
        cursorY,
        options.gradientSize,
      );

      if (intersect && !lastVisible[i]) {
        childrenBorders[i].el.classList.add("eff-reveal-visible");
        lastVisible[i] = true;
      } else if (!intersect && lastVisible[i]) {
        childrenBorders[i].el.classList.remove("eff-reveal-visible");
        lastVisible[i] = false;
      }
    }

    rafId = null;
  };

  const scheduleRender = () => {
    if (rafId !== null) {
      return;
    }
    rafId = requestAnimationFrame(render);
  };

  updateRects();

  const enterEvent = "onpointerenter" in window ? "pointerenter" : "mouseenter";
  const moveEvent = "onpointermove" in window ? "pointermove" : "mousemove";
  const leaveEvent = "onpointerleave" in window ? "pointerleave" : "mouseleave";

  element.addEventListener(
    enterEvent,
    () => {
      updateRects();
    },
    { passive: true },
  );

  element.addEventListener(
    moveEvent,
    (e) => {
      lastCursor = { x: e.clientX, y: e.clientY };
      scheduleRender();
    },
    { passive: true },
  );

  element.addEventListener(leaveEvent, () => {
    clearAll();
    lastCursor = null;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  window.addEventListener("resize", updateRects, { passive: true });
  window.addEventListener("scroll", updateRects, { passive: true });
}

export function enableChildrenBackgroundEffetcs(
  resource: IResource,
  options: IEffectOptions,
  pressed: ClickedElement,
) {
  enableBackgroundEffects(
    resource,
    options.children?.lightColor || "",
    options.children?.gradientSize || 100,
    options.clickEffect,
    pressed,
  );
}

// ** Element Processing *******************************************************
export function preProcessElement(element: HTMLElement): IResource {
  return {
    oriBg: getComputedStyle(element).backgroundImage,
    el: element,
  };
}

export function preProcessElements(elements: NodeListOf<HTMLElement>) {
  const ressources: IResource[] = [];
  const elementsL = elements.length;
  for (let i = 0; i < elementsL; i++) {
    const element = elements[i];
    ressources.push(preProcessElement(element));
  }

  return ressources;
}

export function preProcessSelector(selector: string) {
  return preProcessElements(document.querySelectorAll(selector));
}
