import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyIndexController extends Controller {
  queryParams = ['page', 'sort', 'size'];

  size = 25;
  @tracked page = 0;
  @tracked sort = 'governing-alias.given-name';

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get positionsCantBeCreatedOrEdited() {
    return (
      !this.isCentralWorshipService && new Date() >= new Date('2023-02-01')
    );
  }
}
