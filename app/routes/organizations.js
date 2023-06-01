import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { action } from '@ember/object';
export default class OrganizationsRoute extends Route {
  @service session;
  @service router;
  @service role;
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (!this.role.activeRole) {
      return this.router.transitionTo('select-role');
    }
  }
  @action
  error(error) {
    console.log(error);
    this.router.transitionTo('route-not-found', {
      wildcard: 'pagina-niet-gevonden',
    });
  }
}
