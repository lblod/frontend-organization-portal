import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { timeout, task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class OrganizationSelectComponent extends Component {
  @service store;

  @tracked loadedRecord;

  @action
  triggerChange(event) {
    this.args.onChange(event);
    if (this.args.onChangeExtra) {
      this.args.onChangeExtra();
    }
  }

  @task
  *loadOrganizationsTask(searchParams = '') {
    yield Promise.resolve();
    yield timeout(500);

    let classificationCodes = this.args.classificationCodes;
    let searchResults = [];
    let query;

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
        classificationCodes = [CLASSIFICATION.WORSHIP_SERVICE.id];
      } else if (boardPositionCodes.length) {
        const selectedPosition = boardPositionCodes.at(0);
        const governingBodyClassification = yield selectedPosition.appliesTo;
        const classificationOptions =
          yield governingBodyClassification.appliesWithin;

        // If we find one, we use it as the only allowed code
        classificationOptions.forEach((classificationOption) => {
          if (
            classificationCodes.find((code) => code == classificationOption.id)
          ) {
            classificationCodes.push(classificationOption.id);
          }
        });
      }
    }

    if (classificationCodes && classificationCodes.length) {
      query = {
        filter: {
          classification: {
            id: classificationCodes.join(),
          },
        },
        sort: 'name',
        include: 'classification',
      };
    }

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    if (query) {
      searchResults = yield this.store.query('organization', query);
    }

    if (typeof this.args.filter === 'function') {
      return this.args.filter(searchResults);
    } else {
      return searchResults;
    }
  }

  get selectedOrganization() {
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
        'organization',
        selectedOrganization
      );
    }
  }
}
