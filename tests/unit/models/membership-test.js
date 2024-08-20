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
          (await organization.memberships).push(model);

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

          (await organization.memberships).push(model);

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

          (await organization.memberships).push(model);

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

          (await organization.memberships).push(model);

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

          (await organization.memberships).push(model);

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
          (await organization.memberships).push(model);

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

            (await organization.memberships).push(model);

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

            (await organization.memberships).push(model);

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

          (await organization.memberships).push(model);

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

          (await organization.memberships).push(model);

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
});
