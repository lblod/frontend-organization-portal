import Controller from '@ember/controller';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class MandatoryIndexController extends Controller {
  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.model.mandatory.mandate
        .get('governingBody')
        .get('isTimeSpecializationOf')
        .get('administrativeUnit')
        .get('classification')
        .get('id') === CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.model.mandatory.mandate
        .get('governingBody')
        .get('isTimeSpecializationOf')
        .get('administrativeUnit')
        .get('classification')
        .get('id') === CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get positionsCantBeCreatedOrEdited() {
    return new Date() >= new Date('2023-02-01');
  }
}
