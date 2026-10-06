import { attr } from '@warp-drive/legacy/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import { validateUrl } from '../validators/schema';

export default class DecisionModel extends AbstractValidationModel {
  @attr('date') publicationDate;
  @attr('uri-set', {
    defaultValue: function () {
      return [];
    },
  })
  documentLinks;

  get isEmpty() {
    // TODO: should this not also check for an activity?
    return !(this.publicationDate || this.documentLinks?.some((link) => link));
  }

  get validationSchema() {
    return Joi.object({
      // TODO: is the date really optional?
      publicationDate: Joi.date().allow(null),
      documentLinks: Joi.array()
        .items(validateUrl('Geef een geldig internetadres in'))
        .optional(),
    });
  }
}
