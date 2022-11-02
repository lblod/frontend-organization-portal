import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PeoplePersonPositionsIndexController extends Controller {
  @service router;
  @service store;
  queryParams = ['positions', 'role', 'administrativeUnit', 'status'];
  @tracked status = true;
  @tracked role;
  @tracked administrativeUnit;
  @tracked positions;
}
