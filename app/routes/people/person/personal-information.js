import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class PeoplePersonPersonalInformationRoute extends Route {
  // model() {
  //   return this.modelFor('people.person');
  // }

  @service store;

  model() {
    let { id: personId } = this.paramsFor('people.person');

    return this.store.findRecord('person', personId, {
      reload: true,
      include: [
        'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit',
        'mandatories.contacts',
      ].join(),
    });
  }
}
