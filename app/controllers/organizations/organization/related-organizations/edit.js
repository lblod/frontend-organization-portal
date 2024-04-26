import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  get hasValidationErrors() {
    return this.model.organization.error;
  }

  queryParams = ['sort'];

  @tracked sort = 'name';

  // TODO:  move logic to model
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
    let subOrganization = this.store.createRecord('administrative-unit');
    this.model.subOrganizations.push(subOrganization);
  }

  @action
  updateSubOrganization(removedOrganization, addedOrganization) {
    this.removeSubOrganization(removedOrganization);
    this.model.subOrganizations.push(addedOrganization);
  }

  @action
  removeSubOrganization(organization) {
    const index = this.model.subOrganizations.indexOf(organization);
    if (index > -1) {
      this.model.subOrganizations.splice(index, 1);
    }
  }

  @action
  updateRelatedOrg(orgs) {
    if (Array.isArray(orgs)) {
      this.model.organization.isSubOrganizationOf = orgs[0];
      this.model.organization.wasFoundedByOrganizations = orgs;
    } else {
      this.model.organization.isSubOrganizationOf = orgs;
      this.model.organization.wasFoundedByOrganizations = orgs ? [orgs] : [];
    }
  }

  @action
  updateRelatedSubOrg(subOrg) {
    this.model.organization.isAssociatedWith = subOrg;
  }

  @action
  addNewHasParticipants() {
    let organization = this.store.createRecord('administrative-unit');
    this.model.hasParticipants.push(organization);
  }

  @action
  updateHasParticipants(removedOrganization, addedOrganization) {
    this.removeHasParticipants(removedOrganization);
    this.model.hasParticipants.push(addedOrganization);
  }

  @action
  removeHasParticipants(organization) {
    const index = this.model.hasParticipants.indexOf(organization);
    if (index > -1) {
      this.model.hasParticipants.splice(index, 1);
    }
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { organization, subOrganizations, hasParticipants } = this.model;
    organization.subOrganizations = subOrganizations;
    organization.hasParticipants = hasParticipants;

    yield organization.validate({ relaxMandatoryFoundingOrganization: true });

    if (!this.hasValidationErrors) {
      yield organization.save();

      this.router.transitionTo(
        'organizations.organization.related-organizations',
        organization.id
      );
    }
  }

  reset() {
    this.model.organization.reset();
  }
}
