import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class OrganizationsOrganizationRoute extends Route {
  @service store;

  async model(params) {
    // Note: Already include status, otherwise the validations can fail when the
    // user tries to save edits without that they previously visited the core
    // data page.
    // We also pre-load the classification because the "isX" getters are used in routes that don't display the classification.
    const { content: organization } = await this.store.request(
      findRecord('organization', params.id, {
        include: 'organization-status,classification',
      }),
    );
    return organization;
  }
}
