import Controller from '@ember/controller';
import { ID_NAME } from 'frontend-organization-portal/models/identifier';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganizationsOrganizationCoreDataController extends Controller {
  @tracked showAbbData = true;

  isKboIdentifier(identifier) {
    return identifier?.idName === ID_NAME.KBO;
  }

  get kboIdentifier() {
    return this.model.representativeBody.identifiers.find((id) =>
      this.isKboIdentifier(id)
    );
  }

  @action
  setShowAbbData(value) {
    this.showAbbData = value;
  }
}
