import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';

export default class OPSessionService extends SessionService {
  @service currentSession;

  get isMockLoginSession() {
    return this.isAuthenticated
      ? this.data.authenticated.authenticator.includes('mock-login')
      : false;
  }

  async handleAuthentication(routeAfterAuthentication) {
    await this.currentSession.load();
    super.handleAuthentication(routeAfterAuthentication);
  }

  handleInvalidation() {
    // Invalidation is handled in the relevant routes directly
  }
}
