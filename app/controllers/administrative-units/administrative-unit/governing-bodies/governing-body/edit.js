import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { validate as validateDate } from 'frontend-organization-portal/utils/datepicker';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyEditController extends Controller {
  @service router;

  @tracked
  startDateValidation = { valid: true };
  @tracked
  endDateValidation = { valid: true };

  @action
  validateStartDate(validation) {
    this.startDateValidation = validateDate(validation);
  }

  @action
  validateEndDate(validation) {
    this.endDateValidation = validateDate(validation);
  }

  @action
  cancel() {
    this.startDateValidation = { valid: true };
    this.endDateValidation = { valid: true };
    this.model.governingBody.rollbackAttributes();
    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );
  }
  @dropTask
  *save(event) {
    event.preventDefault();

    if (this.endDateValidation.valid && this.startDateValidation.valid) {
      yield this.model.governingBody.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.governing-bodies.governing-body',
        this.model.governingBody.id
      );
    }
  }
}
