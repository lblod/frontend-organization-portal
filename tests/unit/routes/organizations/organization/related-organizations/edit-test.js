import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import {
  setFeatures,
  stubTransitionTo,
} from 'frontend-organization-portal/tests/helpers/feature-flags';
import EditRoute from 'frontend-organization-portal/routes/organizations/organization/related-organizations/edit';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalGebruiker-editeerder';
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

    const linkageTo = ({ type, id }) => ({ data: { type, id } });

    const classifiedOrganization = (id, name, classification) => ({
      type: 'organization',
      id,
      attributes: { name },
      relationships: {
        classification: linkageTo({
          type: 'administrative-unit-classification-code',
          id: classification.id,
        }),
      },
    });

    const hasRelationWithRole = {
      type: 'membership-role',
      id: MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
      attributes: {},
    };

    const relationWith = (id, { member, organization }) => ({
      type: 'membership',
      id,
      relationships: {
        member: linkageTo(member),
        organization: linkageTo(organization),
        role: linkageTo(hasRelationWithRole),
      },
    });

    /**
     * Push the resources and run the model hook for the organization, with
     * the pushed relations as the answer of the backend.
     */
    async function modelFor(context, organization, resources) {
      const store = context.store();
      const records = store.push({ data: resources });
      const recordOf = (resource) => records[resources.indexOf(resource)];
      const route = context.route();
      route.modelFor = () => ({
        organization: recordOf(organization),
        roles: [],
        selectableRoles: [],
      });
      const requestStub = sinon.stub(store, 'request').resolves({
        content: resources
          .filter((resource) => resource.type === 'membership')
          .map(recordOf),
      });

      const model = await route.model({ page: 0, size: 500 });

      requestStub.restore();
      return model;
    }

    test('it leaves out the "has a relation with" relations between organizations that may not have that role', async function (assert) {
      const municipality = classifiedOrganization(
        'municipality',
        'Gemeente',
        CLASSIFICATION.MUNICIPALITY,
      );
      const province = classifiedOrganization(
        'province',
        'Provincie',
        CLASSIFICATION.PROVINCE,
      );
      const zone = classifiedOrganization(
        'zone',
        'Politiezone',
        CLASSIFICATION.POLICE_ZONE,
      );
      const worshipService = classifiedOrganization(
        'worship-service',
        'Kerkfabriek',
        CLASSIFICATION.WORSHIP_SERVICE,
      );

      const model = await modelFor(this, municipality, [
        hasRelationWithRole,
        municipality,
        province,
        zone,
        worshipService,
        // Kept for the hierarchy, but hidden
        relationWith('with-province', {
          member: municipality,
          organization: province,
        }),
        relationWith('with-zone', { member: zone, organization: municipality }),
        // A worship service may have the role, so this one is shown
        relationWith('with-worship-service', {
          member: municipality,
          organization: worshipService,
        }),
      ]);

      assert.deepEqual(
        model.memberships.map((membership) => membership.id),
        ['with-worship-service'],
      );
    });

    test('it keeps the relations of a worship organization, also with a representative body sent without its classification', async function (assert) {
      const worshipService = classifiedOrganization(
        'worship-service',
        'Kerkfabriek',
        CLASSIFICATION.WORSHIP_SERVICE,
      );
      const centralWorshipService = classifiedOrganization(
        'central-worship-service',
        'Centraal kerkbestuur',
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
      );
      // The backend includes a representative body without the linkage to
      // its classification
      const representativeBody = {
        type: 'representative-body',
        id: 'representative-body',
        attributes: { name: 'Bisdom' },
      };

      const model = await modelFor(this, worshipService, [
        hasRelationWithRole,
        worshipService,
        centralWorshipService,
        representativeBody,
        relationWith('with-central-worship-service', {
          member: worshipService,
          organization: centralWorshipService,
        }),
        relationWith('with-representative-body', {
          member: representativeBody,
          organization: worshipService,
        }),
      ]);

      assert.deepEqual(
        model.memberships.map((membership) => membership.id),
        ['with-representative-body', 'with-central-worship-service'],
      );
    });

    test('it redirects non-worship users to the read view when the flag is on', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(
        transitionTo.calledOnceWith(
          'organizations.organization.related-organizations',
        ),
      );
    });

    test('it does not redirect worship users when the flag is on', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalErediensten-editeerder';
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(transitionTo.notCalled);
    });

    test('it does not redirect when the flag is off', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': false });
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(transitionTo.notCalled);
    });

    test('it loads the relations on both sides with everything the page shows', async function (assert) {
      const store = this.store();
      const { organization } = pushOrganizationWithMemberships(store);
      const route = this.route();
      route.modelFor = () => ({ organization, roles: [], selectableRoles: [] });
      const requestStub = sinon
        .stub(store, 'request')
        .resolves({ content: [] });

      await route.model({ page: 2, size: 50 });

      const { data } = requestStub.firstCall.args[0];
      assert.strictEqual(data.type, 'membership');
      assert.deepEqual(data.query, {
        'filter[:or:][member][:id:]': 'organization',
        'filter[:or:][organization][:id:]': 'organization',
        include: [
          'role',
          'member.classification',
          'member.organization-status',
          'organization.classification',
          'organization.organization-status',
          'during',
        ].join(),
        page: { size: 50, number: 2 },
      });
      requestStub.restore();
    });

    test('it only loads the relations with the selected role', async function (assert) {
      const store = this.store();
      const { organization } = pushOrganizationWithMemberships(store);
      const [role] = store.push({
        data: [
          {
            type: 'membership-role',
            id: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
            attributes: {},
          },
        ],
      });
      const route = this.route();
      route.modelFor = () => ({
        organization,
        roles: [role],
        selectableRoles: [role],
      });
      const requestStub = sinon
        .stub(store, 'request')
        .resolves({ content: [] });

      await route.model({
        page: 0,
        size: 500,
        selectedRoleLabel: 'Heeft als leden',
      });

      const { query } = requestStub.firstCall.args[0].data;
      assert.strictEqual(query['filter[organization][:id:]'], 'organization');
      assert.strictEqual(
        query['filter[role][:id:]'],
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
      );
      assert.notOk(query['filter[:or:][member][:id:]']);
      requestStub.restore();
    });
  },
);
