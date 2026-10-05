import Controller from '@ember/controller';
import { service } from '@ember/service';
import { saveRecord } from '@warp-drive/legacy/compat/builders';
import { dropTask } from 'ember-concurrency';
import {
  isCityType,
  isNameChangeType,
} from 'frontend-organization-portal/models/change-event-type';

export default class OrganizationsOrganizationChangeEventsDetailsEditController extends Controller {
  @service router;
  @service store;

  isCityType = isCityType;
  isNameChangeType = isNameChangeType;

  get hasValidationErrors() {
    return this.model.changeEvent.error || this.model.decision?.error;
  }

  save = dropTask(async (event) => {
    event.preventDefault();

    let { changeEvent, currentChangeEventResult, decision } = this.model;

    await changeEvent.validate();

    if (changeEvent.requiresDecisionInformation) {
      await decision.validate();
    }

    if (
      isNameChangeType(changeEvent.type) &&
      !currentChangeEventResult.resultingName
    ) {
      changeEvent.addError('resultingName', 'Vul de nieuwe naam in');
    }

    if (
      !changeEvent.error &&
      (changeEvent.requiresDecisionInformation ? !decision.error : true)
    ) {
      if (changeEvent.requiresDecisionInformation) {
        if (!decision.isEmpty && decision.hasDirtyAttributes) {
          if (decision.isNew) {
            changeEvent.decision = decision;
          }

          await this.store.request(saveRecord(decision));
        }

        if (decision.isEmpty) {
          changeEvent.decision = null;
          decision.deleteRecord();
          if (!decision.isNew) {
            await this.store.request(saveRecord(decision));
          }
          decision.unloadRecord();
          // Prevents errors in call to `reset()` on transition
          this.model.decision = null;
        }
      }

      if (currentChangeEventResult.hasDirtyAttributes) {
        await this.store.request(saveRecord(currentChangeEventResult));
      }

      // Note: always save change event as adding a decision is not detected by
      // the `hasDirtyAttributes` method, which results in the new decision to
      // be discarded on save.
      await this.store.request(saveRecord(changeEvent));

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
    this.model.currentChangeEventResult.rollbackAttributes();
  }
}
