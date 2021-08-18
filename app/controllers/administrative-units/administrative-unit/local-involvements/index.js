import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsIndexController extends Controller {
  queryParams = ['sort'];

  @tracked sort = 'administrative-unit.name';
}
