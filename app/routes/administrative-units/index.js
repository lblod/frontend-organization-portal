import Route from '@ember/routing/route';
import { service } from '@ember/service';

// Route for backwards compatibility with the removed `administrative-units`
// route. This will redirect to the corresponding route in `organizations`
export default class AdministrativeUnitsIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('organizations');
  }
}
