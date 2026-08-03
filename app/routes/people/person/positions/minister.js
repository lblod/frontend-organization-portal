import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class PeoplePersonPositionsMinisterRoute extends Route {
  @service store;

  async model({ ministerId }) {
    const person = this.modelFor('people.person');

    const { content: minister } = await this.store.request(
      findRecord('minister', ministerId, {
        reload: true,
        include: [
          'contacts.contact-address',
          'minister-position.function',
          'minister-position.worship-service.classification',
          'financing',
        ].join(),
      }),
    );

    return {
      person,
      minister,
    };
  }
}
