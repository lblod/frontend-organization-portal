import Controller from '@ember/controller';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { helper } from '@ember/component/helper';

export default class OrganizationsOrganizationCoreDataController extends Controller {
  isKboIdentifier = helper(function isSharePointIdentifier([identifier]) {
    return identifier?.idName === ID_NAME.KBO;
  });
}
