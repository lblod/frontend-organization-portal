/* eslint-disable warp-drive/no-legacy-request-patterns -- TODO: remove this once we have an alternative for peekRecord and peekAll */
import { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import { saveRecord } from '@warp-drive/legacy/compat/builders';
import sinon from 'sinon';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import EditController from 'frontend-organization-portal/controllers/organizations/organization/related-organizations/edit';

module(
  'Unit | Controller | organizations/organization/related-organizations/edit',
  function (hooks) {
    setupTest(hooks);

    // The organizations routes are built into a lazy bundle (`splitAtRoutes`
    // in ember-cli-build.js), so the controller must be registered before the
    // owner can look it up.
    hooks.beforeEach(function () {
      this.owner.register(
        'controller:organizations/organization/related-organizations/edit',
        EditController,
      );
    });

    this.store = function () {
      return this.owner.lookup('service:store');
    };

    this.controller = function () {
      return this.owner.lookup(
        'controller:organizations/organization/related-organizations/edit',
      );
    };

    /**
     * Push a persisted organization and a persisted membership with another
     * organization into the store, as the edit route would have loaded them.
     */
    function pushOrganizationWithMembership(store) {
      const [organization, , , membership] = store.push({
        data: [
          {
            type: 'organization',
            id: 'organization',
            attributes: { name: 'Organisatie' },
          },
          {
            type: 'organization',
            id: 'member',
            attributes: { name: 'Lid' },
          },
          {
            type: 'membership-role',
            id: 'role',
            attributes: { label: 'Heeft een relatie met' },
          },
          {
            type: 'membership',
            id: 'membership',
            relationships: {
              organization: {
                data: { type: 'organization', id: 'organization' },
              },
              member: { data: { type: 'organization', id: 'member' } },
              role: { data: { type: 'membership-role', id: 'role' } },
            },
          },
        ],
      });
      return { organization, membership };
    }

    module('reset', function () {
      test('it restores a persisted membership that was removed but not saved', function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.reallyRemoveMembership(membership);

        assert.true(membership.isDeleted);
        assert.true(membership.hasDirtyAttributes);
        assert.false(membership.isNew);
        assert.true(controller.hasUnsavedEdits);

        controller.reset();

        assert.false(membership.isDeleted);
        assert.false(membership.hasDirtyAttributes);
        assert.false(membership.isDestroying);
        assert.strictEqual(
          store.peekRecord('membership', 'membership'),
          membership,
        );
        assert.strictEqual(controller.memberships, null);

        // Opening the edit page again shows the membership
        controller.setup();

        assert.deepEqual(controller.memberships, [membership]);
        assert.false(controller.hasUnsavedEdits);
      });

      test('it unloads a new membership that was added but not saved', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.addMembership();
        const newMembership = controller.memberships.at(-1);

        assert.true(newMembership.isNew);
        assert.strictEqual(store.peekAll('membership').length, 2);

        controller.reset();

        assert.true(newMembership.isDestroying);
        assert.strictEqual(store.peekAll('membership').length, 1);
        assert.false(membership.isDeleted);

        await settled();

        assert.true(newMembership.isDestroyed);
      });

      test('it leaves a membership alone whose deletion was saved', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.reallyRemoveMembership(membership);
        // A successful DELETE returns no payload
        const deleteStub = sinon.stub(
          this.owner.lookup('adapter:application'),
          'deleteRecord',
        );
        deleteStub.resolves(null);
        await store.request(saveRecord(membership));

        assert.true(membership.isDeleted);
        assert.false(membership.hasDirtyAttributes);
        assert.false(membership.isDestroying);
        assert.strictEqual(store.peekAll('membership').length, 0);

        controller.reset();

        assert.true(membership.isDeleted);
        assert.false(membership.hasDirtyAttributes);
        assert.strictEqual(store.peekAll('membership').length, 0);
        assert.strictEqual(controller.memberships, null);

        deleteStub.restore();
      });

      test('it leaves memberships alone whose save is still in flight', async function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        controller.reallyRemoveMembership(membership);
        controller.addMembership();
        const newMembership = controller.memberships.at(-1);

        // The adapter only answers when the test says so, as a slow server
        // would
        const adapter = this.owner.lookup('adapter:application');
        let resolveDelete;
        let resolveCreate;
        const deleteStub = sinon.stub(adapter, 'deleteRecord').returns(
          new Promise((resolve) => {
            resolveDelete = resolve;
          }),
        );
        const createStub = sinon.stub(adapter, 'createRecord').returns(
          new Promise((resolve) => {
            resolveCreate = resolve;
          }),
        );
        const deleteRequest = store.request(saveRecord(membership));
        const createRequest = store.request(saveRecord(newMembership));

        assert.true(membership.isSaving);
        assert.true(newMembership.isSaving);

        // Leaving the edit page, e.g. with "Annuleer", while the save runs
        controller.reset();

        assert.true(newMembership.isNew);
        assert.false(newMembership.isDestroying);
        assert.true(store.peekAll('membership').includes(newMembership));
        assert.true(membership.isDeleted);
        assert.strictEqual(controller.memberships, null);

        resolveDelete(null);
        resolveCreate({ data: { type: 'memberships', id: 'new-membership' } });
        await Promise.all([deleteRequest, createRequest]);

        assert.false(newMembership.isNew);
        assert.false(newMembership.isSaving);
        assert.strictEqual(newMembership.id, 'new-membership');
        assert.true(membership.isDeleted);
        assert.false(membership.hasDirtyAttributes);
        assert.strictEqual(store.peekAll('membership').length, 1);

        deleteStub.restore();
        createStub.restore();
      });

      test('it ignores a membership that was already unloaded', function (assert) {
        const store = this.store();
        const { organization, membership } =
          pushOrganizationWithMembership(store);
        const controller = this.controller();
        controller.model = { organization, memberships: [membership] };
        controller.setup();

        membership.deleteRecord();
        membership.unloadRecord();

        assert.true(membership.isDestroying);

        controller.reset();

        assert.strictEqual(store.peekRecord('membership', 'membership'), null);
        assert.strictEqual(controller.memberships, null);
      });

      test('it does not throw when there are no memberships', function (assert) {
        const { organization } = pushOrganizationWithMembership(this.store());
        const controller = this.controller();
        controller.model = { organization };
        controller.memberships = null;

        controller.reset();

        assert.strictEqual(controller.memberships, null);
        assert.strictEqual(controller.selectedRoleLabel, null);
      });
    });
  },
);
