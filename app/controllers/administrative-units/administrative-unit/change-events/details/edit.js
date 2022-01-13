import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { isEmpty } from 'frontend-contact-hub/models/decision';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsEditController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    event.preventDefault();

    let {
      changeEvent,
      decision,
      canAddDecisionInformation: shouldSaveDecision,
    } = this.model;

    yield changeEvent.validate();

    if (shouldSaveDecision) {
      yield decision.validate();
    }

    if (changeEvent.isValid && shouldSaveDecision ? decision.isValid : true) {
      if (shouldSaveDecision && !isEmpty(decision) && decision.isDirty) {
        if (decision.isNew) {
          changeEvent.decision = decision;
        }
        yield decision.save();
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
