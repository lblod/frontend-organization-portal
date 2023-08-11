import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { isEmpty } from 'frontend-organization-portal/models/decision';
import { validate as validateDate } from 'frontend-organization-portal/utils/datepicker';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { CHANGE_EVENT_TYPE } from 'frontend-organization-portal/models/change-event-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsEditController extends Controller {
  @service router;

  @tracked
  endDateValidation = { valid: true };

  @tracked
  publicationDateValidation = { valid: true };

  get isCityChangeEvent() {
    return (
      this.model.changeEvent.type &&
      this.model.changeEvent.type.get('id') == CHANGE_EVENT_TYPE.CITY
    );
  }

  get isAgbOrApb() {
    return (
      this.model.administrativeUnit.classification.get('id') ===
        CLASSIFICATION_CODE.AGB ||
      this.model.administrativeUnit.classification.get('id') ===
        CLASSIFICATION_CODE.APB
    );
  }

  get isIgs() {
    return (
      this.model.administrativeUnit.classification.get('id') ===
        CLASSIFICATION_CODE.PROJECTVERENIGING ||
      this.model.administrativeUnit.classification.get('id') ===
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING ||
      this.model.administrativeUnit.classification.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING ||
      this.model.administrativeUnit.classification.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
    );
  }

  @action
  validateEndDate(validation) {
    this.endDateValidation = validateDate(validation);
  }

  @action
  validatePublicationDate(validation) {
    this.publicationDateValidation = validateDate(validation);
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
      this.endDateValidation.valid &&
      this.publicationDateValidation.valid &&
      changeEvent.isValid &&
      shouldSaveDecision
        ? decision.isValid
        : true
    ) {
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
