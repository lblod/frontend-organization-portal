import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
  createPrimaryContact,
  createSecondaryContact,
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class OrganizationsOrganizationSitesSiteEditRoute extends Route {
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
        model.organization.isPrivateOcmwAssociation
      )
    ) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model() {
    let { site } = this.modelFor('organizations.organization.sites.site');

    let contacts = await site.contacts;

    let contact = findPrimaryContact(contacts);
    if (!contact) {
      contact = createPrimaryContact(this.store);
    }

    let secondaryContact = findSecondaryContact(contacts);
    if (!secondaryContact) {
      secondaryContact = createSecondaryContact(this.store);
    }

    let organization = this.modelFor('organizations.organization');

    let address = await site.address;

    return {
      site,
      address,
      contact,
      secondaryContact,
      organization,
      currentPrimarySite: await organization.primarySite,
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
