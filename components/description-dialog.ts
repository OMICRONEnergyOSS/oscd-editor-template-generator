/* eslint-disable @typescript-eslint/no-unused-vars */
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, html, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import { MdOutlinedTextField } from '@scopedelement/material-web/textfield/MdOutlinedTextField.js';
import { MdDialog } from '@scopedelement/material-web/dialog/dialog.js';
import { MdTextButton } from '@scopedelement/material-web/button/text-button.js';

export class DescriptionDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'md-dialog': MdDialog,
    'md-text-button': MdTextButton,
    'md-outlined-text-field': MdOutlinedTextField,
  };

  @property({ type: Array })
  cdClasses: string[] = [];

  @property({ type: Function })
  onConfirm!: (description: string) => void;

  @property({ type: Function })
  onCancel!: () => void;

  @query('md-dialog')
  dialog!: MdDialog;

  @query('#lnode-type-description')
  description!: MdOutlinedTextField;

  get open() {
    return this.dialog?.open ?? false;
  }

  show() {
    this.dialog?.show();
  }

  close() {
    if (this.description) {
      this.description.errorText = '';
      this.description.error = false;
      this.description.value = '';
    }
    this.dialog?.close();
  }

  private validate(): boolean {
    let isValid = true;

    if (!this.description?.checkValidity()) {
      this.description.errorText = 'Not a valid description.';
      this.description.error = true;
      isValid = false;
    } else {
      this.description.errorText = '';
      this.description.error = false;
    }

    return isValid;
  }

  private resetErrorText(e: Event): void {
    if (this.description.errorText && this.description.checkValidity()) {
      this.description.errorText = '';
      this.description.error = false;
    }
  }

  private handleConfirm() {
    if (!this.validate()) return;
    this.onConfirm(this.description.value);
    this.close();
  }

  render() {
    return html`
      <md-dialog @closed=${() => this.close()}>
        <div slot="headline">Add LNodeType Description</div>
        <div slot="content" class="dialog-content">
          <md-outlined-text-field
            id="lnode-type-description"
            label="LNodeType Description"
            required
            @input=${this.resetErrorText}
          ></md-outlined-text-field>
        </div>
        <div slot="actions">
          <md-text-button id="cancel-button" @click=${this.close} type="button"
            >Cancel</md-text-button
          >
          <md-text-button
            id="confirm-button"
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
