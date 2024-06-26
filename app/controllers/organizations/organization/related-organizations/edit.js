import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class OrganizationsOrganizationRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  queryParams = ['sort', 'page', 'size', 'organizationStatus'];

  @tracked sort = 'name';
  @tracked page = 0;
  @tracked size = 25;
  @tracked organizationStatus = true;

  @tracked relatedOrganizations;

  get hasValidationErrors() {
    return this.model.organization.error;
  }

  setup() {
    if (!this.relatedOrganizations) {
      // Note: use EmberArray since this variable is tracked
      this.relatedOrganizations = A(
        this.model.relatedOrganizations.map((e) => e)
      );
    }
    if (this.relatedOrganizations.length === 0) {
      this.addRelatedOrganization();
    }
  }

  @action
  addRelatedOrganization() {
    let organization = this.store.createRecord('organization');
    this.relatedOrganizations.pushObject(organization);
    // TODO: update diff
  }

  @action
  removeRelatedOrganization(organization) {
    // TODO: do not remove if membership concerns founding
    this.relatedOrganizations.removeObject(organization);
    // TODO: update diff log
  }

  @action
  updateRelatedOrganization(removedOrganization, organization) {
    this.removeRelatedOrganization(removedOrganization);
    this.relatedOrganizations.pushObject(organization);
    // TODO: update diff log
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let organization = this.model.organization;
    // let { organization, subOrganizations, hasParticipants } = this.model;
    // organization.subOrganizations = subOrganizations;
    // organization.hasParticipants = hasParticipants;

    // TODO: update all the memberships and memberships-of-organizations of the necessary organizations

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
