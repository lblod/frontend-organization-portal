import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import worshipAdministrativeUnitValidations from 'frontend-contact-hub/validations/worship-administrative-unit';

const ID_NAME = {
  SHAREPOINT: 'SharePoint identificator',
  KBO: 'KBO nummer',
};

export default class AdministrativeUnitsNewRoute extends Route {
  @service store;

  model() {
    return {
      administrativeUnit: createValidatedChangeset(
        this.store.createRecord('worship-administrative-unit'),
        worshipAdministrativeUnitValidations
      ),
      worshipService: this.store.createRecord('worship-service', {
        crossBorder: false,
      }),
      centralWorshipService: this.store.createRecord('central-worship-service'),
      primarySite: this.store.createRecord('site'),
      address: createValidatedChangeset(
        this.store.createRecord('address'),
        getAddressValidations(true)
      ),
      contact: createValidatedChangeset(
        this.store.createRecord('contact-point'),
        contactValidations
      ),
      identifierKBO: this.store.createRecord('identifier', {
        idName: ID_NAME.KBO,
      }),
      structuredIdentifierKBO: this.store.createRecord('structured-identifier'),
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
