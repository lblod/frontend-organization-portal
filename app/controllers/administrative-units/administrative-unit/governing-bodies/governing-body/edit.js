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

  resetValidation() {
    this.startDateValidation = { valid: true };
    this.endDateValidation = { valid: true };
  }
  @action
  async validateStartDate(validation) {
    this.resetValidation();
    this.startDateValidation = validateDate(validation);
  }

  @action
  async validateEndDate(validation) {
    this.resetValidation();
    this.endDateValidation = validateDate(validation);
  }

  @action
  cancel() {
    this.resetValidation();
    this.model.governingBody.rollbackAttributes();

    this.router.transitionTo(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );
  }
  @dropTask
  *save(event) {
    event.preventDefault();
    yield this.model.governingBody.validate();

    if (
      this.model.governingBody.isValid &&
      this.endDateValidation.valid &&
      this.startDateValidation.valid
    ) {
      yield this.model.governingBody.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.governing-bodies.governing-body',
        this.model.governingBody.id
      );
    } else {
      // TODO this isn't ideal. Worth to refactor the entire datepicker validation thing
      const errors = this.model.governingBody.errors;
      const startDateError = errors?.find((v) => v.key === 'startDate');
      const endDateError = errors?.find((v) => v.key === 'endDate');
      if (startDateError?.validation?.length) {
        this.startDateValidation = {
          valid: false,
          errorMessage: startDateError.validation.join('\n'),
        };
      }
      if (endDateError?.validation?.length) {
        this.endDateValidation = {
          valid: false,
          errorMessage: endDateError.validation.join('\n'),
        };
      }
    }
  }
}
