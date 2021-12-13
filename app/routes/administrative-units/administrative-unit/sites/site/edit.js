import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditRoute extends Route {
  @service store;
  @service currentSession;
  @service session;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', { wildcard: 'not-found' });
    }
  }
  async model() {
    let { site } = this.modelFor(
      'administrative-units.administrative-unit.sites.site'
    );

    let contacts = await site.contacts;
    if (contacts.length === 0) {
      contacts.pushObject(this.store.createRecord('contact-point'));
    }
    let contact = contacts.firstObject;

    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let address = await site.address;

    return {
      site,
      address: createValidatedChangeset(address, getAddressValidations(true)),
      contact: createValidatedChangeset(contact, contactValidations),
      administrativeUnit,
      currentPrimarySite: await administrativeUnit.primarySite,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup();
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
