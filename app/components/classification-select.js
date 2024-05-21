import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CENTRAL_WORSHIP_SERVICE_BLACKLIST } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
      allowedIds = [CLASSIFICATION.WORSHIP_SERVICE.id];
    } else if (this.args.restrictForNewBestuurseenheden) {
      allowedIds = [
        CLASSIFICATION.WORSHIP_SERVICE.id,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
        CLASSIFICATION.DISTRICT.id,
        CLASSIFICATION.AGB.id,
        CLASSIFICATION.APB.id,
        CLASSIFICATION.PROJECTVERENIGING.id,
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
        CLASSIFICATION.POLICE_ZONE.id,
        CLASSIFICATION.ASSISTANCE_ZONE.id,
        CLASSIFICATION.WELZIJNSVERENIGING.id,
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
        CLASSIFICATION.ZIEKENHUISVERENIGING.id,
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING
          .id,
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
        CLASSIFICATION.PEVA_MUNICIPALITY.id,
        CLASSIFICATION.PEVA_PROVINCE.id,
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
          ].includes(id)
      );
    } else {
      allowedIds = allowedIds.filter((id) =>
        [
          CLASSIFICATION.WORSHIP_SERVICE.id,
          CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
        ].includes(id)
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

    return codes;
  }

  isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
