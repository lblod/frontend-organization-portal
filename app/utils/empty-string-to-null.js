/**
 * Set empty strings to null in an Ember data model
 *
 * @param {Object} model Ember data model
 * @returns {Object} Ember data model
 */
export function setEmptyStringsToNull(model) {
  let properties = Object.keys(model.toJSON());

  for (const property of properties) {
    if (model[property] === '') {
      model[property] = null;
    }
  }

  return model;
}
