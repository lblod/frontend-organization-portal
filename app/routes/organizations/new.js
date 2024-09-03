import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { MEMBERSHIP_ROLES_MAPPING } from '../../models/membership-role';

export default class OrganizationsNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
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

    let roles = await this.store.query('membership-role', {
      'filter[:id:]': [
        MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
        MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
      ].join(','),
    });

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
