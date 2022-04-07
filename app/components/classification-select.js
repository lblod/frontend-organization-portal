import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { useTask } from 'ember-resources';

const CLASSIFICATION = {
  CENTRAL_WORSHIP_SERVICE: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
  WORSHIP_SERVICE: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
};
const CENTRAL_WORSHIP_SERVICE_BLACKLIST = [
  '1a1abeafc973d27cebcb2d7a15b2d823', // Israëlitisch
  '99536dd6eb0d2ef38a89efafb17e7389', // Anglicaans
  'e8cba1540b35a32e9cb45126c38c03c6', // Protestants
];

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
      allowedIds = [CLASSIFICATION.WORSHIP_SERVICE];
    } else {
      allowedIds = [
        CLASSIFICATION.WORSHIP_SERVICE,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
      ];
    }

    return yield this.store.query('administrative-unit-classification-code', {
      'filter[:id:]': allowedIds.join(),
    });
  }

  isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
