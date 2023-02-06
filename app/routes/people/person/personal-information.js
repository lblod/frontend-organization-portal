import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
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

    // assuming we duplicate persons + change uri for the worship positions ones
    let administrativeUnitPersonType = true;
    for (const position of positions) {
      const administrativeUnit = await position.administrativeUnit;
      const classification = await administrativeUnit.classification;
      if (
        ![
          CLASSIFICATION_CODE.MUNICIPALITY,
          CLASSIFICATION_CODE.OCMW,
          CLASSIFICATION_CODE.PROVINCE,
          CLASSIFICATION_CODE.DISTRICT,
        ].includes(classification.id)
      ) {
        administrativeUnitPersonType = false;
        break;
      }
    }

    let askSensitiveInformation = null;
    let requestSensitiveInformation = null;

    if (
      this.sensitivePersonalInformation.hasStoredSensitiveInformation(person)
    ) {
      requestSensitiveInformation =
        this.sensitivePersonalInformation.getStoredSensitiveInformation(person);
    } else {
      askSensitiveInformation =
        await this.sensitivePersonalInformation.askInformation(
          person,
          administrativeUnitPersonType
        );
    }

    return {
      person,
      askSensitiveInformation,
      requestSensitiveInformation,
      administrativeUnitPersonType,
      positions,
    };
  }
}
