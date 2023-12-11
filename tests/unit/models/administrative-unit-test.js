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
      assert.deepEqual(model.error, {
        name: 'Vul de naam in',
        classification: 'Selecteer een optie',
      });
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
      assert.deepEqual(model.error, {
        name: 'Vul de naam in',
        isSubOrganizationOf: 'Selecteer een optie',
        wasFoundedByOrganization: 'Selecteer een optie',
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
      assert.deepEqual(model.error, {
        name: 'Vul de naam in',
        expectedEndDate: 'De datum mag niet in het verleden liggen',
        hasParticipants: 'Selecteer een optie',
        isSubOrganizationOf: 'Selecteer een optie',
      });
    });
  });
});
