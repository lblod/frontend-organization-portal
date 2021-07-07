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
    'province',
    'classification',
    'organizationStatus',
  ];

  @tracked page = 0;
  size = 20;
  @tracked sort = 'name';
  @tracked name = '';
  @tracked municipality = '';
  @tracked province = '';
  @tracked classification = '';
  @tracked honoraryServiceType = '';
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

  get hasNoResults() {
    return (
      this.model.loadAdministrativeUnitsTaskInstance.isFinished &&
      this.administrativeUnits.length === 0
    );
  }

  get hasErrored() {
    return this.model.loadAdministrativeUnitsTaskInstance.isError;
  }

  get selectedClassification() {
    if (!this.classification) {
      return null;
    }

    return this.model.classifications.find((classification) => {
      return classification.id === this.classification;
    });
  }

  get selectedHonoraryServiceType() {
    if (!this.honoraryServiceType) {
      return null;
    }

    return this.model.honoraryServiceTypes.find((honoraryServiceType) => {
      return honoraryServiceType.id === this.honoraryServiceType;
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
  setHonoraryServiceType(selection) {
    if (selection !== null) {
      this.honoraryServiceType = selection.id;
    } else {
      this.honoraryServiceType = '';
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

  @action
  setMunicipality(selection) {
    if (selection !== null) {
      this.municipality = selection;
    } else {
      this.municipality = '';
    }
  }

  @action
  setProvince(selection) {
    if (selection !== null) {
      this.province = selection;
    } else {
      this.province = '';
    }
  }

  resetPagination() {
    this.page = 0;
  }
}
