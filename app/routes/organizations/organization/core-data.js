import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { findKboContact } from 'frontend-organization-portal/models/contact-point';

export default class OrganizationsOrganizationCoreDataRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    const representativeBody = await this.store.findRecord(
      'representative-body',
      organizationId,
      {
        reload: true,
        include: [
          'organization-status',
          'recognized-worship-type',
          'identifiers.structured-identifier',
          'primary-site.address',
          'primary-site.contacts',
          'resulted-from',
          'kbo-administrative-unit',
        ].join(),
      }
    );

    let kboContacts = null;
    const kboAdministrativeUnit =
      await representativeBody.kboAdministrativeUnit;
    if (kboAdministrativeUnit) {
      kboContacts = await kboAdministrativeUnit.contacts;
    }

    return {
      representativeBody: representativeBody,
      kboContacts: findKboContact(kboContacts),
    };
  }
}
