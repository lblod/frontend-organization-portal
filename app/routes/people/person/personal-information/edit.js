import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import personValidations from 'frontend-contact-hub/validations/person';

export default class PeoplePersonPersonalInformationEditRoute extends Route {
  model() {
    let { person } = this.modelFor('people.person.personal-information');

    return {
      person: createValidatedChangeset(person, personValidations),
    };
  }
}
