import {
  selectByRole,
  getClassificationIdsForRole,
} from 'frontend-organization-portal/utils/classification-identifiers';
import { module, test } from 'qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

module('Unit | Utility | classification-identifiers', function () {
  module('selectByRole', function () {
    test('it returns a string of all worship classification code ids for worship role', function (assert) {
      let result = selectByRole(true);
      assert.deepEqual(
        result,
        `${CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id}, ${CLASSIFICATION.WORSHIP_SERVICE.id}, ${CLASSIFICATION.REPRESENTATIVE_BODY.id}`
      );
    });

    test('it returns a list for all non-worship classifications code ids when called without argument', function (assert) {
      const result = selectByRole();
      assert.deepEqual(
        result,
        `${CLASSIFICATION.AGB.id}, ${CLASSIFICATION.APB.id}, ${CLASSIFICATION.MUNICIPALITY.id}, ${CLASSIFICATION.PROVINCE.id}, ${CLASSIFICATION.OCMW.id}, ${CLASSIFICATION.DISTRICT.id}, ${CLASSIFICATION.PROJECTVERENIGING.id}, ${CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id}, ${CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id}, ${CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id}, ${CLASSIFICATION.POLICE_ZONE.id}, ${CLASSIFICATION.ASSISTANCE_ZONE.id}, ${CLASSIFICATION.WELZIJNSVERENIGING.id}, ${CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id}, ${CLASSIFICATION.PEVA_MUNICIPALITY.id}, ${CLASSIFICATION.PEVA_PROVINCE.id}, ${CLASSIFICATION.ZIEKENHUISVERENIGING.id}, ${CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id}, ${CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id}, ${CLASSIFICATION.ASSOCIATION_OTHER.id}, ${CLASSIFICATION.CORPORATION_OTHER.id}`
      );
    });

    test('it returns a list for all non-worship classifications code ids when called with falsy argument', function (assert) {
      const result = selectByRole(false);
      assert.deepEqual(
        result,
        `${CLASSIFICATION.AGB.id}, ${CLASSIFICATION.APB.id}, ${CLASSIFICATION.MUNICIPALITY.id}, ${CLASSIFICATION.PROVINCE.id}, ${CLASSIFICATION.OCMW.id}, ${CLASSIFICATION.DISTRICT.id}, ${CLASSIFICATION.PROJECTVERENIGING.id}, ${CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id}, ${CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id}, ${CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id}, ${CLASSIFICATION.POLICE_ZONE.id}, ${CLASSIFICATION.ASSISTANCE_ZONE.id}, ${CLASSIFICATION.WELZIJNSVERENIGING.id}, ${CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id}, ${CLASSIFICATION.PEVA_MUNICIPALITY.id}, ${CLASSIFICATION.PEVA_PROVINCE.id}, ${CLASSIFICATION.ZIEKENHUISVERENIGING.id}, ${CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id}, ${CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id}, ${CLASSIFICATION.ASSOCIATION_OTHER.id}, ${CLASSIFICATION.CORPORATION_OTHER.id}`
      );
    });
  });

  module('getClassificationIdsForRole', function () {
    test('it includes all worship classification code ids for worship role', function (assert) {
      const result = getClassificationIdsForRole(true);

      assert.deepEqual(
        [
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
          CLASSIFICATION.WORSHIP_SERVICE.id,
          CLASSIFICATION.REPRESENTATIVE_BODY.id,
        ].sort(),
        result.sort()
      );
    });

    test('it includes all worship classification code ids for worship role when not restricted to creation', function (assert) {
      const result = getClassificationIdsForRole(true, false);

      assert.deepEqual(
        [
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
          CLASSIFICATION.WORSHIP_SERVICE.id,
          CLASSIFICATION.REPRESENTATIVE_BODY.id,
        ].sort(),
        result.sort()
      );
    });

    test('it does not include representative body classification id when restricted for creation', function (assert) {
      const result = getClassificationIdsForRole(true, true);

      assert.deepEqual(
        [
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
          CLASSIFICATION.WORSHIP_SERVICE.id,
        ].sort(),
        result.sort()
      );

      assert.notOk(result.includes(CLASSIFICATION.REPRESENTATIVE_BODY.id));
    });

    test('it returns a list for all includes all non-worship classifications code ids when called with falsy argument', function (assert) {
      const result = getClassificationIdsForRole(false);

      assert.deepEqual(
        [
          CLASSIFICATION.AGB.id,
          CLASSIFICATION.APB.id,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.PROVINCE.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.DISTRICT.id,
          CLASSIFICATION.PROJECTVERENIGING.id,
          CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
          CLASSIFICATION.POLICE_ZONE.id,
          CLASSIFICATION.ASSISTANCE_ZONE.id,
          CLASSIFICATION.WELZIJNSVERENIGING.id,
          CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
          CLASSIFICATION.PEVA_MUNICIPALITY.id,
          CLASSIFICATION.PEVA_PROVINCE.id,
          CLASSIFICATION.ZIEKENHUISVERENIGING.id,
          CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
            .id,
          CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ].sort(),
        result.sort()
      );

      assert.notOk(result.includes(CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.REPRESENTATIVE_BODY.id));
    });

    test('it should exclude organizations that cannot be created', function (assert) {
      let result = getClassificationIdsForRole(false, true);
      assert.deepEqual(
        [
          CLASSIFICATION.AGB.id,
          CLASSIFICATION.APB.id,
          CLASSIFICATION.DISTRICT.id,
          CLASSIFICATION.PROJECTVERENIGING.id,
          CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
          CLASSIFICATION.POLICE_ZONE.id,
          CLASSIFICATION.ASSISTANCE_ZONE.id,
          CLASSIFICATION.WELZIJNSVERENIGING.id,
          CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
          CLASSIFICATION.PEVA_MUNICIPALITY.id,
          CLASSIFICATION.PEVA_PROVINCE.id,
          CLASSIFICATION.ZIEKENHUISVERENIGING.id,
          CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
            .id,
          CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ].sort(),
        result.sort()
      );

      assert.notOk(result.includes(CLASSIFICATION.MUNICIPALITY.id));
      assert.notOk(result.includes(CLASSIFICATION.PROVINCE.id));
      assert.notOk(result.includes(CLASSIFICATION.OCMW.id));

      assert.notOk(result.includes(CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.REPRESENTATIVE_BODY.id));
    });

    test('it returns a list for all non-worship classifications code ids when called without argument', function (assert) {
      let result = getClassificationIdsForRole();

      assert.deepEqual(
        [
          CLASSIFICATION.AGB.id,
          CLASSIFICATION.APB.id,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.PROVINCE.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.DISTRICT.id,
          CLASSIFICATION.PROJECTVERENIGING.id,
          CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
          CLASSIFICATION.POLICE_ZONE.id,
          CLASSIFICATION.ASSISTANCE_ZONE.id,
          CLASSIFICATION.WELZIJNSVERENIGING.id,
          CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
          CLASSIFICATION.PEVA_MUNICIPALITY.id,
          CLASSIFICATION.PEVA_PROVINCE.id,
          CLASSIFICATION.ZIEKENHUISVERENIGING.id,
          CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
            .id,
          CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ].sort(),
        result.sort()
      );

      assert.notOk(result.includes(CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.WORSHIP_SERVICE.id));
      assert.notOk(result.includes(CLASSIFICATION.REPRESENTATIVE_BODY.id));
    });
  });
});
