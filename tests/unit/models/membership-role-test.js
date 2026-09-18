import { module, test } from 'qunit';
import { setupTest } from 'frontend-organization-portal/tests/helpers';
import {
  MEMBERSHIP_ROLES,
  MEMBERSHIP_ROLES_MAPPING,
} from 'frontend-organization-portal/models/membership-role';

module('Unit | Model | membership role', function (hooks) {
  setupTest(hooks);

  this.store = function () {
    return this.owner.lookup('service:store');
  };

  test('every role has a unique id and unique, trimmed labels', function (assert) {
    const ids = MEMBERSHIP_ROLES.map((role) => role.id);
    assert.strictEqual(new Set(ids).size, ids.length);

    // The role select and the role filter identify a role by its label, so
    // no label may be shared by two different roles. The generic role is the
    // only one whose two labels are identical.
    const labels = MEMBERSHIP_ROLES.flatMap((role) => [
      role.label,
      role.inverseLabel,
    ]);
    assert.strictEqual(new Set(labels).size, labels.length - 1);

    labels.forEach((label) => assert.strictEqual(label, label.trim()));
  });

  [
    [MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH, 'hasRelationWith'],
    [MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF, 'isFounderOf'],
    [MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN, 'participatesIn'],
    [MEMBERSHIP_ROLES_MAPPING.GRANTS_RECOGNITION_TO, 'grantsRecognition'],
    [MEMBERSHIP_ROLES_MAPPING.IS_REPRESENTED_IN, 'isRepresentedIn'],
    [MEMBERSHIP_ROLES_MAPPING.SERVES, 'serves'],
  ].forEach(([roleMapping, getter]) => {
    test(`"${roleMapping.label}" is the only role for which "${getter}" is true and it has the right labels`, function (assert) {
      const model = this.store().createRecord('membership-role', roleMapping);

      assert.true(model[getter]);
      assert.strictEqual(model.opLabel, roleMapping.label);
      assert.strictEqual(model.inverseOpLabel, roleMapping.inverseLabel);

      MEMBERSHIP_ROLES.filter((role) => role.id !== roleMapping.id).forEach(
        (role) => {
          const other = this.store().createRecord('membership-role', role);
          assert.false(other[getter]);
        },
      );
    });
  });

  test('the labels of an unknown role are undefined', function (assert) {
    const model = this.store().createRecord('membership-role', {
      id: 'unknown',
    });

    assert.strictEqual(model.opLabel, undefined);
    assert.strictEqual(model.inverseOpLabel, undefined);
  });
});
