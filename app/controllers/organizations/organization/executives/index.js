import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationExecutivesIndexController extends Controller {
  queryParams = ['page', 'sort', 'size'];

  size = 25;
  @tracked page = 0;
  @tracked sort = 'governing-alias.given-name';
  @service router;

  get currentURL() {
    return this.router.currentURL;
  }
}
