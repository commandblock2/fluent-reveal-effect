import {
  type IResource,
  type IEffectOptions,
  type IUserEffectOptions,
  type IEnableEffectFunc,
  type ClickedElement,
} from './types';
import {
  preProcessElement,
  preProcessSelector,
  enableChildrenBackgroundEffetcs,
  enableBorderEffects,
} from './helpers';

// ** Option *******************************************************************
function applyEffectOption(userOptions: IUserEffectOptions): IEffectOptions {
  const defaultOptions: IEffectOptions = {
    lightColor: 'rgba(255,255,255,0.25)',
    gradientSize: 150,
    clickEffect: true,
    children: {
      borderSelector: '.eff-reveal-border',
      elementSelector: '.eff-reveal',
      lightColor: 'rgba(255,255,255,0.25)',
      gradientSize: 150,
    },
  };

  return Object.assign(defaultOptions, userOptions);
}

// ** Children Effect **********************************************************
function applyChildrenElementEffect(
  resource: IResource,
  options: IEffectOptions,
  pressed: ClickedElement,
  enableBackgroundEffectsFunc: IEnableEffectFunc,
) {
  enableBackgroundEffectsFunc(resource, options, pressed);
}

function applyChildrenEffect(
  resources: IResource[],
  options: IEffectOptions,
  pressed: ClickedElement,
  enableBackgroundEffectsFunc: IEnableEffectFunc
) {
  const resourceL = resources.length;

  for (let i = 0; i < resourceL; i++) {
    const resource = resources[i];
    applyChildrenElementEffect(resource, options, pressed, enableBackgroundEffectsFunc);
  }
}

// ** Container Effect *********************************************************
function applyContainerElementEffect(
  resource: IResource,
  options: IEffectOptions,
  pressed: ClickedElement,
  enableBackgroundEffectsFunc: IEnableEffectFunc,
) {
  // Container
  const childrenBorders = preProcessSelector(options.children?.borderSelector || '');
  enableBorderEffects(resource, childrenBorders, options);

  // Children
  const childrens = preProcessSelector(options.children?.elementSelector || '');
  applyChildrenEffect(childrens, options, pressed, enableBackgroundEffectsFunc);
}

// ** Apply Effect *************************************************************
export const applyElementEffect = (element: HTMLElement, userOptions: IUserEffectOptions = {}) => {
  const options = applyEffectOption(userOptions);
  const resource = preProcessElement(element);
  const pressed: ClickedElement = {
    element: null,
    progress: 0
  };

  if (userOptions.clickEffect) {
    const downEvent = "onpointerdown" in window ? "pointerdown" : "mousedown";
    const upEvent = "onpointerup" in window ? "pointerup" : "mouseup";
    element.addEventListener(downEvent, event => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        pressed.element = target;
        pressed.progress = 1;
      }
    }
    )

    element.addEventListener(upEvent, _ => {
      pressed.element = null;
    }
    )
  }

  const enableBackgroundEffectsFunc = enableChildrenBackgroundEffetcs;
  applyContainerElementEffect(resource, options, pressed, enableBackgroundEffectsFunc);
};

