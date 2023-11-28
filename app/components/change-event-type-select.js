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
} from 'frontend-organization-portal/models/change-event-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { CHANGE_EVENTS_OCMW_VERENIGINGEN } from '../models/change-event-type';

export default class ChangeEventTypeSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadChangeEventTypesTask.perform();
  }

  @task *loadChangeEventTypesTask() {
    let types = yield this.store.findAll('change-event-type');

    let classification = yield this.args.administrativeUnitClassification;
    if (classification.id == CLASSIFICATION_CODE.WORSHIP_SERVICE) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_WORSHIP_SERVICE)
      );
    }
    if (classification.id == CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_CENTRAL_WORSHIP_SERVICE)
      );
    }
    if (classification.id == CLASSIFICATION_CODE.MUNICIPALITY) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_MUNICIPALITY)
      );
    }
    if (classification.id == CLASSIFICATION_CODE.OCMW) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_OCMW));
    }
    if (classification.id == CLASSIFICATION_CODE.DISTRICT) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_DISTRICT)
      );
    }
    if (
      classification.id == CLASSIFICATION_CODE.AGB ||
      classification.id == CLASSIFICATION_CODE.APB
    ) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_AGB_APB));
    }
    if (
      classification.id == CLASSIFICATION_CODE.PROJECTVERENIGING ||
      classification.id == CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING ||
      classification.id == CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING ||
      classification.id ==
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
    ) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_IGS));
    }
    if (
      classification.id == CLASSIFICATION_CODE.POLICE_ZONE ||
      classification.id == CLASSIFICATION_CODE.ASSISTANCE_ZONE
    ) {
      types = types.filter((t) => this.isIdInList(t.id, CHANGE_EVENTS_PZ_HPZ));
    }
    if (
      classification.id == CLASSIFICATION_CODE.OCMW_VERENIGING ||
      classification.id == CLASSIFICATION_CODE.WELZIJNSVERENIGING
    ) {
      types = types.filter((t) =>
        this.isIdInList(t.id, CHANGE_EVENTS_OCMW_VERENIGINGEN)
      );
    }

    return types;
  }

  isIdInList(id, blacklist) {
    return blacklist.find((element) => element == id);
  }
}
