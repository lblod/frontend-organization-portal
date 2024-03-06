import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class AdministrativeUnitsAdministrativeUnitSitesNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  get editFeature() {
    const editFeature = config.features['edit-contact-data']
    return editFeature === true || editFeature === 'true';
  }

  beforeModel() {
    if (!this.currentSession.canEdit || !this.editFeature) {
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
      site: this.store.createRecord('site'),
      address,
      contact: createPrimaryContact(this.store),
      secondaryContact: createSecondaryContact(this.store),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
