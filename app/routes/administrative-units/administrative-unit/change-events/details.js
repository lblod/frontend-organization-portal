import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { CHANGE_EVENT_TYPE } from 'frontend-contact-hub/models/change-event-type';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsDetailsRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    let { changeEventId } = this.paramsFor(
      'administrative-units.administrative-unit.change-events.details'
    );
    let changeEvent = await this.store.findRecord(
      'change-event',
      changeEventId,
      {
        reload: true,
        include: [
          'type',
          'decision',
          'original-organizations',
          'resulting-organizations',
          'results.resulting-organization',
          'results.status',
        ].join(),
      }
    );

    let currentChangeEventResult = await findCurrentChangeEventResult(
      administrativeUnit,
      changeEvent
    );

    let changeEventType = await changeEvent.type;

    return {
      administrativeUnit,
      changeEvent,
      currentChangeEventResult,
      isMergerChangeEvent: changeEventType.id === CHANGE_EVENT_TYPE.MERGER,
      shouldShowExtraInformationCard:
        shouldShowExtraInformationCard(changeEventType),
    };
  }
}

async function findCurrentChangeEventResult(organization, changeEvent) {
  let results = await changeEvent.results;

  for (let result of results.toArray()) {
    let resultingOrganization = await result.resultingOrganization;
    if (resultingOrganization.id === organization.id) {
      return result;
    }
  }
}

function shouldShowExtraInformationCard(changeEventType) {
  return (
    changeEventType.id === CHANGE_EVENT_TYPE.MERGER ||
    changeEventType.id === CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE
  );
}
