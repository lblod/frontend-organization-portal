import { tracked } from '@glimmer/tracking';
import Model from '@ember-data/model';

/**
 * Ember Data Model with Joi-based Validation
 */
export default class AbstractValidationModel extends Model {
  @tracked _validationError = null;

  /**
   * Get the validation schema for the model. Should be overridden in subclasses.
   * @returns {object} - The Joi validation schema.
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
  async validate() {
    const { attributes, relationships } = this.#serializeAll();
    const value = { ...attributes, ...relationships };
    console.log('value', value);
    try {
      await this.validationSchema.validateAsync(value, {
        abortEarly: false,
      });
    } catch (error) {
      console.log('error', JSON.stringify(error), error);
      this._validationError = error.details?.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});

      return false;
    }

    return true;
  }

  #serializeAll() {
    const { data } = this.serialize({ includeId: true });

    const relationships = {};
    this.eachRelationship((name, meta) => {
      // kebab-case the relationship name
      const nameKebabed = name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      relationships[nameKebabed] = this.#serializeRelationship(
        this[name],
        meta
      );
    });

    return {
      ...data,
      relationships,
    };
  }

  #serializeRelationship(relationshipValue, { kind }) {
    if (kind === 'belongsTo') {
      return this.#serializeSingleRelationship(relationshipValue);
    } else if (kind === 'hasMany') {
      return this.#serializeManyRelationship(relationshipValue);
    }

    return null;
  }

  #serializeSingleRelationship(relationshipValue) {
    if (relationshipValue.isTruthy) {
      const { data } = relationshipValue.content.serialize({ includeId: true });

      return data;
    }

    return undefined;
  }

  #serializeManyRelationship(relationshipValue) {
    console.log('relationshipValue', relationshipValue.length);
    console.log('relationshipValue.toArray()', relationshipValue.toArray());
    return relationshipValue.length > 0
      ? relationshipValue
          .toArray()
          .map((item) => item.serialize({ includeId: true }))
      : undefined;
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
