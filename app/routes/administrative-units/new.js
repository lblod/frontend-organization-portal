import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import { getStructuredIdentifierKBOValidations } from 'frontend-organization-portal/validations/administrative-unit';

export default class AdministrativeUnitsNewRoute extends Route {
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
    const address = this.store.createRecord('address');
    address.country = 'België';

    return {
      administrativeUnit: this.store.createRecord('administrative-unit'),
      centralWorshipService: this.store.createRecord('central-worship-service'),
      worshipService: this.store.createRecord('worship-service'),
      primarySite: this.store.createRecord('site'),
      address: createValidatedChangeset(address, getAddressValidations(true)),
      contact: createPrimaryContact(this.store),
      secondaryContact: createSecondaryContact(this.store),
      identifierKBO: this.store.createRecord('identifier', {
        idName: ID_NAME.KBO,
      }),
      structuredIdentifierKBO: createValidatedChangeset(
        this.store.createRecord('structured-identifier'),
        getStructuredIdentifierKBOValidations(this.store)
      ),
      identifierSharepoint: this.store.createRecord('identifier', {
        idName: ID_NAME.SHAREPOINT,
      }),
      structuredIdentifierSharepoint: this.store.createRecord(
        'structured-identifier'
      ),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
