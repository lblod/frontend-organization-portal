import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitChangeEventsIndexController extends Controller {
  queryParams = ['page', 'size', 'sort'];

  @tracked page = 0;
  @tracked size = 20;
  @tracked sort = '-result-from.date';
}
