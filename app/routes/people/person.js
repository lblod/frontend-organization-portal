import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { findRecord } from '@warp-drive/legacy/compat/builders';

export default class PeoplePersonRoute extends Route {
  @service store;

  async model(params) {
    const { content: person } = await this.store.request(
      findRecord('person', params.id),
    );
    return person;
  }
}
