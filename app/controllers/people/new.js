import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { REQUEST_REASON } from 'frontend-organization-portal/models/request-reason';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import {
  validate as validateBirthDate,
  formatNl,
} from 'frontend-organization-portal/utils/datepicker';

export default class PeopleNewController extends Controller {
  @service router;
  @service sensitivePersonalInformation;
  @service store;

  queryParams = ['redirectUrl'];

  @tracked redirectUrl;
  @tracked positionId;

  @tracked
  sensitiveInformationError;

  @tracked
  birthDateValidation = { valid: true };

  @action
  validateBirthDate(validation) {
    let errorMessages = {
      minDate: `Kies een datum die na ${formatNl(this.minDate)} plaatsvindt.`,
      maxDate: `Kies een datum die vóór ${formatNl(this.maxDate)} plaatsvindt.`,
    };
    this.birthDateValidation = validateBirthDate(
      validation,
      true,
      errorMessages
    );
  }

  @action
  setSsn(value) {
    this.model.sensitiveInformation.ssn = value;
  }

  @dropTask
  *savePersonTask(event) {
    event.preventDefault();

    let { person, sensitiveInformation } = this.model;
    yield person.validate();

    let { validSsn, sensitiveInformationError } =
      yield this.sensitivePersonalInformation.validateSsn(
        person,
        sensitiveInformation.ssn
      );
    this.sensitiveInformationError = sensitiveInformationError;

    if (person.isValid && validSsn && this.birthDateValidation.valid) {
      person = setEmptyStringsToNull(person);
      yield person.save();

      let requestReason = yield this.store.findRecord(
        'request-reason',
        REQUEST_REASON.CREATION
      );

      yield this.sensitivePersonalInformation.updateInformation(
        sensitiveInformation,
        person,
        requestReason
      );

      let newPersonId = person.id;
      let getPositionId = this.redirectUrl
        .split('=')
        .pop()
        .split('%')[0]
        .toString();

      if (this.redirectUrl) {
        // When passing a url the query params are ignored so we add the person id manually for now
        //this.router.transitionTo(`${this.redirectUrl}?personId=${newPersonId}`);
        this.router.transitionTo(
          `administrative-units.administrative-unit.governing-bodies.governing-body.mandatory.new?positionId=${getPositionId}?personId=${newPersonId}`
        );
        console.log('redirect url: ', getPositionId);
      } else {
        this.router.transitionTo('people.person', newPersonId);
      }
    }
  }

  @action
  cancel() {
    if (this.redirectUrl) {
      this.router.transitionTo(this.redirectUrl);
    } else {
      this.router.transitionTo('people');
    }
  }

  reset() {
    this.birthDateValidation = { valid: true };
    this.redirectUrl = null;
    this.sensitiveInformationError = null;
    this.removeUnsavedRecords();
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

  removeUnsavedRecords() {
    this.model.person.rollbackAttributes();
  }
}
