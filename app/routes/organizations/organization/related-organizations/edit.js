import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationRelatedOrganizationsEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  queryParams = {
    sort: { refreshModel: true },
    page: { refreshModel: true },
    organizationStatus: { refreshModel: true, replace: true },
  };

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }

  async model(params) {
    const organization = this.modelFor('organizations.organization');

    // TODO: filter for memberships with active organizations
    const query = {
      'filter[:or:][member][:id:]': organization.id,
      'filter[:or:][organization][:id:]': organization.id,
      include: 'role,member,member,organization',
      sort: params.sort,
      page: { size: params.size, number: params.page },
    };

    const memberships = await this.store.query('membership', query);

    // TODO: retrieve in component instead?
    let roles = await this.store.findAll('membership-role');
    // Limit to membership roles concerning related organizations, excluding
    // the roles concerning positions
    // FIXME: sometimes results in a "TypeError: MEMBERSHIP_ROLES.find(...) is undefined"
    roles = roles.filter((role) => role.opLabel);

    return {
      organization,
      memberships,
      roles,
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setup(model);
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
