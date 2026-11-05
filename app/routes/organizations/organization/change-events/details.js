import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class OrganizationsOrganizationChangeEventsDetailsRoute extends Route {
  @service store;
  @service scopeOfOperation;

  async model() {
    let organization = this.modelFor('organizations.organization');

    let { changeEventId } = this.paramsFor(
      'organizations.organization.change-events.details',
    );
    const { content: changeEvent } = await this.store.request(
      findRecord('change-event', changeEventId, {
        reload: true,
        include: [
          'type',
          'decision',
          'original-organizations',
          'resulting-organizations',
          'results.resulting-organization',
          'results.status',
          'results.resulting-legal-form',
          'results.resulting-scope',
          'results.resulting-additional-qualifications',
          'results.original-legal-form',
          'results.original-scope',
          'results.original-additional-qualifications',
        ].join(),
      }),
    );

    let currentChangeEventResult = await findCurrentChangeEventResult(
      organization,
      changeEvent,
    );

    let resultingScope = currentChangeEventResult?.resultingScope;
    let resultingScopeLabel = resultingScope
      ? await this.scopeOfOperation.getLabelForLocation(resultingScope)
      : undefined;

    let originalScope = currentChangeEventResult?.originalScope;
    let originalScopeLabel = originalScope
      ? await this.scopeOfOperation.getLabelForLocation(originalScope)
      : undefined;

    return {
      organization,
      changeEvent,
      currentChangeEventResult,
      resultingScopeLabel,
      originalScopeLabel,
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
