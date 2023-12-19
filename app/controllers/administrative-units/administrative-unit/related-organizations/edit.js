import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  get hasValidationErrors() {
    return this.model.administrativeUnit.isInvalid;
  }

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

  get isPoliceZone() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.POLICE_ZONE
    );
  }

  get isAssistanceZone() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.ASSISTANCE_ZONE
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

  get isOcmwAssociation() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.includes(
      this.model.administrativeUnit.classification?.get('id')
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
      CLASSIFICATION_CODE.POLICE_ZONE,
      CLASSIFICATION_CODE.ASSISTANCE_ZONE,
      // TODO when onboarded, add companies
    ];
  }

  get classificationCodesOcmwAssociationParticipants() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.concat([
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
    ]);
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
  updateRelatedOrg(orgs) {
    if (Array.isArray(orgs)) {
      this.model.administrativeUnit.isSubOrganizationOf = orgs[0];
      this.model.administrativeUnit.wasFoundedByOrganizations = orgs;
    } else {
      this.model.administrativeUnit.isSubOrganizationOf = orgs;
      this.model.administrativeUnit.wasFoundedByOrganizations = new Array(orgs);
    }
  }

  @action
  updateRelatedSubOrg(subOrg) {
    this.model.administrativeUnit.isAssociatedWith = subOrg;
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
