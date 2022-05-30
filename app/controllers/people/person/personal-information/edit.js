import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { REQUEST_REASON } from 'frontend-organization-portal/models/request-reason';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import {
  EMPTY_DATE,
  INVALID_DATE,
  MIN_DATE,
  MAX_DATE,
} from 'frontend-organization-portal/components/datepicker';

export default class PeoplePersonPersonalInformationEditController extends Controller {
  @service router;
  @service sensitivePersonalInformation;
  @service store;

  @tracked
  sensitiveInformationError;
  @tracked
  validSsn = true;

  @tracked
  birthDateValidation = { valid: true };

  @action
  validateBirthDate(validation) {
    if (!validation.valid) {
      switch (validation.error) {
        case INVALID_DATE: {
          this.birthDateValidation = {
            valid: false,
            errorMessage: 'Invalid date',
          };
          break;
        }
        case MIN_DATE: {
          this.birthDateValidation = {
            valid: false,
            errorMessage: 'min date invalid',
          };
          break;
        }
        case MAX_DATE: {
          this.birthDateValidation = {
            valid: false,
            errorMessage: 'max date invalid',
          };
          break;
        }
        case EMPTY_DATE: {
          this.birthDateValidation = { valid: true };
          break;
        }
      }
    } else {
      this.birthDateValidation = { valid: true };
    }
  }
  @action
  setSsn(value) {
    this.model.sensitiveInformation.ssn = value;
  }

  get currentURL() {
    return this.router.currentURL;
  }

  reset() {
    this.sensitiveInformationError = null;
    this.validSsn = true;
  }

  @action
  cancel() {
    let { person } = this.model;
    this.router.refresh();
    this.router.transitionTo('people.person.personal-information', person.id);
  }

  get minDate() {
    let minDate = new Date();
    minDate.setFullYear(1900);
    minDate.setMonth(0);
    minDate.setDate(1);
    return minDate;
  }

  get maxDate() {
    return new Date();
  }

  @dropTask
  *save(event) {
    event.preventDefault();
    let { person, sensitiveInformation } = this.model;
    yield person.validate();
    let valid = person.isValid;

    if (sensitiveInformation) {
      let { validSsn, sensitiveInformationError } =
        yield this.sensitivePersonalInformation.validateSsn(
          person,
          sensitiveInformation.ssn
        );
      this.validSsn = validSsn;
      this.sensitiveInformationError = sensitiveInformationError;
    }
    if (valid && this.validSsn && this.birthDateValidation.valid) {
      yield person.save();
      let requestReason = yield this.store.findRecord(
        'request-reason',
        REQUEST_REASON.EDITION
      );

      if (sensitiveInformation) {
        yield this.sensitivePersonalInformation.updateInformation(
          sensitiveInformation,
          person,
          requestReason
        );
      }
      this.router.refresh();
      this.router.transitionTo('people.person.personal-information', person.id);
    }
  }
}
