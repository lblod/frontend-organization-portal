import Route from '@ember/routing/route';
import { dropTask } from 'ember-concurrency';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-contact-hub/models/contact-point';
import { A } from '@ember/array';

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexRoute extends Route {
  async model() {
    const { id } = this.paramsFor('administrative-units.administrative-unit');
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    let primarySite = await administrativeUnit.primarySite;

    // TODO : "if" not needed when the data of all administrative units will be correct
    // they should all have a primary site on creation
    let contacts = A();
    if (primarySite) {
      contacts = await primarySite.contacts;
    }

    return {
      administrativeUnit,
      primaryContact: findPrimaryContact(contacts),
      secondaryContact: findSecondaryContact(contacts),
      subOrganizations: this.loadSubOrganizationsTask.perform(id),
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id) {
    return yield this.store.query('organization', {
      include: 'classification',
      'filter[is-sub-organization-of][:id:]': id,
      'page[size]': 500,
    });
  }
}
