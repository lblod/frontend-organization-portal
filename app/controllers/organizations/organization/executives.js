import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationExecutivesController extends Controller {
  queryParams = ['page', 'sort', 'size'];
  @tracked page = 0;
  @tracked sort = '';
  size = 20;
}
