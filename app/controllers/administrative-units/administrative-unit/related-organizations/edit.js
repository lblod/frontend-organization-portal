import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { RECOGNIZED_WORSHIP_TYPE } from 'frontend-organization-portal/models/recognized-worship-type';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { tracked } from '@glimmer/tracking';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  queryParams = ['sort'];

  @tracked sort = 'name';
  removedMemberships = [];

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isProvince() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isOCMW() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.OCMW
    );
  }

  get isMunicipality() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isAgb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.AGB
    );
  }

  get isApb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.APB
    );
  }

  get isDistrict() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isIgs() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.PROJECTVERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
    );
  }

  get isWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get hasCentralWorshipService() {
    const typesThatHaveACentralWorshipService = [
      RECOGNIZED_WORSHIP_TYPE.ISLAMIC,
      RECOGNIZED_WORSHIP_TYPE.ROMAN_CATHOLIC,
      RECOGNIZED_WORSHIP_TYPE.ORTHODOX,
    ];

    return (
      this.isWorshipService &&
      typesThatHaveACentralWorshipService.find(
        (id) => id == this.model.administrativeUnit.recognizedWorshipType?.id
      )
    );
  }

  get classificationCodes() {
    return [CLASSIFICATION_CODE.MUNICIPALITY];
  }

  get classificationCodesIgsParticipants() {
    return [
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
      CLASSIFICATION_CODE.AGB,
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      // TODO when onboarded, add politiezone, hulpverleningzone and companies
    ];
  }

  @action
  addNewMembership() {
    let membership = this.store.createRecord('membership');

    if (this.isCentralWorshipService || this.isProvince) {
      membership.role = this.model.membershipRoles.find(
        (role) => role.id == MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id
      );
    } else if (this.isIgs) {
      membership.role = this.model.membershipRoles.find(
        (role) => role.id == MEMBERSHIP_ROLES_MAPPING.HAS_PARTICIPANTS.id
      );
    }
    this.model.relatedMemberships.pushObject(membership);
  }

  @action
  updateMembership(membership, member) {
    membership.member = member;
  }

  @action
  removeMembership(removedMembership) {
    this.model.relatedMemberships.removeObject(removedMembership);
    this.removedMemberships.push(removedMembership);
  }

  // TODO - has to do with agbs and apbs
  @action
  updateRelatedOrg(org) {
    this.model.administrativeUnit.isSubOrganizationOf = org;
    this.model.administrativeUnit.wasFoundedByOrganization = org;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let { administrativeUnit, membershipHasRelationWith, relatedMemberships } =
      this.model;

    // Case : "is sub organization of" such as the link between an EB and a CB
    membershipHasRelationWith.role = yield this.store.findRecord(
      'membership-role',
      MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id
    );
    const isMemberOf = yield administrativeUnit.isMemberOf;
    const organization = yield membershipHasRelationWith.organization;
    if (organization) {
      isMemberOf.pushObject(organization);
      administrativeUnit.isMemberOf.pushObject(organization);
    }

    yield administrativeUnit.validate();

    if (administrativeUnit.isValid) {
      yield membershipHasRelationWith.save();
      yield administrativeUnit.save();

      // Process removed membeships: remove resources and links
      for (const membership of this.removedMemberships) {
        const member = yield membership.member;
        const memberOfOrganizations = yield member.isMemberOf;

        memberOfOrganizations.removeObject(administrativeUnit);
        member.save();

        membership.destroyRecord();
      }
      this.removedMemberships = [];

      for (const membership of relatedMemberships) {
        // TODO could be membership.organization if we handle participateIn as well ?
        const member = yield membership.member;
        const memberOfOrganizations = yield member.isMemberOf;

        memberOfOrganizations.pushObject(administrativeUnit);
        member.save();

        membership.organization = administrativeUnit;
        membership.save();
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.related-organizations',
        administrativeUnit.id
      );
    }
  }
}
