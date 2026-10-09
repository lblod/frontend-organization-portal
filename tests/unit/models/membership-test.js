import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

module('Unit | Model | membership', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  module('validate', function () {
    // smoke test on required attributes
    test('it returns error when model is empty', async function (assert) {
      const model = this.store().createRecord('membership');

      const isValid = await model.validate();

      assert.false(isValid);
      assert.strictEqual(Object.keys(model.error).length, 3);
      assert.propContains(model.error, {
        member: { message: 'Selecteer een optie' },
        organization: { message: 'Selecteer een optie' },
        role: { message: 'Selecteer een optie' },
      });
    });

    module('creating new organization', function () {
      [
        CLASSIFICATION.PROJECTVERENIGING,
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      ].forEach((cl) => {
        test(`it should not return an error when two municipal founders and participants are provided for ${cl.label}`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );

          const organization = this.store().createRecord(
            'administrative-unit',
            {
              classification,
            },
          );

          const municipalityClassification = this.store().createRecord(
            'administrative-unit-classification-code',
            CLASSIFICATION.MUNICIPALITY,
          );
          const municipalityOne = this.store().createRecord(
            'administrative-unit',
            {
              classification: municipalityClassification,
            },
          );
          const municipalityTwo = this.store().createRecord(
            'administrative-unit',
            {
              classification: municipalityClassification,
            },
          );

          const founderRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          );
          const participantRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          );

          const founderOne = this.store().createRecord('membership', {
            organization: organization,
            member: municipalityOne,
            role: founderRole,
          });
          const founderTwo = this.store().createRecord('membership', {
            organization: organization,
            member: municipalityTwo,
            role: founderRole,
          });
          const participantOne = this.store().createRecord('membership', {
            organization: organization,
            member: municipalityOne,
            role: participantRole,
          });
          const participantTwo = this.store().createRecord('membership', {
            organization: organization,
            member: municipalityTwo,
            role: participantRole,
          });

          (await organization.memberships).push(
            founderOne,
            founderTwo,
            participantOne,
            participantTwo,
          );

          const member = this.store().createRecord('organization');

          const relationRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
          );

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: relationRole,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.true(isValid);
        });
      });

      [
        [CLASSIFICATION.PROJECTVERENIGING, 'Kies minstens 2 gemeenten'],
        [
          CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
          'Kies minstens 2 gemeenten',
        ],
        [
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
          'Kies minstens 2 gemeenten',
        ],
        [
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
          'Kies minstens 2 gemeenten',
        ],
        [CLASSIFICATION.AGB, 'Kies minstens 1 gemeente'],
        [CLASSIFICATION.APB, 'Kies minstens 1 provincie'],
      ].forEach(([cl, message]) => {
        test(`it should return an error when organization is a(n) ${cl.label} lacking a founder`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            'administrative-unit',
            {
              classification,
            },
          );

          const member = this.store().createRecord('organization');

          const role = this.store().createRecord('membership-role');

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: role,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.false(isValid);
          assert.strictEqual(Object.keys(model.error).length, 1);
          assert.propContains(model.error, {
            role: { message },
          });
        });
      });

      [
        CLASSIFICATION.PROJECTVERENIGING,
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      ].forEach((cl) => {
        test(`it should return an error when organization is a ${cl.label} without participants`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            'administrative-unit',
            {
              classification,
            },
          );

          const member = this.store().createRecord('organization');

          const role = this.store().createRecord('membership-role');

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: role,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.false(isValid);
          assert.strictEqual(Object.keys(model.error).length, 1);
          assert.propContains(model.error, {
            role: { message: 'Kies minstens 2 gemeenten' },
          });
        });
      });

      [CLASSIFICATION.APB].forEach((cl) => {
        test(`it should return an error when a related municipality is missing for ${cl.label}`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            'administrative-unit',
            {
              classification,
            },
          );
          const member = this.store().createRecord('organization');
          const role = this.store().createRecord('membership-role');

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: role,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.false(isValid);
          assert.strictEqual(Object.keys(model.error).length, 1);
          assert.propContains(model.error, {
            role: { message: 'Kies minstens 1 provincie' },
          });
        });
      });

      [
        [CLASSIFICATION.WELZIJNSVERENIGING, CLASSIFICATION.OCMW],
        [CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING, CLASSIFICATION.OCMW],
        [CLASSIFICATION.PEVA_MUNICIPALITY, CLASSIFICATION.MUNICIPALITY],
        [CLASSIFICATION.PEVA_PROVINCE, CLASSIFICATION.PROVINCE],
      ].forEach(([cl, participantClassification]) => {
        test(`it returns no error when membership is a founder for a ${cl.label}`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            'administrative-unit',
            {
              classification,
            },
          );

          const participant = this.store().createRecord('administrative-unit', {
            classification: this.store().createRecord(
              'administrative-unit-classification-code',
              participantClassification,
            ),
          });
          const participantRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          );
          this.store().createRecord('membership', {
            organization: organization,
            member: participant,
            role: participantRole,
          });

          const member = this.store().createRecord('organization');

          const founderRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          );

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: founderRole,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.true(isValid);
        });
      });

      [
        [CLASSIFICATION.WELZIJNSVERENIGING, CLASSIFICATION.OCMW],
        [CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING, CLASSIFICATION.OCMW],
        [CLASSIFICATION.PEVA_MUNICIPALITY, CLASSIFICATION.MUNICIPALITY],
        [CLASSIFICATION.PEVA_PROVINCE, CLASSIFICATION.PROVINCE],
      ].forEach(([cl, relatedClassification]) => {
        test(`it returns no error there is another founder for a ${cl.label}`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            'administrative-unit',
            {
              classification,
            },
          );

          const relatedClassificationRecord = this.store().createRecord(
            'administrative-unit-classification-code',
            relatedClassification,
          );
          const founder = this.store().createRecord('administrative-unit', {
            classification: relatedClassificationRecord,
          });
          const participant = this.store().createRecord('administrative-unit', {
            classification: relatedClassificationRecord,
          });

          const founderRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          );
          const participantRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          );

          this.store().createRecord('membership', {
            organization: organization,
            member: founder,
            role: founderRole,
          });
          this.store().createRecord('membership', {
            organization: organization,
            member: participant,
            role: participantRole,
          });

          const member = this.store().createRecord('organization');

          const role = this.store().createRecord('membership-role');
          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: role,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.true(isValid);
        });
      });

      [CLASSIFICATION.POLICE_ZONE, CLASSIFICATION.ASSISTANCE_ZONE].forEach(
        (cl) => {
          test(`it returns an error when there is no membership with the "member" role for a ${cl.label}`, async function (assert) {
            const classification = this.store().createRecord(
              'administrative-unit-classification-code',
              cl,
            );
            const organization = this.store().createRecord(
              'administrative-unit',
              {
                classification,
              },
            );
            const member = this.store().createRecord('organization');

            const role = this.store().createRecord('membership-role');

            const model = this.store().createRecord('membership', {
              organization: organization,
              member: member,
              role: role,
            });

            const isValid = await model.validate({
              creatingNewOrganization: true,
            });

            assert.false(isValid);
            assert.strictEqual(Object.keys(model.error).length, 1);
            assert.propContains(model.error, {
              role: { message: 'Kies minstens 1 gemeente' },
            });
          });
        },
      );

      [CLASSIFICATION.POLICE_ZONE, CLASSIFICATION.ASSISTANCE_ZONE].forEach(
        (cl) => {
          test(`it returns no error when membership is a "member" for a ${cl.label}`, async function (assert) {
            const classification = this.store().createRecord(
              'administrative-unit-classification-code',
              cl,
            );
            const organization = this.store().createRecord(
              'administrative-unit',
              {
                classification,
              },
            );
            const member = this.store().createRecord('organization');

            const participantRole = this.store().createRecord(
              'membership-role',
              MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
            );

            const model = this.store().createRecord('membership', {
              organization: organization,
              member: member,
              role: participantRole,
            });

            const isValid = await model.validate({
              creatingNewOrganization: true,
            });

            assert.true(isValid);
          });

          test(`it returns an error when the only membership is a "has relation with" for a ${cl.label}`, async function (assert) {
            const classification = this.store().createRecord(
              'administrative-unit-classification-code',
              cl,
            );
            const organization = this.store().createRecord(
              'administrative-unit',
              {
                classification,
              },
            );
            const member = this.store().createRecord('organization');

            const relationRole = this.store().createRecord(
              'membership-role',
              MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
            );

            const model = this.store().createRecord('membership', {
              organization: organization,
              member: member,
              role: relationRole,
            });

            const isValid = await model.validate({
              creatingNewOrganization: true,
            });

            assert.false(isValid);
            assert.propContains(model.error, {
              role: { message: 'Kies minstens 1 gemeente' },
            });
          });
        },
      );

      [
        [
          CLASSIFICATION.APB,
          MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          CLASSIFICATION.PROVINCE,
        ],
        [
          CLASSIFICATION.PROJECTVERENIGING,
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          CLASSIFICATION.MUNICIPALITY,
        ],
        [
          CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
          MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          CLASSIFICATION.MUNICIPALITY,
        ],
      ].forEach(([cl, roleMapping, participantClassification]) => {
        test(`it returns no error when a "${roleMapping.label}" and the other required memberships are provided for a ${cl.label}`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            'administrative-unit',
            {
              classification,
            },
          );

          const municipalityClassification = this.store().createRecord(
            'administrative-unit-classification-code',
            CLASSIFICATION.MUNICIPALITY,
          );
          const participantClassificationRecord =
            participantClassification === CLASSIFICATION.MUNICIPALITY
              ? municipalityClassification
              : this.store().createRecord(
                  'administrative-unit-classification-code',
                  participantClassification,
                );

          const municipalityOne = this.store().createRecord(
            'administrative-unit',
            {
              classification: municipalityClassification,
            },
          );
          const municipalityTwo = this.store().createRecord(
            'administrative-unit',
            {
              classification: municipalityClassification,
            },
          );
          const participant = this.store().createRecord('administrative-unit', {
            classification: participantClassificationRecord,
          });

          const founderRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          );
          const participantRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
          );

          this.store().createRecord('membership', {
            organization: organization,
            member: municipalityOne,
            role: founderRole,
          });
          this.store().createRecord('membership', {
            organization: organization,
            member: municipalityTwo,
            role: founderRole,
          });
          this.store().createRecord('membership', {
            organization: organization,
            member: participant,
            role: participantRole,
          });

          const member = this.store().createRecord('organization');

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role:
              roleMapping === MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF
                ? founderRole
                : participantRole,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.true(isValid);
        });
      });

      [
        CLASSIFICATION.WORSHIP_SERVICE,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
      ].forEach((cl) => {
        test(`it returns an error when there is no membership  with the "has relation with" role for a ${cl.label}`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            cl.id === CLASSIFICATION.WORSHIP_SERVICE.id
              ? 'worship-service'
              : 'central-worship-service',
            {
              classification,
            },
          );
          const member = this.store().createRecord('organization');

          const role = this.store().createRecord('membership-role');

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: role,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.false(isValid);
          assert.strictEqual(Object.keys(model.error).length, 1);
          assert.propContains(model.error, {
            role: { message: 'Selecteer een optie' },
          });
        });
      });

      [
        CLASSIFICATION.WORSHIP_SERVICE,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
      ].forEach((cl) => {
        test(`it returns no error when membership is a "has relation with" for a ${cl.label}`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            cl.id === CLASSIFICATION.WORSHIP_SERVICE.id
              ? 'worship-service'
              : 'central-worship-service',
            {
              classification,
            },
          );
          const member = this.store().createRecord('organization');

          const relationRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
          );

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: relationRole,
          });

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.true(isValid);
        });
      });

      module('OP-3929 minimums', function () {
        /**
         * Push a persisted administrative unit of the given classification,
         * as the create form only offers persisted organizations: the unit
         * being created must be the only new organization of a membership.
         */
        function pushUnit(store, classification, id) {
          const records = store.push({
            data: [
              {
                type: 'administrative-unit-classification-code',
                id: classification.id,
                attributes: { label: classification.label },
              },
              {
                type: 'administrative-unit',
                id,
                relationships: {
                  classification: {
                    data: {
                      type: 'administrative-unit-classification-code',
                      id: classification.id,
                    },
                  },
                },
              },
            ],
          });
          return records.at(-1);
        }

        function createOrganization(store, classification) {
          return store.createRecord('administrative-unit', {
            classification: store.createRecord(
              'administrative-unit-classification-code',
              classification,
            ),
          });
        }

        function createMemberships(store, organization, specs) {
          const roles = {};
          return specs.map((spec, index) => {
            const other = pushUnit(store, spec.other, `unit-${index}`);
            // A role record can only be created once per id.
            const role = (roles[spec.role.id] ??= store.createRecord(
              'membership-role',
              spec.role,
            ));
            return store.createRecord('membership', {
              role,
              member: spec.asMember ? organization : other,
              organization: spec.asMember ? other : organization,
            });
          });
        }

        [
          {
            label: 'a district with a municipality as founder',
            organization: CLASSIFICATION.DISTRICT,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
          },
          {
            label:
              'an interlokale vereniging with two municipal founders and a municipal participant',
            organization: CLASSIFICATION.INTERLOKALE_VERENIGING,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.MUNICIPALITY,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.MUNICIPALITY,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
          },
          {
            label:
              'a bosgroep with a province as recognizer and a municipality as participant',
            organization: CLASSIFICATION.BOSGROEP,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO,
                other: CLASSIFICATION.PROVINCE,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
          },
          {
            label: 'an "andere" with a municipality as participant',
            organization: CLASSIFICATION.ANDERE,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
          },
          {
            label:
              'a municipality with an OCMW serving it and a vervoerregioraad it is represented in',
            organization: CLASSIFICATION.MUNICIPALITY,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.SERVES,
                other: CLASSIFICATION.OCMW,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
                other: CLASSIFICATION.VERVOERREGIORAAD,
                asMember: true,
              },
            ],
          },
          {
            label: 'an OCMW with a municipality it serves',
            organization: CLASSIFICATION.OCMW,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.SERVES,
                other: CLASSIFICATION.MUNICIPALITY,
                asMember: true,
              },
            ],
          },
          {
            label:
              'a vervoerregioraad with a municipality it is represented by',
            organization: CLASSIFICATION.VERVOERREGIORAAD,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
          },
          {
            label:
              'a zorgraad with a regionaal zorgplatform it participates in and a municipality it is represented by',
            organization: CLASSIFICATION.ZORGRAAD,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.REGIONAAL_ZORGPLATFORM,
                asMember: true,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
          },
          {
            label: 'a regionaal zorgplatform with a zorgraad as participant',
            organization: CLASSIFICATION.REGIONAAL_ZORGPLATFORM,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.ZORGRAAD,
              },
            ],
          },
          {
            label: 'a regionaal landschap with a municipality as participant',
            organization: CLASSIFICATION.REGIONAAL_LANDSCHAP,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
          },
          ...[
            CLASSIFICATION.ZIEKENHUISVERENIGING,
            CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
            CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
          ].map((cl) => ({
            label: `a ${cl.label.toLowerCase()} with an OCMW as founder and as participant`,
            organization: cl,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.OCMW,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.OCMW,
              },
            ],
          })),
          {
            label: 'a woonmaatschappij without required fields',
            organization: CLASSIFICATION.WOONMAATSCHAPPIJ,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
                other: CLASSIFICATION.WOONMAATSCHAPPIJ,
                asMember: true,
              },
            ],
          },
        ].forEach(({ label, organization, specs }) => {
          test(`it returns no error when ${label} is created`, async function (assert) {
            const store = this.store();
            const newOrganization = createOrganization(store, organization);
            const memberships = createMemberships(
              store,
              newOrganization,
              specs,
            );

            const isValid = await memberships
              .at(-1)
              .validate({ creatingNewOrganization: true });

            assert.true(isValid);
          });
        });

        [
          {
            label: 'a district without a founder',
            organization: CLASSIFICATION.DISTRICT,
            specs: [],
            message: 'Kies minstens 1 gemeente',
          },
          {
            label: 'an interlokale vereniging with only one founder',
            organization: CLASSIFICATION.INTERLOKALE_VERENIGING,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.MUNICIPALITY,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
            message: 'Kies minstens 2 gemeenten',
          },
          {
            label: 'an interlokale vereniging without a municipal participant',
            organization: CLASSIFICATION.INTERLOKALE_VERENIGING,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.MUNICIPALITY,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.MUNICIPALITY,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.PROVINCE,
              },
            ],
            message: 'Kies minstens 1 gemeente',
          },
          {
            label: 'a bosgroep without a recognizer',
            organization: CLASSIFICATION.BOSGROEP,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
            message: 'Kies minstens 1 provincie',
          },
          {
            label: 'an "andere" with only an "Is lid van" membership',
            organization: CLASSIFICATION.ANDERE,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.INTERLOKALE_VERENIGING,
                asMember: true,
              },
            ],
            message: 'Kies minstens 1 organisatie',
          },
          {
            label:
              'a municipality without an organization it is represented in',
            organization: CLASSIFICATION.MUNICIPALITY,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.SERVES,
                other: CLASSIFICATION.OCMW,
              },
            ],
            message: 'Kies minstens 1 vervoerregioraad of zorgraad',
          },
          {
            label: 'an OCMW without a municipality it serves',
            organization: CLASSIFICATION.OCMW,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.WELZIJNSVERENIGING,
                asMember: true,
              },
            ],
            message: 'Kies minstens 1 gemeente',
          },
          {
            label:
              'a vervoerregioraad without a municipality it is represented by',
            organization: CLASSIFICATION.VERVOERREGIORAAD,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.INTERLOKALE_VERENIGING,
                asMember: true,
              },
            ],
            message: 'Kies minstens 1 gemeente',
          },
          {
            label: 'a zorgraad without a municipality it is represented by',
            organization: CLASSIFICATION.ZORGRAAD,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.REGIONAAL_ZORGPLATFORM,
                asMember: true,
              },
            ],
            message: 'Kies minstens 1 gemeente of OCMW',
          },
          {
            label:
              'a zorgraad without a regionaal zorgplatform it participates in',
            organization: CLASSIFICATION.ZORGRAAD,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
            message: 'Kies minstens 1 regionaal zorgplatform',
          },
          {
            label:
              'a regionaal zorgplatform with only an organization it is represented by',
            organization: CLASSIFICATION.REGIONAAL_ZORGPLATFORM,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN,
                other: CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
              },
            ],
            message: 'Kies minstens 1 zorgraad',
          },
          {
            label: 'a regionaal landschap without a participant',
            organization: CLASSIFICATION.REGIONAAL_LANDSCHAP,
            specs: [],
            message: 'Kies minstens 1 gemeente of provincie',
          },
          ...[
            CLASSIFICATION.ZIEKENHUISVERENIGING,
            CLASSIFICATION.VERENIGING_OF_VENNOOTSCHAP_VOOR_SOCIALE_DIENSTVERLENING,
            CLASSIFICATION.WOONZORGVERENIGING_OF_WOONZORGVENNOOTSCHAP,
          ].map((cl) => ({
            label: `a ${cl.label.toLowerCase()} without an OCMW participant`,
            organization: cl,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.OCMW,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
            message: 'Kies minstens 1 OCMW',
          })),
          {
            label: 'an opdrachthoudende vereniging with only one founder',
            organization: CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.MUNICIPALITY,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
            message: 'Kies minstens 2 gemeenten',
          },
          {
            label: 'a welzijnsvereniging with only municipal participants',
            organization: CLASSIFICATION.WELZIJNSVERENIGING,
            specs: [
              {
                role: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
                other: CLASSIFICATION.OCMW,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
              {
                role: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
                other: CLASSIFICATION.MUNICIPALITY,
              },
            ],
            message: 'Kies minstens 1 OCMW',
          },
        ].forEach(({ label, organization, specs, message }) => {
          test(`it returns an error when ${label} is created`, async function (assert) {
            const store = this.store();
            const newOrganization = createOrganization(store, organization);
            // A membership with the worship-only role, so it counts towards
            // no field: the create form validates every membership of the
            // organization being created.
            const unrelatedMembership = store.createRecord('membership', {
              organization: newOrganization,
              member: pushUnit(store, CLASSIFICATION.MUNICIPALITY, 'unit'),
              role: store.createRecord(
                'membership-role',
                MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
              ),
            });
            createMemberships(store, newOrganization, specs);

            const isValid = await unrelatedMembership.validate({
              creatingNewOrganization: true,
            });

            assert.false(isValid);
            assert.propContains(unrelatedMembership.error, {
              role: { message },
            });
          });
        });
      });
    });

    module('editing existing organization', function () {
      [
        CLASSIFICATION.WELZIJNSVERENIGING,
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        CLASSIFICATION.PEVA_MUNICIPALITY,
        CLASSIFICATION.PEVA_PROVINCE,
      ].forEach((cl) => {
        test(`it returns no error when founder is missing for a ${cl.label} and the mandatory founder rule is relaxed`, async function (assert) {
          const classification = this.store().createRecord(
            'administrative-unit-classification-code',
            cl,
          );
          const organization = this.store().createRecord(
            'administrative-unit',
            {
              classification,
            },
          );
          const member = this.store().createRecord('organization');

          const role = this.store().createRecord('membership-role');

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: role,
          });

          const isValid = await model.validate();

          assert.true(isValid);
        });
      });
    });
  });

  module('isHasRelationWithMembership', function () {
    test('it should return truthy for a membership with the relation role', async function (assert) {
      const role = this.store().createRecord('membership-role', {
        id: MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
      });

      const model = this.store().createRecord('membership', {
        role: role,
      });

      assert.ok(model.isHasRelationWithMembership);
    });

    test('it should return falsy for a membership with another role', async function (assert) {
      const role = this.store().createRecord('membership-role', {
        id: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id,
      });

      const model = this.store().createRecord('membership', {
        role: role,
      });

      assert.notOk(model.isHasRelationWithMembership);
    });

    test('it should return falsy for a membership without a role', async function (assert) {
      const model = this.store().createRecord('membership', {});

      assert.notOk(model.isHasRelationWithMembership);
    });
  });

  module('isFounderOfMembership', function () {
    test('it should return truthy for a membership with the founder role', async function (assert) {
      const role = this.store().createRecord('membership-role', {
        id: MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id,
      });

      const model = this.store().createRecord('membership', {
        role: role,
      });

      assert.ok(model.isFounderOfMembership);
    });

    test('it should return falsy for a membership with another role', async function (assert) {
      const role = this.store().createRecord('membership-role', {
        id: MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
      });

      const model = this.store().createRecord('membership', {
        role: role,
      });

      assert.notOk(model.isFounderOfMembership);
    });

    test('it should return falsy for a membership without a role', async function (assert) {
      const model = this.store().createRecord('membership', {});

      assert.notOk(model.isFounderOfMembership);
    });
  });

  module('isParticipatesMembership', function () {
    test('it should return truthy for a membership with the participates role', async function (assert) {
      const role = this.store().createRecord('membership-role', {
        id: MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN.id,
      });

      const model = this.store().createRecord('membership', {
        role: role,
      });

      assert.ok(model.isParticipatesMembership);
    });

    test('it should return falsy for a membership with another role', async function (assert) {
      const role = this.store().createRecord('membership-role', {
        id: MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id,
      });

      const model = this.store().createRecord('membership', {
        role: role,
      });

      assert.notOk(model.isParticipatesMembership);
    });

    test('it should return falsy for a membership without a role', async function (assert) {
      const model = this.store().createRecord('membership', {});

      assert.notOk(model.isParticipatesMembership);
    });
  });

  module('isServesMembership', function () {
    test('it should return truthy for a membership with the serves role', async function (assert) {
      const role = this.store().createRecord(
        'membership-role',
        MEMBERSHIP_ROLES_MAPPING.SERVES,
      );
      const model = this.store().createRecord('membership', { role });

      assert.ok(model.isServesMembership);
      assert.notOk(model.isHasRelationWithMembership);
    });

    test('it should return falsy for a membership with another role', async function (assert) {
      const role = this.store().createRecord(
        'membership-role',
        MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
      );
      const model = this.store().createRecord('membership', { role });

      assert.notOk(model.isServesMembership);
    });
  });

  module('isNotRemovableByUser', function () {
    function pushMembership(store, { organization, member, roleMapping }) {
      const records = store.push({
        data: [
          {
            type: 'administrative-unit-classification-code',
            id: organization.id,
            attributes: { label: organization.label },
          },
          {
            type: 'administrative-unit-classification-code',
            id: member.id,
            attributes: { label: member.label },
          },
          {
            type: 'administrative-unit',
            id: 'org',
            relationships: {
              classification: {
                data: {
                  type: 'administrative-unit-classification-code',
                  id: organization.id,
                },
              },
            },
          },
          {
            type: 'administrative-unit',
            id: 'member',
            relationships: {
              classification: {
                data: {
                  type: 'administrative-unit-classification-code',
                  id: member.id,
                },
              },
            },
          },
          {
            type: 'membership-role',
            id: roleMapping.id,
            attributes: { label: roleMapping.label },
          },
          {
            type: 'membership',
            id: 'membership',
            relationships: {
              organization: {
                data: { type: 'administrative-unit', id: 'org' },
              },
              member: { data: { type: 'administrative-unit', id: 'member' } },
              role: { data: { type: 'membership-role', id: roleMapping.id } },
            },
          },
        ],
      });
      return records.at(-1);
    }

    [
      [
        CLASSIFICATION.MUNICIPALITY,
        CLASSIFICATION.OCMW,
        MEMBERSHIP_ROLES_MAPPING.SERVES,
      ],
      [
        CLASSIFICATION.MUNICIPALITY,
        CLASSIFICATION.OCMW,
        MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
      ],
      [
        CLASSIFICATION.PROVINCE,
        CLASSIFICATION.MUNICIPALITY,
        MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
      ],
      [
        CLASSIFICATION.PROVINCE,
        CLASSIFICATION.OCMW,
        MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
      ],
    ].forEach(([organization, member, roleMapping]) => {
      test(`a persisted "${roleMapping.label}" membership between a ${organization.label} and a ${member.label} cannot be removed`, async function (assert) {
        const model = pushMembership(this.store(), {
          organization,
          member,
          roleMapping,
        });

        assert.true(model.isNotRemovableByUser);
      });
    });

    [
      [
        CLASSIFICATION.MUNICIPALITY,
        CLASSIFICATION.OCMW,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      ],
      [
        CLASSIFICATION.POLICE_ZONE,
        CLASSIFICATION.MUNICIPALITY,
        MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN,
      ],
      [
        CLASSIFICATION.AGB,
        CLASSIFICATION.MUNICIPALITY,
        MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
      ],
    ].forEach(([organization, member, roleMapping]) => {
      test(`a persisted "${roleMapping.label}" membership between a ${organization.label} and a ${member.label} can be removed`, async function (assert) {
        const model = pushMembership(this.store(), {
          organization,
          member,
          roleMapping,
        });

        assert.false(model.isNotRemovableByUser);
      });
    });

    test('a new membership can always be removed', async function (assert) {
      const role = this.store().createRecord(
        'membership-role',
        MEMBERSHIP_ROLES_MAPPING.SERVES,
      );
      const model = this.store().createRecord('membership', { role });

      assert.false(model.isNotRemovableByUser);
    });
  });

  module('equals', function () {
    test('Membership equality is reflexive', function (assert) {
      const organization = this.store().createRecord('organization', {
        id: 'organization',
      });
      const member = this.store().createRecord('organization', {
        id: 'member',
      });
      const role = this.store().createRecord('membership-role', { id: 'role' });

      const model = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: role,
      });

      const areEqual = model.equals(model);
      assert.true(areEqual);
    });

    test('Membership equality is symmetric', function (assert) {
      const organization = this.store().createRecord('organization', {
        id: 'organization',
      });
      const member = this.store().createRecord('organization', {
        id: 'member',
      });
      const role = this.store().createRecord('membership-role', { id: 'role' });

      const model = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: role,
      });

      const other = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: role,
      });

      const modelEqualsOther = model.equals(other);
      const otherEqualsModel = other.equals(model);
      assert.strictEqual(modelEqualsOther, otherEqualsModel);
    });

    test('Membership equality is transitive', function (assert) {
      const organization = this.store().createRecord('organization', {
        id: 'organization',
      });
      const member = this.store().createRecord('organization', {
        id: 'member',
      });
      const role = this.store().createRecord('membership-role', { id: 'role' });

      const membershipOne = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: role,
      });

      const membershipTwo = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: role,
      });

      const membershipThree = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: role,
      });

      const oneEqualsTwo = membershipOne.equals(membershipTwo);
      const twoEqualsThree = membershipTwo.equals(membershipThree);
      assert.strictEqual(oneEqualsTwo, twoEqualsThree);
    });

    test('it should return true when memberships have the same organization, member and role', async function (assert) {
      const organization = this.store().createRecord('organization', {
        id: 'organization',
      });
      const member = this.store().createRecord('organization', {
        id: 'member',
      });
      const role = this.store().createRecord('membership-role', { id: 'role' });

      const membershipOne = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: role,
      });
      const membershipTwo = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: role,
      });

      const areEqual = membershipOne.equals(membershipTwo);
      assert.true(areEqual);
    });

    test('it should return false when memberships have a different role', async function (assert) {
      const organization = this.store().createRecord('organization', {
        id: 'organization',
      });
      const member = this.store().createRecord('organization', {
        id: 'member',
      });
      const roleOne = this.store().createRecord('membership-role', {
        id: 'role-one',
      });
      const roleTwo = this.store().createRecord('membership-role', {
        id: 'role-two',
      });

      const membershipOne = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: roleOne,
      });
      const membershipTwo = this.store().createRecord('membership', {
        organization: organization,
        member: member,
        role: roleTwo,
      });

      const areEqual = membershipOne.equals(membershipTwo);
      assert.false(areEqual);
    });

    test('it should return false when memberships have a different organizations', async function (assert) {
      const organizationOne = this.store().createRecord('organization', {
        id: 'organization-one',
      });
      const organizationTwo = this.store().createRecord('organization', {
        id: 'prganization-two',
      });
      const member = this.store().createRecord('organization', {
        id: 'member',
      });
      const role = this.store().createRecord('membership-role', { id: 'role' });

      const membershipOne = this.store().createRecord('membership', {
        organization: organizationOne,
        member: member,
        role: role,
      });
      const membershipTwo = this.store().createRecord('membership', {
        organization: organizationTwo,
        member: member,
        role: role,
      });

      const areEqual = membershipOne.equals(membershipTwo);
      assert.false(areEqual);
    });

    test('it should return false when memberships have a different members', async function (assert) {
      const organization = this.store().createRecord('organization', {
        id: 'organization',
      });
      const memberOne = this.store().createRecord('organization', {
        id: 'member-one',
      });
      const memberTwo = this.store().createRecord('organization', {
        id: 'member-two',
      });

      const role = this.store().createRecord('membership-role', { id: 'role' });

      const membershipOne = this.store().createRecord('membership', {
        organization: organization,
        member: memberOne,
        role: role,
      });
      const membershipTwo = this.store().createRecord('membership', {
        organization: organization,
        member: memberTwo,
        role: role,
      });

      const areEqual = membershipOne.equals(membershipTwo);
      assert.false(areEqual);
    });
  });
});
