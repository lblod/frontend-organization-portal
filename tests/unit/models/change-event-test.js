import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';

module('Unit | Model | change event', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  test('it returns errors when the model is empty', async function (assert) {
    const model = this.store().createRecord('change-event');

    const isValid = await model.validate();

    assert.false(isValid);
    assert.strictEqual(Object.keys(model.error).length, 2);
    assert.propContains(model.error, {
      type: { message: 'Selecteer een type' },
      date: { message: 'Vul de datum in' },
    });
  });

  test('it returns an error when the date is missing', async function (assert) {
    const model = this.store().createRecord('change-event', {
      type: CHANGE_EVENT_TYPE.NAME_CHANGE,
    });

    const isValid = await model.validate();

    assert.false(isValid);
    assert.strictEqual(Object.keys(model.error).length, 1);
    assert.propContains(model.error, { date: { message: 'Vul de datum in' } });
  });
});
