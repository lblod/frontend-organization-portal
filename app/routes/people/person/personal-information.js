import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPersonalInformationRoute extends Route {
  @service store;
  @service router;
  @service contactDetails;
  @service sensitivePersonalInformation;
  @service currentSession;
  resetController(controller) {
    controller.reset();
  }

  async model() {
    let { id: personId } = this.paramsFor('people.person');

    const { person, positions } =
      await this.contactDetails.getPersonAndAllPositions(personId);

    let askSensitiveInformation = null;
    let requestSensitiveInformation = null;

    if (
      this.sensitivePersonalInformation.hasStoredSensitiveInformation(person)
    ) {
      requestSensitiveInformation =
        this.sensitivePersonalInformation.getStoredSensitiveInformation(person);
    } else {
      askSensitiveInformation =
        await this.sensitivePersonalInformation.askInformation(person);
    }

    return {
      person,
      askSensitiveInformation,
      requestSensitiveInformation,
      positions,
    };
  }
}
