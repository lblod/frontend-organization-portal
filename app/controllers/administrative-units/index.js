import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsIndexController extends Controller {
  @service router;
  queryParams = [
    'name',
    'municipality',
    'classification',
    'organizationStatus',
  ];

  @tracked name = '';
  @tracked municipality = '';
  @tracked classification = '';
  @tracked organizationStatus = '';

  @action
  search() {
    this.router.refresh();
  }

  @action
  setClassification(selection) {
    if (selection !== null) {
      this.classification = selection.id;
    } else {
      this.classification = '';
    }
  }

  get selectedClassification() {
    if (!this.classification) {
      return null;
    }

    return this.model.classifications.find((classification) => {
      return classification.id === this.classification;
    });
  }

  @action
  setOrganizationStatus(selection) {
    if (selection !== null) {
      this.organizationStatus = selection.id;
    } else {
      this.organizationStatus = '';
    }
  }

  get selectedOrganizationStatus() {
    if (!this.organizationStatus) {
      return null;
    }

    return this.model.statuses.find((organizationStatus) => {
      return organizationStatus.id === this.organizationStatus;
    });
  }
}
