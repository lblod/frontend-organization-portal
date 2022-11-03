import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
export default class PeoplePersonPositionsIndexController extends Controller {
  @service router;

  queryParams = ['page', 'size', 'role', 'administrativeUnit', 'endDate'];

  @tracked page = 0;
  size = 25;
  @tracked sort = 'role';
  @tracked role;
  @tracked administrativeUnit;
  @tracked endDate;

  @tracked positions;
}
