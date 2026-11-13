import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import {
  setFeatures,
  stubTransitionTo,
} from 'frontend-organization-portal/tests/helpers/feature-flags';
import EditRoute from 'frontend-organization-portal/routes/organizations/organization/sites/site/edit';

module(
  'Unit | Route | organizations/organization/sites/site/edit',
  function (hooks) {
    setupTest(hooks);

    hooks.beforeEach(function () {
      this.owner.register(
        'route:organizations/organization/sites/site/edit',
        EditRoute,
      );
    });

    this.route = function () {
      return this.owner.lookup(
        'route:organizations/organization/sites/site/edit',
      );
    };

    test('it redirects non-worship users to the sites list when the flag is on', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': true });
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalGebruiker-editeerder';
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(
        transitionTo.calledOnceWith('organizations.organization.sites'),
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

    test('it does not redirect non-worship users when the flag is off', function (assert) {
      setFeatures(this.owner, { 'disable-rvs-organizations-edits': false });
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalGebruiker-editeerder';
      const transitionTo = stubTransitionTo(this.owner);

      this.route().beforeModel();

      assert.true(transitionTo.notCalled);
    });
  },
);
