import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import RepresentativeBodyModel from '../../../../models/representative-body';

export default class OrganizationsOrganizationRelatedOrganizationsIndexController extends Controller {
  queryParams = ['sort', 'page', 'size', 'organizationStatus'];

  @tracked sort = 'name';
  @tracked page = 0;
  @tracked size = 25;
  @tracked organizationStatus = true;

  // TODO: Move to model
  get isRepresentativeBody() {
    return this.model.organization instanceof RepresentativeBodyModel;
  }
}
