import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | decision', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  test('it returns no errors when the model is empty', async function (assert) {
    const model = this.store().createRecord('decision');

    const isValid = await model.validate();

    assert.true(isValid);
  });

  test('it returns an error on an invalid url', async function (assert) {
    const model = this.store().createRecord('decision', {
      documentLink: 'Invalid url',
    });

    const isValid = await model.validate();

    assert.false(isValid);
    assert.strictEqual(Object.keys(model.error).length, 1);
    assert.propContains(model.error, {
      documentLink: { message: 'Geef een geldig internetadres in' },
    });
  });

  test('it returns no error when a valid url is provided', async function (assert) {
    const model = this.store().createRecord('decision', {
      documentLink: 'https://www.vlaanderen.be',
    });

    const isValid = await model.validate();

    assert.true(isValid);
  });

  test('it returns no error when an empty url is provided', async function (assert) {
    const model = this.store().createRecord('decision', {
      documentLink: '',
    });

    const isValid = await model.validate();

    assert.true(isValid);
  });
});
