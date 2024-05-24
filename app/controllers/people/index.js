import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class PeopleIndexController extends Controller {
  @service router;
  @service store;
  @service currentSession;
  queryParams = [
    'page',
    'size',
    'given_name',
    'family_name',
    'organization',
    'status',
    'position',
  ];
  @tracked status = true;
  @tracked position;

  @tracked page = 0;
  size = 25;
  @tracked sort = 'given_name,family_name';
  @tracked given_name = '';
  @tracked family_name = '';
  @tracked organization;
  @tracked selectedOrganization;

  get people() {
    return this.model.loadPeopleTaskInstance.isFinished
      ? this.model.loadPeopleTaskInstance.value
      : this.model.loadedPeople;
  }

  get isLoading() {
    return this.model.loadPeopleTaskInstance.isRunning;
  }

  get hasPreviousData() {
    return this.model.loadedPeople && this.model.loadedPeople.length > 0;
  }

  get showTableLoader() {
    return this.isLoading && !this.hasPreviousData;
  }

  get hasNoResults() {
    return (
      this.model.loadPeopleTaskInstance.isFinished && this.people.length === 0
    );
  }

  get hasErrored() {
    return this.model.loadPeopleTaskInstance.isError;
  }

  @action
  setGivenName(given_name) {
    this.page = null;
    this.given_name = given_name;
  }

  @action
  setFamilyName(family_name) {
    this.page = null;
    this.family_name = family_name;
  }

  @action
  setPosition(position) {
    this.page = null;
    this.position = position?.id;
  }

  @action
  setOrganization(organization) {
    this.page = null;
    this.organization = organization?.id;
    this.selectedOrganization = organization;
  }

  @action
  search(event) {
    event.preventDefault();

    if (this.page > 0) {
      this.resetPagination();
    } else {
      this.router.refresh();
    }
  }

  resetPagination = () => (this.page = null);

  @action
  resetFilters() {
    this.given_name = '';
    this.family_name = '';
    this.organization = null;
    this.selectedOrganization = null;
    this.status = true;
    this.position = null;
    this.page = 0;
    this.sort = 'given_name,family_name';

    // Triggers a refresh of the model
    this.page = null;
  }

  get classificationCodes() {
    let allowedIds = [
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
      CLASSIFICATION.WORSHIP_SERVICE.id,
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.DISTRICT.id,
      CLASSIFICATION.PROVINCE.id,
      CLASSIFICATION.AGB.id,
      CLASSIFICATION.APB.id,
      CLASSIFICATION.PROJECTVERENIGING.id,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
      CLASSIFICATION.WELZIJNSVERENIGING.id,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
      CLASSIFICATION.ZIEKENHUISVERENIGING.id,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
    ];

    if (this.currentSession.hasUnitRole) {
      allowedIds = allowedIds.filter(
        (id) =>
          ![
            CLASSIFICATION.WORSHIP_SERVICE.id,
            CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
          ].includes(id)
      );
    } else {
      allowedIds = [
        CLASSIFICATION.WORSHIP_SERVICE.id,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
      ];
    }
    return allowedIds;
  }
}
