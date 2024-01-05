import Joi from 'joi';

//TODO Split this file up into multiple files, one for each function.

/**
 * Validate and require an object for "belong to" relationships.
 * @param {string} [message] - Custom error message for validation failure.
 * @returns {Joi.ObjectSchema} - Joi schema for required "belong to" relationships.
 */
export const validateBelongsToRequired = (
  message = 'This field is required.'
) => {
  return Joi.object().required().messages({ 'any.required': message });
};

/**
 * Validate an object for optional "belong to" relationships.
 * @returns {Joi.ObjectSchema} - Joi schema for optional "belong to" relationships.
 */
export const validateBelongsToOptional = () => {
  return Joi.object();
};

/**
 * Validate and require an array for "has many" relationships.
 * @param {string} [message] - Custom error message for validation failure.
 * @returns {Joi.ArraySchema} - Joi schema for required "has many" relationships.
 */
export const validateHasManyRequired = (
  message = 'This field is required.'
) => {
  return Joi.array().required().messages({ 'any.required': message });
};

/**
 * Validate an array for optional "has many" relationships.
 * @returns {Joi.ArraySchema} - Joi schema for optional "has many" relationships.
 */
export const validateHasManyOptional = () => {
  return Joi.array();
};

/**
 * Validate a string as a phone number.
 * @param {string} [message] - Custom error message for validation failure.
 * @returns {Joi.StringSchema<string>} - Joi schema for validating phone numbers.
 */
export const validatePhone = (message = 'Invalid phone number format.') => {
  return Joi.string()
    .regex(/^(tel:)?\+?[0-9]*$/)
    .messages({ 'string.pattern.base': message });
};

/**
 * Validate a string as an email address.
 * @param {string} [message] - Custom error message for validation failure.
 * @returns {Joi.StringSchema<string>} - Joi schema for validating email addresses.
 */
export const validateEmail = (message = 'Invalid email format.') => {
  return Joi.string()
    .email({ tlds: false })
    .messages({ 'string.email': message });
};

/**
 * Validate a string as a URL.
 * @param {string} [message] - Custom error message for validation failure.
 * @returns {Joi.StringSchema<string>} - Joi schema for validating URLs.
 */
export const validateUrl = (message = 'Invalid URL format.') => {
  return Joi.string().uri().messages({ 'string.uri': message });
};

/**
 * Validate a string as a KBO number.
 * @returns {Joi.StringSchema<string>} - Joi schema for validating KBO numbers.
 */
export const validateKBO = () => {
  return Joi.string()
    .required()
    .pattern(/^\d{10}$/) // 10 digits
    .messages({
      'any.required': 'Vul het KBO nummer in',
      'string.pattern.base': 'Vul het (tiencijferige) KBO nummer in.',
    });
};

/**
 * Require when all fields are present
 * @param {Array<string>} fields - Array of field names to check for existence.
 * @param {string} [message] - Custom error message for validation failure.
 * @returns {Joi.ObjectSchema} - Joi schema for conditional required fields.
 */
export const validateRequiredWhenAll = (
  fields,
  message = 'This field is required.'
) => {
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
 * Require when `classification.id` is one of the classification codes in the list.
 * @param {Array<string>} classificationCodeList - Array of valid classification codes.
 * @returns {Joi.ObjectSchema} - Joi schema for conditional required classification ID.
 */
export const validateRequiredWhenClassificationId = (
  classificationCodeList,
  message = 'This field is required.'
) => {
  return Joi.when('classification.id', {
    is: Joi.exist().valid(...classificationCodeList),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({ 'any.required': message });
};
