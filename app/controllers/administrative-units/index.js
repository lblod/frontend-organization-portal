import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AdministrativeUnitsIndexController extends Controller {
  @service router;
  queryParams = [
    'page',
    'size',
    'sort',
    'name',
    'municipality',
    'classification',
    'organizationStatus',
  ];

  @tracked page = 0;
  size = 20;
  @tracked sort = 'name';
  @tracked name = '';
  @tracked municipality = '';
  @tracked classification = '';
  @tracked organizationStatus = '';

  get administrativeUnits() {
    return this.model.loadAdministrativeUnitsTaskInstance.isFinished
      ? this.model.loadAdministrativeUnitsTaskInstance.value
      : this.model.loadedAdministrativeUnits;
  }

  get isLoading() {
    return this.model.loadAdministrativeUnitsTaskInstance.isRunning;
  }

  get hasPreviousData() {
    return (
      this.model.loadedAdministrativeUnits &&
      this.model.loadedAdministrativeUnits.length > 0
    );
  }

  get showTableLoader() {
    return this.isLoading && !this.hasPreviousData;
  }

  get selectedClassification() {
    if (!this.classification) {
      return null;
    }

    return this.model.classifications.find((classification) => {
      return classification.id === this.classification;
    });
  }

  get selectedOrganizationStatus() {
    if (!this.organizationStatus) {
      return null;
    }

    return this.model.statuses.find((organizationStatus) => {
      return organizationStatus.id === this.organizationStatus;
    });
  }

  @action
  search(event) {
    event.preventDefault();

    if (this.page > 0) {
      // resetting the pagination will refresh the model
      this.resetPagination();
    } else {
      this.router.refresh();
    }
  }

  @action
  setClassification(selection) {
    if (selection !== null) {
      this.classification = selection.id;
    } else {
      this.classification = '';
    }
  }

  @action
  setOrganizationStatus(selection) {
    if (selection !== null) {
      this.organizationStatus = selection.id;
    } else {
      this.organizationStatus = '';
    }
  }

  resetPagination() {
    this.page = 0;
  }
}
