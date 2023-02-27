import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SelectRoleController extends Controller {
  @service currentSession;
  @service router;
  @service role;

  @action
  async updateActiveRole(role) {
    await this.role.updateActiveRole(role);
    this.router.transitionTo('index');
  }

  get activeRole() {
    return this.currentSession.activeRole;
  }
}
