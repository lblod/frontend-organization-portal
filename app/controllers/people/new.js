import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { REQUEST_REASON } from 'frontend-contact-hub/models/request-reason';

export default class PeopleNewController extends Controller {
  @service router;
  @service sensitivePersonalInformation;
  @service store;

  queryParams = ['redirectUrl'];

  @tracked redirectUrl;

  @tracked
  sensitiveInformationError;

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

    if (person.isValid && validSsn) {
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
      if (this.redirectUrl) {
        // When passing a url the query params are ignored so we add the person id manually for now
        this.router.transitionTo(`${this.redirectUrl}?personId=${newPersonId}`);
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
    this.redirectUrl = null;
    this.sensitiveInformationError = null;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.person.rollbackAttributes();
  }
}
