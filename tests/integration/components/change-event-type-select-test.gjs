import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupRenderingTest } from 'frontend-organization-portal/tests/helpers';
import { findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { clickTrigger } from 'ember-power-select/test-support/helpers';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

function changeEventType(id, label) {
  return { id, type: 'change-event-type', attributes: { label } };
}

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
    this.set('onChange', () => {});
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  async function optionLabels() {
    await render(hbs`
      <ChangeEventTypeSelect
        @organizationClassification={{this.classification}}
        @onChange={{this.onChange}}
      />
    `);
    await clickTrigger();
    return findAll('.ember-power-select-option').map((option) =>
      option.textContent.trim(),
    );
  }

  test('it lists the municipality types without the worship-only ones', async function (assert) {
    this.set('classification', CLASSIFICATION.MUNICIPALITY);

    assert.deepEqual(await optionLabels(), [
      'Naamswijziging',
      'Oprichting',
      'Stadstitel',
    ]);
  });

  test('it keeps the worship-only types for a worship service', async function (assert) {
    this.set('classification', CLASSIFICATION.WORSHIP_SERVICE);

    assert.deepEqual(await optionLabels(), [
      'Naamswijziging',
      'Erkenning toegekend',
    ]);
  });
});
