import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
export default class PeoplePersonPositionsIndexController extends Controller {
  @service router;

  queryParams = ['sort', 'page', 'size'];

  @tracked sort = 'position.status';
  @tracked page = 0;
  @tracked size = 25;
}
