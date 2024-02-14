import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
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
    this.#resetValidationErrors();
    const serializedModel = this.#serializeModel();

    try {
      await this.validationSchema.validateAsync(serializedModel, {
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

  #serializeModelWithDepthControl(model, maxDepth = 2) {
    if (!model || maxDepth < 0) {
      return undefined;
    }
    const entries = [...model.constructor.fields, ['id', 'attribute']].map(
      ([key, type]) => {
        if (type === 'attribute') {
          return [key, model[key]];
        } else if (type === 'belongsTo') {
          const belongsTo = model.belongsTo(key).value();
          return [
            key,
            this.#serializeModelWithDepthControl(belongsTo, maxDepth - 1),
          ];
        } else if (type === 'hasMany') {
          const hasMany = model.hasMany(key).value();
          if (!hasMany?.length) return [key, undefined];
          const values = hasMany.map((item) => {
            return item.toString();
          });
          return [key, values];
        } else {
          assert(`Unknown field type: ${type}`);
        }
      }
    );

    return Object.fromEntries(entries);
  }

  #serializeModel() {
    const serializedModel = this.#serializeModelWithDepthControl(this);
    // Remove id on the top level
    delete serializedModel.id;

    return serializedModel;
  }

  /**
   * Reset the model to its original state.
   * @returns {void}
   * @see https://guides.emberjs.com/release/models/#toc_rolling-back-attributes
   */
  reset() {
    this.#resetValidationErrors();
    this.rollbackAttributes();
  }

  #resetValidationErrors() {
    this._validationError = undefined;
  }
}
