import { module, test } from 'qunit';

import { setupTest } from 'frontend-organization-portal/tests/helpers';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

module('Unit | Model | registered organization', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    test('it should return errors when model is empty', async function (assert) {
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

    test('it should return an extra error creating empty model', async function (assert) {
      const model = this.store().createRecord('registered-organization');

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);

      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
        memberships: { message: 'Selecteer een optie' },
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should return an extra error when there are no memberships when creating a  new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 3);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
          memberships: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should return an extra error when memberships is an empty when creating a new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
          memberships: [],
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 3);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
          memberships: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should not return an extra error when there are memberships when creating a new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl
        );
        const membership = this.store().createRecord('membership');
        const model = this.store().createRecord('registered-organization', {
          classification,
          memberships: [membership],
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 2);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should not return an extra error for missing memberships when editing an existing ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 2);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should not return an extra error memberships is an empty array when editing an existing ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
          memberships: [],
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 2);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should not return an extra error for editing an existing ${cl.label} that has a membership`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl
        );
        const membership = this.store().createRecord('membership');
        const model = this.store().createRecord('registered-organization', {
          classification,
          memberships: [membership],
        });

        const isValid = await model.validate();

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
