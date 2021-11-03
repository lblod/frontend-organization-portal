import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ID_NAME } from 'frontend-contact-hub/models/identifier';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import personValidations from 'frontend-contact-hub/validations/person';

export default class PeopleNewRoute extends Route {
  @service store;

  model() {
    return {
      person: createValidatedChangeset(
        this.store.createRecord('person'),
        personValidations
      ),
      dateOfBirth: this.store.createRecord('date-of-birth'),
      identifierSSN: this.store.createRecord('identifier', {
        idName: ID_NAME.SSN,
      }),
      structuredIdentifierSSN: this.store.createRecord('structured-identifier'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
