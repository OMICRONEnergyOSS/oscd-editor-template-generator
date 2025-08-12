import { LitElement, PropertyValues } from 'lit';
export declare class Snackbar extends LitElement {
    message: string;
    type: 'success' | 'error';
    private visible;
    static styles: import("lit").CSSResult;
    updated(changed: PropertyValues): void;
    render(): import("lit-html").TemplateResult<1>;
}
