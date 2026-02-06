export interface IResource {
    oriBg: string;
    el: HTMLElement;
}
export interface ClickedElement {
    element: HTMLElement | null;
    progress: number;
}
export interface IArea {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
export interface IEffectOptions {
    lightColor: string | 'rgba(255,255,255,0.1)';
    gradientSize: number | 200;
    clickEffect: boolean | false;
    children: {
        borderSelector: string | '.eff-reveal-border';
        elementSelector: string | '.eff-reveal';
        lightColor: string | 'rgba(255,255,255,0.1)';
        gradientSize: number | 200;
    };
}
export type IUserEffectOptions = Partial<IEffectOptions>;
export interface IEnableEffectFunc {
    (element: IResource, options: IEffectOptions, wrapper: ClickedElement): void;
}
