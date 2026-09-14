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

      assert.strictEqual(Object.keys(model.error).length, 5);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
        legalForm: { message: 'Selecteer een optie' },
        contentThemes: { message: 'Selecteer een optie' },
      });
    });

    test('it should return an extra error creating empty model', async function (assert) {
      const model = this.store().createRecord('registered-organization');

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);

      assert.strictEqual(Object.keys(model.error).length, 6);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
        memberships: { message: 'Selecteer een optie' },
        legalForm: { message: 'Selecteer een optie' },
        contentThemes: { message: 'Selecteer een optie' },
      });
    });

    test(`it should not return an error creating an empty "Andere" model without memberships`, async function (assert) {
      const classification = this.store().createRecord(
        'registered-organization-classification-code',
        CLASSIFICATION.ANDERE,
      );
      const model = this.store().createRecord('registered-organization', {
        classification,
      });

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);
      assert.notOk(model.error.memberships);
    });

    [CLASSIFICATION.REGIONAAL_LANDSCHAP].forEach((cl) => {
      test(`it should require a werkingsgebied but no memberships when creating a new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl,
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.propContains(model.error, {
          scope: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should return an error when there are no memberships when creating a  new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl,
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.propContains(model.error, {
          memberships: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should return an error when memberships is an empty when creating a new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl,
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
          memberships: [],
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.propContains(model.error, {
          memberships: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should not return an error when there are memberships when creating a new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl,
        );
        const membership = this.store().createRecord('membership');
        const model = this.store().createRecord('registered-organization', {
          classification,
          memberships: [membership],
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.notOk(model.error.memberships);
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should not return an error for missing memberships when editing an existing ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl,
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.notOk(model.error.memberships);
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should not return an error if memberships is an empty array when editing an existing ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl,
        );
        const model = this.store().createRecord('registered-organization', {
          classification,
          memberships: [],
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.notOk(model.error.memberships);
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
    ].forEach((cl) => {
      test(`it should not return an error for editing an existing ${cl.label} that has a membership`, async function (assert) {
        const classification = this.store().createRecord(
          'registered-organization-classification-code',
          cl,
        );
        const membership = this.store().createRecord('membership');
        const model = this.store().createRecord('registered-organization', {
          classification,
          memberships: [membership],
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.notOk(model.error.memberships);
      });
    });
  });
});
