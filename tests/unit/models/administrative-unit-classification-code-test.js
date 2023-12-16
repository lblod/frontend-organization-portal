import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  CLASSIFICATION,
  listClassificationCodes,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';

module(
  'Unit | Model | administrative unit classification code',
  function (hooks) {
    setupTest(hooks);

    test('should return all non-worship classification codes', function (assert) {
      let codes = listClassificationCodes();
      assert.equal(
        codes.length,
        12,
        'There should be 12 classification codes.'
      );
      assert.deepEqual(
        new Set(codes),
        new Set([
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.PROVINCE.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.DISTRICT.id,
          CLASSIFICATION.AGB.id,
          CLASSIFICATION.APB.id,
          CLASSIFICATION.PROJECTVERENIGING.id,
          CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
          CLASSIFICATION.POLICE_ZONE.id,
          CLASSIFICATION.ASSISTANCE_ZONE.id,
        ]),
        'Result should contain all non-worship classification codes'
      );
    });

    test('should return all worship classification codes', function (assert) {
      let codes = listClassificationCodes(true);

      assert.equal(codes.length, 3, 'There should be 3 classification codes.');
      assert.deepEqual(
        new Set(codes),
        new Set([
          CLASSIFICATION.WORSHIP_SERVICE.id,
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
          CLASSIFICATION.REPRESENTATIVE_ORGAN.id,
        ]),
        'Result should contain all worship classification codes'
      );
    });
  }
);
