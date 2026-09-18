import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { query } from '@warp-drive/legacy/compat/builders';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { MEMBERSHIP_ROLES } from '../../models/membership-role';

export default class OrganizationsNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('unauthorized');
    }
  }

  async model() {
    const structuredIdentifierKBO = this.store.createRecord(
      'structured-identifier',
    );

    const identifierKBO = this.store.createRecord('identifier', {
      idName: ID_NAME.KBO,
      structuredIdentifier: structuredIdentifierKBO,
    });

    const structuredIdentifierSharepoint = this.store.createRecord(
      'structured-identifier',
    );

    const identifierSharepoint = this.store.createRecord('identifier', {
      idName: ID_NAME.SHAREPOINT,
      structuredIdentifier: structuredIdentifierSharepoint,
    });

    const { content: roles } = await this.store.request(
      query('membership-role', {
        'filter[:id:]': MEMBERSHIP_ROLES.map((role) => role.id).join(','),
      }),
    );

    return {
      primarySite: this.store.createRecord('site'),
      address: this.store.createRecord('address', {
        country: 'België',
      }),
      contact: createPrimaryContact(this.store),
      secondaryContact: createSecondaryContact(this.store),
      identifierKBO,
      structuredIdentifierKBO,
      identifierSharepoint,
      structuredIdentifierSharepoint,
      roles,
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }

  setupController(controller) {
    super.setupController(...arguments);

    controller.set(
      'currentOrganizationModel',
      this.store.createRecord('organization'),
    );
  }
}
