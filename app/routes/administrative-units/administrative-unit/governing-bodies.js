import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { EXECUTIVE_ORGANEN } from 'frontend-organization-portal/models/governing-body-classification-code';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesRoute extends Route {
  @service store;

  async model() {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      administrativeUnitId,
      {
        reload: true,
        include:
          'governing-bodies.has-time-specializations,governing-bodies.classification',
      }
    );

    let untimedGoverningBodies = await administrativeUnit.governingBodies;
    let governingBodies = [];

    for (let governingBody of untimedGoverningBodies.toArray()) {
      const governingBodyClassification = await governingBody.classification;
      if (
        !EXECUTIVE_ORGANEN.find((id) => id === governingBodyClassification.id)
      ) {
        const timedGoverningBodies = governingBody
          ? await governingBody.hasTimeSpecializations
          : [];

        const arrayTimedGoverningBodies = timedGoverningBodies.toArray();

        governingBodies.push(...arrayTimedGoverningBodies);
      }
    }

    const sortedTimesGoverningBodies = governingBodies.sort((a, b) => {
      if (a.endDate && b.endDate) {
        return b.endDate - a.endDate;
      } else if (a.startDate && b.startDate) {
        return b.startDate - a.startDate;
      } else {
        return b.endDate ? 1 : b.startDate ? 1 : -1;
      }
    });

    return {
      administrativeUnit,
      governingBodies: sortedTimesGoverningBodies,
    };
  }
}
