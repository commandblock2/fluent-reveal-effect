import { IResource, IEffectOptions, ClickedElement } from '../types';
export declare function drawClickEffect(element: HTMLElement, lightColor: string, gradientSize: number, e: MouseEvent): void;
export declare function enableBorderEffects(resource: IResource, childrenBorders: IResource[], options: IEffectOptions): void;
export declare function enableChildrenBackgroundEffetcs(resource: IResource, options: IEffectOptions, pressed: ClickedElement): void;
export declare function preProcessElement(element: HTMLElement): IResource;
export declare function preProcessElements(elements: NodeListOf<HTMLElement>): IResource[];
export declare function preProcessSelector(selector: string): IResource[];
