import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RedirectRoute extends Route {
  @service deepLink;
  @service router;
  @service session;

  async beforeModel(transition) {
    if (this.session.requireAuthentication(transition, 'login')) {
      let { resource: resourceUri } = transition.to.queryParams;

      if (!resourceUri) {
        return this.router.replaceWith('index');
      }

      try {
        await this.deepLink.redirect(resourceUri);
      } catch (error) {
        return this.router.replaceWith('index');
      }
    }
  }
}
