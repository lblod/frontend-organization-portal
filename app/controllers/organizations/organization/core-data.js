import Controller from '@ember/controller';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { helper } from '@ember/component/helper';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationCoreDataController extends Controller {
  @tracked showAbbData = true;

  isKboIdentifier = helper(function isSharePointIdentifier([identifier]) {
    return identifier?.idName === ID_NAME.KBO;
  });

  @action
  setShowAbbData(value) {
    this.showAbbData = value;
  }
}
