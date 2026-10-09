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
      assert.strictEqual(Object.keys(model.error).length, 6);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
        scope: { message: 'Selecteer een optie' },
        legalForm: { message: 'Selecteer een optie' },
        contentThemes: { message: 'Selecteer een optie' },
      });
    });

    test("it returns an extra error when it's a PROJECTVERENIGING and the expectedEndDate is earlier than now", async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.PROJECTVERENIGING,
      );
      const model = this.store().createRecord('administrative-unit', {
        classification,
        expectedEndDate: new Date('2020-01-01'),
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.propContains(model.error, {
        expectedEndDate: {
          message: 'De datum mag niet in het verleden liggen',
        },
      });
    });

    [
      CLASSIFICATION.PROJECTVERENIGING,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
      CLASSIFICATION.AGB,
      CLASSIFICATION.APB,
      CLASSIFICATION.POLICE_ZONE,
      CLASSIFICATION.ASSISTANCE_ZONE,
      CLASSIFICATION.DISTRICT,
      CLASSIFICATION.MUNICIPALITY,
      CLASSIFICATION.INTERLOKALE_VERENIGING,
      CLASSIFICATION.VERVOERREGIORAAD,
    ].forEach((cl) => {
      test(`it should return an extra error when a new  ${cl.label} is created without memberships`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );

        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.propContains(model.error, {
          memberships: { message: 'Kies minstens 1 gerelateerde organisatie' },
        });
      });
    });

    [
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should return an extra error when a new  ${cl.label} is created without memberships`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );

        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.propContains(model.error, {
          memberships: { message: 'Kies minstens 1 gerelateerde organisatie' },
        });
      });
    });

    [
      CLASSIFICATION.PROJECTVERENIGING,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
      CLASSIFICATION.AGB,
      CLASSIFICATION.APB,
      CLASSIFICATION.POLICE_ZONE,
      CLASSIFICATION.ASSISTANCE_ZONE,
      CLASSIFICATION.DISTRICT,
      CLASSIFICATION.MUNICIPALITY,
      CLASSIFICATION.INTERLOKALE_VERENIGING,
      CLASSIFICATION.VERVOERREGIORAAD,
    ].forEach((cl) => {
      test(`it should return an extra error when a new  ${cl.label} is created with an empty memberships array`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );

        const model = this.store().createRecord('administrative-unit', {
          classification,
          memberships: [],
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.propContains(model.error, {
          memberships: { message: 'Kies minstens 1 gerelateerde organisatie' },
        });
      });
    });

    [
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should return an extra error when a new  ${cl.label} is created with an empty memberships array`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );

        const model = this.store().createRecord('administrative-unit', {
          classification,
          memberships: [],
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.propContains(model.error, {
          memberships: { message: 'Kies minstens 1 gerelateerde organisatie' },
        });
      });
    });

    [
      CLASSIFICATION.PROJECTVERENIGING,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
      CLASSIFICATION.AGB,
      CLASSIFICATION.APB,
      CLASSIFICATION.POLICE_ZONE,
      CLASSIFICATION.ASSISTANCE_ZONE,
      CLASSIFICATION.DISTRICT,
      CLASSIFICATION.MUNICIPALITY,
      CLASSIFICATION.INTERLOKALE_VERENIGING,
      CLASSIFICATION.VERVOERREGIORAAD,
    ].forEach((cl) => {
      test(`it should not return an extra error when a membership is defined present when creating an new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const membership = this.store().createRecord('membership');

        const model = this.store().createRecord('administrative-unit', {
          classification,
          memberships: [membership],
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.notOk(model.error.memberships);
      });
    });

    [
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should not return an extra error when a membership is defined present when creating an new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const membership = this.store().createRecord('membership');

        const model = this.store().createRecord('administrative-unit', {
          classification,
          memberships: [membership],
        });

        const isValid = await model.validate({ creatingNewOrganization: true });

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 3);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
          scope: { message: 'Selecteer een optie' },
        });
      });
    });

    test(`it should return an extra error when a new OCMW is created without memberships on the member side`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.OCMW,
      );

      const model = this.store().createRecord('administrative-unit', {
        classification,
      });

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);
      assert.propContains(model.error, {
        membershipsOfOrganizations: { message: 'Selecteer een optie' },
      });
      assert.notOk(model.error.memberships);
    });

    test(`it should return an extra error when a new OCMW is created with an empty membershipsOfOrganizations array`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.OCMW,
      );

      const model = this.store().createRecord('administrative-unit', {
        classification,
        membershipsOfOrganizations: [],
      });

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);
      assert.propContains(model.error, {
        membershipsOfOrganizations: { message: 'Selecteer een optie' },
      });
    });

    test(`it should not return an extra error when a new OCMW is created with a membership on the member side`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.OCMW,
      );
      const membership = this.store().createRecord('membership');

      const model = this.store().createRecord('administrative-unit', {
        classification,
        membershipsOfOrganizations: [membership],
      });

      const isValid = await model.validate({ creatingNewOrganization: true });

      assert.false(isValid);
      assert.notOk(model.error.membershipsOfOrganizations);
    });

    test(`it should not return an extra error when editing an existing OCMW without memberships on the member side`, async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.OCMW,
      );

      const model = this.store().createRecord('administrative-unit', {
        classification,
      });

      const isValid = await model.validate();

      assert.false(isValid);
      assert.notOk(model.error.membershipsOfOrganizations);
    });

    [
      CLASSIFICATION.PROJECTVERENIGING,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
      CLASSIFICATION.AGB,
      CLASSIFICATION.APB,
      CLASSIFICATION.POLICE_ZONE,
      CLASSIFICATION.ASSISTANCE_ZONE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an existing ${cl.label} without memberships`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.notOk(model.error.memberships);
      });
    });

    [
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an existing ${cl.label} without memberships`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
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
          scope: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.PROJECTVERENIGING,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
      CLASSIFICATION.AGB,
      CLASSIFICATION.APB,
      CLASSIFICATION.POLICE_ZONE,
      CLASSIFICATION.ASSISTANCE_ZONE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an ${cl.label} with an empty memberships array`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
          memberships: [],
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.notOk(model.error.memberships);
      });
    });

    [
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an ${cl.label} with an empty memberships array`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
          memberships: [],
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 3);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
          scope: { message: 'Selecteer een optie' },
        });
      });
    });

    [
      CLASSIFICATION.PROJECTVERENIGING,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
      CLASSIFICATION.AGB,
      CLASSIFICATION.APB,
      CLASSIFICATION.POLICE_ZONE,
      CLASSIFICATION.ASSISTANCE_ZONE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an existing ${cl.label} with memberships`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const membership = this.store().createRecord('membership');

        const model = this.store().createRecord('administrative-unit', {
          classification,
          memberships: [membership],
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.notOk(model.error.memberships);
      });
    });

    [
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an existing with memberships ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const membership = this.store().createRecord('membership');

        const model = this.store().createRecord('administrative-unit', {
          classification,
          memberships: [membership],
        });

        const isValid = await model.validate();

        assert.false(isValid);
        assert.strictEqual(Object.keys(model.error).length, 3);
        assert.propContains(model.error, {
          legalName: { message: 'Vul de juridische naam in' },
          organizationStatus: { message: 'Selecteer een optie' },
          scope: { message: 'Selecteer een optie' },
        });
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
          cl,
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
          cl,
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
