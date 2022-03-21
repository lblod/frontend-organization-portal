import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { isEmpty } from 'frontend-organization-portal/models/decision';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsEditController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    event.preventDefault();

    let {
      changeEvent,
      decision,
      decisionActivity,
      canAddDecisionInformation: shouldSaveDecision,
    } = this.model;

    yield changeEvent.validate();

    if (shouldSaveDecision) {
      yield decision.validate();
    }

    if (changeEvent.isValid && shouldSaveDecision ? decision.isValid : true) {
      if (shouldSaveDecision) {
        if (
          decisionActivity.changedAttributes().endDate ||
          (!isEmpty(decision) && decision.isDirty)
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

      if (changeEvent.isDirty) {
        yield changeEvent.save();
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.change-events.details',
        changeEvent.id
      );
    }
  }
}
