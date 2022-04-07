import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { useTask } from 'ember-resources';

const CENTRAL_WORSHIP_SERVICE_ID = 'f9cac08a-13c1-49da-9bcb-f650b0604054';
const CENTRAL_WORSHIP_SERVICE_BLACKLIST = [
  '1a1abeafc973d27cebcb2d7a15b2d823', // Israëlitisch
  '99536dd6eb0d2ef38a89efafb17e7389', // Anglicaans
  'e8cba1540b35a32e9cb45126c38c03c6', // Protestants
];

export default class RecognizedWorshipTypeSelect extends Component {
  @service store;

  recognizedWorshipTypes = useTask(
    this,
    this.loadRecognizedWorshipTypesTask,
    () => [this.args.selectedClassificationId]
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
      (worshipType) => worshipType.id === id
    );
  }

  @task
  *loadRecognizedWorshipTypesTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let recognizedWorshipTypes = yield this.store.query(
      'recognized-worship-type',
      { sort: 'label' }
    );

    if (this.args.selectedClassificationId == CENTRAL_WORSHIP_SERVICE_ID) {
      // Filter out blacklisted types for central worship services
      recognizedWorshipTypes = recognizedWorshipTypes.filter(
        (t) => !this.isIdInBlacklist(t.id)
      );
    }

    return recognizedWorshipTypes;
  }

  isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
