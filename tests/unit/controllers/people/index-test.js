import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import {
  MockUnitCurrentSessionService,
  MockWorshipCurrentSessionService,
  MockNoRoleCurrentSessionService,
} from 'frontend-organization-portal/tests/mock/mock-current-session-services';

module('Unit | Controller | people/index', function (hooks) {
  setupTest(hooks);

  test('Worship role', function (assert) {
    this.owner.register(
      'service:currentSession',
      MockWorshipCurrentSessionService
    );
    let controller = this.owner.lookup('controller:people/index');

    assert.equal(controller.classificationCodes.length, 2);
    // Compare as sets since order is not relevant
    assert.deepEqual(
      new Set(controller.classificationCodes),
      new Set([
        CLASSIFICATION_CODE.WORSHIP_SERVICE,
        CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
      ])
    );
  });

  test('Unit role', function (assert) {
    this.owner.register(
      'service:currentSession',
      MockUnitCurrentSessionService
    );
    let controller = this.owner.lookup('controller:people/index');

    assert.equal(controller.classificationCodes.length, 10);
    // Compare as sets since order is not relevant
    assert.deepEqual(
      new Set(controller.classificationCodes),
      new Set([
        CLASSIFICATION_CODE.MUNICIPALITY,
        CLASSIFICATION_CODE.OCMW,
        CLASSIFICATION_CODE.DISTRICT,
        CLASSIFICATION_CODE.PROVINCE,
        CLASSIFICATION_CODE.AGB,
        CLASSIFICATION_CODE.APB,
        CLASSIFICATION_CODE.PROJECTVERENIGING,
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      ])
    );
  });

  test('No role', function (assert) {
    this.owner.register(
      'service:currentSession',
      MockNoRoleCurrentSessionService
    );
    let controller = this.owner.lookup('controller:people/index');

    assert.equal(controller.classificationCodes.length, 0);
  });
});
