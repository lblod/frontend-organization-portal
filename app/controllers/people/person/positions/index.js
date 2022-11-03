import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
export default class PeoplePersonPositionsIndexController extends Controller {
  @service router;

  queryParams = [
    'sort',
    'page',
    'size',
    'role',
    'administrativeUnit',
    'endDate',
    'positions',
  ];

  @tracked page = 0;
  size = 25;
  @tracked sort = 'role';
  @tracked role = '';
  @tracked administrativeUnit = '';
  @tracked endDate = '';

  @tracked positions;
}
