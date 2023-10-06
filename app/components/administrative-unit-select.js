import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { timeout, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { trackedTask } from 'ember-resources/util/ember-concurrency';

import { action } from '@ember/object';
export default class AdministrativeUnitSelectComponent extends Component {
  @service store;
  @tracked loadedRecord;

  munipalities = trackedTask(this, this.loadAdministrativeUnitsTask, () => [
    this.args.selectedProvince,
  ]);

  @action
  triggerChange(event) {
    this.args.onChange(event);
    if (this.args.onChangeExtra) {
      this.args.onChangeExtra();
    }
  }

  @task
  *loadAdministrativeUnitsTask(searchParams = '') {
    yield Promise.resolve();
    yield timeout(500);

    let classificationCodes = this.args.classificationCodes;
    let allowedClassificationCodes = [];
    let searchResults = [];
    let query = '';

    const selectedPositionId = this.args.selectedPosition;

    if (selectedPositionId) {
      let boardPositionCodes = yield this.store.query('board-position-code', {
        filter: {
          ':id:': selectedPositionId,
        },
      });
      let ministerPositions = yield this.store.query(
        'minister-position-function',
        {
          filter: {
            ':id:': selectedPositionId,
          },
        }
      );

      if (ministerPositions.length) {
        // Only worship services have minister positions
        if (
          classificationCodes.find(
            (code) => code == CLASSIFICATION_CODE.WORSHIP_SERVICE
          )
        ) {
          allowedClassificationCodes = [CLASSIFICATION_CODE.WORSHIP_SERVICE];
        }
      } else if (boardPositionCodes.length) {
        const selectedPosition = boardPositionCodes.firstObject;
        const governingBodyClassification = yield selectedPosition.appliesTo;
        const classificationOptions =
          yield governingBodyClassification.appliesWithin;

        // If we found one, we use it as the only allowed code
        classificationOptions.forEach((classificationOption) => {
          if (
            classificationCodes.find((code) => code == classificationOption.id)
          ) {
            allowedClassificationCodes.push(classificationOption.id);
          }
        });
      }
    } else {
      allowedClassificationCodes = classificationCodes;
    }

    if (this.args.selectedProvince && this.args.selectedProvince.id.length) {
      // If a province is selected, load the municipalities in it
      query = {
        filter: {
          'is-sub-organization-of': {
            id: this.args.selectedProvince.id,
          },
          classification: {
            id: CLASSIFICATION_CODE.MUNICIPALITY,
          },
        },
        sort: 'name',
        page: {
          size: 400,
        },
      };
    } else {
      query = {
        sort: 'name',
        include: 'classification',
      };
      if (allowedClassificationCodes.length) {
        query.filter = {
          classification: {
            id: allowedClassificationCodes.join(),
          },
        };
      }
    }

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    searchResults = yield this.store.query('administrative-unit', query);

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
}
