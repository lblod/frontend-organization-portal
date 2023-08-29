import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationRelatedOrganizationsController extends Controller {
  queryParams = ['sort', 'page', 'size', 'organizationStatus'];

  @tracked sort = 'name';
  @tracked page = 0;
  @tracked size = 25;
  @tracked organizationStatus = true;

  get relatedOrganizations() {
    return this.model.loadRelatedOrganizationsTaskInstance.isFinished
      ? this.model.loadRelatedOrganizationsTaskInstance.value
      : this.model.relatedOrganizations;
  }

  get isLoading() {
    return this.model.loadRelatedOrganizationsTaskInstance.isRunning;
  }
}
