import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';
import { RELATION_TYPES } from 'frontend-organization-portal/models/organization';

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

  // TODO fix table pagination (index page only)
  // TODO Remove sorting in edit mode ?

  @action
  addNewRelatedOrganization() {
    let clonedOrganization = this.store.createRecord('organization');
    if (this.isCentralWorshipService) {
      clonedOrganization.relationType = RELATION_TYPES.HAS_RELATION_WITH;
    } else if (this.isIgs) {
      clonedOrganization.relationType = RELATION_TYPES.HAS_PARTICIPANTS;
    }
    this.model.clonedRelatedOrganizations.pushObject(clonedOrganization);
  }

  @action
  updateRelatedOrganization(removedClonedOrganization, addedOrganization) {
    this.model.clonedRelatedOrganizations.removeObject(
      removedClonedOrganization
    );

    const addedClonedOrganization = this.cloneOrganization(addedOrganization);
    addedClonedOrganization.opUuid = addedOrganization.id;
    addedClonedOrganization.relationType =
      removedClonedOrganization.relationType;
    this.model.clonedRelatedOrganizations.pushObject(addedClonedOrganization);
  }

  @action
  removeRelatedOrganization(clonedOrganization) {
    this.model.clonedRelatedOrganizations.removeObject(clonedOrganization);
  }

  @action
  updateRelatedOrg(org) {
    this.model.administrativeUnit.isSubOrganizationOf = org;
    this.model.administrativeUnit.wasFoundedByOrganization = org;
  }

  @action
  updateRelationType(organization, relationType) {
    console.log(this.model.clonedRelatedOrganizations);
    const clonedOrganization = this.model.clonedRelatedOrganizations.find(
      (clonedOrg) => {
        if (clonedOrg.opUuid) return clonedOrg.opUuid == organization.opUuid;
        else return clonedOrg.id == organization.id;
      }
    );
    clonedOrganization.relationType = relationType;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { administrativeUnit, clonedRelatedOrganizations } = this.model;

    let subOrganizations = [];
    let hasParticipants = [];
    for (const clonedOrganization of clonedRelatedOrganizations) {
      if (clonedOrganization.opUuid) {
        const organization = yield this.store.findRecord(
          'organization',
          clonedOrganization.opUuid
        );
        if (clonedOrganization.relationType == 'Heeft een relatie met') {
          subOrganizations.push(organization);
        } else if (
          clonedOrganization.relationType == 'Heeft als participanten'
        ) {
          hasParticipants.push(organization);
        }
      }
    }

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

  cloneOrganization(organization) {
    const clone = this.store.createRecord('organization');

    clone.opUuid = organization.id;
    clone.name = organization.name;
    clone.organizationStatus = organization.organizationStatus;
    clone.classification = organization.classification;

    return clone;
  }
}
