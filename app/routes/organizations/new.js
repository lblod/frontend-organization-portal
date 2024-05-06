import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';

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

  model() {
    const structuredIdentifierKBO = this.store.createRecord(
      'structured-identifier'
    );

    const identifierKBO = this.store.createRecord('identifier', {
      idName: ID_NAME.KBO,
      structuredIdentifier: structuredIdentifierKBO,
    });

    const structuredIdentifierSharepoint = this.store.createRecord(
      'structured-identifier'
    );

    const identifierSharepoint = this.store.createRecord('identifier', {
      idName: ID_NAME.SHAREPOINT,
      structuredIdentifier: structuredIdentifierSharepoint,
    });

    let administrativeUnit;
    if (this.currentSession.hasWorshipRole) {
      administrativeUnit = this.store.createRecord(
        'worship-administrative-unit'
      );
    } else {
      administrativeUnit = this.store.createRecord('administrative-unit');
    }

    return {
      administrativeUnit,
      centralWorshipService: this.store.createRecord('central-worship-service'),
      worshipService: this.store.createRecord('worship-service'),
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
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
