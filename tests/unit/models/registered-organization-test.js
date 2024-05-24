import { module, test } from 'qunit';

import { setupTest } from 'frontend-organization-portal/tests/helpers';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

module('Unit | Model | registered organization', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    test('it returns errors when model is empty', async function (assert) {
      const model = this.store().createRecord('registered-organization');

      const isValid = await model.validate();

      assert.false(isValid);

      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it returns an extra error when founder is missing for ${cl.label} without relaxing the mandatory rule`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 3);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
          wasFoundedByOrganizations: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it returns no extra error when founder is missing for ${cl.label} when relaxing the mandatory rule`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
        });

        const isValid = await model.validate({
          relaxMandatoryFoundingOrganization: true,
        });

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 2);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
        });
      });
    });
  });
});
