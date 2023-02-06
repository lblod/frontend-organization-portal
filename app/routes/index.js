import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service session;
  @service currentSession;
  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    this.currentSession.onlyWorshipContext = false;
    this.currentSession.onlyUnitContext = false;
  }
}
