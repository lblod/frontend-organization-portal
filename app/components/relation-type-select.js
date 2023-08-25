import Component from '@glimmer/component';
import { RELATION_TYPES } from 'frontend-organization-portal/models/organization';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class RelationTypeSelectComponent extends Component {
  get relationTypes() {
    if (this.isCentralWorshipService || this.isProvince) {
      return [RELATION_TYPES.HAS_RELATION_WITH];
    } else if (this.isIgs) {
      return [RELATION_TYPES.HAS_PARTICIPANTS];
    } else {
      return [
        RELATION_TYPES.HAS_RELATION_WITH,
        RELATION_TYPES.PARTICIPATES_IN,
        RELATION_TYPES.HAS_PARTICIPANTS,
      ];
    }
  }

  get isCentralWorshipService() {
    return (
      this.args.administrativeUnit &&
      this.args.administrativeUnit.classification.get('id') ===
        CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isProvince() {
    return (
      this.args.administrativeUnit &&
      this.args.administrativeUnit.classification.get('id') ===
        CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isIgs() {
    const typesThatAreIGS = [
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ];
    return (
      this.args.administrativeUnit &&
      typesThatAreIGS.includes(
        this.args.administrativeUnit.classification.get('id')
      )
    );
  }
}
