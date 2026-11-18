import { assert } from '@ember/debug';

/**
 * Accesses the loaded data of a belongsTo relationship in a sync way so it can be passed around more easily without having to use await first.
 * This helper assumes the relationship was already loaded before.
 * @param {unknown} record
 * @param {string} relationshipName
 * @returns {unknown | null} The record if the relationship was loaded, or null if it wasn't
 */
export default function belongsToValue(record, relationshipName) {
  assert(
    'The record argument should be an EmberData model instance',
    Boolean(record.belongsTo),
  );
  assert(
    'A relationship name is required',
    typeof relationshipName === 'string' && Boolean(relationshipName),
  );
  assert(
    `The "${record.constructor.name}" class doesn't have a "${relationshipName}" belongsTo relationship.`,
    record.constructor.relationshipsByName?.get(relationshipName)?.kind ===
      'belongsTo',
  );
  return record.belongsTo(relationshipName).value();
}
