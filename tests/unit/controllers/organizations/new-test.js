/* eslint-disable warp-drive/no-legacy-request-patterns -- TODO: remove this once we have an alternative for peekRecord and peekAll */
import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import NewController from 'frontend-organization-portal/controllers/organizations/new';
import AbstractValidationModel from 'frontend-organization-portal/models/abstract-validation-model';
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
import { REGERING_CLASSIFICATION_ID } from 'frontend-organization-portal/constants/classification';
import {
  FEDERALE_REGERING_ID,
  VLAAMSE_REGERING_ID,
} from 'frontend-organization-portal/constants/special-organizations';

module('Unit | Controller | organizations/new', function (hooks) {
  setupTest(hooks);

  // The organizations routes are built into a lazy bundle (`splitAtRoutes`
  // in ember-cli-build.js), so the controller must be registered before the
  // owner can look it up.
  hooks.beforeEach(function () {
    this.owner.register('controller:organizations/new', NewController);
  });

  hooks.afterEach(function () {
    sinon.restore();
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

    /**
     * Push a persisted, active "Regering"-classified government, as the save
     * task fetches it for the autofill types.
     */
    function pushGovernment(store, governmentId) {
      const [, , government] = store.push({
        data: [
          {
            type: 'organization-status-code',
            id: ORGANIZATION_STATUS.ACTIVE,
            attributes: { label: 'Actief' },
          },
          {
            type: 'administrative-unit-classification-code',
            id: REGERING_CLASSIFICATION_ID,
            attributes: { label: 'Regering' },
          },
          {
            type: 'organization',
            id: governmentId,
            relationships: {
              classification: {
                data: {
                  type: 'administrative-unit-classification-code',
                  id: REGERING_CLASSIFICATION_ID,
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
        ],
      });
      return government;
    }

    const MAATSCHAPPELIJKE_ZETEL_ID = 'f1381723dec42c0b6ba6492e41d6f5dd';

    /**
     * Run the save task to its end with contact data editing on, which an
     * IGS or a gemeente needs to save its primary site. Validation is skipped
     * and the adapter answers every request, so no backend is needed.
     */
    async function saveWithContactData(owner, controller) {
      owner.lookup('service:features').setup({ 'edit-contact-data': true });
      sinon.stub(AbstractValidationModel.prototype, 'validate').resolves(true);

      const adapter = owner.lookup('adapter:application');
      sinon.stub(adapter, 'findAll').resolves({
        data: [
          {
            type: 'site-type',
            id: MAATSCHAPPELIJKE_ZETEL_ID,
            attributes: { label: 'Maatschappelijke zetel' },
          },
        ],
      });
      let nextId = 0;
      sinon
        .stub(adapter, 'createRecord')
        .callsFake(async (store, modelClass, snapshot) => ({
          data: {
            type: snapshot.modelName,
            id: `new-${snapshot.modelName}-${++nextId}`,
          },
        }));
      sinon.stub(window, 'fetch').resolves(new Response(null, { status: 204 }));
      sinon.stub(owner.lookup('service:router'), 'replaceWith');

      await controller.createOrganizationTask.perform({
        preventDefault() {},
      });
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

    // The save task autofills the founder and recognizer memberships with
    // the government of the type: the Federale regering for a politiezone,
    // the Vlaamse regering for a zorgraad.
    [
      [CLASSIFICATION.POLICE_ZONE, 'administrative-unit', FEDERALE_REGERING_ID],
      [CLASSIFICATION.ZORGRAAD, 'registered-organization', VLAAMSE_REGERING_ID],
    ].forEach(([classification, modelName, governmentId]) => {
      test(`it autofills the government memberships for a ${classification.label}`, async function (assert) {
        const store = this.store();
        const controller = this.controller();
        setupController(store, controller, modelName, classification);
        const government = pushGovernment(store, governmentId);

        // The save task fetches the government with
        // store.request(findRecord(...)), which hits the adapter even with
        // the record in the store: serve the pushed government from the
        // adapter instead of the network.
        this.owner.lookup('adapter:application').findRecord = () => ({
          data: { type: 'organizations', id: governmentId },
        });

        // The save stops on the validations of the unfinished organization;
        // the two autofilled memberships are what is asserted here.
        await controller.createOrganizationTask.perform({
          preventDefault() {},
        });

        assert.strictEqual(controller.memberships.length, 2);
        const [founderMembership, recognitionMembership] =
          controller.memberships;
        assert.strictEqual(
          founderMembership.belongsTo('role').id(),
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id,
        );
        assert.strictEqual(
          founderMembership.belongsTo('member').value(),
          government,
        );
        assert.strictEqual(
          founderMembership.belongsTo('organization').value(),
          controller.currentOrganizationModel,
        );
        assert.strictEqual(
          recognitionMembership.belongsTo('role').id(),
          MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO.id,
        );
        assert.strictEqual(
          recognitionMembership.belongsTo('member').value(),
          government,
        );
        assert.strictEqual(
          recognitionMembership.belongsTo('organization').value(),
          controller.currentOrganizationModel,
        );
      });
    });

    test('it gives the primary site of a new IGS the Maatschappelijke zetel type', async function (assert) {
      const store = this.store();
      const controller = this.controller();
      setupController(
        store,
        controller,
        'administrative-unit',
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
      );

      await saveWithContactData(this.owner, controller);

      const { primarySite } = controller.model;
      assert.false(primarySite.isNew, 'the primary site is saved');
      assert.strictEqual(
        primarySite.belongsTo('siteType').id(),
        MAATSCHAPPELIJKE_ZETEL_ID,
      );
    });

    test('it gives the primary site of a new gemeente no site type', async function (assert) {
      const store = this.store();
      const controller = this.controller();
      setupController(
        store,
        controller,
        'administrative-unit',
        CLASSIFICATION.MUNICIPALITY,
      );

      await saveWithContactData(this.owner, controller);

      const { primarySite } = controller.model;
      assert.false(primarySite.isNew, 'the primary site is saved');
      assert.strictEqual(primarySite.belongsTo('siteType').id(), null);
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

  module('setMunicipality', function () {
    function pushMunicipality(store, id, scope) {
      const [municipality] = store.push({
        data: [
          {
            type: 'administrative-unit',
            id,
            relationships: {
              organizationStatus: {
                data: {
                  type: 'organization-status-code',
                  id: ORGANIZATION_STATUS.ACTIVE,
                },
              },
              scope: { data: scope ? { type: 'location', id: scope } : null },
            },
          },
          {
            type: 'organization-status-code',
            id: ORGANIZATION_STATUS.ACTIVE,
            attributes: { label: 'Actief' },
          },
          ...(scope ? [{ type: 'location', id: scope }] : []),
        ],
      });
      return municipality;
    }

    function pushProvince(store, id) {
      return store.push({ data: { type: 'administrative-unit', id } });
    }

    test('it looks up the province of the municipality of an AGB through the werkingsgebied of the municipality', async function (assert) {
      const store = this.store();
      const controller = this.controller();
      setupController(
        store,
        controller,
        'administrative-unit',
        CLASSIFICATION.AGB,
      );
      const municipality = pushMunicipality(
        store,
        'municipality',
        'municipality-location',
      );
      const province = pushProvince(store, 'province');
      const request = sinon
        .stub(store, 'request')
        .resolves({ content: [province] });

      await controller.setMunicipality(municipality);

      assert.strictEqual(request.callCount, 1);
      const [{ op, data }] = request.firstCall.args;
      assert.strictEqual(op, 'query');
      assert.strictEqual(data.type, 'administrative-unit');
      assert.deepEqual(data.query, {
        filter: {
          classification: { id: CLASSIFICATION.PROVINCE.id },
          scope: { locations: { id: 'municipality-location' } },
        },
      });
      assert.strictEqual(controller.province?.id, 'province');
      assert.deepEqual(
        controller.founders.map(({ id }) => id),
        ['municipality'],
      );
    });

    test('it does not query the provinces for a municipality without werkingsgebied', async function (assert) {
      const store = this.store();
      const controller = this.controller();
      setupController(
        store,
        controller,
        'administrative-unit',
        CLASSIFICATION.AGB,
      );
      const municipality = pushMunicipality(store, 'municipality', null);
      const request = sinon.stub(store, 'request').resolves({ content: [] });

      await controller.setMunicipality(municipality);

      assert.strictEqual(request.callCount, 0);
      assert.strictEqual(controller.province, undefined);
      assert.deepEqual(
        controller.founders.map(({ id }) => id),
        ['municipality'],
      );
    });

    test('it keeps the province of the last municipality when an earlier lookup finishes later', async function (assert) {
      const store = this.store();
      const controller = this.controller();
      setupController(
        store,
        controller,
        'administrative-unit',
        CLASSIFICATION.AGB,
      );
      const first = pushMunicipality(store, 'first', 'first-location');
      const second = pushMunicipality(store, 'second', 'second-location');
      const firstProvince = pushProvince(store, 'first-province');
      const secondProvince = pushProvince(store, 'second-province');
      let answerFirst;
      const firstAnswer = new Promise((resolve) => (answerFirst = resolve));
      sinon
        .stub(store, 'request')
        .callsFake(({ data }) =>
          data.query.filter.scope.locations.id === 'first-location'
            ? firstAnswer
            : Promise.resolve({ content: [secondProvince] }),
        );

      const firstLookup = controller.setMunicipality(first);
      await controller.setMunicipality(second);
      answerFirst({ content: [firstProvince] });
      await firstLookup;

      assert.strictEqual(controller.province?.id, 'second-province');
      assert.deepEqual(
        controller.founders.map(({ id }) => id),
        ['second'],
      );
    });
  });
});
