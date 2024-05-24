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
        legalName: { message: 'Vul de juridische naam in' },
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
        legalName: { message: 'Vul de juridische naam in' },
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
          legalName: { message: 'Vul de juridische naam in' },
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
          legalName: { message: 'Vul de juridische naam in' },
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
          legalName: { message: 'Vul de juridische naam in' },
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
        legalName: { message: 'Vul de juridische naam in' },
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
        legalName: { message: 'Vul de juridische naam in' },
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
      test(`it returns no extra error when founder is missing for a ${cl.label} and the mandatory founder rule is relaxed`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
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

    test('it has no effect to relax the mandatory founder rule for an AGB', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.AGB
      );
      const model = this.store().createRecord('administrative-unit', {
        classification,
      });

      const isValid = await model.validate({
        relaxMandatoryFoundingOrganization: true,
      });

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 4);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
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

      const isValid = await model.validate({
        relaxMandatoryFoundingOrganization: true,
      });

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 5);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        organizationStatus: { message: 'Selecteer een optie' },
        isAssociatedWith: { message: 'Selecteer een optie' },
        wasFoundedByOrganizations: { message: 'Selecteer een optie' },
        isSubOrganizationOf: { message: 'Selecteer een optie' },
      });
    });
  });

  module('classification', function () {
    [
      [CLASSIFICATION.MUNICIPALITY, 'isMunicipality'],
      [CLASSIFICATION.PROVINCE, 'isProvince'],
      [CLASSIFICATION.OCMW, 'isOCMW'],
      [CLASSIFICATION.DISTRICT, 'isDistrict'],
      [CLASSIFICATION.AGB, 'isAgb'],
      [CLASSIFICATION.APB, 'isApb'],
      [CLASSIFICATION.PROJECTVERENIGING, 'isIgs'],
      [CLASSIFICATION.DIENSTVERLENENDE_VERENIGING, 'isIgs'],
      [CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING, 'isIgs'],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        'isIgs',
      ],
      [CLASSIFICATION.POLICE_ZONE, 'isPoliceZone'],
      [CLASSIFICATION.ASSISTANCE_ZONE, 'isAssistanceZone'],
      [CLASSIFICATION.WELZIJNSVERENIGING, 'isOcmwAssociation'],
      [CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING, 'isOcmwAssociation'],
      [CLASSIFICATION.PEVA_MUNICIPALITY, 'isPevaMunicipality'],
      [CLASSIFICATION.PEVA_PROVINCE, 'isPevaProvince'],
    ].forEach(([cl, func]) => {
      test(`it should return true for ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const result = model[func];
        assert.true(result);
      });
    });

    Object.keys(CLASSIFICATION).forEach((cl) => {
      test(`it should return false for whether ${cl.label} has a central worship service`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const result = model.hasCentralWorshipService;
        assert.notOk(result);
      });
    });
  });
});
