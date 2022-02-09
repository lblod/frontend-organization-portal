import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class PeoplePersonPersonalInformationEditController extends Controller {
  @service router;

  @dropTask
  *save(event) {
    event.preventDefault();
    let { person, contacts } = this.model;
    yield person.validate();
    let validContacts = true;

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
        validContacts = false;
        break;
      }
    }

    if (validContacts && person.isValid) {
      for (let contact of contacts) {
        let { primaryContact, secondaryContact, address } = contact;
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
      }
      yield person.save();

      this.router.transitionTo('people.person.personal-information', person.id);
    }
  }
}
