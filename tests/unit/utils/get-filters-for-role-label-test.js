import { module, test } from 'qunit';
import getFiltersForRoleLabel from 'frontend-organization-portal/utils/get-filters-for-role-label';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';

module('Unit | Utility | get-filters-for-role-label', function () {
  const organization = { id: 'organization' };
  // Stand-ins for membership role records
  const participatesIn = {
    id: 'participates-in',
    opLabel: 'Is lid van',
    inverseOpLabel: 'Heeft als leden',
    hasRelationWith: false,
  };
  const hasRelationWith = {
    id: 'has-relation-with',
    opLabel: 'Heeft een relatie met',
    inverseOpLabel: 'Heeft een relatie met',
    hasRelationWith: true,
  };
  const roles = [participatesIn, hasRelationWith];

  function filters(options) {
    return Object.fromEntries(
      getFiltersForRoleLabel({ roles, organization, ...options }),
    );
  }

  test('without role label it matches the relations on both sides of the organization', function (assert) {
    assert.deepEqual(filters({}), {
      'filter[:or:][member][:id:]': 'organization',
      'filter[:or:][organization][:id:]': 'organization',
    });
  });

  test('a label puts the organization on the side the label implies and filters on the role', function (assert) {
    assert.deepEqual(filters({ roleLabel: 'Is lid van' }), {
      'filter[member][:id:]': 'organization',
      'filter[role][:id:]': 'participates-in',
    });
    assert.deepEqual(filters({ roleLabel: 'Heeft als leden' }), {
      'filter[organization][:id:]': 'organization',
      'filter[role][:id:]': 'participates-in',
    });
  });

  test('the label of the "has a relation with" role matches both sides', function (assert) {
    assert.deepEqual(filters({ roleLabel: 'Heeft een relatie met' }), {
      'filter[:or:][member][:id:]': 'organization',
      'filter[:or:][organization][:id:]': 'organization',
      'filter[role][:id:]': 'has-relation-with',
    });
  });

  test('the status only keeps the relations between active organizations', function (assert) {
    assert.deepEqual(filters({ roleLabel: 'Is lid van', status: true }), {
      'filter[member][:id:]': 'organization',
      'filter[role][:id:]': 'participates-in',
      'filter[member][organization-status][:id:]': ORGANIZATION_STATUS.ACTIVE,
      'filter[organization][organization-status][:id:]':
        ORGANIZATION_STATUS.ACTIVE,
    });
  });
});
