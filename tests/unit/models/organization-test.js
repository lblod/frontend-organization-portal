import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import {
  AgbCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  CentralWorshipServiceCodeList,
  IGSCodeList,
  MunicipalityCodeList,
  OcmwAssociationCodeList,
  OCMWCodeList,
  PevaCodeList,
  PevaProvinceCodeList,
  PoliceZoneCodeList,
  ProvinceCodeList,
  RepresentativeBodyCodeList,
  WorshipServiceCodeList,
} from 'frontend-organization-portal/constants/Classification';

module('Unit | Model | organization', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns error when model is empty', async function (assert) {
      const model = this.store().createRecord('organization');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
      });
    });
  });

  module('classification', function () {
    [
      [CLASSIFICATION.MUNICIPALITY, 'isMunicipality'],
      [CLASSIFICATION.PROVINCE, 'isProvince'],
      [CLASSIFICATION.OCMW, 'isOCMW'],
      [CLASSIFICATION.DISTRICT, 'isDistrict'],
      [CLASSIFICATION.WORSHIP_SERVICE, 'isWorshipService'],
      [CLASSIFICATION.CENTRAL_WORSHIP_SERVICE, 'isCentralWorshipService'],
      [CLASSIFICATION.AGB, 'isAgb'],
      [CLASSIFICATION.APB, 'isApb'],
      [CLASSIFICATION.PROJECTVERENIGING, 'isIgs'],
      [CLASSIFICATION.DIENSTVERLENENDE_VERENIGING, 'isIgs'],
      [CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING, 'isIgs'],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        'isIgs',
      ],
      [CLASSIFICATION.POLICE_ZONE, 'isPoliceZone'],
      [CLASSIFICATION.ASSISTANCE_ZONE, 'isAssistanceZone'],
      [CLASSIFICATION.REPRESENTATIVE_BODY, 'isRepresentativeBody'],
      [CLASSIFICATION.WELZIJNSVERENIGING, 'isOcmwAssociation'],
      [CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING, 'isOcmwAssociation'],
      [CLASSIFICATION.PEVA_MUNICIPALITY, 'isPevaMunicipality'],
      [CLASSIFICATION.PEVA_PROVINCE, 'isPevaProvince'],
    ].forEach(([cl, func]) => {
      test(`it should return false for ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'organization-classification-code',
          cl,
        );
        const model = this.store().createRecord('organization', {
          classification,
        });

        const result = model[func];
        assert.notOk(result);
      });
    });

    Object.keys(CLASSIFICATION).forEach((cl) => {
      test(`it should return false for whether ${cl.label} has a central worship service`, async function (assert) {
        const classification = this.store().createRecord(
          'organization-classification-code',
          cl,
        );
        const model = this.store().createRecord('organization', {
          classification,
        });

        const result = model.hasCentralWorshipService;
        assert.notOk(result);
      });
    });
  });

  module('abbName', function () {
    test('it should return the legal name when set', async function (assert) {
      const model = this.store().createRecord('organization', {
        legalName: 'some legal name',
      });

      assert.deepEqual(model.abbName, 'some legal name');
    });

    test('it should return the name when no legal name is set and there is no KBO organization', async function (assert) {
      const model = this.store().createRecord('organization', {
        name: 'some organization name',
      });

      assert.deepEqual(model.abbName, 'some organization name');
    });

    test('it should return the KBO organization name when no legal name is set', async function (assert) {
      const kboOrganizationModel = this.store().createRecord(
        'kbo-organization',
        {
          name: 'kbo organization',
        },
      );
      const model = this.store().createRecord('organization', {
        kboOrganization: kboOrganizationModel,
      });

      assert.deepEqual(model.abbName, 'kbo organization');
    });

    test('it should return the name when no legal name is set and KBO organization has no name', async function (assert) {
      const kboOrganizationModel =
        this.store().createRecord('kbo-organization');
      const model = this.store().createRecord('organization', {
        kboOrganization: kboOrganizationModel,
        name: 'some name',
      });

      assert.deepEqual(model.abbName, 'some name');
    });

    test('it should return the legal name even if a KBO organization and name are set', async function (assert) {
      const kboOrganizationModel = this.store().createRecord(
        'kbo-organization',
        {
          name: 'kbo organization',
        },
      );
      const model = this.store().createRecord('organization', {
        legalName: 'some legal name',
        name: 'some name',
        kboOrganization: kboOrganizationModel,
      });

      assert.deepEqual(model.abbName, 'some legal name');
    });
  });

  module('getClassificationCodesForMembership', function () {
    const igsParticipants = [
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.AGB.id,
      CLASSIFICATION.PROJECTVERENIGING.id,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
      CLASSIFICATION.POLICE_ZONE.id,
      CLASSIFICATION.ASSISTANCE_ZONE.id,
      CLASSIFICATION.PEVA_MUNICIPALITY.id,
      CLASSIFICATION.PEVA_PROVINCE.id,
      CLASSIFICATION.WELZIJNSVERENIGING.id,
      CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING.id,
      CLASSIFICATION.ZIEKENHUISVERENIGING.id,
      CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING.id,
      CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ];

    const ocmwAssociationParticipants = OcmwAssociationCodeList.concat([
      CLASSIFICATION.MUNICIPALITY.id,
      CLASSIFICATION.OCMW.id,
      CLASSIFICATION.ASSOCIATION_OTHER.id,
      CLASSIFICATION.CORPORATION_OTHER.id,
    ]);

    const pevaParticipants = [
      CLASSIFICATION.PROJECTVERENIGING.id,
      CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
      CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
    ];

    [
      [CLASSIFICATION.PROJECTVERENIGING, igsParticipants],
      [CLASSIFICATION.DIENSTVERLENENDE_VERENIGING, igsParticipants],
      [CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING, igsParticipants],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        igsParticipants,
      ],
      [CLASSIFICATION.PEVA_MUNICIPALITY, pevaParticipants],
      [CLASSIFICATION.PEVA_PROVINCE, pevaParticipants],
      [CLASSIFICATION.WELZIJNSVERENIGING, ocmwAssociationParticipants],
      [
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        ocmwAssociationParticipants,
      ],
      [CLASSIFICATION.ZIEKENHUISVERENIGING, ocmwAssociationParticipants],
      [
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
        ocmwAssociationParticipants,
      ],
    ].forEach(([cl, classificationCodes]) => {
      test(`it should allow valid participants for ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          id: '123',
          classification,
        });
        const participantRole = this.store().createRecord(
          'membership-role',
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        );
        const membership = this.store().createRecord('membership', {
          role: participantRole,
          organization: model,
        });

        const result = model.getClassificationCodesForMembership(membership);

        assert.deepEqual(result.sort(), classificationCodes.sort());
      });
    });

    [
      [
        CLASSIFICATION.MUNICIPALITY,
        [...IGSCodeList, ...OcmwAssociationCodeList, ...AgbCodeList],
      ],
      [CLASSIFICATION.OCMW, [...IGSCodeList, ...OcmwAssociationCodeList]],
      [CLASSIFICATION.AGB, [...IGSCodeList]],
      [CLASSIFICATION.PROJECTVERENIGING, [...IGSCodeList, ...PevaCodeList]],
      [
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
        [...IGSCodeList, ...PevaCodeList],
      ],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
        [...IGSCodeList, ...PevaCodeList],
      ],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        [...IGSCodeList, ...PevaCodeList],
      ],
      [CLASSIFICATION.POLICE_ZONE, [...IGSCodeList]],
      [CLASSIFICATION.ASSISTANCE_ZONE, [...IGSCodeList]],
      [CLASSIFICATION.PEVA_MUNICIPALITY, [...IGSCodeList]],
      [CLASSIFICATION.PEVA_PROVINCE, [...IGSCodeList]],
      [
        CLASSIFICATION.WELZIJNSVERENIGING,
        [...IGSCodeList, ...OcmwAssociationCodeList],
      ],
      [
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        [...IGSCodeList, ...OcmwAssociationCodeList],
      ],
      [
        CLASSIFICATION.ZIEKENHUISVERENIGING,
        [...IGSCodeList, ...OcmwAssociationCodeList],
      ],
      [
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
        [...IGSCodeList, ...OcmwAssociationCodeList],
      ],
      [
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
        [...IGSCodeList, ...OcmwAssociationCodeList],
      ],
      [
        CLASSIFICATION.ASSOCIATION_OTHER,
        [...IGSCodeList, ...OcmwAssociationCodeList],
      ],
      [
        CLASSIFICATION.CORPORATION_OTHER,
        [...IGSCodeList, ...OcmwAssociationCodeList],
      ],
    ].forEach(([cl, classificationCodes]) => {
      test(`it should allow a(n) ${cl.label} to participate in the correct kind of organizations`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          id: '123',
          classification,
        });
        const participantRole = this.store().createRecord(
          'membership-role',
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        );
        const membership = this.store().createRecord('membership', {
          role: participantRole,
          member: model,
        });

        const result = model.getClassificationCodesForMembership(membership);

        assert.deepEqual(result.sort(), classificationCodes.sort());
      });
    });

    [
      [CLASSIFICATION.APB, [CLASSIFICATION.PROVINCE.id]],
      [CLASSIFICATION.AGB, [CLASSIFICATION.MUNICIPALITY.id]],
      [
        CLASSIFICATION.PEVA_MUNICIPALITY,
        [
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.PEVA_PROVINCE,
        [
          CLASSIFICATION.PROVINCE.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.WELZIJNSVERENIGING,
        [
          ...OcmwAssociationCodeList,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        [
          ...OcmwAssociationCodeList,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.ZIEKENHUISVERENIGING,
        [
          ...OcmwAssociationCodeList,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
        [
          ...OcmwAssociationCodeList,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
      [
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
        [
          ...OcmwAssociationCodeList,
          CLASSIFICATION.MUNICIPALITY.id,
          CLASSIFICATION.OCMW.id,
          CLASSIFICATION.ASSOCIATION_OTHER.id,
          CLASSIFICATION.CORPORATION_OTHER.id,
        ],
      ],
    ].forEach(([cl, classificationCodes]) => {
      test(`it should allow a(n) ${cl.label} to be founded by the correct organizations`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          id: '123',
          classification,
        });
        const founderRole = this.store().createRecord(
          'membership-role',
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        );
        const membership = this.store().createRecord('membership', {
          role: founderRole,
          organization: model,
        });

        const result = model.getClassificationCodesForMembership(membership);

        assert.deepEqual(result.sort(), classificationCodes.sort());
      });
    });

    [
      [
        CLASSIFICATION.MUNICIPALITY,
        [
          CLASSIFICATION.AGB.id,
          CLASSIFICATION.PEVA_MUNICIPALITY.id,
          ...OcmwAssociationCodeList,
        ],
      ],
      [
        CLASSIFICATION.PROVINCE,
        [CLASSIFICATION.PEVA_PROVINCE.id, CLASSIFICATION.APB.id],
      ],
      [CLASSIFICATION.OCMW, [...OcmwAssociationCodeList]],
      [
        CLASSIFICATION.ASSOCIATION_OTHER,
        [...PevaCodeList, ...OcmwAssociationCodeList],
      ],
      [
        CLASSIFICATION.CORPORATION_OTHER,
        [...PevaCodeList, ...OcmwAssociationCodeList],
      ],
    ].forEach(([cl, classificationCodes]) => {
      test(`it should allow a(n) ${cl.label} to found the correct organizations`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          id: '123',
          classification,
        });
        const founderRole = this.store().createRecord(
          'membership-role',
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        );
        const membership = this.store().createRecord('membership', {
          role: founderRole,
          member: model,
        });

        const result = model.getClassificationCodesForMembership(membership);

        assert.deepEqual(result.sort(), classificationCodes.sort());
      });
    });

    [
      [
        CLASSIFICATION.MUNICIPALITY,
        [
          ...AgbCodeList,
          ...IGSCodeList,
          ...PoliceZoneCodeList,
          ...AssistanceZoneCodeList,
          ...ProvinceCodeList,
          ...OCMWCodeList,
        ],
      ],
      [
        CLASSIFICATION.PROVINCE,
        [
          ...ApbCodeList,
          ...MunicipalityCodeList,
          ...PevaProvinceCodeList,
          ...OCMWCodeList,
          ...AgbCodeList,
        ],
      ],
      [CLASSIFICATION.AGB, [...MunicipalityCodeList, ...ProvinceCodeList]],
      [CLASSIFICATION.PROJECTVERENIGING, [...MunicipalityCodeList]],
      [CLASSIFICATION.DIENSTVERLENENDE_VERENIGING, [...MunicipalityCodeList]],
      [CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING, [...MunicipalityCodeList]],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        [...MunicipalityCodeList],
      ],
      [CLASSIFICATION.POLICE_ZONE, [...MunicipalityCodeList]],
      [CLASSIFICATION.ASSISTANCE_ZONE, [...MunicipalityCodeList]],
      [CLASSIFICATION.APB, [...ProvinceCodeList]],
      [CLASSIFICATION.OCMW, [...MunicipalityCodeList, ...ProvinceCodeList]],
      [
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
        [...WorshipServiceCodeList, ...RepresentativeBodyCodeList],
      ],
      [
        CLASSIFICATION.WORSHIP_SERVICE,
        [...CentralWorshipServiceCodeList, ...RepresentativeBodyCodeList],
      ],
      [
        CLASSIFICATION.REPRESENTATIVE_BODY,
        [...WorshipServiceCodeList, ...CentralWorshipServiceCodeList],
      ],
    ].forEach(([cl, classificationCodes]) => {
      test(`it should allow a(n) ${cl.label} to have a relation with the correct organizations`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          id: '123',
          classification,
        });
        const role = this.store().createRecord(
          'membership-role',
          MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
        );
        const membershipAsOrganization = this.store().createRecord(
          'membership',
          {
            role: role,
            organization: model,
          },
        );

        let result = model.getClassificationCodesForMembership(
          membershipAsOrganization,
        );

        assert.deepEqual(result.sort(), classificationCodes.sort());

        const membershipAsMember = this.store().createRecord('membership', {
          role: role,
          member: model,
        });

        result = model.getClassificationCodesForMembership(membershipAsMember);

        assert.deepEqual(result.sort(), classificationCodes.sort());
      });
    });

    test(`it should return an empty array when the organization is not involved in the membership relation`, async function (assert) {
      const model = this.store().createRecord('administrative-unit', {
        id: '123',
      });
      const founderRole = this.store().createRecord(
        'membership-role',
        MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      );
      const membership = this.store().createRecord('membership', {
        role: founderRole,
      });

      const result = model.getClassificationCodesForMembership(membership);

      assert.deepEqual(result, []);
    });

    test(`it should return an empty array when the membership has no role`, async function (assert) {
      const model = this.store().createRecord('administrative-unit', {
        id: '123',
      });
      const membership = this.store().createRecord('membership', {
        member: model,
      });

      const result = model.getClassificationCodesForMembership(membership);

      assert.deepEqual(result, []);
    });

    test(`it should return an empty array when the membership role has no id`, async function (assert) {
      const model = this.store().createRecord('administrative-unit', {
        id: '123',
      });
      const role = this.store().createRecord('membership-role');
      const membership = this.store().createRecord('membership', {
        role: role,
        member: model,
      });

      const result = model.getClassificationCodesForMembership(membership);

      assert.deepEqual(result, []);
    });

    test(`it should return an empty array when the membership role has no valid id`, async function (assert) {
      const model = this.store().createRecord('administrative-unit', {
        id: '123',
      });
      const role = this.store().createRecord('membership-role', {
        id: 'IncorrectMembershipRoleIdentifier',
      });
      const membership = this.store().createRecord('membership', {
        role: role,
        member: model,
      });

      const result = model.getClassificationCodesForMembership(membership);

      assert.deepEqual(result, []);
    });
  });
});
