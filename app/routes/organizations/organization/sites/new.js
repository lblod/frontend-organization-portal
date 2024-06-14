import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';
import isContactEditableOrganization from 'frontend-organization-portal/utils/editable-contact-data';

export default class OrganizationsOrganizationSitesNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;
  @service features;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  afterModel(model) {
    if (
      !(
        this.features.isEnabled('edit-contact-data') ||
        isContactEditableOrganization(model.organization)
      )
    ) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    let organization = this.modelFor('organizations.organization');

    const address = this.store.createRecord('address');
    address.country = 'België';

    return {
      organization,
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
