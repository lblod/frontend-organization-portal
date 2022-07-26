import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  get isAntwerpen() {
    return (
      this.model.administrativeUnit.id ==
        '670db1d66c0de3b931962e1044033ccfa9d6e3023aa9828a5f252c3bc69bd32c' || // gemeente
      this.model.administrativeUnit.id ==
        '83c7a12a4a8ac8dd82895715095a866dc4794e60de61b967419bdfc1e207ad96' // ocmw
    );
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isProvince() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isOCMW() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.OCMW
    );
  }

  get isMunicipality() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isDistrict() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.DISTRICT
    );
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

  get hasCentralWorshipService() {
    const typesThatHaveACentralWorshipService = [
      RECOGNIZED_WORSHIP_TYPE.ISLAMIC,
      RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC,
      RECOGNIZED_WORSHIP_TYPE.ORTHODOX,
    ];

    return (
      this.isWorshipService &&
      typesThatHaveACentralWorshipService.find(
        (id) => id == this.model.administrativeUnit.recognizedWorshipType?.id
      )
    );
  }

  get classificationCodes() {
    return [CLASSIFICATION_CODE.MUNICIPALITY];
  }

  @action
  addNewSubOrganization() {
    let subOrganization = this.store.createRecord('organization');
    this.model.subOrganizations.pushObject(subOrganization);
  }

  @action
  updateSubOrganization(removedOrganization, addedOrganization) {
    this.model.subOrganizations.removeObject(removedOrganization);
    this.model.subOrganizations.pushObject(addedOrganization);
  }

  @action
  removeSubOrganization(organization) {
    this.model.subOrganizations.removeObject(organization);
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { administrativeUnit, subOrganizations } = this.model;
    administrativeUnit.subOrganizations = subOrganizations;

    yield administrativeUnit.validate();

    if (administrativeUnit.isValid) {
      yield administrativeUnit.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.related-organizations',
        administrativeUnit.id
      );
    }
  }
}
