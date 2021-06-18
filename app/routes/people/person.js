import Route from '@ember/routing/route';

export default class PeoplePersonRoute extends Route {
  async model(params) {
    return this.store.findRecord('person', params.id);
  }
}
