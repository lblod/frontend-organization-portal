import Joi from 'joi';

export const belongToRequired = (message) => {
  return Joi.object().required().messages({ 'any.required': message });
};

export const belongToOptional = () => {
  return Joi.object();
};

export const hasManyRequired = (message) => {
  return Joi.array().required().messages({ 'any.required': message });
};

export const hasManyOptional = () => {
  return Joi.array();
};

export const phone = (message) => {
  return Joi.string()
    .regex(/^(tel:)?\+?[0-9]*$/)
    .messages({ 'string.pattern.base': message });
};

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

export const requiredWhenClassificationId = (classificationCodeList) => {
  return Joi.when('classification.id', {
    is: Joi.exist().valid(...classificationCodeList),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({ 'any.required': 'Selecteer een optie' });
};
