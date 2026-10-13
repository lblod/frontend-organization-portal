/* eslint-disable warp-drive/no-legacy-request-patterns -- TODO: remove this once we have an alternative for peekRecord and peekAll */
import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import NewController from 'frontend-organization-portal/controllers/organizations/new';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import {
  MEMBERSHIP_ROLES,
  MEMBERSHIP_ROLES_MAPPING,
} from 'frontend-organization-portal/models/membership-role';

module('Unit | Controller | organizations/new', function (hooks) {
  setupTest(hooks);

  // The organizations routes are built into a lazy bundle (`splitAtRoutes`
  // in ember-cli-build.js), so the controller must be registered before the
  // owner can look it up.
  hooks.beforeEach(function () {
    this.owner.register('controller:organizations/new', NewController);
  });

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  this.controller = function () {
    return this.owner.lookup('controller:organizations/new');
  };

  /**
   * Set up the controller as the new route does, for an unsaved organization
   * of the given model and classification.
   */
  function setupController(store, controller, modelName, classification) {
    const roles = MEMBERSHIP_ROLES.map((role) =>
      store.push({
        data: {
          type: 'membership-role',
          id: role.id,
          attributes: { label: role.label },
        },
      }),
    );

    controller.set(
      'currentOrganizationModel',
      store.createRecord(modelName, {
        classification: store.createRecord(
          'administrative-unit-classification-code',
          classification,
        ),
      }),
    );

    const structuredIdentifierKBO = store.createRecord('structured-identifier');
    const structuredIdentifierSharepoint = store.createRecord(
      'structured-identifier',
    );

    controller.set('model', {
      primarySite: store.createRecord('site'),
      address: store.createRecord('address', { country: 'België' }),
      contact: createPrimaryContact(store),
      secondaryContact: createSecondaryContact(store),
      identifierKBO: store.createRecord('identifier', {
        idName: ID_NAME.KBO,
        structuredIdentifier: structuredIdentifierKBO,
      }),
      structuredIdentifierKBO,
      identifierSharepoint: store.createRecord('identifier', {
        idName: ID_NAME.SHAREPOINT,
        structuredIdentifier: structuredIdentifierSharepoint,
      }),
      structuredIdentifierSharepoint,
      roles,
    });
  }

  module('createOrganizationTask', function () {
    /**
     * Push persisted, active organizations of the given classifications, as
     * the organization selects on the create form offer them.
     */
    function pushPickedOrganizations(store, classifications) {
      const data = [
        {
          type: 'organization-status-code',
          id: ORGANIZATION_STATUS.ACTIVE,
          attributes: { label: 'Actief' },
        },
      ];
      for (const [index, classification] of classifications.entries()) {
        data.push(
          {
            type: 'administrative-unit-classification-code',
            id: classification.id,
            attributes: { label: classification.label },
          },
          {
            type: 'administrative-unit',
            id: `organization-${index}`,
            relationships: {
              classification: {
                data: {
                  type: 'administrative-unit-classification-code',
                  id: classification.id,
                },
              },
              organizationStatus: {
                data: {
                  type: 'organization-status-code',
                  id: ORGANIZATION_STATUS.ACTIVE,
                },
              },
            },
          },
        );
      }
      store.push({ data });
      return classifications.map((_, index) =>
        store.peekRecord('administrative-unit', `organization-${index}`),
      );
    }

    test('it saves a member-side field on the membershipsOfOrganizations and an organization-side field on the memberships', async function (assert) {
      const store = this.store();
      const controller = this.controller();
      setupController(
        store,
        controller,
        'registered-organization',
        // A non-autofill classification: its save task fetches no government.
        CLASSIFICATION.ANDERE,
      );
      const [regionaalZorgplatform, municipality] = pushPickedOrganizations(
        store,
        [CLASSIFICATION.REGIONAAL_ZORGPLATFORM, CLASSIFICATION.MUNICIPALITY],
      );

      // The "Andere" being created is a member of the regionaal zorgplatform
      // ("Is lid van") and the organization side of its members
      // ("Heeft als leden").
      const fields = controller.membershipFields;
      const memberSideField = fields.find((field) => field.asMember);
      const organizationSideField = fields.find((field) => !field.asMember);
      controller.setOrganizationForField(
        memberSideField,
        regionaalZorgplatform,
      );
      controller.setOrganizationForField(organizationSideField, municipality);

      // The save stops on the validations of the unfinished organization;
      // the memberships it built are what is asserted here.
      await controller.createOrganizationTask.perform({
        preventDefault() {},
      });

      assert.strictEqual(controller.membershipsOfOrganizations.length, 1);
      const memberSideMembership = controller.membershipsOfOrganizations[0];
      assert.strictEqual(
        memberSideMembership.belongsTo('role').id(),
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
      );
      assert.strictEqual(
        memberSideMembership.belongsTo('member').value(),
        controller.currentOrganizationModel,
      );
      assert.strictEqual(
        memberSideMembership.belongsTo('organization').value(),
        regionaalZorgplatform,
      );

      assert.strictEqual(controller.memberships.length, 1);
      const organizationSideMembership = controller.memberships[0];
      assert.strictEqual(
        organizationSideMembership.belongsTo('role').id(),
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
      );
      assert.strictEqual(
        organizationSideMembership.belongsTo('organization').value(),
        controller.currentOrganizationModel,
      );
      assert.strictEqual(
        organizationSideMembership.belongsTo('member').value(),
        municipality,
      );
    });
  });

  module('containsRequiredFields', function () {
    test('it is false for a type whose related-organization fields are all optional', function (assert) {
      const controller = this.controller();
      setupController(
        this.store(),
        controller,
        'registered-organization',
        CLASSIFICATION.WOONMAATSCHAPPIJ,
      );

      assert.false(controller.containsRequiredFields);
    });

    test('it is true for a type with a required related-organization field', function (assert) {
      const controller = this.controller();
      setupController(
        this.store(),
        controller,
        'registered-organization',
        CLASSIFICATION.ZORGRAAD,
      );

      assert.true(controller.containsRequiredFields);
    });

    test('it is true for worship, whose representative body is required', function (assert) {
      const controller = this.controller();
      setupController(
        this.store(),
        controller,
        'worship-service',
        CLASSIFICATION.WORSHIP_SERVICE,
      );

      assert.true(controller.containsRequiredFields);
    });
  });
});
