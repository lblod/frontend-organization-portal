import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { OcmwAssociationCodeList } from 'frontend-organization-portal/constants/Classification';
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

    test("it returns an extra error when it's a PROJECTVERENIGING and the expectedEndDate is earlier than now", async function (assert) {
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
      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        expectedEndDate: {
          message: 'De datum mag niet in het verleden liggen',
        },
        organizationStatus: { message: 'Selecteer een optie' },
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
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should return an extra error when a new  ${cl.label} is created without memberships`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );

        const model = this.store().createRecord('administrative-unit', {
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
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should return an extra error when a new  ${cl.label} is created with an empty memberships array`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );

        const model = this.store().createRecord('administrative-unit', {
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
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should not return an extra error when a membership is defined present when creating an new ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const membership = this.store().createRecord('membership');

        const model = this.store().createRecord('administrative-unit', {
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
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an existing ${cl.label} without memberships`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
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
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an ${cl.label} with an empty memberships array`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
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
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
    ].forEach((cl) => {
      test(`it should not return an extra error when editing an existing with memberships ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const membership = this.store().createRecord('membership');

        const model = this.store().createRecord('administrative-unit', {
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

  module('participantClassifications', function () {
    const igsParticipants = [
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.AGB.id,
      CLASSIFICATION.PROJECTVERENIGING.id,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
      CLASSIFICATION.POLICE_ZONE.id,
      CLASSIFICATION.ASSISTANCE_ZONE.id,
      CLASSIFICATION.PEVA_MUNICIPALITY.id,
      CLASSIFICATION.PEVA_PROVINCE.id,
      CLASSIFICATION.WELZIJNSVERENIGING.id,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
      CLASSIFICATION.ZIEKENHUISVERENIGING.id,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ];

    const ocmwAssociationParticipants = OcmwAssociationCodeList.concat([
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ]);

    const pevaParticipants = [
      CLASSIFICATION.PROJECTVERENIGING.id,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
    ];

    [
      [CLASSIFICATION.PROJECTVERENIGING, igsParticipants],
      [CLASSIFICATION.DIENSTVERLENENDE_VERENIGING, igsParticipants],
      [CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING, igsParticipants],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        igsParticipants,
      ],
      [CLASSIFICATION.PEVA_MUNICIPALITY, pevaParticipants],
      [CLASSIFICATION.PEVA_PROVINCE, pevaParticipants],
      [CLASSIFICATION.WELZIJNSVERENIGING, ocmwAssociationParticipants],
      [
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        ocmwAssociationParticipants,
      ],
    ].forEach(([cl, classificationCodes]) => {
      test(`it should allow valid participants for ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
        });
        const result = model.participantClassifications;

        assert.deepEqual(result.sort(), classificationCodes.sort());
      });
    });
  });

  module('founderClassifications', function () {
    [
      [CLASSIFICATION.APB, [CLASSIFICATION.MUNICIPALITY.id]],
      [CLASSIFICATION.AGB, [CLASSIFICATION.MUNICIPALITY.id]],
      [
        CLASSIFICATION.PEVA_MUNICIPALITY,
        [
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.PEVA_PROVINCE,
        [
          CLASSIFICATION.PROVINCE.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.WELZIJNSVERENIGING,
        [
          ...OcmwAssociationCodeList,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        [
          ...OcmwAssociationCodeList,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
    ].forEach(([cl, classificationCodes]) => {
      test(`it should allow a(n) ${cl.label} to be founded by the correct organizations`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl
        );
        const model = this.store().createRecord('administrative-unit', {
          classification,
        });

        const result = model.founderClassifications;

        assert.deepEqual(result.sort(), classificationCodes.sort());
      });
    });
  });
});
