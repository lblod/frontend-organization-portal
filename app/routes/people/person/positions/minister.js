import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonPositionsMinisterRoute extends Route {
  @service store;

  async model({ ministerId }) {
    let person = this.modelFor('people.person');

    let minister = await this.store.findRecord('minister', ministerId, {
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
