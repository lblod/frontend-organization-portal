import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service currentSession;
  @service session;
  @service role;
  @service router;
  @service intl;

  async beforeModel() {
    await this.session.setup();
    this.intl.setLocale(['nl-BE']);

    try {
      await this.currentSession.load();
      await this.role.loadActiveRole();
    } catch {
      this.router.transitionTo('auth.logout');
    }
  }

  @action
  error(error, transition) {
    this.router.transitionTo('error', { error, transition });
  }
}
