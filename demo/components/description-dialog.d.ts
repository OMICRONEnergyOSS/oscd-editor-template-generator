import { LitElement } from 'lit';
import { MdOutlinedTextField } from '@scopedelement/material-web/textfield/MdOutlinedTextField.js';
import { MdDialog } from '@scopedelement/material-web/dialog/dialog.js';
import { MdTextButton } from '@scopedelement/material-web/button/text-button.js';
declare const DescriptionDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class DescriptionDialog extends DescriptionDialog_base {
    static scopedElements: {
        'md-dialog': typeof MdDialog;
        'md-text-button': typeof MdTextButton;
        'md-outlined-text-field': typeof MdOutlinedTextField;
    };
    cdClasses: string[];
    onConfirm: (description: string) => void;
    onCancel: () => void;
    dialog: MdDialog;
    description: MdOutlinedTextField;
    get open(): boolean;
    show(): void;
    close(): void;
    private validate;
    private resetErrorText;
    private handleConfirm;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
