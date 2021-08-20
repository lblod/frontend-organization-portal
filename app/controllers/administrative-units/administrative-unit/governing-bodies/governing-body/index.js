import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyIndexController extends Controller {
  queryParams = ['sort'];

  @tracked sort = 'governing-alias.given-name';
}
