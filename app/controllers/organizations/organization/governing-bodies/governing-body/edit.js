import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyEditController extends Controller {
  @service router;

  get hasValidationErrors() {
    return this.model.governingBody.error;
  }

  @action
  cancel() {
    this.reset();

    this.router.transitionTo(
      'organizations.organization.governing-bodies.governing-body',
    );
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    yield this.model.governingBody.validate();

    if (!this.hasValidationErrors) {
      yield this.model.governingBody.save();

      this.router.transitionTo(
        'organizations.organization.governing-bodies.governing-body',
        this.model.governingBody.id,
      );
    }
  }

  reset() {
    this.model.governingBody.reset();
  }
}
