import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CENTRAL_WORSHIP_SERVICE_BLACKLIST } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';

export default class ClassificationMultipleSelectComponent extends Component {
  @service store;
  @service currentSession;

  @tracked oldId;
  @tracked newId;

  classifications = trackedTask(this, this.loadClassificationsTask, () => [
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
      allowedIds = [
        CLASSIFICATION.WORSHIP_SERVICE.id,
        CLASSIFICATION.REPRESENTATIVE_BODY.id,
      ];
    } else {
      allowedIds = [
        CLASSIFICATION.WORSHIP_SERVICE.id,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
        CLASSIFICATION.MUNICIPALITY.id,
        CLASSIFICATION.PROVINCE.id,
        CLASSIFICATION.OCMW.id,
        CLASSIFICATION.DISTRICT.id,
        CLASSIFICATION.AGB.id,
        CLASSIFICATION.APB.id,
        CLASSIFICATION.PROJECTVERENIGING.id,
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
        CLASSIFICATION.POLICE_ZONE.id,
        CLASSIFICATION.ASSISTANCE_ZONE.id,
        CLASSIFICATION.REPRESENTATIVE_BODY.id,
        CLASSIFICATION.WELZIJNSVERENIGING.id,
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
        CLASSIFICATION.ZIEKENHUISVERENIGING.id,
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
          .id,
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
        CLASSIFICATION.PEVA_MUNICIPALITY.id,
        CLASSIFICATION.PEVA_PROVINCE.id,
      ];
    }

    if (this.currentSession.hasUnitRole) {
      allowedIds = allowedIds.filter(
        (id) =>
          ![
            CLASSIFICATION.WORSHIP_SERVICE.id,
            CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
            CLASSIFICATION.REPRESENTATIVE_BODY.id,
          ].includes(id)
      );
    } else {
      allowedIds = allowedIds.filter((id) =>
        [
          CLASSIFICATION.WORSHIP_SERVICE.id,
          CLASSIFICATION.REPRESENTATIVE_BODY.id,
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
        ].includes(id)
      );
    }

    // fixme rename file and make it more generic
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

  isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
