import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { REQUEST_REASON } from 'frontend-organization-portal/models/request-reason';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PeoplePersonPersonalInformationEditController extends Controller {
  @service router;
  @service sensitivePersonalInformation;
  @service store;

  @tracked
  sensitiveInformationError;
  @tracked
  validSsn = true;

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
  @dropTask
  *save(event) {
    event.preventDefault();
    let { person, contacts, sensitiveInformation } = this.model;
    yield person.validate();
    let valid = person.isValid;

    for (let contact of contacts) {
      let { primaryContact, secondaryContact, address } = contact;
      yield primaryContact.validate();
      yield secondaryContact.validate();
      yield address.validate();
      if (
        !primaryContact.isValid ||
        !secondaryContact.isValid ||
        !address.isValid
      ) {
        valid = false;
      }
    }
    if (sensitiveInformation) {
      let { validSsn, sensitiveInformationError } =
        yield this.sensitivePersonalInformation.validateSsn(
          person,
          sensitiveInformation.ssn
        );
      this.validSsn = validSsn;
      this.sensitiveInformationError = sensitiveInformationError;
    }
    if (valid && this.validSsn) {
      for (let contact of contacts) {
        let { primaryContact, secondaryContact, address, position } = contact;
        if (address.isDirty) {
          address.fullAddress = combineFullAddress(address);
          yield address.save();
        }
        primaryContact.contactAddress = address;
        if (primaryContact.isDirty) {
          yield primaryContact.save();
        }
        if (secondaryContact.isDirty) {
          yield secondaryContact.save();
        }
        yield position.save();
      }
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
