import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import {
  CENTRAL_WORSHIP_SERVICE_BLACKLIST,
  ALL_BUT_MUNICIPALITY_BLACKLIST,
} from 'frontend-organization-portal/models/change-event-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class ChangeEventTypeSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadChangeEventTypesTask.perform();
  }

  @task *loadChangeEventTypesTask() {
    let types = yield this.store.findAll('change-event-type');

    let classification = yield this.args.administrativeUnitClassification;
    if (classification.id == CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE) {
      // Filter out blacklisted types for central worship services
      types = types.filter(
        (t) => !this.isIdInBlacklist(t.id, CENTRAL_WORSHIP_SERVICE_BLACKLIST)
      );
    }
    if (classification.id != CLASSIFICATION_CODE.MUNICIPALITY) {
      // Filter out blacklisted types for all types except municipality
      types = types.filter(
        (t) => !this.isIdInBlacklist(t.id, ALL_BUT_MUNICIPALITY_BLACKLIST)
      );
    }

    return types;
  }

  isIdInBlacklist(id, blacklist) {
    return blacklist.find((element) => element == id);
  }
}
