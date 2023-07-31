import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SelectRoleRoute extends Route {
  @service role;
  @service session;
  @service currentSession;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  model() {
    return { roles: this.currentSession.roles };
  }
}
