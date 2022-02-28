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

    if (valid) {
      for (let contact of contacts) {
        let { primaryContact, secondaryContact, address, _ember_data } =
          contact;
        if (address.isDirty) {
          address.fullAddress = combineFullAddress(address);
          yield address.save();
        }
        primaryContact.contactAddress = address;
        if (primaryContact.isDirty) {
          yield primaryContact.save();
          _ember_data.contacts.pushObject(primaryContact);
        }
        if (secondaryContact.isDirty) {
          yield secondaryContact.save();
          _ember_data.contacts.pushObject(secondaryContact);
        }
        yield _ember_data.save();
      }
      yield person.save();
      this.router.transitionTo('people.person.personal-information', person.id);
    }
  }
}
