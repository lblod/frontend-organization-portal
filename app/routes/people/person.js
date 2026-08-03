import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class PeoplePersonRoute extends Route {
  @service store;

  async model(params) {
    return this.store.findRecord('person', params.id);
  }
}
