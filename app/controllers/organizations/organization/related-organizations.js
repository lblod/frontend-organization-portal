import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationRelatedOrganizationsController extends Controller {
  queryParams = ['sort', 'page'];

  @tracked sort = 'name';
  @tracked page = 0;
  @tracked size = 25;
}
