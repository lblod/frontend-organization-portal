import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service currentSession;
  @service session;
  @service role;
  @service router;

  async beforeModel() {
    await this.session.setup();
    try {
      await this.currentSession.load();
      await this.role.loadActiveRole();
    } catch {
      this.router.transitionTo('auth.logout');
    }
  }
}
