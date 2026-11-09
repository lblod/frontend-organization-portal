import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import IndexRoute from 'frontend-organization-portal/routes/organizations/organization/related-organizations/index';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { VLAAMSE_REGERING_ID } from 'frontend-organization-portal/constants/special-organizations';

module(
  'Unit | Route | organizations/organization/related-organizations/index',
  function (hooks) {
    setupTest(hooks);

    // The organizations routes are built into a lazy bundle (`splitAtRoutes`
    // in ember-cli-build.js), so the route must be registered before the
    // owner can look it up.
    hooks.beforeEach(function () {
      this.owner.register(
        'route:organizations/organization/related-organizations/index',
        IndexRoute,
      );
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    this.store = function () {
      return this.owner.lookup('service:store');
    };

    this.route = function () {
      return this.owner.lookup(
        'route:organizations/organization/related-organizations/index',
      );
    };

    const PARTICIPATES_IN = MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN;
    const IS_FOUNDER_OF = MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF;
    const HAS_RELATION_WITH = MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH;
    const PARAMS = { page: 0, size: 500 };

    /**
     * Push a municipality and its relations, as the queries of the route
     * would have loaded them. The municipality is a member of a running, an
     * ended, a future and a dissolved organization, and was founded by the
     * Vlaamse regering (a special organization).
     */
    function pushMunicipalityWithRelations(store) {
      const status = (id, label) => ({
        type: 'organization-status-code',
        id,
        attributes: { label },
      });
      const organization = (id, name, statusId) => ({
        type: 'organization',
        id,
        attributes: { name },
        relationships: {
          classification: {
            data: {
              type: 'administrative-unit-classification-code',
              id: CLASSIFICATION.MUNICIPALITY.id,
            },
          },
          organizationStatus: {
            data: { type: 'organization-status-code', id: statusId },
          },
        },
      });
      const role = (mapping) => ({
        type: 'membership-role',
        id: mapping.id,
        attributes: { label: mapping.label },
      });
      const membership = (id, { member, organization, role, period }) => ({
        type: 'membership',
        id,
        relationships: {
          member: { data: { type: 'organization', id: member } },
          organization: { data: { type: 'organization', id: organization } },
          role: { data: { type: 'membership-role', id: role.id } },
          during: {
            data: period
              ? { type: 'period-of-time', id: `${id}-period` }
              : null,
          },
        },
      });
      const periodOf = (id, attributes) => ({
        type: 'period-of-time',
        id: `${id}-period`,
        attributes,
      });

      const records = store.push({
        data: [
          status(ORGANIZATION_STATUS.ACTIVE, 'Actief'),
          status(ORGANIZATION_STATUS.INACTIVE, 'Niet actief'),
          {
            type: 'administrative-unit-classification-code',
            id: CLASSIFICATION.MUNICIPALITY.id,
            attributes: { label: CLASSIFICATION.MUNICIPALITY.label },
          },
          role(PARTICIPATES_IN),
          role(IS_FOUNDER_OF),
          role(HAS_RELATION_WITH),
          organization('municipality', 'Gemeente', ORGANIZATION_STATUS.ACTIVE),
          organization('running', 'Lopende', ORGANIZATION_STATUS.ACTIVE),
          organization('ended', 'Beëindigde', ORGANIZATION_STATUS.ACTIVE),
          organization('future', 'Toekomstige', ORGANIZATION_STATUS.ACTIVE),
          organization('dissolved', 'Ontbonden', ORGANIZATION_STATUS.INACTIVE),
          organization(
            VLAAMSE_REGERING_ID,
            'Vlaamse regering',
            ORGANIZATION_STATUS.ACTIVE,
          ),
          membership('m-running', {
            member: 'municipality',
            organization: 'running',
            role: PARTICIPATES_IN,
            period: true,
          }),
          periodOf('m-running', { startDate: new Date('2020-01-01') }),
          membership('m-ended', {
            member: 'municipality',
            organization: 'ended',
            role: PARTICIPATES_IN,
            period: true,
          }),
          periodOf('m-ended', {
            startDate: new Date('2010-01-01'),
            endDate: new Date('2015-12-31'),
          }),
          membership('m-future', {
            member: 'municipality',
            organization: 'future',
            role: PARTICIPATES_IN,
            period: true,
          }),
          periodOf('m-future', { startDate: new Date('2999-01-01') }),
          membership('m-dissolved', {
            member: 'municipality',
            organization: 'dissolved',
            role: PARTICIPATES_IN,
          }),
          membership('m-founder', {
            member: VLAAMSE_REGERING_ID,
            organization: 'municipality',
            role: IS_FOUNDER_OF,
          }),
        ],
      });
      const byId = (type, id) =>
        records.find(
          (record) => record.id === id && record.constructor.modelName === type,
        );
      return {
        municipality: byId('organization', 'municipality'),
        roles: [PARTICIPATES_IN, IS_FOUNDER_OF, HAS_RELATION_WITH].map(
          (mapping) => byId('membership-role', mapping.id),
        ),
        asMember: ['m-running', 'm-ended', 'm-future', 'm-dissolved'].map(
          (id) => byId('membership', id),
        ),
        asOrganization: [byId('membership', 'm-founder')],
      };
    }

    /**
     * Answer the membership queries of the route from the given lists and
     * return the queries it sent.
     */
    function stubQueries(store, { asMember, asOrganization }) {
      const queries = [];
      sinon.stub(store, 'request').callsFake(async ({ data }) => {
        queries.push(data.query);
        if (data.query['filter[member][:id:]']) {
          return { content: asMember };
        }
        if (data.query['filter[organization][:id:]']) {
          return { content: asOrganization };
        }
        return { content: [] };
      });
      return queries;
    }

    function setupRoute(context, { municipality, roles }) {
      const route = context.route();
      route.modelFor = () => ({
        organization: municipality,
        roles,
        selectableRoles: roles,
        selectableRoleLabels: [],
      });
      return route;
    }

    test('it lists the relations on both sides from the perspective of the organization', async function (assert) {
      const store = this.store();
      const { municipality, roles, asMember, asOrganization } =
        pushMunicipalityWithRelations(store);
      stubQueries(store, { asMember, asOrganization });
      const route = setupRoute(this, { municipality, roles });

      const model = await route.model(PARAMS);

      assert.strictEqual(model.organization, municipality);
      assert.deepEqual(
        model.relatedOrganizations.map((row) => ({
          role: row.role,
          type: row.organizationType,
          id: row.organizationId,
          name: row.organizationName,
          status: row.organizationStatus.label,
          special: row.isSpecialOrganization,
          startDate: row.startDate,
          endDate: row.endDate,
          relationStatus: row.relationStatus.label,
        })),
        [
          {
            role: 'Is lid van',
            type: 'Gemeente',
            id: 'running',
            name: 'Lopende',
            status: 'Actief',
            special: false,
            startDate: new Date('2020-01-01'),
            endDate: undefined,
            relationStatus: 'Actief',
          },
          {
            role: 'Is lid van',
            type: 'Gemeente',
            id: 'ended',
            name: 'Beëindigde',
            status: 'Actief',
            special: false,
            startDate: new Date('2010-01-01'),
            endDate: new Date('2015-12-31'),
            relationStatus: 'Niet actief',
          },
          {
            role: 'Is lid van',
            type: 'Gemeente',
            id: 'future',
            name: 'Toekomstige',
            status: 'Actief',
            special: false,
            startDate: new Date('2999-01-01'),
            endDate: undefined,
            relationStatus: 'Niet actief',
          },
          {
            role: 'Is lid van',
            type: 'Gemeente',
            id: 'dissolved',
            name: 'Ontbonden',
            status: 'Niet actief',
            special: false,
            startDate: undefined,
            endDate: undefined,
            relationStatus: 'Niet actief',
          },
          {
            role: 'Is opgericht door',
            type: 'Gemeente',
            id: VLAAMSE_REGERING_ID,
            name: 'Vlaamse regering',
            status: 'Actief',
            special: true,
            startDate: undefined,
            endDate: undefined,
            relationStatus: 'Actief',
          },
        ],
      );
    });

    test('it queries both sides with what the table shows when no role is selected', async function (assert) {
      const store = this.store();
      const { municipality, roles, asMember, asOrganization } =
        pushMunicipalityWithRelations(store);
      const queries = stubQueries(store, { asMember, asOrganization });
      const route = setupRoute(this, { municipality, roles });

      await route.model(PARAMS);

      assert.deepEqual(queries, [
        {
          'filter[member][:id:]': 'municipality',
          'filter[role][:id:]': undefined,
          'filter[organization][organization-status][:id:]': undefined,
          include:
            'role,during,organization.classification,organization.organization-status',
          page: { size: 500, number: 0 },
        },
        {
          'filter[organization][:id:]': 'municipality',
          'filter[role][:id:]': undefined,
          'filter[member][organization-status][:id:]': undefined,
          include:
            'role,during,member.classification,member.organization-status',
          page: { size: 500, number: 0 },
        },
      ]);
    });

    test('it only queries the side the selected role label implies', async function (assert) {
      const store = this.store();
      const { municipality, roles, asMember, asOrganization } =
        pushMunicipalityWithRelations(store);
      const queries = stubQueries(store, { asMember, asOrganization });
      const route = setupRoute(this, { municipality, roles });

      await route.model({ ...PARAMS, selectedRoleLabel: 'Is lid van' });

      assert.strictEqual(queries.length, 1);
      assert.strictEqual(queries[0]['filter[member][:id:]'], 'municipality');
      assert.strictEqual(queries[0]['filter[role][:id:]'], PARTICIPATES_IN.id);

      queries.length = 0;
      await route.model({ ...PARAMS, selectedRoleLabel: 'Is opgericht door' });

      assert.strictEqual(queries.length, 1);
      assert.strictEqual(
        queries[0]['filter[organization][:id:]'],
        'municipality',
      );
      assert.strictEqual(queries[0]['filter[role][:id:]'], IS_FOUNDER_OF.id);

      // The "has a relation with" role has no direction
      queries.length = 0;
      await route.model({
        ...PARAMS,
        selectedRoleLabel: 'Heeft een relatie met',
      });

      assert.strictEqual(queries.length, 2);
      assert.deepEqual(
        queries.map((query) => query['filter[role][:id:]']),
        [HAS_RELATION_WITH.id, HAS_RELATION_WITH.id],
      );
    });

    test('it asks the backend to leave out the relations with inactive organizations', async function (assert) {
      const store = this.store();
      const { municipality, roles, asMember, asOrganization } =
        pushMunicipalityWithRelations(store);
      const queries = stubQueries(store, { asMember, asOrganization });
      const route = setupRoute(this, { municipality, roles });

      await route.model({ ...PARAMS, organizationStatus: true });

      assert.strictEqual(
        queries[0]['filter[organization][organization-status][:id:]'],
        ORGANIZATION_STATUS.ACTIVE,
      );
      assert.strictEqual(
        queries[1]['filter[member][organization-status][:id:]'],
        ORGANIZATION_STATUS.ACTIVE,
      );
    });

    test('it sorts the rows on the requested column', async function (assert) {
      const store = this.store();
      const { municipality, roles, asMember, asOrganization } =
        pushMunicipalityWithRelations(store);
      stubQueries(store, { asMember, asOrganization });
      const route = setupRoute(this, { municipality, roles });

      const model = await route.model({ ...PARAMS, sort: '-start-date' });

      assert.deepEqual(
        model.relatedOrganizations.map((row) => row.organizationName),
        // Rows without start date come last, sorted by name
        [
          'Toekomstige',
          'Lopende',
          'Beëindigde',
          'Ontbonden',
          'Vlaamse regering',
        ],
      );
    });
  },
);
