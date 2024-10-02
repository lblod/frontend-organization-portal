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
        test(`it should not return an error when a founder and participant are provided for ${cl.label}`, async function (assert) {
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

          const participant = this.store().createRecord('membership', {
            role: participantRole,
          });

          const relationRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH,
          );

          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: relationRole,
          });

          (await organization.memberships).push(participant);

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.true(isValid);
        });
      });

      [
        CLASSIFICATION.PROJECTVERENIGING,
        CLASSIFICATION.DIENSTVERLENENDE_VERENIGING,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING,
        CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        CLASSIFICATION.AGB,
        CLASSIFICATION.APB,
      ].forEach((cl) => {
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
            role: { message: 'Selecteer een optie' },
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
            role: { message: 'Selecteer een optie' },
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
            role: { message: 'Selecteer een optie' },
          });
        });
      });

      [
        CLASSIFICATION.WELZIJNSVERENIGING,
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        CLASSIFICATION.PEVA_MUNICIPALITY,
        CLASSIFICATION.PEVA_PROVINCE,
      ].forEach((cl) => {
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
        CLASSIFICATION.WELZIJNSVERENIGING,
        CLASSIFICATION.AUTONOME_VERZORGINGSINSTELLING,
        CLASSIFICATION.PEVA_MUNICIPALITY,
        CLASSIFICATION.PEVA_PROVINCE,
      ].forEach((cl) => {
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
          const member = this.store().createRecord('organization');

          const founderRole = this.store().createRecord(
            'membership-role',
            MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF,
          );
          const founder = this.store().createRecord('membership', {
            role: founderRole,
          });

          const role = this.store().createRecord('membership-role');
          const model = this.store().createRecord('membership', {
            organization: organization,
            member: member,
            role: role,
          });

          (await organization.memberships).push(founder);

          const isValid = await model.validate({
            creatingNewOrganization: true,
          });

          assert.true(isValid);
        });
      });

      [CLASSIFICATION.POLICE_ZONE, CLASSIFICATION.ASSISTANCE_ZONE].forEach(
        (cl) => {
          test(`it returns an error when there is no membership  with the "has relation with" role for a ${cl.label}`, async function (assert) {
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
              role: { message: 'Selecteer een optie' },
            });
          });
        },
      );

      [CLASSIFICATION.POLICE_ZONE, CLASSIFICATION.ASSISTANCE_ZONE].forEach(
        (cl) => {
          test(`it returns no error when membership is a "has relation with" for a ${cl.label}`, async function (assert) {
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

            assert.true(isValid);
          });
        },
      );

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
