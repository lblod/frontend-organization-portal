import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationMinistersIndexController extends Controller {
  @service router;

  get currentURL() {
    return this.router.currentURL;
  }
}
