import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import personValidations from 'frontend-contact-hub/validations/person';
import { inject as service } from '@ember/service';

export default class PeoplePersonPersonalInformationEditRoute extends Route {
  @service currentSession;
  @service session;

  beforeModel() {
    if (!this.currentSession.hasAllowedRole) {
      this.session.invalidate();
    }
  }
  model() {
    let { person } = this.modelFor('people.person.personal-information');

    return {
      person: createValidatedChangeset(person, personValidations),
    };
  }
}
