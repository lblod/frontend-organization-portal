import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @service currentSession;
  @service router;

  @action
  goToContext(route) {
    this.router.transitionTo(route);
  }

  get hasUnitRoleAndWorshipRole() {
    return this.currentSession.hasUnitRoleAndWorshipRole;
  }

  get hasUnitRole() {
    return this.currentSession.hasUnitRole;
  }

  get hasWorshipRole() {
    return this.currentSession.hasWorshipRole;
  }
}
