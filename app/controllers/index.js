import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @service currentSession;
  @service router;

  @action
  goToUnitContext(route) {
    this.currentSession.onlyUnitContext = true;
    this.currentSession.onlyWorshipContext = false;
    this.router.transitionTo(route);
  }

  @action
  goToWorshipContext(route) {
    this.currentSession.onlyWorshipContext = true;
    this.currentSession.onlyUnitContext = false;
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
