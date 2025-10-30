import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { NotFoundError, UnauthorizedError } from '@ember-data/adapter/error';
import { showErrorPage } from 'frontend-organization-portal/utils/error';

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
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      this.router.transitionTo('unauthorized');
    } else {
      console.error('Something went wrong:', error);
      showErrorPage(transition, this.router);
    }
  }
}
