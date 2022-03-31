import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service currentSession;
  @service session;

  async beforeModel() {
    await this.session.setup();
    try {
      await this.currentSession.load();
    } catch {
      this.session.invalidate();
    }
  }
}
