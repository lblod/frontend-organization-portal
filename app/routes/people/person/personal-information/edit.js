import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import personValidations from 'frontend-contact-hub/validations/person';
import { inject as service } from '@ember/service';

export default class PeoplePersonPersonalInformationEditRoute extends Route {
  @service currentSession;
  @service session;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', { wildcard: 'not-found' });
    }
  }
  model() {
    let { person } = this.modelFor('people.person.personal-information');

    return {
      person: createValidatedChangeset(person, personValidations),
    };
  }
}
