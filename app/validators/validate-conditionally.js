/**
 * Validator which conditionally runs other validators.
 * This is inspired by this addon https://github.com/skaterdav85/ember-changeset-conditional-validations.
 * Our version supports async validator and conditions functions but
 * it doesn't provide a helper to make retrieving values easier.
 *
 * @param {*} validator a validator function which will be executed if the condition returns `true`
 * @param {*} condition Function which should return true if the validators should run.
 * @returns a conditional validator function
 */
export function validateConditionally(validator, condition) {
  // TODO: support passing in multiple validator functions

  return async function conditionalValidator(
    key,
    newValue,
    oldValue,
    changes,
    content
  ) {
    let shouldValidate = await condition(changes, content);

    if (shouldValidate) {
      return validator(key, newValue, oldValue, changes, content);
    } else {
      const DONT_VALIDATE = true;
      return DONT_VALIDATE;
    }
  };
}
