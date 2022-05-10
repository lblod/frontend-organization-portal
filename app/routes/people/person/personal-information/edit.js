import Route from '@ember/routing/route';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import personValidations from 'frontend-organization-portal/validations/person';
import { inject as service } from '@ember/service';

import { SensitivePersonalInformation } from 'frontend-organization-portal/services/sensitive-personal-information';

export default class PeoplePersonPersonalInformationEditRoute extends Route {
  @service currentSession;
  @service router;
  @service store;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  async model() {
    let { person, requestSensitiveInformation, askSensitiveInformation } =
      this.modelFor('people.person.personal-information');
    let sensitiveInformation = requestSensitiveInformation;
    if (askSensitiveInformation?.isEmpty()) {
      sensitiveInformation = new SensitivePersonalInformation();
    }
    return {
      person: createValidatedChangeset(person, personValidations),
      sensitiveInformation: sensitiveInformation,
      askSensitiveInformation,
    };
  }

  resetController(controller) {
    controller.reset();
  }
}
