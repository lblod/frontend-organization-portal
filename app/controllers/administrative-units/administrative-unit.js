import Controller from '@ember/controller';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitController extends Controller {
  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.model.classification?.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.model.classification?.get('id') ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isProvince() {
    return (
      this.model.classification?.get('id') === CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isDistrict() {
    return (
      this.model.classification?.get('id') === CLASSIFICATION_CODE.DISTRICT
    );
  }
}
