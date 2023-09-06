import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';

export default class MembershipRoleSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadMembershipRolesTask.perform();
  }

  @task *loadMembershipRolesTask() {
    const roles = yield this.store.query('membership-role', {
      'filter[has-broader-role][:id:]': '93c48754610c45e6bd9a894d2720a53d',
    });

    let filteredRoles = [];
    if (this.isCentralWorshipService || this.isProvince) {
      filteredRoles = roles.filter(
        (role) => role.id == MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id
      );
    } else if (this.isIgs) {
      filteredRoles = roles.filter(
        (role) => role.id == MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id
      );
    } else {
      // TODO We should also show the relationship "has participants" here, but I'm not sure how as it's like an opposite
      filteredRoles = roles.filter(
        (role) =>
          role.id == MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id ||
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id
      );
    }

    return filteredRoles;
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
