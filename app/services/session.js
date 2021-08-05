import { inject as service } from '@ember/service';
import BaseSessionService from 'ember-simple-auth/services/session';

export default class SessionService extends BaseSessionService {
  @service currentSession;

  handleAuthentication(routeAfterAuthentication) {
    super.handleAuthentication(routeAfterAuthentication);
    this.currentSession.load();
  }
}
