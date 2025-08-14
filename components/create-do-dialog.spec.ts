/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { SinonSpy, spy } from 'sinon';
import { CreateDataObjectDialog } from './create-do-dialog.js';

customElements.define('create-data-object-dialog', CreateDataObjectDialog);

describe('CreateDataObjectDialog', () => {
  let element: CreateDataObjectDialog;
  let confirmButton: HTMLElement;
  let cancelButton: HTMLElement;
  let confirmSpy: SinonSpy;

  const cdClasses = ['APC', 'ORG', 'SPS'];
  const tree = {
    AnOut1: {
      presCond: 'Omulti',
      type: 'APC',
    },
    Beh: {
      presCond: '0',
      type: 'ORG',
    },
    Ind1: {
      presCond: 'Omulti',
      type: 'SPS',
    },
  };

  beforeEach(async () => {
    confirmSpy = spy();

    element = await fixture(
      html`<create-data-object-dialog
        .cdClasses=${cdClasses}
        .tree=${tree}
        .onConfirm=${confirmSpy}
      >
      </create-data-object-dialog>`,
    );

    const cnfBtn = element.shadowRoot?.querySelector('#confirm-btn');
    const cnclBtn = element.shadowRoot?.querySelector('#cancel-btn');
    if (!cnfBtn || !cnclBtn) {
      throw new Error('Confirm or Cancel button not found in shadowRoot');
    }
    confirmButton = cnfBtn as HTMLButtonElement;
    cancelButton = cnclBtn as HTMLButtonElement;
  });

  it('should call onConfirm for valid form', () => {
    const type = 'APC';
    const doName = 'AnOut2';

    element.doName.value = doName;
    element.cdcType.value = type;

    confirmButton.click();

    expect(confirmSpy.callCount).to.equal(1);
    expect(confirmSpy.calledWith(type, doName)).to.be.true;
  });

  it('clears inputs and closes the dialog on reset button click', async () => {
    element.cdcType.value = 'ACD';
    element.doName.value = 'TestDO';

    cancelButton.click();

    await waitUntil(() => !element.open);
    expect(element.cdcType).to.have.property('value', '');
    expect(element.doName).to.have.property('value', '');
    expect(element.open).to.be.false;
  });

  describe('form validation', () => {
    it('should set DO name in use error', () => {
      element.cdcType.value = 'ORG';
      element.doName.value = 'Beh';

      confirmButton.click();

      expect(confirmSpy.callCount).to.equal(0);
      expect(element.doName.error).to.be.true;
      expect(element.doName.errorText).to.equal('DO name already in use');
    });

    it('should set invalid CDC error', () => {
      element.cdcType.value = 'ORG';
      element.doName.value = 'Ind2';

      confirmButton.click();

      expect(confirmSpy.callCount).to.equal(0);
      expect(element.cdcType.error).to.be.true;
      expect(element.cdcType.errorText).to.equal(
        'CDC type invalid for this DO',
      );
    });

    it('should set custom namespace needed error', async () => {
      element.cdcType.value = 'ORG';
      element.doName.value = 'NewDOName';

      await new Promise(r => setTimeout(r, 400));
      confirmButton.click();

      expect(confirmSpy.callCount).to.equal(0);
      expect(element.namespace.error).to.be.true;
      expect(element.namespace.errorText).to.equal(
        'Custom namespace required.',
      );
    });
  });
});
