import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsMinisterRoute extends Route {
  @service store;

  async model({ positionId: ministerId }) {
    let person = this.modelFor('people.person');

    let minister = this.store.findRecord('minister', ministerId, {
      reload: true,
      include: [
        'contacts.contact-address',
        'minister-position.function',
        'minister-position.worship-service.classification',
        'financing',
      ].join(),
    });

    return {
      person,
      minister,
    };
  }
}
