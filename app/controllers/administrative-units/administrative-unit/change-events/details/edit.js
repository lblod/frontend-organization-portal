import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsEditController extends Controller {
  @service router;

  get hasValidationErrors() {
    return this.model.changeEvent.error || this.model.decision?.error;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { changeEvent, decision, decisionActivity } = this.model;

    yield changeEvent.validate();

    if (changeEvent.requiresDecisionInformation) {
      yield decision.validate();
    }

    if (
      !changeEvent.error && changeEvent.requiresDecisionInformation
        ? !decision.error
        : true
    ) {
      if (changeEvent.requiresDecisionInformation) {
        if (
          decisionActivity.changedAttributes().endDate ||
          (!decision.isEmpty && decision.hasDirtyAttributes)
        ) {
          if (decisionActivity.changedAttributes().endDate) {
            if (decisionActivity.isNew) {
              decision.hasDecisionActivity = decisionActivity;
            }
            yield decisionActivity.save();
          }
          if (decision.isNew) {
            changeEvent.decision = decision;
          }
          yield decision.save();
        }
      }

      if (changeEvent.hasDirtyAttributes) {
        yield changeEvent.save();
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.change-events.details',
        changeEvent.id
      );
    }
  }

  reset() {
    this.model.administrativeUnit.reset();
    this.model.changeEvent.reset();
    this.model.decision?.reset();
    this.model.decisionActivity?.rollbackAttributes();
  }
}
