import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsIndexController extends Controller {
  queryParams = ['sort', 'page', 'size'];

  @tracked sort = 'administrative-unit.name';
  @tracked page = 0;
  @tracked size = 20;

  get isWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }
}
