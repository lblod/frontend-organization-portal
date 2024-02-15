import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  get hasValidationErrors() {
    return this.model.administrativeUnit.error;
  }

  queryParams = ['sort'];

  @tracked sort = 'name';

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

  get classificationCodesPevaParticipants() {
    return [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];
  }

  @action
  addNewSubOrganization() {
    let subOrganization = this.store.createRecord('organization');
    this.model.subOrganizations.push(subOrganization);
  }

  @action
  updateSubOrganization(removedOrganization, addedOrganization) {
    this.model.subOrganizations.removeObject(removedOrganization);
    this.model.subOrganizations.push(addedOrganization);
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
      this.model.administrativeUnit.wasFoundedByOrganizations = orgs
        ? [orgs]
        : [];
    }
  }

  @action
  updateRelatedSubOrg(subOrg) {
    this.model.administrativeUnit.isAssociatedWith = subOrg;
  }

  @action
  addNewHasParticipants() {
    let organization = this.store.createRecord('organization');
    this.model.hasParticipants.push(organization);
  }

  @action
  updateHasParticipants(removedOrganization, addedOrganization) {
    this.model.hasParticipants.removeObject(removedOrganization);
    this.model.hasParticipants.push(addedOrganization);
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

    if (!this.hasValidationErrors) {
      yield administrativeUnit.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.related-organizations',
        administrativeUnit.id
      );
    }
  }

  reset() {
    this.model.administrativeUnit.reset();
  }
}
