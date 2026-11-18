import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import EditController from 'frontend-organization-portal/controllers/organizations/organization/governing-bodies/governing-body/edit';

module(
  'Unit | Controller | organizations/organization/governing-bodies/governing-body/edit',
  function (hooks) {
    setupTest(hooks);

    const controllerName =
      'controller:organizations/organization/governing-bodies/governing-body/edit';

    // The organizations routes are built into a lazy bundle (`splitAtRoutes`
    // in ember-cli-build.js), so the controller must be registered before the
    // owner can look it up.
    hooks.beforeEach(function () {
      this.owner.register(controllerName, EditController);
    });

    /**
     * Point the controller at an organization as the route chain would have
     * loaded it, and return the controller.
     */
    function setupController(owner, { modelName, classification, statusId }) {
      const store = owner.lookup('service:store');
      const organization = store.createRecord(modelName, {
        classification: store.createRecord(
          'administrative-unit-classification-code',
          classification,
        ),
        organizationStatus: store.createRecord('organization-status-code', {
          id: statusId,
        }),
      });

      const controller = owner.lookup(controllerName);
      controller.model = { organization };
      return controller;
    }

    test('it makes the end date optional for a worship service in formation', function (assert) {
      const controller = setupController(this.owner, {
        modelName: 'worship-service',
        classification: CLASSIFICATION.WORSHIP_SERVICE,
        statusId: ORGANIZATION_STATUS.IN_FORMATION,
      });

      assert.true(controller.endDateOptional);
    });

    test('it keeps the end date required for an established worship service', function (assert) {
      const controller = setupController(this.owner, {
        modelName: 'worship-service',
        classification: CLASSIFICATION.WORSHIP_SERVICE,
        statusId: ORGANIZATION_STATUS.ACTIVE,
      });

      assert.false(controller.endDateOptional);
    });

    test('it keeps the end date required for a central worship service in formation', function (assert) {
      const controller = setupController(this.owner, {
        modelName: 'central-worship-service',
        classification: CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
        statusId: ORGANIZATION_STATUS.IN_FORMATION,
      });

      assert.false(controller.endDateOptional);
    });

    test('it keeps the end date required for an organization in formation that is not a worship service', function (assert) {
      const controller = setupController(this.owner, {
        modelName: 'administrative-unit',
        classification: CLASSIFICATION.MUNICIPALITY,
        statusId: ORGANIZATION_STATUS.IN_FORMATION,
      });

      assert.false(controller.endDateOptional);
    });
  },
);
