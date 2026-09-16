import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { hasUnifiedMandatories } from 'frontend-organization-portal/models/governing-body-classification-code';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyIndexController extends Controller {
  queryParams = ['page', 'sort', 'size', 'mandatoriesPage'];

  size = 25;
  @tracked page = 0;
  @tracked mandatoriesPage = 0;
  @tracked sort = 'governing-alias.given-name';

  get showCombinedTable() {
    return hasUnifiedMandatories(this.model.governingBodyClassification);
  }
}
