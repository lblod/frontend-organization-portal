import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationRelatedOrganizationsController extends Controller {
  queryParams = ['sort', 'page', 'size', 'organizationStatus'];

  @tracked sort = 'name';
  @tracked page = 0;
  @tracked size = 25;
  @tracked organizationStatus = true;

  get subOrganizations() {
    return this.model.loadSubOrganizationsTaskInstance.isFinished
      ? this.model.loadSubOrganizationsTaskInstance.value
      : this.model.subOrganizations;
  }

  get isLoading() {
    return this.model.loadSubOrganizationsTaskInstance.isRunning;
  }
}
