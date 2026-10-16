import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import EditRoute from 'frontend-organization-portal/routes/organizations/organization/related-organizations/edit';

module(
  'Unit | Route | organizations/organization/related-organizations/edit',
  function (hooks) {
    setupTest(hooks);

    // The organizations routes are built into a lazy bundle (`splitAtRoutes`
    // in ember-cli-build.js), so the route must be registered before the
    // owner can look it up.
    hooks.beforeEach(function () {
      this.owner.register(
        'route:organizations/organization/related-organizations/edit',
        EditRoute,
      );
    });

    this.store = function () {
      return this.owner.lookup('service:store');
    };

    this.route = function () {
      return this.owner.lookup(
        'route:organizations/organization/related-organizations/edit',
      );
    };

    /**
     * Push a persisted organization and three persisted memberships with
     * other organizations into the store, as the edit route would have
     * loaded them. The current organization is on the `organization` side
     * of one membership and on the `member` side of the others.
     */
    function pushOrganizationWithMemberships(store) {
      const [organization, , , , , membershipC, membershipB, membershipA] =
        store.push({
          data: [
            {
              type: 'organization',
              id: 'organization',
              attributes: { name: 'Organisatie' },
            },
            {
              type: 'organization',
              id: 'a',
              attributes: { name: 'A' },
            },
            {
              type: 'organization',
              id: 'b',
              attributes: { name: 'B' },
            },
            {
              type: 'organization',
              id: 'c',
              attributes: { name: 'C' },
            },
            {
              type: 'membership-role',
              id: 'role',
              attributes: { label: 'Heeft een relatie met' },
            },
            {
              type: 'membership',
              id: 'membership-c',
              relationships: {
                organization: {
                  data: { type: 'organization', id: 'organization' },
                },
                member: { data: { type: 'organization', id: 'c' } },
                role: { data: { type: 'membership-role', id: 'role' } },
              },
            },
            {
              type: 'membership',
              id: 'membership-b',
              relationships: {
                organization: { data: { type: 'organization', id: 'b' } },
                member: {
                  data: { type: 'organization', id: 'organization' },
                },
                role: { data: { type: 'membership-role', id: 'role' } },
              },
            },
            {
              type: 'membership',
              id: 'membership-a',
              relationships: {
                organization: { data: { type: 'organization', id: 'a' } },
                member: {
                  data: { type: 'organization', id: 'organization' },
                },
                role: { data: { type: 'membership-role', id: 'role' } },
              },
            },
          ],
        });
      return { organization, membershipA, membershipB, membershipC };
    }

    test('it sorts the memberships by the name of the other organization', async function (assert) {
      const store = this.store();
      const { organization, membershipA, membershipB, membershipC } =
        pushOrganizationWithMemberships(store);
      const route = this.route();
      route.modelFor = () => ({
        organization,
        roles: [],
        selectableRoles: [],
      });
      const requestStub = sinon
        .stub(store, 'request')
        .resolves({ content: [membershipC, membershipB, membershipA] });

      const model = await route.model({ page: 0, size: 500 });

      assert.deepEqual(model.memberships, [
        membershipA,
        membershipB,
        membershipC,
      ]);
      requestStub.restore();
    });
  },
);
