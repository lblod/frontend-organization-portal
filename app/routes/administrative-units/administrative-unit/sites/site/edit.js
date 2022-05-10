import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import contactValidations from 'frontend-organization-portal/validations/contact-point';
import secondaryContactValidations from 'frontend-organization-portal/validations/secondary-contact-point';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditRoute extends Route {
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
    let { site } = this.modelFor(
      'administrative-units.administrative-unit.sites.site'
    );

    let contacts = await site.contacts;

    let contact = findPrimaryContact(contacts);
    if (!contact) {
      contact = createPrimaryContact(this.store);
    }

    let secondaryContact = findSecondaryContact(contacts);
    if (!secondaryContact) {
      secondaryContact = createSecondaryContact(this.store);
    }

    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let address = await site.address;

    return {
      site,
      address: createValidatedChangeset(address, getAddressValidations(true)),
      contact: createValidatedChangeset(contact, contactValidations),
      secondaryContact: createValidatedChangeset(
        secondaryContact,
        secondaryContactValidations
      ),
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
