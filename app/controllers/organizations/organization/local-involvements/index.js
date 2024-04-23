import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationLocalInvolvementsIndexController extends Controller {
  queryParams = ['sort', 'page', 'size'];

  @tracked sort = 'administrative-unit.name';
  @tracked page = 0;
  @tracked size = 20;
}
