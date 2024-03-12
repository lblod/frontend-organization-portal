import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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

    // resolve the first resulting organization here as workaround
    // the get helper does not work with async relationships in the template
    // https://github.com/emberjs/ember.js/issues/20510
    const firstResultingOrganization = (
      await changeEvent.resultingOrganizations
    )[0];

    let currentChangeEventResult = await findCurrentChangeEventResult(
      administrativeUnit,
      changeEvent
    );

    return {
      administrativeUnit,
      changeEvent,
      currentChangeEventResult,
      firstResultingOrganization,
    };
  }
}

async function findCurrentChangeEventResult(organization, changeEvent) {
  let results = await changeEvent.results;

  for (let result of results.slice()) {
    let resultingOrganization = await result.resultingOrganization;
    if (resultingOrganization.id === organization.id) {
      return result;
    }
  }
}
