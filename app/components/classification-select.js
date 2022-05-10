import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { useTask } from 'ember-resources';
import { CENTRAL_WORSHIP_SERVICE_BLACKLIST } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class ClassificationSelectComponent extends Component {
  @service store;

  classifications = useTask(this, this.loadClassificationsTask, () => [
    this.args.selectedRecognizedWorshipTypeId,
  ]);

  get selectedClassification() {
    if (typeof this.args.selected === 'string') {
      return this.findClassificationById(this.args.selected);
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

  @task *loadClassificationsTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let allowedIds;
    let selectedRecognizedWorshipTypeId =
      this.args.selectedRecognizedWorshipTypeId;

    if (
      selectedRecognizedWorshipTypeId &&
      this.isIdInBlacklist(selectedRecognizedWorshipTypeId)
    ) {
      allowedIds = [CLASSIFICATION_CODE.WORSHIP_SERVICE];
    } else {
      allowedIds = [
        CLASSIFICATION_CODE.WORSHIP_SERVICE,
        CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
        CLASSIFICATION_CODE.MUNICIPALITY,
      ];
    }

    return yield this.store.query('administrative-unit-classification-code', {
      'filter[:id:]': allowedIds.join(),
      sort: 'label',
    });
  }

  isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
