/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { css, html, LitElement } from 'lit';
import { state, query } from 'lit/decorators.js';

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
import { MdTextButton } from '@scopedelement/material-web/button/text-button.js';
import { Snackbar } from './components/snackbar.js';

import { cdClasses, lnClass74 } from './constants.js';

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
    'md-text-button': MdTextButton,
    'oscd-snackbar': Snackbar,
  };

  @query('tree-grid')
  treeUI!: TreeGrid;

  @query('md-filled-select')
  lNodeTypeUI?: MdFilledSelect;

  @query('md-dialog')
  createDOdialog!: MdDialog;

  @query('#cdc-type')
  cdcType!: MdOutlinedSelect;

  @query('#do-name')
  doName!: MdOutlinedTextField;

  @state()
  doc?: XMLDocument;

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
    await this.treeUI.updateComplete;
    this.selection = lastSelection;
  }

  saveTemplates() {
    if (!this.doc) return;

    const inserts = insertSelectedLNodeType(this.doc, this.treeUI.selection, {
      class: this.lNodeType,
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

  reset() {
    this.addedLNode = '';
    this.treeUI.tree = nsdToJson(this.lNodeType) as any;
    this.selection = {};
    this.filter = '';
    this.requestUpdate();
    this.treeUI.requestUpdate();
  }

  openDialog() {
    this.createDOdialog.show();
  }

  closeDialog() {
    if (this.cdcType) {
      this.cdcType.errorText = '';
      this.cdcType.error = false;
      this.cdcType.reset();
    }

    if (this.doName) {
      this.doName.errorText = '';
      this.doName.error = false;
      this.doName.value = '';
    }

    this.createDOdialog.close();
  }

  private async onAddDataObjectSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    if (!this.validateForm()) return;

    try {
      this.createDataObject(
        this.cdcType.value as (typeof cdClasses)[number],
        this.doName.value
      );

      this.showNotification(
        `Data Object '${this.doName.value}' created successfully.`,
        'success'
      );
      this.closeDialog();
      form.reset();
    } catch (error) {
      this.showNotification(
        'Failed to create Data Object. Please try again.',
        'error'
      );
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    if (!this.cdcType?.value) {
      this.cdcType.errorText = 'Please select a common data class.';
      this.cdcType.error = true;
      isValid = false;
    } else {
      this.cdcType.errorText = '';
      this.cdcType.error = false;
    }

    if (!this.doName?.checkValidity()) {
      this.doName.errorText = 'Not a valid DO name.';
      this.doName.error = true;
      isValid = false;
    } else {
      this.doName.errorText = '';
      this.doName.error = false;
    }

    return isValid;
  }

  private createDataObject(
    cdcType: (typeof cdClasses)[number],
    doName: string
  ): void {
    const cdcChildren = nsdToJson(cdcType);

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

  /* eslint-disable class-methods-use-this */
  private resetErrorText(e: Event): void {
    const target = e.target as MdOutlinedTextField | MdOutlinedSelect;
    if (target.errorText && target.checkValidity()) {
      target.errorText = '';
      target.error = false;
    }
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackbarMessage = '';
    setTimeout(() => {
      this.snackbarMessage = message;
      this.snackbarType = type;
    }, 0);
  }

  render() {
    return html`<div class="container">
        <div class="btn-wrapper">
          <md-outlined-button @click=${this.openDialog}>
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
        <tree-grid></tree-grid>
      </div>
      ${this.doc
        ? html`<md-fab
            label="${this.addedLNode || 'Add Type'}"
            @click=${this.saveTemplates}
          >
            <md-icon slot="icon">${this.addedLNode ? 'done' : 'add'}</md-icon>
          </md-fab>`
        : html``}
      <md-dialog @closed=${this.closeDialog}>
        <div slot="headline">Add Data Object</div>
        <form
          slot="content"
          id="add-data-object"
          class="dialog-content"
          novalidate
          @submit=${this.onAddDataObjectSubmit}
          @reset=${this.closeDialog}
        >
          <md-outlined-select
            class="cdc-type"
            label="Common Data Class"
            required
            id="cdc-type"
            @input=${this.resetErrorText}
          >
            ${cdClasses.map(
              (cdClass: (typeof cdClasses)[number]) =>
                html`<md-select-option value=${cdClass}
                  >${cdClass}</md-select-option
                >`
            )}
          </md-outlined-select>
          <md-outlined-text-field
            label="Data Object Name"
            id="do-name"
            required
            maxlength="12"
            pattern="[A-Z][0-9A-Za-z]*"
            @input=${this.resetErrorText}
          ></md-outlined-text-field>
        </form>
        <div slot="actions">
          <md-text-button form="add-data-object" type="reset"
            >Close</md-text-button
          >
          <md-text-button form="add-data-object" type="submit"
            >Add</md-text-button
          >
        </div>
      </md-dialog>
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

    md-outlined-button,
    md-text-button {
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

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `;
}
