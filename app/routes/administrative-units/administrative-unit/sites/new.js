import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import { getSiteValidations } from 'frontend-organization-portal/validations/site';
import contactValidations from 'frontend-organization-portal/validations/contact-point';
import secondaryContactValidations from 'frontend-organization-portal/validations/secondary-contact-point';

export default class AdministrativeUnitsAdministrativeUnitSitesNewRoute extends Route {
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
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    const address = this.store.createRecord('address');
    address.country = 'België';

    return {
      administrativeUnit,
      site: createValidatedChangeset(
        this.store.createRecord('site'),
        getSiteValidations()
      ),
      address: createValidatedChangeset(address, getAddressValidations(true)),
      contact: createValidatedChangeset(
        createPrimaryContact(this.store),
        contactValidations
      ),
      secondaryContact: createValidatedChangeset(
        createSecondaryContact(this.store),
        secondaryContactValidations
      ),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
