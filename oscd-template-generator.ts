/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { css, html, LitElement } from 'lit';
import { property, state, query } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { newEditEvent } from '@openenergytools/open-scd-core';

import {
  insertSelectedLNodeType,
  nsdToJson,
  LNodeDescription,
} from '@openenergytools/scl-lib';

import { TreeGrid, TreeSelection } from '@openenergytools/tree-grid';

import { MdFab } from '@scopedelement/material-web/fab/MdFab.js';
import { MdIcon } from '@scopedelement/material-web/icon/MdIcon.js';
import { MdFilledSelect } from '@scopedelement/material-web/select/MdFilledSelect.js';
import { MdSelectOption } from '@scopedelement/material-web/select/MdSelectOption.js';
import { MdFilledSelect as MdOutlinedSelect } from '@scopedelement/material-web/select/MdOutlineSelect.js';
import { MdOutlinedTextField } from '@scopedelement/material-web/textfield/MdOutlinedTextField.js';
import { MdOutlinedButton } from '@scopedelement/material-web/button/outlined-button.js';
import { MdDialog } from '@scopedelement/material-web/dialog/dialog.js';
import { CdcChildren } from '@openenergytools/scl-lib/dist/tDataTypeTemplates/nsdToJson.js';
import { Snackbar } from './components/snackbar.js';
import { CreateDataObjectDialog } from './components/create-do-dialog.js';
import { DescriptionDialog } from './components/description-dialog.js';

import { cdClasses, lnClass74 } from './constants.js';
import { NodeData, getSelectionByPath, processEnums } from './foundation.js';

let lastLNodeType = 'LPHD';
let lastSelection = {};
let lastFilter = '';

export default class TemplateGenerator extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'tree-grid': TreeGrid,
    'md-filled-select': MdFilledSelect,
    'md-select-option': MdSelectOption,
    'md-outlined-select': MdOutlinedSelect,
    'md-fab': MdFab,
    'md-icon': MdIcon,
    'md-outlined-button': MdOutlinedButton,
    'md-dialog': MdDialog,
    'md-outlined-text-field': MdOutlinedTextField,
    'oscd-snackbar': Snackbar,
    'create-data-object-dialog': CreateDataObjectDialog,
    'description-dialog': DescriptionDialog,
  };

  @property({ attribute: false })
  doc?: XMLDocument;

  @query('tree-grid')
  treeUI!: TreeGrid;

  @query('md-filled-select')
  lNodeTypeUI?: MdFilledSelect;

  @query('create-data-object-dialog')
  createDOdialog!: CreateDataObjectDialog;

  @query('description-dialog')
  descriptionDialog!: DescriptionDialog;

  @state()
  get selection(): TreeSelection {
    if (!this.treeUI) return {};
    return this.treeUI.selection;
  }

  set selection(selection: TreeSelection) {
    this.treeUI.selection = selection;
  }

  @state()
  get filter(): string {
    if (!this.treeUI) return '';
    return this.treeUI.filter ?? '';
  }

  set filter(filter: string) {
    this.treeUI.filter = filter;
  }

  @state()
  get lNodeType(): string {
    return this.lNodeTypeUI?.value || lastLNodeType;
  }

  set lNodeType(lNodeType: string) {
    if (!this.lNodeTypeUI) return;
    this.lNodeTypeUI.value = lNodeType;
    if (!this.lNodeTypeUI.value) this.lNodeTypeUI.value = lastLNodeType;
  }

  @state()
  addedLNode = '';

  @state()
  snackbarMessage = '';

  @state()
  snackbarType: 'success' | 'error' = 'success';

  disconnectedCallback() {
    super.disconnectedCallback();
    lastSelection = this.selection;
    lastFilter = this.filter;
    lastLNodeType = this.lNodeType;
  }

  async firstUpdated() {
    await this.treeUI.updateComplete;
    await this.lNodeTypeUI!.updateComplete;

    this.treeUI.tree = nsdToJson(lastLNodeType) as any;
    this.lNodeType = lastLNodeType;
    this.filter = lastFilter;
    this.selection = lastSelection;

    await this.treeUI.updateComplete;

    this.autoSelectEnums();
  }

  saveTemplates(description: string) {
    if (!this.doc) return;

    const inserts = insertSelectedLNodeType(this.doc, this.treeUI.selection, {
      class: this.lNodeType,
      ...(description !== undefined && { desc: description }),
      data: this.treeUI.tree as LNodeDescription,
    });

    const newLNodeType = inserts.find(
      insert => (insert.node as Element).tagName === 'LNodeType'
    )?.node as Element;

    if (newLNodeType) this.addedLNode = newLNodeType.getAttribute('id') ?? '';

    this.dispatchEvent(
      newEditEvent(inserts, {
        title: `Create LNodeType ${newLNodeType.getAttribute('id')}`,
      })
    );
  }

  async reset() {
    this.addedLNode = '';
    this.treeUI.tree = nsdToJson(this.lNodeType) as any;
    this.selection = {};
    this.filter = '';
    this.requestUpdate();
    this.treeUI.requestUpdate();

    await this.treeUI.updateComplete;
    this.autoSelectEnums();
  }

  private handleDOConfirm = (
    cdcType: string,
    doName: string,
    namespace: string | null
  ) => {
    if (!cdcType || !doName) return;
    try {
      this.createDataObject(
        cdcType as (typeof cdClasses)[number],
        doName,
        namespace
      );
      this.showNotification(
        `Data Object '${doName}' created successfully.`,
        'success'
      );
    } catch (error) {
      this.showNotification(
        'Failed to create Data Object. Please try again.',
        'error'
      );
    }
  };

  private createDataObject(
    cdcType: (typeof cdClasses)[number],
    doName: string,
    namespace: string | null
  ): void {
    let cdcChildren = nsdToJson(cdcType) as CdcChildren;

    if (namespace) {
      cdcChildren = {
        ...cdcChildren,
        dataNs: {
          ...cdcChildren?.dataNs,
          mandatory: true,
          val: namespace,
        },
      };
    }

    const cdcDescription = {
      tagName: 'DataObject',
      type: cdcType,
      descID: '',
      presCond: 'O',
      children: cdcChildren,
    };

    Object.assign(this.treeUI.tree, {
      [doName]: cdcDescription,
    });
    this.treeUI.requestUpdate();
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackbarMessage = '';
    setTimeout(() => {
      this.snackbarMessage = message;
      this.snackbarType = type;
    }, 0);
  }

  private updateSelectionAtPath(
    selection: TreeSelection,
    path: string[],
    newSelection: TreeSelection
  ): TreeSelection {
    if (path.length === 0) return newSelection;

    const [currentKey, ...remainingPath] = path;
    return {
      ...selection,
      [currentKey]: this.updateSelectionAtPath(
        selection[currentKey] || {},
        remainingPath,
        newSelection
      ),
    };
  }

  private handleNodeSelected = (event: CustomEvent) => {
    const { node, path } = event.detail;

    const currentSelectionAtPath = getSelectionByPath(
      this.treeUI.selection,
      path
    );

    const selectionWithEnums = processEnums(
      currentSelectionAtPath,
      node as NodeData
    );

    this.treeUI.selection = this.updateSelectionAtPath(
      this.treeUI.selection,
      path,
      selectionWithEnums
    );

    this.treeUI.requestUpdate();
  };

  private autoSelectEnums(): void {
    const tree = this.treeUI.tree as Record<string, NodeData>;
    const newSelection = { ...this.treeUI.selection };

    for (const [key, dataObject] of Object.entries(tree)) {
      if (newSelection[key]) {
        newSelection[key] = processEnums(newSelection[key], dataObject);
      }
    }

    this.treeUI.selection = newSelection;
    this.treeUI.requestUpdate();
  }

  render() {
    return html`<div class="container">
        <div class="btn-wrapper">
          <md-outlined-button @click=${() => this.createDOdialog.show()}>
            <md-icon slot="icon">add</md-icon>
            Add Data Object
          </md-outlined-button>
          <md-filled-select @input=${this.reset}>
            ${lnClass74.map(
              lNodeType =>
                html`<md-select-option value=${lNodeType}
                  >${lNodeType}</md-select-option
                >`
            )}
          </md-filled-select>
        </div>
        <tree-grid @node-selected=${this.handleNodeSelected}></tree-grid>
      </div>
      ${this.doc
        ? html`<md-fab
            label="${this.addedLNode || 'Add Type'}"
            @click=${() => this.descriptionDialog.show()}
          >
            <md-icon slot="icon">${this.addedLNode ? 'done' : 'add'}</md-icon>
          </md-fab>`
        : html``}
      <create-data-object-dialog
        .cdClasses=${cdClasses}
        .tree=${this.treeUI?.tree}
        .onConfirm=${this.handleDOConfirm}
      ></create-data-object-dialog>
      <description-dialog
        .onConfirm=${(description: string) => this.saveTemplates(description)}
        .onCancel=${() => this.descriptionDialog.close()}
      ></description-dialog>
      <oscd-snackbar
        .message=${this.snackbarMessage}
        .type=${this.snackbarType}
      ></oscd-snackbar>`;
  }

  static styles = css`
    * {
      --md-sys-color-primary: var(--oscd-primary);
      --md-sys-color-secondary: var(--oscd-secondary);
      --md-sys-typescale-body-large-font: var(--oscd-theme-text-font);
      --md-outlined-text-field-input-text-color: var(--oscd-base01);

      --md-sys-color-surface: var(--oscd-base3);
      --md-sys-color-on-surface: var(--oscd-base00);
      --md-sys-color-on-primary: var(--oscd-base2);
      --md-sys-color-on-surface-variant: var(--oscd-base00);
      --md-menu-container-color: var(--oscd-base3);
      font-family: var(--oscd-theme-text-font, 'Roboto');
      --md-sys-color-surface-container-highest: var(--oscd-base2);
      --md-list-item-activated-background: rgb(
        from var(--oscd-primary) r g b / 0.38
      );
      --md-menu-item-selected-container-color: rgb(
        from var(--oscd-primary) r g b / 0.38
      );
      --md-list-container-color: var(--oscd-base2);
      --md-fab-container-color: var(--oscd-secondary);
      --md-dialog-container-color: var(--oscd-base3);
      --md-dialog-container-shape: 4px;
      --md-text-button-container-shape: 4px;
    }

    md-outlined-button {
      text-transform: uppercase;
    }

    md-icon {
      font-family: var(--oscd-theme-icon-font, 'Material Symbols Outlined');
    }

    md-fab {
      position: fixed;
      bottom: 32px;
      right: 32px;
    }

    .container {
      margin: 12px;
    }

    .btn-wrapper {
      display: flex;
      margin-bottom: 12px;
      gap: 12px;
    }
  `;
}
