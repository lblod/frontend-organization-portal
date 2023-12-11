import Joi from 'joi';

/**
 * Define a validator for required "belong to" relationships.
 * @param {string} message - Custom error message for validation failure.
 * @returns {Joi.ObjectSchema} - Joi schema for required "belong to" relationships.
 */
export const belongToRequired = (message) => {
  return Joi.object().required().messages({ 'any.required': message });
};

/**
 * Define a validator for optional "belong to" relationships.
 * @returns {Joi.ObjectSchema} - Joi schema for optional "belong to" relationships.
 */
export const belongToOptional = () => {
  return Joi.object();
};

/**
 * Define a validator for required "has many" relationships.
 * @param {string} message - Custom error message for validation failure.
 * @returns {Joi.ArraySchema} - Joi schema for required "has many" relationships.
 */
export const hasManyRequired = (message) => {
  return Joi.array().required().messages({ 'any.required': message });
};

/**
 * Define a validator for optional "has many" relationships.
 * @returns {Joi.ArraySchema} - Joi schema for optional "has many" relationships.
 */
export const hasManyOptional = () => {
  return Joi.array();
};

/**
 * Define a validator for phone numbers.
 * @param {string} message - Custom error message for validation failure.
 * @returns {Joi.StringSchema<string>} - Joi schema for validating phone numbers.
 */
export const phone = (message) => {
  return Joi.string()
    .regex(/^(tel:)?\+?[0-9]*$/)
    .messages({ 'string.pattern.base': message });
};

/**
 * Define a validator for conditional required fields based on the existence of multiple fields.
 * @param {Array<string>} fields - Array of field names to check for existence.
 * @param {string} message - Custom error message for validation failure.
 * @returns {Joi.ObjectSchema} - Joi schema for conditional required fields.
 */

export const requiredWhenAll = (fields, message) => {
  const conditions = fields.reduce((acc, field) => {
    return acc === null
      ? Joi.when(field, {
          is: Joi.exist(),
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
      : Joi.when(field, {
          is: Joi.exist(),
          then: acc,
          otherwise: Joi.optional(),
        });
  }, null);

  return conditions.messages({ 'any.required': message });
};

/**
 * Define a validator for conditional required field based on the classification ID.
 * @param {Array<string>} classificationCodeList - Array of valid classification codes.
 * @returns {Joi.ObjectSchema} - Joi schema for conditional required classification ID.
 */
export const requiredWhenClassificationId = (classificationCodeList) => {
  return Joi.when('classification.id', {
    is: Joi.exist().valid(...classificationCodeList),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({ 'any.required': 'Selecteer een optie' });
};
