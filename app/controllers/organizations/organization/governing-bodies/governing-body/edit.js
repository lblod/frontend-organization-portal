import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { saveRecord } from '@warp-drive/legacy/compat/builders';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';

export default class OrganizationsOrganizationGoverningBodiesGoverningBodyEditController extends Controller {
  @service router;
  @service store;

  get hasValidationErrors() {
    return this.model.governingBody.error;
  }

  get endDateOptional() {
    const { organization } = this.model;
    const status = organization.belongsTo('organizationStatus').value();

    return Boolean(
      organization.isWorshipService &&
      status?.id === ORGANIZATION_STATUS.IN_FORMATION,
    );
  }

  @action
  cancel() {
    this.reset();

    this.router.transitionTo(
      'organizations.organization.governing-bodies.governing-body',
    );
  }

  save = dropTask(async (event) => {
    event.preventDefault();

    await this.model.governingBody.validate({
      endDateOptional: this.endDateOptional,
    });

    if (!this.hasValidationErrors) {
      await this.store.request(saveRecord(this.model.governingBody));

      this.router.transitionTo(
        'organizations.organization.governing-bodies.governing-body',
        this.model.governingBody.id,
      );
    }
  });

  reset() {
    this.model.governingBody.reset();
  }
}
