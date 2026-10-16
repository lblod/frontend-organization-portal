import { module, test } from 'qunit';
import { RELATION_STATUS } from 'frontend-organization-portal/utils/relation-status';
import { sortRelatedOrganizations } from 'frontend-organization-portal/utils/sort-related-organizations';

function row(organizationName, values = {}) {
  return {
    organizationName,
    role: 'Is lid van',
    organizationType: 'Gemeente',
    relationStatus: RELATION_STATUS.ACTIVE,
    ...values,
  };
}

function names(rows) {
  return rows.map((row) => row.organizationName).join(',');
}

module('Unit | Utility | sort-related-organizations', function () {
  test('it sorts on a date with the rows without a date last', function (assert) {
    const rows = [
      row('B'),
      row('C', { endDate: new Date('2025-01-01') }),
      row('A'),
      row('D', { endDate: new Date('2024-01-01') }),
    ];

    assert.strictEqual(
      names(sortRelatedOrganizations(rows, 'end-date')),
      'D,C,A,B',
    );
    assert.strictEqual(
      names(sortRelatedOrganizations(rows, '-end-date')),
      'C,D,A,B',
    );
  });

  test('it sorts on the relation status', function (assert) {
    const rows = [
      row('B', { relationStatus: RELATION_STATUS.INACTIVE }),
      row('C'),
      row('A'),
    ];

    assert.strictEqual(
      names(sortRelatedOrganizations(rows, 'relation-status')),
      'A,C,B',
    );
    assert.strictEqual(
      names(sortRelatedOrganizations(rows, '-relation-status')),
      'B,A,C',
    );
  });

  test('it sorts on a text column with ties by name', function (assert) {
    const rows = [
      row('B', { role: 'Is lid van' }),
      row('C', { role: 'Bedient' }),
      row('A', { role: 'Is lid van' }),
    ];

    assert.strictEqual(
      names(sortRelatedOrganizations(rows, 'role.label')),
      'C,A,B',
    );
    assert.strictEqual(names(sortRelatedOrganizations(rows, '-name')), 'C,B,A');
  });

  test('it keeps the order for an unknown column', function (assert) {
    const rows = [row('B'), row('A')];

    assert.strictEqual(sortRelatedOrganizations(rows, 'unknown'), rows);
  });
});
