import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import {
  CENTRAL_WORSHIP_SERVICE_BOARD_POSITIONS_BLACKLIST,
  WORSHIP_SERVICE_POSITIONS_BOARD_BLACKLIST,
} from 'frontend-organization-portal/models/board-position';
import { CENTRAL_WORSHIP_SERVICE_MINISTER_POSITIONS_BLACKLIST } from 'frontend-organization-portal/models/minister-position';

export default class AdministrativeUnitSelectComponent extends Component {
  @service store;
  @tracked loadedRecord;

  constructor() {
    super(...arguments);
    this.loadRecord.perform();
  }

  @restartableTask
  *loadAdministrativeUnitsTask(searchParams = '') {
    yield timeout(500);

    const selectedPosition = this.args.selectedPosition;
    let allowedClassificationCodes = this.args.classificationCodes;

    allowedClassificationCodes = this.filterOutBlacklistedClassificationCodes(
      selectedPosition,
      allowedClassificationCodes
    );

    const query = {
      sort: 'name',
      include: 'classification',
    };

    if (Array.isArray(allowedClassificationCodes)) {
      query.filter = {
        classification: {
          ':id:': allowedClassificationCodes.join(),
        },
      };
    }

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    let searchResults = yield this.store.query('administrative-unit', query);

    if (typeof this.args.filter === 'function') {
      return this.args.filter(searchResults);
    } else {
      return searchResults;
    }
  }

  get selectedAdministrativeUnit() {
    if (typeof this.args.selected === 'string') {
      return this.loadedRecord;
    }

    return this.args.selected;
  }

  @task
  *loadRecord() {
    let selectedOrganization = this.args.selected;
    if (typeof selectedOrganization === 'string') {
      this.loadedRecord = yield this.store.findRecord(
        'administrative-unit',
        selectedOrganization
      );
    }
  }

  filterOutBlacklistedClassificationCodes(position, classificationCodes) {
    const selectedPosition = position;
    let allowedClassificationCodes = classificationCodes;

    allowedClassificationCodes = this.getAllowedClassificationCodes(
      selectedPosition,
      allowedClassificationCodes,
      CENTRAL_WORSHIP_SERVICE_BOARD_POSITIONS_BLACKLIST,
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );

    allowedClassificationCodes = this.getAllowedClassificationCodes(
      selectedPosition,
      allowedClassificationCodes,
      CENTRAL_WORSHIP_SERVICE_MINISTER_POSITIONS_BLACKLIST,
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );

    allowedClassificationCodes = this.getAllowedClassificationCodes(
      selectedPosition,
      allowedClassificationCodes,
      WORSHIP_SERVICE_POSITIONS_BOARD_BLACKLIST,
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );

    return allowedClassificationCodes;
  }

  getAllowedClassificationCodes(
    position,
    allowedClassificationCodes,
    blacklist,
    classificationId
  ) {
    let classificationCodes = allowedClassificationCodes;

    const isBlacklistedInCentralWorshipServices = this.isIdInBlacklist(
      position,
      blacklist
    );
    if (isBlacklistedInCentralWorshipServices) {
      classificationCodes = classificationCodes.filter(
        (code) => code != classificationId
      );
    }

    return classificationCodes;
  }

  isIdInBlacklist(id, blacklist) {
    return blacklist.find((element) => element == id);
  }
}
