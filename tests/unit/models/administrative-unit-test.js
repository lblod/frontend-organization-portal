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
      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
      });
    });

    test("it returns more error when it's PROJECTVERENIGING and expectedEndDate earlier than now", async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.PROJECTVERENIGING
      );
      const model = this.store().createRecord('administrative-unit', {
        classification,
        expectedEndDate: new Date('2020-01-01'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 5);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        expectedEndDate: {
          message: 'De datum mag niet in het verleden liggen',
        },
        hasParticipants: { message: 'Selecteer een optie' },
        isSubOrganizationOf: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
      });
    });

    [
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
    ].forEach((cl) => {
      test(`it returns an extra error when founder is missing for ${cl.label} without relaxing the mandatory rule`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 3);
        assert.propContains(model.error, {
          name: { message: 'Vul de naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
          wasFoundedByOrganizations: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
    ].forEach((cl) => {
      test(`it returns an extra error when founder is missing for ${cl.label} when providing wrong argument to relax mandatory`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const isValid = await model.validate('notTrue');

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 3);
        assert.propContains(model.error, {
          name: { message: 'Vul de naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
          wasFoundedByOrganizations: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
    ].forEach((cl) => {
      test(`it returns no extra error when founder is provided for a ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const founder = this.store().createRecord('administrative-unit');
        const model = this.store().createRecord('administrative-unit', {
          classification,
          wasFoundedByOrganizations: [founder],
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 2);
        assert.propContains(model.error, {
          name: { message: 'Vul de naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
        });
      });
    });

    test(`it returns no extra error when founder is provided for an AGB`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.AGB
      );
      const founder = this.store().createRecord('administrative-unit');
      const model = this.store().createRecord('administrative-unit', {
        classification,
        wasFoundedByOrganizations: [founder],
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        isSubOrganizationOf: { message: 'Selecteer een optie' },
      });
    });

    test(`it returns no extra error when founder is provided for an APB`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.APB
      );
      const founder = this.store().createRecord('administrative-unit');
      const model = this.store().createRecord('administrative-unit', {
        classification,
        wasFoundedByOrganizations: [founder],
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        isAssociatedWith: { message: 'Selecteer een optie' },
        isSubOrganizationOf: { message: 'Selecteer een optie' },
      });
    });

    [
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
    ].forEach((cl) => {
      test(`it returns no extra error when founder is missing for an existing ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const isValid = await model.validate(true);

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 2);
        assert.propContains(model.error, {
          name: { message: 'Vul de naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
        });
      });
    });

    test('it has no effect to relax the mandatory founder rule for an AGB', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.AGB
      );
      const model = this.store().createRecord('administrative-unit', {
        classification,
      });

      const isValid = await model.validate(true);

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        wasFoundedByOrganizations: { message: 'Selecteer een optie' },
        isSubOrganizationOf: { message: 'Selecteer een optie' },
      });
    });

    test('it has no effect to relax the mandatory founder rule for an APB', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.APB
      );
      const model = this.store().createRecord('administrative-unit', {
        classification,
      });

      const isValid = await model.validate(true);

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 5);
      assert.propContains(model.error, {
        name: { message: 'Vul de naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        isAssociatedWith: { message: 'Selecteer een optie' },
        wasFoundedByOrganizations: { message: 'Selecteer een optie' },
        isSubOrganizationOf: { message: 'Selecteer een optie' },
      });
    });
  });
});
