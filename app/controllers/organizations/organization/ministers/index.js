import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class OrganizationsOrganizationMinistersIndexController extends Controller {
  @service router;

  get currentURL() {
    return this.router.currentURL;
  }
}
