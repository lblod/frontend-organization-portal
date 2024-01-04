import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  CLASSIFICATION,
  CLASSIFICATION_CODE,
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

    test('Assistence zone', function (assert) {
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

    test('Welzijnsvereniging', function (assert) {
      assert.ok(CLASSIFICATION_CODE.WELZIJNSVERENIGING);

      assert.strictEqual(
        CLASSIFICATION.WELZIJNSVERENIGING.id,
        CLASSIFICATION_CODE.WELZIJNSVERENIGING
      );
    });

    test('Autonome verzorgingsinstelling', function (assert) {
      assert.ok(CLASSIFICATION_CODE.AUTONOME_VERZORGINGSINSTELLING);

      assert.strictEqual(
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
        CLASSIFICATION_CODE.AUTONOME_VERZORGINGSINSTELLING
      );
    });
  }
);
