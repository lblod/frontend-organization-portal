import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CENTRAL_WORSHIP_SERVICE_BLACKLIST } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { getClassificationIdsForRole } from 'frontend-organization-portal/utils/classification-identifiers';
import { convertClassificationToGroups } from 'frontend-organization-portal/utils/group-classifications';

export default class ClassificationSelectComponent extends Component {
  @service store;
  @service currentSession;

  classifications = trackedTask(this, this.loadClassificationsTask, () => [
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

  @task
  *loadClassificationsTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let allowedIds = getClassificationIdsForRole(
      this.currentSession.hasWorshipRole,
      this.args.restrictForNewOrganizations,
    );

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
    if (codes.slice().length === 1 && codes.slice()[0] != this.args.selected) {
      this.args.onChange(codes.slice()[0]);
    }

    return convertClassificationToGroups(codes);
  }

  #isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
