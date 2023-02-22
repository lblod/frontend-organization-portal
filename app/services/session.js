import { inject as service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';
import config from 'frontend-organization-portal/config/environment';

export default class SessionService extends BaseSessionService {
  @service currentSession;
  @service role;

  handleAuthentication(routeAfterAuthentication) {
    super.handleAuthentication(routeAfterAuthentication);
    this.currentSession.load();
    this.role.loadActiveRole();
  }

  handleInvalidation() {
    let logoutUrl = config.torii.providers['acmidm-oauth2'].logoutUrl;
    this.role.destroyActiveRole();
    super.handleInvalidation(logoutUrl);
  }
}
