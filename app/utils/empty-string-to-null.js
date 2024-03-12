/**
 * Set empty strings to null in all model attributes.
 *
 * @param {Object} model Ember data model
 * @returns {Object} Ember data model
 */
export function setEmptyStringsToNull(model) {
  model.eachAttribute((name) => {
    if (model[name] === '') {
      model[name] = null;
    }
  });

  return model;
}
