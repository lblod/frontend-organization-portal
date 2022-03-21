import Route from '@ember/routing/route';
import { dropTask } from 'ember-concurrency';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class AdministrativeUnitsAdministrativeUnitCoreDataIndexRoute extends Route {
  async model() {
    const { id } = this.paramsFor('administrative-units.administrative-unit');
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit.core-data'
    );

    let primarySite = await administrativeUnit.primarySite;
    let contacts = await primarySite.contacts;

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
