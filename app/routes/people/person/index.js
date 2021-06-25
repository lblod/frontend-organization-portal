import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PeoplePersonIndexRoute extends Route {
  @service router;

  beforeModel() {
    return this.router.replaceWith('people.person.personal-information');
  }
}
