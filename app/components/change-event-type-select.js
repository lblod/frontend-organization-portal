import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import {
  CHANGE_EVENTS_WORSHIP_SERVICE,
  CHANGE_EVENTS_CENTRAL_WORSHIP_SERVICE,
  CHANGE_EVENTS_MUNICIPALITY,
  CHANGE_EVENTS_OCMW,
  CHANGE_EVENTS_AGB_APB,
  CHANGE_EVENTS_DISTRICT,
  CHANGE_EVENTS_IGS,
  CHANGE_EVENTS_PZ_HPZ,
  CHANGE_EVENTS_OCMW_ASSOCIATION,
  CHANGE_EVENTS_PEVA,
} from 'frontend-organization-portal/models/change-event-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class ChangeEventTypeSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadChangeEventTypesTask.perform();
  }

  @task *loadChangeEventTypesTask() {
    let types = yield this.store.findAll('change-event-type');

    let classification = yield this.args.organizationClassification;
    if (classification.id == CLASSIFICATION.WORSHIP_SERVICE.id) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_WORSHIP_SERVICE)
      );
    }
    if (classification.id == CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_CENTRAL_WORSHIP_SERVICE)
      );
    }
    if (classification.id == CLASSIFICATION.MUNICIPALITY.id) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_MUNICIPALITY)
      );
    }
    if (classification.id == CLASSIFICATION.OCMW.id) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_OCMW));
    }
    if (classification.id == CLASSIFICATION.DISTRICT.id) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_DISTRICT)
      );
    }
    if (
      classification.id == CLASSIFICATION.AGB.id ||
      classification.id == CLASSIFICATION.APB.id
    ) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_AGB_APB));
    }
    if (
      classification.id == CLASSIFICATION.PROJECTVERENIGING.id ||
      classification.id == CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id ||
      classification.id == CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id ||
      classification.id ==
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id
    ) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_IGS));
    }
    if (
      classification.id == CLASSIFICATION.POLICE_ZONE.id ||
      classification.id == CLASSIFICATION.ASSISTANCE_ZONE.id
    ) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_PZ_HPZ));
    }
    if (
      classification.id == CLASSIFICATION.WELZIJNSVERENIGING.id ||
      classification.id == CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id
      // TODO: uncomment when onboarding private OCMW associations
      // ||
      // classification.id == CLASSIFICATION.ZIEKENHUISVERENIGING.id ||
      // classification.id ==
      //   CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id ||
      // classification.id ==
      //   CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id
    ) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_OCMW_ASSOCIATION)
      );
    }
    if (
      classification.id == CLASSIFICATION.PEVA_MUNICIPALITY.id ||
      classification.id == CLASSIFICATION.PEVA_PROVINCE.id
    ) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_PEVA));
    }

    return types;
  }

  isIdInList(id, blacklist) {
    return blacklist.find((element) => element == id);
  }
}
