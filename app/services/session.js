import { inject as service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';
import config from 'frontend-organization-portal/config/environment';

export default class SessionService extends BaseSessionService {
  @service currentSession;
  @service role;

  async handleAuthentication(routeAfterAuthentication) {
    super.handleAuthentication(routeAfterAuthentication);
    await this.currentSession.load();
    await this.role.loadActiveRole();
  }

  async handleInvalidation() {
    let logoutUrl = config.torii.providers['acmidm-oauth2'].logoutUrl;
    await this.role.destroyActiveRole();
    super.handleInvalidation(logoutUrl);
  }
}
