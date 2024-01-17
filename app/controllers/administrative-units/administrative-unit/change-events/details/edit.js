import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsEditController extends Controller {
  @service router;

  get hasValidationErrors() {
    return this.model.changeEvent.error || this.model.decision?.error;
  }

  get isCityChangeEvent() {
    return (
      this.model.changeEvent.type &&
      this.model.changeEvent.type.get('id') == CHANGE_EVENT_TYPE.CITY
    );
  }

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

    if (
      !this.model.changeEvent.error && shouldSaveDecision
        ? !decision.error
        : true
    ) {
      if (shouldSaveDecision) {
        if (
          decisionActivity.changedAttributes().endDate ||
          (!decision.isEmpty && decision.hasDirtyAttributes)
        ) {
          console.log('endDate isEmpty dirty');
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
  }
}
