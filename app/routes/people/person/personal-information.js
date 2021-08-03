import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class PeoplePersonPersonalInformationRoute extends Route {
  @service store;

  async model() {
    let { id: personId } = this.paramsFor('people.person');

    let person = await this.store.findRecord('person', personId, {
      reload: true,
      include: [
        'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit.classification',
        'mandatories.contacts',
      ].join(),
    });

    return {
      person,
    };
  }
}
