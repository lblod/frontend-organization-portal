import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CENTRAL_WORSHIP_SERVICE_BLACKLIST } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class RecognizedWorshipTypeSelect extends Component {
  @service store;

  recognizedWorshipTypes = trackedTask(
    this,
    this.loadRecognizedWorshipTypesTask,
    () => [this.args.selectedClassificationId],
  );

  get selectedRecognizedWorshipType() {
    if (typeof this.args.selected === 'string') {
      return this.getRecognizedWorshipTypeById(this.args.selected);
    }

    return this.args.selected;
  }

  getRecognizedWorshipTypeById(id) {
    if (this.recognizedWorshipTypes.isRunning) {
      return null;
    }

    return this.recognizedWorshipTypes.value.find(
      (worshipType) => worshipType.id === id,
    );
  }

  @task
  *loadRecognizedWorshipTypesTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let recognizedWorshipTypes = yield this.store.query(
      'recognized-worship-type',
      { sort: 'label' },
    );

    if (
      this.args.selectedClassificationId ==
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id
    ) {
      // Filter out blacklisted types for central worship services
      recognizedWorshipTypes = recognizedWorshipTypes.filter(
        (t) => !this.isIdInBlacklist(t.id),
      );
    }

    return recognizedWorshipTypes;
  }

  isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
