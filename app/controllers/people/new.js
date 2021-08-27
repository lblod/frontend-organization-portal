import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class PeopleNewController extends Controller {
  @service router;

  queryParams = ['redirectUrl'];

  @tracked redirectUrl;

  @dropTask
  *savePersonTask(event) {
    event.preventDefault();

    let { dateOfBirth, identifierSSN, person, structuredIdentifierSSN } =
      this.model;

    yield dateOfBirth.save();

    yield structuredIdentifierSSN.save();
    identifierSSN.structuredIdentifier = structuredIdentifierSSN;
    yield identifierSSN.save();

    person.dateOfBirth = dateOfBirth;
    person.registration = identifierSSN;
    yield person.save();

    let personId = this.model.person.id;

    if (this.redirectUrl) {
      // When passing a url the query params are ignored so we add the person id manually for now
      this.router.transitionTo(`${this.redirectUrl}?personId=${personId}`);
    } else {
      this.router.transitionTo('people.person', personId);
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
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.person.rollbackAttributes();
    this.model.dateOfBirth.rollbackAttributes();
    this.model.identifierSSN.rollbackAttributes();
    this.model.structuredIdentifierSSN.rollbackAttributes();
  }
}
