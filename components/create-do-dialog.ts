/* eslint-disable @typescript-eslint/no-unused-vars */
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, html, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import { MdSelectOption } from '@scopedelement/material-web/select/MdSelectOption.js';
import { MdFilledSelect } from '@scopedelement/material-web/select/MdOutlineSelect.js';
import { MdOutlinedTextField } from '@scopedelement/material-web/textfield/MdOutlinedTextField.js';
import { MdDialog } from '@scopedelement/material-web/dialog/dialog.js';
import { MdTextButton } from '@scopedelement/material-web/button/text-button.js';

export class CreateDataObjectDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'md-dialog': MdDialog,
    'md-text-button': MdTextButton,
    'md-outlined-select': MdFilledSelect,
    'md-select-option': MdSelectOption,
    'md-outlined-text-field': MdOutlinedTextField,
  };

  @property({ type: Array })
  cdClasses: string[] = [];

  @property({ type: Function })
  onConfirm?: (cdcType: string, doName: string) => void;

  @query('md-dialog')
  dialog!: MdDialog;

  @query('#cdc-type')
  cdcType!: MdFilledSelect;

  @query('#do-name')
  doName!: MdOutlinedTextField;

  get open() {
    return this.dialog?.open ?? false;
  }

  show() {
    this.dialog?.show();
  }

  close() {
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
    this.dialog?.close();
  }

  private validate(): boolean {
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

  /* eslint-disable class-methods-use-this */
  private resetErrorText(e: Event): void {
    const target = e.target as MdOutlinedTextField | MdFilledSelect;
    if (target.errorText && target.checkValidity()) {
      target.errorText = '';
      target.error = false;
    }
  }

  private handleConfirm() {
    if (!this.validate()) return;
    this.onConfirm?.(this.cdcType?.value, this.doName?.value);
    this.close();
  }

  render() {
    return html`
      <md-dialog @closed=${() => this.close()}>
        <div slot="headline">Add Data Object</div>
        <div slot="content" class="dialog-content">
          <md-outlined-select
            id="cdc-type"
            class="cdc-type"
            label="Common Data Class"
            required
            @input=${this.resetErrorText}
          >
            ${this.cdClasses.map(
              cdClass =>
                html`<md-select-option value=${cdClass}
                  >${cdClass}</md-select-option
                >`
            )}
          </md-outlined-select>
          <md-outlined-text-field
            id="do-name"
            label="Data Object Name"
            required
            maxlength="12"
            pattern="[A-Z][0-9A-Za-z]*"
            @input=${this.resetErrorText}
          ></md-outlined-text-field>
        </div>
        <div slot="actions">
          <md-text-button id="cancel-btn" @click=${this.close} type="button"
            >Cancel</md-text-button
          >
          <md-text-button
            id="confirm-btn"
            @click=${this.handleConfirm}
            type="button"
            >Add</md-text-button
          >
        </div>
      </md-dialog>
    `;
  }

  static styles = css`
    md-text-button {
      text-transform: uppercase;
    }
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `;
}
