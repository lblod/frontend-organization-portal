import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class OrganizationsOrganizationLocalInvolvementsIndexController extends Controller {
  queryParams = ['sort', 'page', 'size'];

  // Note: "administrative-unit" is the relationship name in the
  // local-involvements model
  @tracked sort = 'administrative-unit.name';
  @tracked page = 0;
  @tracked size = 20;

  // TODO: replace by model function
  get isWorshipService() {
    return (
      this.model.organization.classification?.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }
}
