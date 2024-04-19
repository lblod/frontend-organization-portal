import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationLocalInvolvementsIndexController extends Controller {
  queryParams = ['sort', 'page', 'size'];

  // Note: "administrative-unit" is the relationship name in the
  // local-involvements model
  @tracked sort = 'administrative-unit.name';
  @tracked page = 0;
  @tracked size = 20;
}
