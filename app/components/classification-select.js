import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CENTRAL_WORSHIP_SERVICE_BLACKLIST } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
      allowedIds = [CLASSIFICATION_CODE.WORSHIP_SERVICE];
    } else if (this.args.restrictForNewBestuurseenheden) {
      allowedIds = [
        CLASSIFICATION_CODE.WORSHIP_SERVICE,
        CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
        CLASSIFICATION_CODE.DISTRICT,
        CLASSIFICATION_CODE.AGB,
        CLASSIFICATION_CODE.APB,
        CLASSIFICATION_CODE.PROJECTVERENIGING,
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        CLASSIFICATION_CODE.POLICE_ZONE,
        CLASSIFICATION_CODE.ASSISTANCE_ZONE,
        // TODO: check whether OP is responsible for creating instances of these
        // new types
        CLASSIFICATION_CODE.WELZIJNSVERENIGING,
        CLASSIFICATION_CODE.AUTONOME_VERZORGINGSINSTELLING,
        // TODO: uncomment when onboarding private OCMW associations
        // CLASSIFICATION_CODE.ZIEKENHUISVERENIGING,
        // CLASSIFICATION_CODE.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
        // CLASSIFICATION_CODE.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
      ];
    } else {
      allowedIds = [
        CLASSIFICATION_CODE.WORSHIP_SERVICE,
        CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
        CLASSIFICATION_CODE.MUNICIPALITY,
        CLASSIFICATION_CODE.PROVINCE,
        CLASSIFICATION_CODE.OCMW,
        CLASSIFICATION_CODE.DISTRICT,
        CLASSIFICATION_CODE.AGB,
        CLASSIFICATION_CODE.APB,
        CLASSIFICATION_CODE.PROJECTVERENIGING,
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        CLASSIFICATION_CODE.POLICE_ZONE,
        CLASSIFICATION_CODE.ASSISTANCE_ZONE,
        CLASSIFICATION_CODE.WELZIJNSVERENIGING,
        CLASSIFICATION_CODE.AUTONOME_VERZORGINGSINSTELLING,
        // TODO: uncomment when onboarding private OCMW associations
        // CLASSIFICATION_CODE.ZIEKENHUISVERENIGING,
        // CLASSIFICATION_CODE.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
        // CLASSIFICATION_CODE.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
      ];
    }

    if (this.currentSession.hasUnitRole) {
      allowedIds = allowedIds.filter(
        (id) =>
          ![
            CLASSIFICATION_CODE.WORSHIP_SERVICE,
            CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
          ].includes(id)
      );
    } else {
      allowedIds = allowedIds.filter((id) =>
        [
          CLASSIFICATION_CODE.WORSHIP_SERVICE,
          CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
        ].includes(id)
      );
    }

    const codes = yield this.store.query(
      'administrative-unit-classification-code',
      {
        'filter[:id:]': allowedIds.join(),
        sort: 'label',
      }
    );

    // Auto-selects the type if there is only one option
    if (
      codes.toArray().length === 1 &&
      codes.toArray()[0] != this.args.selected
    ) {
      this.args.onChange(codes.toArray()[0]);
    }

    return codes;
  }

  isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
