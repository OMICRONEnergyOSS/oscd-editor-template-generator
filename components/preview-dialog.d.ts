import { LitElement } from 'lit';
import { MdDialog } from '@scopedelement/material-web/dialog/dialog.js';
import { MdTextButton } from '@scopedelement/material-web/button/text-button.js';
import AceEditor from 'ace-custom-element';
import { LNodeDescription } from '@openenergytools/scl-lib';
import { TreeSelection } from '@openenergytools/tree-grid';
declare const PreviewDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class PreviewDialog extends PreviewDialog_base {
    static scopedElements: {
        'md-dialog': typeof MdDialog;
        'md-text-button': typeof MdTextButton;
        'ace-editor': typeof AceEditor;
    };
    dialog: MdDialog;
    aceEditor: typeof AceEditor;
    selection: TreeSelection;
    tree: LNodeDescription | undefined;
    lNodeType: string;
    get xmlContent(): string;
    show(): void;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
