import { LitElement } from 'lit';
import { TreeNode } from '@openenergytools/tree-grid';
import { MdSelectOption } from '@scopedelement/material-web/select/MdSelectOption.js';
import { MdFilledSelect } from '@scopedelement/material-web/select/MdOutlineSelect.js';
import { MdOutlinedTextField } from '@scopedelement/material-web/textfield/MdOutlinedTextField.js';
import { MdDialog } from '@scopedelement/material-web/dialog/dialog.js';
import { MdTextButton } from '@scopedelement/material-web/button/text-button.js';
import { cdClasses } from '../constants.js';
type NodeData = TreeNode & {
    presCond?: string;
    type?: (typeof cdClasses)[number];
};
declare const CreateDataObjectDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class CreateDataObjectDialog extends CreateDataObjectDialog_base {
    static scopedElements: {
        'md-dialog': typeof MdDialog;
        'md-text-button': typeof MdTextButton;
        'md-outlined-select': typeof MdFilledSelect;
        'md-select-option': typeof MdSelectOption;
        'md-outlined-text-field': typeof MdOutlinedTextField;
    };
    cdClasses: string[];
    tree: Partial<Record<string, NodeData>>;
    onConfirm?: (cdcType: string, doName: string, namespace: string | null) => void;
    dialog: MdDialog;
    cdcType: MdFilledSelect;
    doName: MdOutlinedTextField;
    namespace: MdOutlinedTextField;
    private namespaceDefaultValue;
    private isCustomNamespaceDisabled;
    get open(): boolean;
    show(): void;
    close(): void;
    private getDONameStatus;
    private onValueChange;
    private setDONameStatusError;
    private validate;
    private resetErrorText;
    private handleConfirm;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
