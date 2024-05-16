import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyIndexController extends Controller {
  queryParams = ['page', 'sort', 'size'];

  size = 25;
  @tracked page = 0;
  @tracked sort = 'governing-alias.given-name';
}
