import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CENTRAL_WORSHIP_SERVICE_BLACKLIST } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';
import { getClassificationIdsForRole } from 'frontend-organization-portal/utils/classification-identifiers';

export default class ClassificationMultipleSelectComponent extends Component {
  @service store;
  @service currentSession;

  @tracked oldId;
  @tracked newId;

  classifications = trackedTask(this, this.loadClassificationsTask, () => [
    this.args.selectedOrganizationTypes,
    this.args.selectedRecognizedWorshipTypeId,
  ]);

  get selectedClassifications() {
    let selectionArray = [];

    if (typeof this.args.selected === 'string' && this.args.selected.length) {
      const ids = this.args.selected.split(',');
      ids.forEach((id) => {
        const classification = this.findClassificationById(id);
        if (classification) {
          selectionArray.push(classification);
        }
      });
    }

    if (selectionArray.length) {
      return selectionArray;
    }

    return this.args.selected;
  }

  findClassificationById(id) {
    if (this.classifications.isRunning) {
      return null;
    }

    let classifications = this.classifications.value;
    return classifications.find((status) => status.id === id);
  }

  @task
  *loadClassificationsTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    // Filter possible options based selected organization types, if any
    let selectedOrganizationTypes = this.args.selectedOrganizationTypes;
    let allowedIds = selectedOrganizationTypes
      ? getClassificationIdsForRole(
          this.currentSession.hasWorshipRole,
          false,
          ...selectedOrganizationTypes.split(','),
        )
      : getClassificationIdsForRole(this.currentSession.hasWorshipRole);

    // Filter possible options based on selected worship service type, if any
    let selectedRecognizedWorshipTypeId =
      this.args.selectedRecognizedWorshipTypeId;

    if (
      selectedRecognizedWorshipTypeId &&
      this.#isIdInBlacklist(selectedRecognizedWorshipTypeId)
    ) {
      allowedIds = allowedIds.filter(
        (id) => id === CLASSIFICATION.WORSHIP_SERVICE.id,
      );
    }

    const codes = yield this.store.query('organization-classification-code', {
      'filter[:id:]': allowedIds.join(),
      sort: 'label',
    });

    // Auto-selects the type if there is only one option
    this.newId = selectedRecognizedWorshipTypeId;

    if (
      !this.selectedClassifications.length &&
      this.newId &&
      !codes.slice().includes(this.args.selected) &&
      this.newId != this.oldId
    ) {
      this.args.onChange(codes.slice());
    }
    this.oldId = this.newId;

    return codes;
  }

  #isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
