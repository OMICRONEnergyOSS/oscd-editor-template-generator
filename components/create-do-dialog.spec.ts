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

    element = await fixture(html`<create-data-object-dialog
      .cdClasses=${cdClasses}
      .tree=${tree}
      .onConfirm=${confirmSpy}
    >
    </create-data-object-dialog>`);

    confirmButton = element.shadowRoot?.querySelector('#confirm-btn')!;
    cancelButton = element.shadowRoot?.querySelector('#cancel-btn')!;
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
});
