import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';
import { EXECUTIVE_ORGANEN } from 'frontend-organization-portal/models/governing-body-classification-code';

export default class OrganizationsOrganizationGoverningBodiesRoute extends Route {
  @service store;

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    // NOTE (16/09/2026): The `governingBodies` property is defined in the
    // `AdministrativeUnit` model, not the `Organization` model, so we fetch
    // an `administrative-unit` here directly. This route assumes every
    // organization it is visited for is an administrative unit; visiting it
    // for a non-administrative-unit organization will fail.
    // We used to call `findRecord('organization', ...)` here, which only
    // worked because of an Ember bug that silently issued a request to the
    // `/administrative-units` endpoint instead of `/organizations`. The
    // Ember upgrade fixed that bug, which broke this route since it started
    // hitting `/organizations` for real and no longer got a `governingBodies`
    // relationship back.
    const { content: organization } = await this.store.request(
      findRecord('administrative-unit', organizationId, {
        reload: true,
        include:
          'governing-bodies.has-time-specializations,governing-bodies.classification',
      }),
    );

    let untimedGoverningBodies = await organization.governingBodies;
    let governingBodies = [];

    for (let governingBody of untimedGoverningBodies.slice()) {
      const governingBodyClassification = await governingBody.classification;
      if (
        !EXECUTIVE_ORGANEN.find((id) => id === governingBodyClassification.id)
      ) {
        const timedGoverningBodies = governingBody
          ? await governingBody.hasTimeSpecializations
          : [];

        const arrayTimedGoverningBodies = timedGoverningBodies.slice();

        governingBodies.push(...arrayTimedGoverningBodies);
      }
    }

    const sortedTimesGoverningBodies = governingBodies.sort((a, b) => {
      const now = new Date();
      const aStatusIsActive = !a.endDate || a.endDate > now;
      const bStatusIsActive = !b.endDate || b.endDate > now;

      if (aStatusIsActive !== bStatusIsActive) {
        return aStatusIsActive ? -1 : 1;
      }

      if (a.endDate && b.endDate) {
        return b.endDate - a.endDate;
      } else if (a.startDate && b.startDate) {
        return b.startDate - a.startDate;
      } else {
        return b.endDate ? 1 : b.startDate ? 1 : -1;
      }
    });

    return {
      organization,
      governingBodies: sortedTimesGoverningBodies,
    };
  }
}
