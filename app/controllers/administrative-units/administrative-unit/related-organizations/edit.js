import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  queryParams = ['sort'];

  @tracked sort = 'name';

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

  get isAgb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.AGB
    );
  }

  get isApb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.APB
    );
  }

  get isDistrict() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isIgs() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.PROJECTVERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
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

  get classificationCodesIgsParticipants() {
    return [
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
      CLASSIFICATION_CODE.AGB,
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      // TODO when onboarded, add politiezone, hulpverleningzone and companies
    ];
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
  @action
  updateRelatedOrg(org) {
    this.model.administrativeUnit.isSubOrganizationOf = org;
    this.model.administrativeUnit.wasFoundedByOrganization = org;
  }

  @action
  addNewHasParticipants() {
    let organization = this.store.createRecord('organization');
    this.model.hasParticipants.pushObject(organization);
  }

  @action
  updateHasParticipants(removedOrganization, addedOrganization) {
    this.model.hasParticipants.removeObject(removedOrganization);
    this.model.hasParticipants.pushObject(addedOrganization);
  }

  @action
  removeHasParticipants(organization) {
    this.model.hasParticipants.removeObject(organization);
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { administrativeUnit, subOrganizations, hasParticipants } = this.model;
    administrativeUnit.subOrganizations = subOrganizations;
    administrativeUnit.hasParticipants = hasParticipants;

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
