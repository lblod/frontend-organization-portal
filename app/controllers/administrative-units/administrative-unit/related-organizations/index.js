import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsIndexController extends Controller {
  queryParams = ['sort'];

  @tracked sort = 'name';
}
