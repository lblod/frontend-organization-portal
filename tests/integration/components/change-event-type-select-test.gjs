import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { findAll, render } from '@ember/test-helpers';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import ChangeEventTypeSelect from 'frontend-organization-portal/components/change-event-type-select.js';

function changeEventType(id, label) {
  return { id, type: 'change-event-type', attributes: { label } };
}

const noopOnChange = () => {};

module('Integration | Component | change-event-type-select', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const types = store.push({
      data: [
        changeEventType(CHANGE_EVENT_TYPE.NAME_CHANGE, 'Naamswijziging'),
        changeEventType(CHANGE_EVENT_TYPE.OPRICHTING, 'Oprichting'),
        changeEventType(CHANGE_EVENT_TYPE.CITY, 'Stadstitel'),
        changeEventType(CHANGE_EVENT_TYPE.FUSIE, 'Fusie'),
        changeEventType(
          CHANGE_EVENT_TYPE.RECOGNITION_GRANTED,
          'Erkenning toegekend',
        ),
      ],
    });
    sinon.stub(store, 'request').resolves({ content: types });
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  async function optionLabels(classification) {
    await render(
      <template>
        <ChangeEventTypeSelect
          @organizationClassification={{classification}}
          @onChange={{noopOnChange}}
        />
      </template>,
    );
    await clickTrigger();
    return findAll('.ember-power-select-option').map((option) =>
      option.textContent.trim(),
    );
  }

  test('it lists the municipality types without the worship-only ones', async function (assert) {
    assert.deepEqual(await optionLabels(CLASSIFICATION.MUNICIPALITY), [
      'Naamswijziging',
      'Oprichting',
      'Stadstitel',
    ]);
  });

  test('it keeps the worship-only types for a worship service', async function (assert) {
    assert.deepEqual(await optionLabels(CLASSIFICATION.WORSHIP_SERVICE), [
      'Naamswijziging',
      'Erkenning toegekend',
    ]);
  });
});
