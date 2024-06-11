import { ORGANIZATION_TYPES } from '../constants/organization-types';
import { CLASSIFICATION } from '../models/administrative-unit-classification-code';

/**
 * A group object that can be use in Ember Power Select. For more information
 * see https://ember-power-select.com/docs/groups
 * @typedef {Object} Group
 * @property {string} groupName - the name of the group.
 * @property {string} options - the options available in the group
 */

/**
 * Convert a set of classification code identifiers to a list of groups that can
 * be parsed by Power select.
 * @param {string[]} codes - a list of classification code identifiers
 * @returns {Group[]} a list of objects representing groups
 */
export function convertClassificationToGroups(codes) {
  return [
    createGroup(
      'Bestuurseenheden',
      ORGANIZATION_TYPES.ADMINISTRATIVE_UNIT,
      codes
    ),
    createGroup('Verenigingen', ORGANIZATION_TYPES.ASSOCIATION, codes),
    createGroup('Vennootschappen', ORGANIZATION_TYPES.CORPORATION, codes),
  ].filter((group) => group.options.length > 0);
}

/**
 * Create an object that can be used by Ember Power Select.
 * @param {string} name - the intended group name
 * @param {string} filter - the organization type for which to filter the
 *     classification code identifiers.
 * @param {string[]} codes - a list of classification code identifiers.
 * @returns {Group} an object representing a group.
 */
function createGroup(name, filter, codes) {
  return {
    groupName: name,
    options: codes.filter((code) =>
      Object.values(CLASSIFICATION)
        .filter((cl) => cl.organizationType === filter)
        .map((cl) => cl.id)
        .includes(code.id)
    ),
  };
}
