import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationRoute extends Route {
  @service store;

  async model(params) {
    // Note: Already include status, otherwise the validations can fail when the
    // user tries to save edits without that they previously visited the core
    // data page.
    return this.store.findRecord('organization', params.id, {
      include: 'organization-status',
    });
  }
}
