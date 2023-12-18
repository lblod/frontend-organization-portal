import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  CLASSIFICATION,
  CLASSIFICATION_CODE,
  listClassificationCodes,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';

module(
  'Unit | Model | administrative unit classification code',
  function (hooks) {
    setupTest(hooks);

    test('Municipality', function (assert) {
      assert.ok(CLASSIFICATION_CODE.MUNICIPALITY);

      assert.strictEqual(
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION_CODE.MUNICIPALITY
      );
    });

    test('Province', function (assert) {
      assert.ok(CLASSIFICATION_CODE.PROVINCE);

      assert.strictEqual(
        CLASSIFICATION.PROVINCE.id,
        CLASSIFICATION_CODE.PROVINCE
      );
    });

    test('OCMW', function (assert) {
      assert.ok(CLASSIFICATION_CODE.OCMW);

      assert.strictEqual(CLASSIFICATION.OCMW.id, CLASSIFICATION_CODE.OCMW);
    });

    test('District', function (assert) {
      assert.ok(CLASSIFICATION_CODE.DISTRICT);

      assert.strictEqual(
        CLASSIFICATION.DISTRICT.id,
        CLASSIFICATION_CODE.DISTRICT
      );
    });

    test('Worship service', function (assert) {
      assert.ok(CLASSIFICATION_CODE.WORSHIP_SERVICE);

      assert.strictEqual(
        CLASSIFICATION.WORSHIP_SERVICE.id,
        CLASSIFICATION_CODE.WORSHIP_SERVICE
      );
    });

    test('Central worship service', function (assert) {
      assert.ok(CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE);

      assert.strictEqual(
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
        CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
      );
    });

    test('AGB', function (assert) {
      assert.ok(CLASSIFICATION_CODE.AGB);

      assert.strictEqual(CLASSIFICATION.AGB.id, CLASSIFICATION_CODE.AGB);
    });

    test('APB', function (assert) {
      assert.ok(CLASSIFICATION_CODE.APB);

      assert.strictEqual(CLASSIFICATION.APB.id, CLASSIFICATION_CODE.APB);
    });

    test('Projectvereniging', function (assert) {
      assert.ok(CLASSIFICATION_CODE.PROJECTVERENIGING);

      assert.strictEqual(
        CLASSIFICATION.PROJECTVERENIGING.id,
        CLASSIFICATION_CODE.PROJECTVERENIGING
      );
    });

    test('Dienstverlenende vereniging', function (assert) {
      assert.ok(CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING);

      assert.strictEqual(
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING
      );
    });

    test('Opdrachthoudende vereniging', function (assert) {
      assert.ok(CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING);

      assert.strictEqual(
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING
      );
    });

    test('Opdrachthoudende_Vereniging_Met_Private_Deelname', function (assert) {
      assert.ok(
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
      );

      assert.strictEqual(
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
      );
    });

    test('Police zone', function (assert) {
      assert.ok(CLASSIFICATION_CODE.POLICE_ZONE);

      assert.strictEqual(
        CLASSIFICATION.POLICE_ZONE.id,
        CLASSIFICATION_CODE.POLICE_ZONE
      );
    });

    test('Assistance zone', function (assert) {
      assert.ok(CLASSIFICATION_CODE.ASSISTANCE_ZONE);

      assert.strictEqual(
        CLASSIFICATION.ASSISTANCE_ZONE.id,
        CLASSIFICATION_CODE.ASSISTANCE_ZONE
      );
    });

    test('Representative organ', function (assert) {
      assert.ok(CLASSIFICATION_CODE.REPRESENTATIVE_ORGAN);

      assert.strictEqual(
        CLASSIFICATION.REPRESENTATIVE_ORGAN.id,
        CLASSIFICATION_CODE.REPRESENTATIVE_ORGAN
      );
    });

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
