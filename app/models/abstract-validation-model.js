import Model from '@ember-data/model';
import { tracked } from '@glimmer/tracking';
import { object, array, addMethod, ValidationError } from 'yup';

/**
 * Ember Data Model with Yup-based Validation
 * Inspired by https://mainmatter.com/blog/2021/12/08/validations-in-ember-apps/
 */
export default class AbstractValidationModel extends Model {
  @tracked _validationError = null;
  /**
   * Get the validation schema for the model. Should be overridden in subclasses.
   * @returns {object} - The Yup validation schema.
   */
  get validationSchema() {
    throw new Error('validationSchema should be overridden');
  }

  /**
   * Get the validation error for the model.
   * @returns {object} - The validation error.
   */
  get error() {
    return this._validationError;
  }

  /**
   * Validate the model using the validation schema.
   * @returns {Promise<boolean>} - Whether the model is valid.
   */
  validate() {
    return this.validationSchema
      .validate(this, { abortEarly: false })
      .then(() => true)
      .catch((error) => {
        if (!error.inner) {
          throw error;
        }

        this._validationError = error.inner.reduce((acc, err) => {
          acc[err.path] = err.message;
          return acc;
        }, {});

        return false;
      });
  }

  /**
   * Reset the model to its original state.
   * @returns {void}
   * @see https://guides.emberjs.com/release/models/#toc_rolling-back-attributes
   */
  reset() {
    this._validationError = null;
    this.rollbackAttributes();
  }
}

// Add custom Yup method for validating belongsTo relationships
addMethod(
  object,
  'relationship',
  function ({ isRequired = false, message } = {}) {
    return this.test(async (value, { path, options }) => {
      const content = value?.content;
      if (!content) {
        if (isRequired)
          throw new ValidationError(
            message || `${path} is a required field`,
            content,
            path
          );

        return true;
      }

      const isValid = await validateRelationship(content, options);

      return isValid === true;
    });
  }
);

// Add custom Yup method for validating hasMany relationships
addMethod(
  array,
  'relationship',
  function ({ isRequired = false, message } = {}) {
    return this.transform((_value, originalValue) => {
      return originalValue?.toArray() || [];
    }).test(async (value, { path, options }) => {
      if (!value.length && isRequired) {
        throw new ValidationError(
          message || `${path} is a required field`,
          value,
          path
        );
      }

      const validationsPassed = await Promise.all(
        value.map((item) => {
          return validateRelationship(item, options);
        })
      );

      return validationsPassed.every((validation) => validation === true);
    });
  }
);

const validateRelationship = async (relationship, options) => {
  if (!relationship.validate) {
    throw new Error(`${options.path} should extend AbstractValidationModel.`);
  }
  const isValid = await relationship.validate();

  if (isValid) {
    return true;
  }

  throw new ValidationError(relationship.error, relationship, options.path);
};
