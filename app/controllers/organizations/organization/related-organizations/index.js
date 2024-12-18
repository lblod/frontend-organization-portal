import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationRelatedOrganizationsIndexController extends Controller {
  queryParams = [
    'sort',
    'page',
    'size',
    'organizationStatus',
    'selectedRoleLabel',
  ];

  @tracked sort = 'name';
  @tracked page = 0;
  @tracked size = 500;
  @tracked organizationStatus = true;
  @tracked selectedRoleLabel;

  reset() {
    this.selectedRoleLabel = '';
  }
}
