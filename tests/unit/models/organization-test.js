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
      console.log(model.error);
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
});
