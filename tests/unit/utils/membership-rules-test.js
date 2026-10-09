import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import {
  allowedClassificationsForMembershipField,
  allowedRoleLabelsForClassification,
  allowedRolesForClassification,
  hasRequiredMembershipFields,
  removingMembershipBreaksMinimum,
} from 'frontend-organization-portal/utils/membership-rules';
import { membershipFieldsByClassification } from 'frontend-organization-portal/constants/memberships';
import {
  AutonomeVerzorgingsinstellingCodeList,
  DienstverlenendeVerenigingCodeList,
  MunicipalityCodeList,
  OCMWCodeList,
  WelzijnsverenigingCodeList,
  ZiekenhuisverenigingCodeList,
} from 'frontend-organization-portal/constants/classification';

module('Unit | Utils | membership rules', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  // Creating a record with an id that is already in use throws, so the
  // classification codes and roles are memoized per test store.
  const recordCaches = new WeakMap();

  function cachedRecord(store, kind, definition) {
    let cache = recordCaches.get(store);
    if (!cache) {
      cache = {};
      recordCaches.set(store, cache);
    }
    return (cache[`${kind}-${definition.id}`] ??= store.createRecord(
      kind,
      definition,
    ));
  }

  function createOrganization(store, classification) {
    return store.createRecord('administrative-unit', {
      classification: cachedRecord(
        store,
        'administrative-unit-classification-code',
        classification,
      ),
    });
  }

  function createMembership(store, { role, member, organization }) {
    return store.createRecord('membership', {
      role: cachedRecord(store, 'membership-role', role),
      member,
      organization,
    });
  }

  module('allowedRolesForClassification', function () {
    [
      [CLASSIFICATION.DISTRICT, [MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF]],
      [
        CLASSIFICATION.MUNICIPALITY,
        [
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
          MEMBERSHIP_ROLES_MAPPING.SERVES,
        ],
      ],
      [
        CLASSIFICATION.OCMW,
        [
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
          MEMBERSHIP_ROLES_MAPPING.SERVES,
        ],
      ],
      [
        CLASSIFICATION.PROVINCE,
        [
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO,
        ],
      ],
      [
        CLASSIFICATION.BOSGROEP,
        [
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO,
        ],
      ],
      [
        CLASSIFICATION.WORSHIP_SERVICE,
        [MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH],
      ],
      [
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
        [MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH],
      ],
      [
        CLASSIFICATION.REPRESENTATIVE_BODY,
        [MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH],
      ],
    ].forEach(([classification, roles]) => {
      test(`it should allow only the ${roles.length} role(s) of the rules for a ${classification.label}`, function (assert) {
        assert.deepEqual(
          allowedRolesForClassification(classification.id).map(
            (role) => role.id,
          ),
          roles.map((role) => role.id),
        );
      });
    });
  });

  module('allowedRoleLabelsForClassification', function () {
    [
      [
        CLASSIFICATION.PROVINCE,
        ['Is lid van', 'Is oprichter van', 'Verleent erkenning aan'],
      ],
      [
        CLASSIFICATION.BOSGROEP,
        [
          'Is lid van',
          'Heeft als leden',
          'Werd erkend door',
          'Werd opgericht door',
        ],
      ],
      [
        CLASSIFICATION.OCMW,
        [
          'Bedient',
          'Is feitelijk vertegenwoordigd in (niet lidmaatschap)',
          'Is lid van',
          'Is oprichter van',
        ],
      ],
      [
        CLASSIFICATION.MUNICIPALITY,
        [
          'Is feitelijk vertegenwoordigd in (niet lidmaatschap)',
          'Is lid van',
          'Is oprichter van',
          'Wordt bediend door',
        ],
      ],
      [CLASSIFICATION.DISTRICT, ['Werd opgericht door']],
    ].forEach(([classification, labels]) => {
      test(`it should offer only the usable labels of the rules for a ${classification.label}`, function (assert) {
        assert.deepEqual(
          allowedRoleLabelsForClassification(classification.id).sort(),
          labels.sort(),
        );
      });
    });

    [
      CLASSIFICATION.WORSHIP_SERVICE,
      CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
      CLASSIFICATION.REPRESENTATIVE_BODY,
    ].forEach((classification) => {
      test(`a ${classification.label} keeps "Heeft een relatie met"`, function (assert) {
        assert.true(
          allowedRoleLabelsForClassification(classification.id).includes(
            'Heeft een relatie met',
          ),
        );
      });
    });

    test('it offers a label exactly when the rules know the classification on the side the label implies', function (assert) {
      Object.values(CLASSIFICATION).forEach((classification) => {
        const labels = allowedRoleLabelsForClassification(classification.id);
        const expected = new Set();

        Object.values(MEMBERSHIP_ROLES_MAPPING).forEach((role) => {
          [true, false].forEach((asMember) => {
            if (
              allowedClassificationsForMembershipField(classification.id, {
                role,
                asMember,
              }).length > 0
            ) {
              // For "has a relation with" both labels are one and the same
              // string, so the set keeps each once whatever the directions.
              expected.add(asMember ? role.label : role.inverseLabel);
            }
          });
        });

        assert.deepEqual(
          labels,
          Array.from(expected).sort(),
          `labels for a ${classification.label}`,
        );
      });
    });
  });

  module('allowedClassificationsForMembershipField', function () {
    function fieldFor(classification, roleMapping, asMember) {
      return membershipFieldsByClassification[classification.id].find(
        (field) =>
          field.role.id === roleMapping.id && field.asMember === asMember,
      );
    }

    [
      [
        CLASSIFICATION.MUNICIPALITY,
        MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
        true,
        [CLASSIFICATION.VERVOERREGIORAAD.id, CLASSIFICATION.ZORGRAAD.id],
      ],
      [
        CLASSIFICATION.MUNICIPALITY,
        MEMBERSHIP_ROLES_MAPPING.SERVES,
        false,
        [...OCMWCodeList],
      ],
      [
        CLASSIFICATION.OCMW,
        MEMBERSHIP_ROLES_MAPPING.SERVES,
        true,
        [...MunicipalityCodeList],
      ],
      [
        CLASSIFICATION.DISTRICT,
        MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        false,
        [...MunicipalityCodeList],
      ],
      [
        CLASSIFICATION.ANDERE,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        false,
        [
          ...WelzijnsverenigingCodeList,
          ...AutonomeVerzorgingsinstellingCodeList,
          ...DienstverlenendeVerenigingCodeList,
          ...MunicipalityCodeList,
          ...OCMWCodeList,
          ...ZiekenhuisverenigingCodeList,
          CLASSIFICATION.AGB.id,
          CLASSIFICATION.APB.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id,
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id,
          CLASSIFICATION.PEVA_MUNICIPALITY.id,
          CLASSIFICATION.PEVA_PROVINCE.id,
          CLASSIFICATION.PROJECTVERENIGING.id,
          CLASSIFICATION.PROVINCE.id,
        ],
      ],
      [
        CLASSIFICATION.WELZIJNSVERENIGING,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        false,
        [
          ...AutonomeVerzorgingsinstellingCodeList,
          ...DienstverlenendeVerenigingCodeList,
          ...MunicipalityCodeList,
          ...OCMWCodeList,
        ],
      ],
      [
        CLASSIFICATION.ZIEKENHUISVERENIGING,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        false,
        [
          ...AutonomeVerzorgingsinstellingCodeList,
          ...MunicipalityCodeList,
          ...OCMWCodeList,
          ...WelzijnsverenigingCodeList,
        ],
      ],
      [
        CLASSIFICATION.ZORGRAAD,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        true,
        [
          CLASSIFICATION.REGIONAAL_ZORGPLATFORM.id,
          // A zorgraad may also participate in an interlokale vereniging,
          // only the regionaal zorgplatform counts towards its minimum.
          CLASSIFICATION.INTERLOKALE_VERENIGING.id,
        ],
      ],
      [
        CLASSIFICATION.ZORGRAAD,
        MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
        false,
        [...MunicipalityCodeList, ...OCMWCodeList],
      ],
      [
        CLASSIFICATION.WOONMAATSCHAPPIJ,
        MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
        true,
        [CLASSIFICATION.WOONMAATSCHAPPIJ.id],
      ],
    ].forEach(
      ([classification, roleMapping, asMember, classificationCodes]) => {
        test(`it should allow the classifications of the rules for the "${roleMapping.label}" field of a ${classification.label}`, function (assert) {
          const field = fieldFor(classification, roleMapping, asMember);

          assert.deepEqual(
            allowedClassificationsForMembershipField(
              classification.id,
              field,
            ).sort(),
            [...classificationCodes].sort(),
          );
        });
      },
    );
  });

  module('hasRequiredMembershipFields', function () {
    test('it returns true when every required field meets its minimum', async function (assert) {
      const store = this.store();
      const municipality = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const ocmw = createOrganization(store, CLASSIFICATION.OCMW);
      const vervoerregioraad = createOrganization(
        store,
        CLASSIFICATION.VERVOERREGIORAAD,
      );
      const serves = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.SERVES,
        organization: municipality,
        member: ocmw,
      });
      const representedIn = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
        organization: vervoerregioraad,
        member: municipality,
      });

      assert.true(
        hasRequiredMembershipFields(municipality, [serves, representedIn]),
      );
    });

    test('it returns false when a required field is empty', async function (assert) {
      const store = this.store();
      const municipality = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const ocmw = createOrganization(store, CLASSIFICATION.OCMW);
      const serves = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.SERVES,
        organization: municipality,
        member: ocmw,
      });

      assert.false(hasRequiredMembershipFields(municipality, [serves]));
    });

    test('it returns true for a type without required fields', async function (assert) {
      const store = this.store();
      const woonmaatschappij = createOrganization(
        store,
        CLASSIFICATION.WOONMAATSCHAPPIJ,
      );

      assert.true(hasRequiredMembershipFields(woonmaatschappij, []));
    });

    test('it counts only members of the minimum classifications towards a restricted field', async function (assert) {
      const store = this.store();
      const welzijnsvereniging = createOrganization(
        store,
        CLASSIFICATION.WELZIJNSVERENIGING,
      );
      const ocmw = createOrganization(store, CLASSIFICATION.OCMW);
      const municipality = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const founder = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: welzijnsvereniging,
        member: ocmw,
      });
      const municipalityParticipant = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        organization: welzijnsvereniging,
        member: municipality,
      });
      const ocmwParticipant = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        organization: welzijnsvereniging,
        member: ocmw,
      });

      const memberships = [founder, municipalityParticipant, ocmwParticipant];

      assert.false(
        hasRequiredMembershipFields(welzijnsvereniging, [
          founder,
          municipalityParticipant,
        ]),
      );
      assert.true(hasRequiredMembershipFields(welzijnsvereniging, memberships));
    });

    test('it counts only members of the minimum classifications towards a restricted member-side field', async function (assert) {
      const store = this.store();
      const zorgraad = createOrganization(store, CLASSIFICATION.ZORGRAAD);
      const regionaalZorgplatform = createOrganization(
        store,
        CLASSIFICATION.REGIONAAL_ZORGPLATFORM,
      );
      const interlokaleVereniging = createOrganization(
        store,
        CLASSIFICATION.INTERLOKALE_VERENIGING,
      );
      const municipality = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const participatesInPlatform = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        organization: regionaalZorgplatform,
        member: zorgraad,
      });
      const participatesInInterlokale = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
        organization: interlokaleVereniging,
        member: zorgraad,
      });
      const representedBy = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
        organization: zorgraad,
        member: municipality,
      });

      // The zorgraad needs a regionaal zorgplatform, not any organization, to
      // participate in.
      assert.false(
        hasRequiredMembershipFields(zorgraad, [
          participatesInInterlokale,
          representedBy,
        ]),
      );
      assert.true(
        hasRequiredMembershipFields(zorgraad, [
          participatesInPlatform,
          representedBy,
        ]),
      );
    });
  });

  module('removingMembershipBreaksMinimum', function () {
    test('it returns true when removing the membership of a field takes it below its minimum', async function (assert) {
      const store = this.store();
      const district = createOrganization(store, CLASSIFICATION.DISTRICT);
      const municipality = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const founder = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: district,
        member: municipality,
      });

      assert.true(
        removingMembershipBreaksMinimum(founder, district, [founder]),
      );
    });

    test('it returns false when the field keeps enough memberships', async function (assert) {
      const store = this.store();
      const district = createOrganization(store, CLASSIFICATION.DISTRICT);
      const municipalityOne = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const municipalityTwo = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const founderOne = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: district,
        member: municipalityOne,
      });
      const founderTwo = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: district,
        member: municipalityTwo,
      });

      assert.false(
        removingMembershipBreaksMinimum(founderOne, district, [
          founderOne,
          founderTwo,
        ]),
      );
    });

    test('it returns false when the field has no minimum', async function (assert) {
      const store = this.store();
      const province = createOrganization(store, CLASSIFICATION.PROVINCE);
      const apb = createOrganization(store, CLASSIFICATION.APB);
      const founder = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: apb,
        member: province,
      });

      assert.false(
        removingMembershipBreaksMinimum(founder, province, [founder]),
      );
    });

    test('it does not count memberships that are already removed', async function (assert) {
      const store = this.store();
      const district = createOrganization(store, CLASSIFICATION.DISTRICT);
      const municipalityOne = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const municipalityTwo = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const founderOne = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: district,
        member: municipalityOne,
      });
      const founderTwo = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: district,
        member: municipalityTwo,
      });
      founderTwo.deleteRecord();

      assert.true(
        removingMembershipBreaksMinimum(founderOne, district, [
          founderOne,
          founderTwo,
        ]),
      );
    });

    test('it does not count a membership whose other side is not set, an empty form row', async function (assert) {
      const store = this.store();
      const district = createOrganization(store, CLASSIFICATION.DISTRICT);
      const municipality = createOrganization(
        store,
        CLASSIFICATION.MUNICIPALITY,
      );
      const founder = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: district,
        member: municipality,
      });
      const emptyRow = createMembership(store, {
        role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
        organization: district,
      });

      assert.true(
        removingMembershipBreaksMinimum(founder, district, [founder, emptyRow]),
      );
    });
  });
});
