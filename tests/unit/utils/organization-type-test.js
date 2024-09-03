import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { getOrganizationTypes } from 'frontend-organization-portal/utils/organization-type';
import { ORGANIZATION_TYPES } from 'frontend-organization-portal/constants/organization-types';

module('Unit | Utility | organization-type', function (hooks) {
  setupTest(hooks);

  module('getOrganizationTypes', function () {
    test('it returns an empty list when no classifications are provided', async function (assert) {
      const result = getOrganizationTypes();
      assert.deepEqual(result, []);
    });

    [
      CLASSIFICATION.MUNICIPALITY,
      CLASSIFICATION.PROVINCE,
      CLASSIFICATION.OCMW,
      CLASSIFICATION.DISTRICT,
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
      CLASSIFICATION.AGB,
      CLASSIFICATION.APB,
      CLASSIFICATION.PROJECTVERENIGING,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION.POLICE_ZONE,
      CLASSIFICATION.ASSISTANCE_ZONE,
      CLASSIFICATION.WELZIJNSVERENIGING,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
      CLASSIFICATION.PEVA_MUNICIPALITY,
      CLASSIFICATION.PEVA_PROVINCE,
    ].forEach((cl) => {
      test(`it returns the administrative unit organization type for ${cl.label}`, async function (assert) {
        const result = getOrganizationTypes(cl.id);
        assert.deepEqual(result, [ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT]);
      });
    });

    [
      CLASSIFICATION.ZIEKENHUISVERENIGING,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
      CLASSIFICATION.ASSOCIATION_OTHER,
    ].forEach((cl) => {
      test(`it returns the association organization type for ${cl.label}`, async function (assert) {
        const result = getOrganizationTypes(cl.id);
        assert.deepEqual(result, [ORGANIZATION_TYPES.ASSOCIATION]);
      });
    });

    [CLASSIFICATION.CORPORATION_OTHER].forEach((cl) => {
      test(`it returns the corporation organization type for ${cl.label}`, async function (assert) {
        const result = getOrganizationTypes(cl.id);
        assert.deepEqual(result, [ORGANIZATION_TYPES.CORPORATION]);
      });
    });

    test('it returns the administrative unit organization type when only provided administrative unit classifications', async function (assert) {
      const result = getOrganizationTypes(
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION.PROVINCE.id,
        CLASSIFICATION.OCMW.id,
      );
      assert.deepEqual(result, [ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT]);
    });

    test(`it returns the association organization type when only provided association classifications`, async function (assert) {
      const result = getOrganizationTypes(
        CLASSIFICATION.ZIEKENHUISVERENIGING.id,
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
          .id,
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
        CLASSIFICATION.ASSOCIATION_OTHER.id,
      );
      assert.deepEqual(result, [ORGANIZATION_TYPES.ASSOCIATION]);
    });

    test('it returns the administrative unit and association organization types when provided classifications for both', async function (assert) {
      const result = getOrganizationTypes(
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION.ZIEKENHUISVERENIGING.id,
      );
      assert.deepEqual(
        result.sort(),
        [
          ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
          ORGANIZATION_TYPES.ASSOCIATION,
        ].sort(),
      );
    });

    test('it returns the administrative unit and corporation organization types when provided classifications for both', async function (assert) {
      const result = getOrganizationTypes(
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION.CORPORATION_OTHER.id,
      );
      assert.deepEqual(
        result.sort(),
        [
          ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
          ORGANIZATION_TYPES.CORPORATION,
        ].sort(),
      );
    });

    test('it returns all organization types when provided classifications for each', async function (assert) {
      const result = getOrganizationTypes(
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION.CORPORATION_OTHER.id,
        CLASSIFICATION.ZIEKENHUISVERENIGING.id,
      );
      assert.deepEqual(
        result.sort(),
        [
          ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
          ORGANIZATION_TYPES.ASSOCIATION,
          ORGANIZATION_TYPES.CORPORATION,
        ].sort(),
      );
    });
  });
});
