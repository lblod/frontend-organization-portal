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
    // Disabling positions creation and edition, they now happen in Loket.
    const positionsCantBeCreatedOrEdited = new Date() >= new Date('2023-02-01');
    if (!this.currentSession.canEdit || positionsCantBeCreatedOrEdited) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  async model() {
    let {
      person,
      requestSensitiveInformation,
      askSensitiveInformation,
      administrativeUnitPersonType,
    } = this.modelFor('people.person.personal-information');
    let sensitiveInformation = requestSensitiveInformation;
    console.log('here: ', administrativeUnitPersonType);
    if (askSensitiveInformation?.isEmpty()) {
      sensitiveInformation = new SensitivePersonalInformation();
    }
    return {
      person: createValidatedChangeset(person, personValidations),
      sensitiveInformation: sensitiveInformation,
      askSensitiveInformation,
      administrativeUnitPersonType,
    };
  }

  resetController(controller) {
    controller.reset();
  }
}
