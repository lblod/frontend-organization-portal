import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import RelatedOrganizationsRoute from 'frontend-organization-portal/routes/organizations/organization/related-organizations';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import {
  MEMBERSHIP_ROLES,
  MEMBERSHIP_ROLES_MAPPING,
} from 'frontend-organization-portal/models/membership-role';

module(
  'Unit | Route | organizations/organization/related-organizations',
  function (hooks) {
    setupTest(hooks);

    // The organizations routes are built into a lazy bundle (`splitAtRoutes`
    // in ember-cli-build.js), so the route must be registered before the
    // owner can look it up.
    hooks.beforeEach(function () {
      this.owner.register(
        'route:organizations/organization/related-organizations',
        RelatedOrganizationsRoute,
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
        'route:organizations/organization/related-organizations',
      );
    };

    const { HAS_RELATION_WITH, GRANTS_RECOGNITION_TO, IS_FOUNDER_OF } =
      MEMBERSHIP_ROLES_MAPPING;

    // Labels the rules allow for a municipality, in display order
    const MUNICIPALITY_LABELS = [
      'Is lid van',
      'Is feitelijk vertegenwoordigd in (niet lidmaatschap)',
      'Is oprichter van',
      'Wordt bediend door',
    ];

    /**
     * Push a municipality and every membership role, as the parent route and
     * this route would have loaded them.
     */
    function pushMunicipalityAndRoles(store) {
      const [, municipality, ...roles] = store.push({
        data: [
          {
            type: 'administrative-unit-classification-code',
            id: CLASSIFICATION.MUNICIPALITY.id,
            attributes: { label: CLASSIFICATION.MUNICIPALITY.label },
          },
          {
            type: 'administrative-unit',
            id: 'municipality',
            attributes: { name: 'Gemeente' },
            relationships: {
              classification: {
                data: {
                  type: 'administrative-unit-classification-code',
                  id: CLASSIFICATION.MUNICIPALITY.id,
                },
              },
            },
          },
          ...MEMBERSHIP_ROLES.map((role) => ({
            type: 'membership-role',
            id: role.id,
            attributes: { label: role.label },
          })),
        ],
      });
      return { municipality, roles };
    }

    /**
     * Answer the role query with the roles and the membership queries with a
     * stored membership for the given role ids, and return the membership
     * queries that were sent.
     */
    function stubQueries(store, roles, storedRoleIds = []) {
      const membershipQueries = [];
      sinon.stub(store, 'request').callsFake(async ({ data }) => {
        if (data.type === 'membership-role') {
          return { content: roles };
        }
        membershipQueries.push(data.query);
        return {
          content: storedRoleIds.includes(data.query['filter[role][:id:]'])
            ? [{ id: 'stored' }]
            : [],
        };
      });
      return membershipQueries;
    }

    function setupRoute(context, municipality) {
      const route = context.route();
      route.modelFor = () => municipality;
      return route;
    }

    test('it offers the roles and labels the rules allow for the classification', async function (assert) {
      const store = this.store();
      const { municipality, roles } = pushMunicipalityAndRoles(store);
      stubQueries(store, roles);
      const route = setupRoute(this, municipality);

      const model = await route.model();

      assert.strictEqual(model.organization, municipality);
      assert.deepEqual(model.roles, roles);
      assert.deepEqual(
        model.selectableRoles.map((role) => role.id),
        [
          IS_FOUNDER_OF.id,
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
          MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN.id,
          MEMBERSHIP_ROLES_MAPPING.SERVES.id,
        ],
      );
      assert.deepEqual(model.allowedRoleLabels, MUNICIPALITY_LABELS);
      assert.deepEqual(model.selectableRoleLabels, MUNICIPALITY_LABELS);
    });

    test('it checks for stored relations with the roles the rules exclude', async function (assert) {
      const store = this.store();
      const { municipality, roles } = pushMunicipalityAndRoles(store);
      const queries = stubQueries(store, roles);
      const route = setupRoute(this, municipality);

      await route.model();

      assert.deepEqual(queries, [
        {
          // "Has a relation with" has no direction: both sides
          'filter[:or:][member][:id:]': 'municipality',
          'filter[:or:][organization][:id:]': 'municipality',
          'filter[role][:id:]': HAS_RELATION_WITH.id,
          page: { size: 1, number: 0 },
        },
        {
          // "Is erkend door": the municipality is the recognised organization
          'filter[organization][:id:]': 'municipality',
          'filter[role][:id:]': GRANTS_RECOGNITION_TO.id,
          page: { size: 1, number: 0 },
        },
      ]);
    });

    test('it keeps the labels of stored relations with excluded roles filterable, without offering them for new relations', async function (assert) {
      const store = this.store();
      const { municipality, roles } = pushMunicipalityAndRoles(store);
      stubQueries(store, roles, [
        HAS_RELATION_WITH.id,
        GRANTS_RECOGNITION_TO.id,
      ]);
      const route = setupRoute(this, municipality);

      const model = await route.model();

      assert.deepEqual(model.allowedRoleLabels, MUNICIPALITY_LABELS);
      assert.deepEqual(model.selectableRoleLabels, [
        'Heeft een relatie met',
        'Is lid van',
        'Is feitelijk vertegenwoordigd in (niet lidmaatschap)',
        'Is erkend door',
        'Is oprichter van',
        'Wordt bediend door',
      ]);
    });
  },
);
