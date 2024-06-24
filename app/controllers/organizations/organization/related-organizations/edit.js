import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  get hasValidationErrors() {
    return this.model.organization.error;
  }

  queryParams = ['sort'];

  @tracked sort = 'name';
  @tracked page = 0;
  @tracked size = 25;

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
