import Route from '@ember/routing/route';
import { service } from '@ember/service';

// Route for backwards compatibility with the removed `administrative-units`
// route. This will redirect to the corresponding route in `organizations`
export default class AdministrativeUnitsWildcardRoute extends Route {
  @service router;

  beforeModel(transition) {
    const baseUrl = this.router.urlFor('organizations');
    const url = `${baseUrl}/${transition.to.params.path}`;
    this.router.replaceWith(url);
  }
}
