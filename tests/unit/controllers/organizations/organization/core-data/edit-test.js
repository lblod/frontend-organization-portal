/* eslint-disable warp-drive/no-legacy-request-patterns -- TODO: remove this once we have an alternative for peekRecord */
import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import { setFeatures } from 'frontend-organization-portal/tests/helpers/feature-flags';
import EditController from 'frontend-organization-portal/controllers/organizations/organization/core-data/edit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';

module(
  'Unit | Controller | organizations/organization/core-data/edit',
  function (hooks) {
    setupTest(hooks);

    // The organizations routes are built into a lazy bundle (`splitAtRoutes`
    // in ember-cli-build.js), so the controller must be registered before the
    // owner can look it up.
    hooks.beforeEach(function () {
      this.owner.register(
        'controller:organizations/organization/core-data/edit',
        EditController,
      );
      setFeatures(this.owner, {
        'disable-rvs-organizations-edits': true,
        'edit-contact-data': true,
      });
      this.owner.lookup('service:role')._activeRole =
        'ABBOrganisatiePortaalGebruiker-editeerder';
    });

    hooks.afterEach(function () {
      sinon.restore();
    });

    const event = { preventDefault() {} };

    /**
     * Push an organization with a persisted primary site, address and
     * contacts into the store, as the edit route would have loaded them, and
     * return the model for the controller.
     */
    function pushModel(store, { classification }) {
      const [organization] = store.push({
        data: [
          {
            type: 'organization',
            id: 'organization',
            attributes: { name: 'Organisatie', legalName: 'Organisatie' },
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
                  id: 'active',
                },
              },
              primarySite: {
                data: { type: 'site', id: 'site' },
              },
            },
          },
          {
            type: 'organization-status-code',
            id: 'active',
            attributes: { label: 'Actief' },
          },
          {
            type: 'administrative-unit-classification-code',
            id: classification.id,
            attributes: { label: classification.label },
          },
          {
            type: 'site',
            id: 'site',
            relationships: {
              address: { data: { type: 'address', id: 'address' } },
              contacts: {
                data: [
                  { type: 'contact-point', id: 'contact' },
                  { type: 'contact-point', id: 'secondary-contact' },
                ],
              },
            },
          },
          {
            type: 'address',
            id: 'address',
            attributes: {
              street: 'Kerkstraat',
              number: '1',
              postcode: '1000',
              municipality: 'Brussel',
              country: 'België',
              province: 'Brussel',
              fullAddress: 'Kerkstraat 1, 1000 Brussel, België',
            },
          },
          {
            type: 'contact-point',
            id: 'contact',
            attributes: { email: 'contact@example.com', type: 'primary' },
          },
          {
            type: 'contact-point',
            id: 'secondary-contact',
            attributes: { type: 'secondary' },
          },
        ],
      });

      const structuredIdentifierKBO = store.createRecord(
        'structured-identifier',
        { localId: '0123456789' },
      );
      const structuredIdentifierSharepoint = store.createRecord(
        'structured-identifier',
        { localId: '123456' },
      );

      return {
        organization,
        address: store.peekRecord('address', 'address'),
        contact: store.peekRecord('contact-point', 'contact'),
        secondaryContact: store.peekRecord(
          'contact-point',
          'secondary-contact',
        ),
        identifierKBO: store.createRecord('identifier', {
          idName: ID_NAME.KBO,
          structuredIdentifier: structuredIdentifierKBO,
        }),
        identifierSharepoint: store.createRecord('identifier', {
          idName: ID_NAME.SHAREPOINT,
          structuredIdentifier: structuredIdentifierSharepoint,
        }),
        structuredIdentifierKBO,
        structuredIdentifierSharepoint,
      };
    }

    /**
     * Stub the adapter so that no requests are sent, and return the log of
     * the requests that would have been sent, in order.
     */
    function stubAdapter(owner) {
      const adapter = owner.lookup('adapter:application');
      const requests = [];

      sinon
        .stub(adapter, 'createRecord')
        .callsFake(async (store, modelClass, snapshot) => {
          requests.push(`create ${snapshot.modelName}`);
          return {
            data: { type: snapshot.modelName, id: `new-${snapshot.modelName}` },
          };
        });
      sinon
        .stub(adapter, 'updateRecord')
        .callsFake(async (store, modelClass, snapshot) => {
          requests.push(`update ${snapshot.modelName}`);
          return null;
        });

      return requests;
    }

    this.controllerWithModel = function (model) {
      const controller = this.owner.lookup(
        'controller:organizations/organization/core-data/edit',
      );
      controller.model = model;
      controller.locationsInScope = [];
      return controller;
    };

    test('it saves the organization when the flag is off', async function (assert) {
      setFeatures(this.owner, {
        'disable-rvs-organizations-edits': false,
        'edit-contact-data': true,
      });
      const store = this.owner.lookup('service:store');
      const model = pushModel(store, {
        classification: CLASSIFICATION.WORSHIP_SERVICE,
      });
      const requests = stubAdapter(this.owner);
      const controller = this.controllerWithModel(model);
      sinon.stub(controller.router, 'refresh');
      sinon.stub(controller.router, 'transitionTo');

      model.organization.name = 'Gewijzigd';

      await controller.save.perform(event);

      assert.true(requests.includes('update organization'));
    });
  },
);
