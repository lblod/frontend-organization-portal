import Controller from '@ember/controller';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class OrganizationsOrganizationChangeEventsDetailsEditController extends Controller {
  @service router;

  get hasValidationErrors() {
    return this.model.changeEvent.error || this.model.decision?.error;
  }

  save = dropTask(async (event) => {
    event.preventDefault();

    let { changeEvent, decision, decisionActivity } = this.model;

    await changeEvent.validate();

    if (changeEvent.requiresDecisionInformation) {
      await decision.validate();
    }

    if (
      !changeEvent.error &&
      (changeEvent.requiresDecisionInformation ? !decision.error : true)
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
            await decisionActivity.save();
          }
          if (decision.isNew) {
            changeEvent.decision = decision;
          }

          await decision.save();
        }

        if (decision.isEmpty) {
          changeEvent.decision = null;
          await decision.destroyRecord();
          // Prevents errors in call to `reset()` on transition
          this.model.decision = null;
        }
      }

      // Note: always save change event as adding a decision is not detected by
      // the `hasDirtyAttributes` method, which results in the new decision to
      // be discarded on save.
      await changeEvent.save();

      this.router.transitionTo(
        'organizations.organization.change-events.details',
        changeEvent.id,
      );
    }
  });

  reset() {
    this.model.organization.reset();
    this.model.changeEvent.reset();
    this.model.decision?.reset();
    this.model.decisionActivity?.rollbackAttributes();
  }
}
