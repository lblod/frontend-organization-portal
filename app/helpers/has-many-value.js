import { assert } from '@ember/debug';

/**
 * Accesses the loaded data of a hasMany relationship in a sync way so it can be passed around more easily without having to use await first.
 * This helper assumes the relationship was already loaded before.
 * @param {unknown} record
 * @param {string} relationshipName
 * @returns {unknown[] | null} An array of records if the relationship was loaded, or null if it wasn't
 */
export default function hasManyValue(record, relationshipName) {
  assert(
    'The record argument should be an EmberData model instance',
    Boolean(record.hasMany)
  );
  assert(
    'A relationship name is required',
    typeof relationshipName === 'string' && Boolean(relationshipName)
  );
  assert(
    `The "${record.constructor.name}" class doesn't have a "${relationshipName}" hasMany relationship.`,
    record.constructor.relationshipsByName?.get(relationshipName)?.kind ===
      'hasMany'
  );
  return record.hasMany(relationshipName).value();
}
