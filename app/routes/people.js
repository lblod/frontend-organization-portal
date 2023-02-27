import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeopleRoute extends Route {
  @service session;
  @service router;
  @service role;
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (!this.role.activeRole) {
      return this.router.transitionTo('select-role');
    }
  }
}
