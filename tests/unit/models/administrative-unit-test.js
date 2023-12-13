import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

module('Unit | Model | administrative unit', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns errors when model is empty', async function (assert) {
      const model = this.store().createRecord('administrative-unit');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(model.error.name.message, 'Vul de naam in');
      assert.strictEqual(
        model.error.classification.message,
        'Selecteer een optie'
      );
    });

    test('tt', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.AGB
      );
      const model = this.store().createRecord('administrative-unit', {
        classification,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        wasFoundedByOrganization: { message: 'Selecteer een optie' },
        isSubOrganizationOf: { message: 'Selecteer een optie' },
      });
    });

    test('date', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.PROJECTVERENIGING
      );
      const model = this.store().createRecord('administrative-unit', {
        classification,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      console.log(model.error);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        expectedEndDate: {
          message: 'De datum mag niet in het verleden liggen',
        },
        hasParticipants: { message: 'Selecteer een optie' },
        isSubOrganizationOf: { message: 'Selecteer een optie' },
      });
    });
  });
});
