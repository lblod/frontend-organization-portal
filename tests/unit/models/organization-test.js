import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { ABB_CLASSIFICATION_ID } from 'frontend-organization-portal/constants/classification';
import {
  AgbCodeList,
  AndereCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  AutonomeVerzorgingsinstellingCodeList,
  BosgroepCodeList,
  CentralWorshipServiceCodeList,
  DistrictCodeList,
  DienstverlenendeVerenigingCodeList,
  InterlokaleVerenigingCodeList,
  MunicipalityCodeList,
  OCMWCodeList,
  OpdrachthoudendeVerenigingCodeList,
  OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
  PevaMunicipalityCodeList,
  PevaProvinceCodeList,
  PoliceZoneCodeList,
  ProjectverenigingCodeList,
  ProvinceCodeList,
  RegionaalLandschapCodeList,
  RepresentativeBodyCodeList,
  VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
  VervoerregioraadCodeList,
  WelzijnsverenigingCodeList,
  WoonmaatschappijCodeList,
  WoonzorgverenigingCodeList,
  WorshipServiceCodeList,
  ZiekenhuisverenigingCodeList,
  ZorgraadCodeList,
} from 'frontend-organization-portal/constants/classification';

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
      assert.strictEqual(Object.keys(model.error).length, 5);
      assert.propContains(model.error, {
        legalName: { message: 'Vul de juridische naam in' },
        classification: { message: 'Selecteer een optie' },
        organizationStatus: { message: 'Selecteer een optie' },
        legalForm: { message: 'Selecteer een optie' },
        contentThemes: { message: 'Selecteer een optie' },
      });
    });

    test('additionalQualifications is required for some organization types', async function (assert) {
      const organization = this.store().createRecord('organization');
      await organization.validate();

      assert.notOk(
        organization.error.additionalQualifications,
        'optional if there is no classification yet',
      );

      const requiredFieldClassification = this.store().createRecord(
        'administrative-unit-classification-code',
        { id: CLASSIFICATION.AGB.id },
      );

      organization.classification = requiredFieldClassification;
      await organization.validate();

      assert.strictEqual(
        organization.error.additionalQualifications.message,
        'Selecteer een optie',
      );

      const optionalFieldClassification = this.store().createRecord(
        'administrative-unit-classification-code',
        { id: CLASSIFICATION.MUNICIPALITY.id },
      );
      organization.classification = optionalFieldClassification;
      await organization.validate();

      assert.notOk(organization.error.additionalQualifications);
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
    const projectverenigingParticipants = [
      ...MunicipalityCodeList,
      ...AssistanceZoneCodeList,
      ...OCMWCodeList,
      ...PoliceZoneCodeList,
    ];

    const dienstverlenendeVerenigingParticipants = [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...AgbCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...MunicipalityCodeList,
      ...AssistanceZoneCodeList,
      ...OCMWCodeList,
      ...OpdrachthoudendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
      ...PoliceZoneCodeList,
    ];

    const opdrachthoudendeVerenigingParticipants = [
      ...dienstverlenendeVerenigingParticipants,
      ...WelzijnsverenigingCodeList,
    ];

    const ocmwAssociationParticipants = [
      ...MunicipalityCodeList,
      ...OCMWCodeList,
    ];

    const welzijnsverenigingParticipants = [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
    ];

    const ziekenhuisverenigingParticipants = [
      ...AutonomeVerzorgingsinstellingCodeList,
      ...MunicipalityCodeList,
      ...OCMWCodeList,
      ...WelzijnsverenigingCodeList,
    ];

    [
      [CLASSIFICATION.PROJECTVERENIGING, projectverenigingParticipants],
      [
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
        dienstverlenendeVerenigingParticipants,
      ],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
        opdrachthoudendeVerenigingParticipants,
      ],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        opdrachthoudendeVerenigingParticipants,
      ],
      [CLASSIFICATION.PEVA_MUNICIPALITY, ocmwAssociationParticipants],
      [CLASSIFICATION.PEVA_PROVINCE, [...ProvinceCodeList]],
      [CLASSIFICATION.WELZIJNSVERENIGING, welzijnsverenigingParticipants],
      [
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        ocmwAssociationParticipants,
      ],
      [CLASSIFICATION.ZIEKENHUISVERENIGING, ziekenhuisverenigingParticipants],
      [
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
        ocmwAssociationParticipants,
      ],
      [CLASSIFICATION.POLICE_ZONE, [...MunicipalityCodeList]],
      [CLASSIFICATION.ASSISTANCE_ZONE, [...MunicipalityCodeList]],
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

    const igsParticipantOrganizations = [
      ...AndereCodeList,
      ...DienstverlenendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingCodeList,
      ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
      ...InterlokaleVerenigingCodeList,
    ];

    [
      [
        CLASSIFICATION.MUNICIPALITY,
        [
          ...AndereCodeList,
          ...AgbCodeList,
          ...AssistanceZoneCodeList,
          ...BosgroepCodeList,
          ...AutonomeVerzorgingsinstellingCodeList,
          ...DienstverlenendeVerenigingCodeList,
          ...InterlokaleVerenigingCodeList,
          ...OpdrachthoudendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
          ...PevaMunicipalityCodeList,
          ...PoliceZoneCodeList,
          ...ProjectverenigingCodeList,
          ...RegionaalLandschapCodeList,
          ...VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
          ...WelzijnsverenigingCodeList,
          ...WoonmaatschappijCodeList,
          ...WoonzorgverenigingCodeList,
          ...ZiekenhuisverenigingCodeList,
        ],
      ],
      [
        CLASSIFICATION.OCMW,
        [
          ...AndereCodeList,
          ...AutonomeVerzorgingsinstellingCodeList,
          ...DienstverlenendeVerenigingCodeList,
          ...InterlokaleVerenigingCodeList,
          ...OpdrachthoudendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
          ...PevaMunicipalityCodeList,
          ...ProjectverenigingCodeList,
          ...VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
          ...WelzijnsverenigingCodeList,
          ...WoonmaatschappijCodeList,
          ...WoonzorgverenigingCodeList,
          ...ZiekenhuisverenigingCodeList,
        ],
      ],
      [CLASSIFICATION.AGB, igsParticipantOrganizations],
      [
        CLASSIFICATION.PROJECTVERENIGING,
        [...AndereCodeList, ...InterlokaleVerenigingCodeList],
      ],
      [
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
        [...igsParticipantOrganizations, ...WelzijnsverenigingCodeList],
      ],
      [CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING, igsParticipantOrganizations],
      [
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        igsParticipantOrganizations,
      ],
      [
        CLASSIFICATION.POLICE_ZONE,
        [
          ...DienstverlenendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
          ...InterlokaleVerenigingCodeList,
          ...ProjectverenigingCodeList,
        ],
      ],
      [
        CLASSIFICATION.ASSISTANCE_ZONE,
        [
          ...DienstverlenendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
          ...InterlokaleVerenigingCodeList,
          ...ProjectverenigingCodeList,
        ],
      ],
      [
        CLASSIFICATION.PEVA_MUNICIPALITY,
        [...AndereCodeList, ...InterlokaleVerenigingCodeList],
      ],
      [
        CLASSIFICATION.PEVA_PROVINCE,
        [...AndereCodeList, ...InterlokaleVerenigingCodeList],
      ],
      [
        CLASSIFICATION.WELZIJNSVERENIGING,
        [
          ...AndereCodeList,
          ...OpdrachthoudendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
          ...InterlokaleVerenigingCodeList,
          ...ZiekenhuisverenigingCodeList,
        ],
      ],
      [
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        [
          ...AndereCodeList,
          ...DienstverlenendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
          ...InterlokaleVerenigingCodeList,
          ...WelzijnsverenigingCodeList,
          ...ZiekenhuisverenigingCodeList,
        ],
      ],
      [
        CLASSIFICATION.ZIEKENHUISVERENIGING,
        [...AndereCodeList, ...InterlokaleVerenigingCodeList],
      ],
      [
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
        [...InterlokaleVerenigingCodeList],
      ],
      [
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
        [...InterlokaleVerenigingCodeList],
      ],
      [CLASSIFICATION.ANDERE, [...InterlokaleVerenigingCodeList]],
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
      [CLASSIFICATION.APB, [...ProvinceCodeList]],
      [CLASSIFICATION.AGB, [...MunicipalityCodeList]],
      [CLASSIFICATION.PEVA_MUNICIPALITY, [...MunicipalityCodeList]],
      [CLASSIFICATION.PEVA_PROVINCE, [...ProvinceCodeList]],
      [CLASSIFICATION.WELZIJNSVERENIGING, [...OCMWCodeList]],
      [CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING, [...OCMWCodeList]],
      [CLASSIFICATION.ZIEKENHUISVERENIGING, [...OCMWCodeList]],
      [
        CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
        [...OCMWCodeList],
      ],
      [
        CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
        [...OCMWCodeList],
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
          ...AgbCodeList,
          ...DistrictCodeList,
          ...DienstverlenendeVerenigingCodeList,
          ...InterlokaleVerenigingCodeList,
          ...OpdrachthoudendeVerenigingCodeList,
          ...OpdrachthoudendeVerenigingMetPrivateDeelnameCodeList,
          ...PevaMunicipalityCodeList,
          ...ProjectverenigingCodeList,
        ],
      ],
      [
        CLASSIFICATION.PROVINCE,
        [...ApbCodeList, ...BosgroepCodeList, ...PevaProvinceCodeList],
      ],
      [
        CLASSIFICATION.OCMW,
        [
          ...AutonomeVerzorgingsinstellingCodeList,
          ...VerenigingOfVennootschapVoorSocialeDienstverleningCodeList,
          ...WelzijnsverenigingCodeList,
          ...WoonzorgverenigingCodeList,
          ...ZiekenhuisverenigingCodeList,
        ],
      ],
      [CLASSIFICATION.ANDERE, []],
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

    // The founder and recognizer of these types are auto-filled with one of
    // the two governments (see special-organizations), so no organization
    // can be picked by hand for those roles.
    [
      CLASSIFICATION.POLICE_ZONE,
      CLASSIFICATION.ASSISTANCE_ZONE,
      CLASSIFICATION.VERVOERREGIORAAD,
      CLASSIFICATION.REGIONAAL_ZORGPLATFORM,
      CLASSIFICATION.REGIONAAL_LANDSCHAP,
      CLASSIFICATION.WOONMAATSCHAPPIJ,
      CLASSIFICATION.ZORGRAAD,
    ].forEach((cl) => {
      test(`it should not allow a hand-picked founder or recognizer for a(n) ${cl.label}`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          cl,
        );
        const model = this.store().createRecord('administrative-unit', {
          id: '123',
          classification,
        });

        [
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO,
        ].forEach((roleMapping) => {
          const role = this.store().createRecord(
            'membership-role',
            roleMapping,
          );
          const membership = this.store().createRecord('membership', {
            role,
            organization: model,
          });

          const result = model.getClassificationCodesForMembership(membership);

          assert.deepEqual(result, [], roleMapping.inverseLabel);
        });
      });
    });

    // The other side of the same rule: an ABB-classified organization (the
    // two governments) cannot be picked by hand as the founder or recognizer
    // of any organization. ABB is deliberately not in the CLASSIFICATION
    // constant, so the record is created inline.
    [
      MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO,
    ].forEach((roleMapping) => {
      test(`it should not allow a(n) ABB-classified organization to be a hand-picked "${roleMapping.inverseLabel}" of another organization`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          {
            id: ABB_CLASSIFICATION_ID,
            label: 'Agentschap Binnenlands Bestuur',
          },
        );
        const model = this.store().createRecord('administrative-unit', {
          id: '123',
          classification,
        });
        const role = this.store().createRecord('membership-role', roleMapping);
        const membership = this.store().createRecord('membership', {
          role,
          member: model,
        });

        const result = model.getClassificationCodesForMembership(membership);

        assert.deepEqual(result, []);
      });
    });

    [
      [CLASSIFICATION.MUNICIPALITY, []],
      [CLASSIFICATION.PROVINCE, []],
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
      [CLASSIFICATION.PEVA_MUNICIPALITY, []],
      [CLASSIFICATION.PEVA_PROVINCE, []],
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

    test('it should allow a municipality to be served by an OCMW', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.MUNICIPALITY,
      );
      const model = this.store().createRecord('administrative-unit', {
        id: '123',
        classification,
      });
      const role = this.store().createRecord(
        'membership-role',
        MEMBERSHIP_ROLES_MAPPING.SERVES,
      );
      const membership = this.store().createRecord('membership', {
        role,
        organization: model,
      });

      const result = model.getClassificationCodesForMembership(membership);

      assert.deepEqual(result, [...OCMWCodeList]);
    });

    test('it should allow an OCMW to serve a municipality', async function (assert) {
      const classification = this.store().createRecord(
        'administrative-unit-classification-code',
        CLASSIFICATION.OCMW,
      );
      const model = this.store().createRecord('administrative-unit', {
        id: '123',
        classification,
      });
      const role = this.store().createRecord(
        'membership-role',
        MEMBERSHIP_ROLES_MAPPING.SERVES,
      );
      const membership = this.store().createRecord('membership', {
        role,
        member: model,
      });

      const result = model.getClassificationCodesForMembership(membership);

      assert.deepEqual(result, [...MunicipalityCodeList]);
    });

    [
      [MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO, [], []],
      [
        MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
        [],
        [...VervoerregioraadCodeList, ...ZorgraadCodeList],
      ],
    ].forEach(([roleMapping, expectedAsOrganization, expectedAsMember]) => {
      test(`it should allow the "${roleMapping.label}" role only between the organizations of the OP-3929 rules`, async function (assert) {
        const classification = this.store().createRecord(
          'administrative-unit-classification-code',
          CLASSIFICATION.MUNICIPALITY,
        );
        const model = this.store().createRecord('administrative-unit', {
          id: '123',
          classification,
        });
        const role = this.store().createRecord('membership-role', roleMapping);
        const membershipAsOrganization = this.store().createRecord(
          'membership',
          {
            role,
            organization: model,
          },
        );

        let result = model.getClassificationCodesForMembership(
          membershipAsOrganization,
        );

        assert.deepEqual(result.sort(), expectedAsOrganization.sort());

        const membershipAsMember = this.store().createRecord('membership', {
          role,
          member: model,
        });

        result = model.getClassificationCodesForMembership(membershipAsMember);

        assert.deepEqual(result.sort(), expectedAsMember.sort());
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
