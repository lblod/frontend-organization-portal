import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

module('Unit | Model | organization', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns error when model is empty', async function (assert) {
      const model = this.store().createRecord('organization');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
      });
    });
  });

  module('classification', function () {
    [
      [CLASSIFICATION.MUNICIPALITY, 'isMunicipality'],
      [CLASSIFICATION.PROVINCE, 'isProvince'],
      [CLASSIFICATION.OCMW, 'isOCMW'],
      [CLASSIFICATION.DISTRICT, 'isDistrict'],
      [CLASSIFICATION.WORSHIP_SERVICE, 'isWorshipService'],
      [CLASSIFICATION.CENTRAL_WORSHIP_SERVICE, 'isCentralWorshipService'],
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
      [CLASSIFICATION.REPRESENTATIVE_BODY, 'isRepresentativeBody'],
      [CLASSIFICATION.WELZIJNSVERENIGING, 'isOcmwAssociation'],
      [CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING, 'isOcmwAssociation'],
      [CLASSIFICATION.PEVA_MUNICIPALITY, 'isPevaMunicipality'],
      [CLASSIFICATION.PEVA_PROVINCE, 'isPevaProvince'],
    ].forEach(([cl, func]) => {
      test(`it should return false for ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'organization-classification-code',
          cl
        );
        const model = this.store().createRecord('organization', {
          classification,
        });

        const result = model[func];
        assert.notOk(result);
      });
    });

    Object.keys(CLASSIFICATION).forEach((cl) => {
      test(`it should return false for whether ${cl.label} has a central worship service`, async function (assert) {
        const classification = this.store().createRecord(
          'organization-classification-code',
          cl
        );
        const model = this.store().createRecord('organization', {
          classification,
        });

        const result = model.hasCentralWorshipService;
        assert.notOk(result);
      });
    });
  });

  module('abbName', function () {
    test('it should return the legal name when set', async function (assert) {
      const model = this.store().createRecord('organization', {
        legalName: 'some legal name',
      });

      assert.deepEqual(model.abbName, 'some legal name');
    });

    test('it should return the name when no legal name is set and there is no KBO organization', async function (assert) {
      const model = this.store().createRecord('organization', {
        name: 'some organization name',
      });

      assert.deepEqual(model.abbName, 'some organization name');
    });

    test('it should return the KBO organization name when no legal name is set', async function (assert) {
      const kboOrganizationModel = this.store().createRecord(
        'kboOrganization',
        {
          name: 'kbo organization',
        }
      );
      const model = this.store().createRecord('organization', {
        kboOrganization: kboOrganizationModel,
      });

      assert.deepEqual(model.abbName, 'kbo organization');
    });

    test('it should return the name when no legal name is set and KBO organization has no name', async function (assert) {
      const kboOrganizationModel = this.store().createRecord('kboOrganization');
      const model = this.store().createRecord('organization', {
        kboOrganization: kboOrganizationModel,
        name: 'some name',
      });

      assert.deepEqual(model.abbName, 'some name');
    });

    test('it should return the legal name even if a KBO organization and name are set', async function (assert) {
      const kboOrganizationModel = this.store().createRecord(
        'kboOrganization',
        {
          name: 'kbo organization',
        }
      );
      const model = this.store().createRecord('organization', {
        legalName: 'some legal name',
        name: 'some name',
        kboOrganization: kboOrganizationModel,
      });

      assert.deepEqual(model.abbName, 'some legal name');
    });
  });
});
