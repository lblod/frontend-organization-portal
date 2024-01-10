import { tracked } from '@glimmer/tracking';
import Model from '@ember-data/model';

/**
 * Ember Data Model with Joi-based Validation
 */
export default class AbstractValidationModel extends Model {
  @tracked _validationError;

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
    this._validationError = undefined;
    const { attributes, relationships } = this.#serializeAll();
    const value = { ...attributes, ...relationships };

    try {
      await this.validationSchema.validateAsync(value, {
        abortEarly: false,
        context: {
          changedAttributes: this.changedAttributes(),
        },
      });
    } catch (error) {
      this._validationError = error.details?.reduce((acc, err) => {
        acc[err.context.key] = err;
        return acc;
      }, {});

      return false;
    }

    return true;
  }

  #serializeAll() {
    const { data } = this.serialize({ includeId: true });
    const snakeCaseData = this.convertAttributesKeysToSnakeCase(data);

    const relationships = {};
    this.eachRelationship((name, meta) => {
      relationships[name] = this.#serializeRelationship(this[name], meta);
    });

    return {
      ...snakeCaseData,
      relationships,
    };
  }

  convertAttributesKeysToSnakeCase(data) {
    if (!data?.attributes) {
      return data;
    }

    const { attributes, ...rest } = data;

    const attributesKeysSnakeCased = Object.fromEntries(
      Object.entries(attributes).map(([key, value]) => [
        key.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase()),
        value,
      ])
    );

    return {
      ...rest,
      attributes: attributesKeysSnakeCased,
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
    this._validationError = undefined;
    this.rollbackAttributes();
  }
}
